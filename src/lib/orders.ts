import { prisma } from "@/lib/db";
import { canTransition } from "@/lib/payment-config";
import type { PaymentStatus } from "@/types/payment";

// ───────────────── Helpers status Midtrans ─────────────────

// Map transaction_status Midtrans → status pembayaran internal
export function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string
): PaymentStatus {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "success" : "pending";
  }
  if (transactionStatus === "settlement") return "success";
  if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) {
    return "failed";
  }
  return "pending";
}

// ───────────────── Helper nominal (cicilan) ─────────────────

type PayLike = { grossAmount: number; paidAt: Date | null };

/** Total nominal yang sudah lunas (DP + pelunasan yang paidAt terisi). */
export function paidSoFar(payments: PayLike[]): number {
  return payments.filter((p) => p.paidAt).reduce((s, p) => s + p.grossAmount, 0);
}

/** Sisa tagihan = agreedTotal − yang sudah dibayar (min 0). */
export function outstandingAmount(order: {
  agreedTotal: number | null;
  payments: PayLike[];
}): number {
  return Math.max(0, (order.agreedTotal ?? 0) - paidSoFar(order.payments));
}

// ───────────────── Fase 1: customer ─────────────────

export async function createOrderRequest(input: {
  userId: string;
  serviceId: string;
  serviceTitle: string;
  brief: string;
  phone?: string;
}) {
  // Nomor urut rapi (#0001) — dihitung dalam transaksi. SQLite men-serialize
  // write, jadi tak akan bentrok pada single-instance; @unique sebagai jaring.
  return prisma.$transaction(async (tx) => {
    const last = await tx.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const orderNumber = (last?.orderNumber ?? 0) + 1;
    return tx.order.create({ data: { ...input, orderNumber, status: "requested" } });
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: { createdAt: "asc" } } },
  });
}

/** Ambil order milik user tertentu — null bila bukan pemilik (cegah IDOR). */
export async function getOrderForUser(id: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payments: { orderBy: { createdAt: "asc" } } },
  });
  if (!order || order.userId !== userId) return null;
  return order;
}

// ───────────────── Fase 2: admin ─────────────────

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { user: true, payments: { orderBy: { createdAt: "asc" } } },
  });
}

export async function listOrders(status?: string) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true, payments: true },
  });
}

/** Set harga kesepakatan + DP → status quoted (hanya dari requested). */
export async function setQuote(id: string, agreedTotal: number, dpAmount: number) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order tidak ditemukan");
  if (!canTransition(order.status, "quoted")) {
    throw new Error(`Tidak bisa quote dari status ${order.status}`);
  }
  if (dpAmount <= 0 || agreedTotal <= 0 || dpAmount > agreedTotal) {
    throw new Error("Nominal DP/total tidak valid");
  }
  return prisma.order.update({
    where: { id },
    data: { agreedTotal, dpAmount, status: "quoted" },
  });
}

export async function updateStatus(id: string, nextStatus: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order tidak ditemukan");
  if (!canTransition(order.status, nextStatus)) {
    throw new Error(`Transisi ${order.status} → ${nextStatus} tidak diizinkan`);
  }
  return prisma.order.update({ where: { id }, data: { status: nextStatus } });
}

export async function updateProgress(id: string, pct: number, note?: string) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return prisma.order.update({
    where: { id },
    data: { progressPct: clamped, progressNote: note ?? null },
  });
}

// ───────────────── Fase 3: pembayaran ─────────────────

export async function createPaymentRecord(input: {
  orderId: string;
  type: "dp" | "settlement";
  grossAmount: number;
  midtransOrderId: string;
  snapToken: string;
}) {
  return prisma.payment.create({
    data: { ...input, transactionStatus: "pending" },
  });
}

/**
 * Terapkan notifikasi webhook secara idempotent & aman-nominal.
 * - Verifikasi `grossAmount` (rupiah) cocok dengan nilai yang tercatat.
 * - "Klaim" pembayaran secara ATOMIC (updateMany dengan guard paidAt:null) agar
 *   notifikasi ganda yang datang bersamaan tidak menggandakan transisi/email.
 * Mengembalikan apakah ini transisi sukses pertama (untuk trigger email sekali).
 */
export async function applyWebhook(params: {
  midtransOrderId: string;
  transactionId: string;
  transactionStatus: string;
  paymentType?: string;
  status: PaymentStatus;
  grossAmount: number; // rupiah dari notifikasi (sudah di-parse)
}): Promise<{
  firstSuccess: boolean;
  type?: string;
  orderId?: string;
  amountMismatch?: boolean;
  amount?: number;
}> {
  const { midtransOrderId, transactionId, transactionStatus, paymentType, status, grossAmount } =
    params;

  const payment = await prisma.payment.findUnique({
    where: { midtransOrderId },
    select: { type: true, orderId: true, grossAmount: true },
  });
  if (!payment) return { firstSuccess: false };

  // ── Verifikasi nominal: tolak bila tidak sama dengan yang ditagih ──
  if (Math.round(grossAmount) !== payment.grossAmount) {
    console.error("[payment] Nominal webhook tidak cocok:", {
      midtransOrderId,
      diterima: grossAmount,
      diharapkan: payment.grossAmount,
    });
    return {
      firstSuccess: false,
      type: payment.type,
      orderId: payment.orderId,
      amountMismatch: true,
    };
  }

  if (status === "success") {
    // Klaim atomic + transisi order dalam satu transaksi.
    const claimed = await prisma.$transaction(async (tx) => {
      const claim = await tx.payment.updateMany({
        where: { midtransOrderId, paidAt: null },
        data: { paidAt: new Date(), transactionId, transactionStatus, paymentType },
      });
      if (claim.count === 0) return false; // sudah diproses sebelumnya

      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
        select: { status: true, agreedTotal: true },
      });
      if (payment.type === "dp" && order?.status === "quoted") {
        await tx.order.update({ where: { id: payment.orderId }, data: { status: "dp_paid" } });
      } else if (payment.type === "settlement" && order?.status === "awaiting_settlement") {
        // Cicilan pelunasan: order selesai HANYA bila akumulasi yang dibayar
        // (DP + semua pelunasan) sudah menutup agreedTotal. Bila belum, tetap
        // awaiting_settlement agar cicilan berikutnya bisa dibayar.
        const paid = await tx.payment.aggregate({
          where: { orderId: payment.orderId, paidAt: { not: null } },
          _sum: { grossAmount: true },
        });
        if ((paid._sum.grossAmount ?? 0) >= (order.agreedTotal ?? 0)) {
          await tx.order.update({ where: { id: payment.orderId }, data: { status: "completed" } });
        }
      }
      return true;
    });

    return { firstSuccess: claimed, type: payment.type, orderId: payment.orderId, amount: payment.grossAmount };
  }

  // Status non-sukses (pending/failed): perbarui field transaksi, jangan sentuh paidAt.
  await prisma.payment.update({
    where: { midtransOrderId },
    data: { transactionId, transactionStatus, paymentType },
  });
  return { firstSuccess: false, type: payment.type, orderId: payment.orderId, amount: payment.grossAmount };
}
