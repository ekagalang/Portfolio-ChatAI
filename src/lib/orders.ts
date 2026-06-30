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

// ───────────────── Fase 1: customer ─────────────────

export async function createOrderRequest(input: {
  userId: string;
  serviceId: string;
  serviceTitle: string;
  brief: string;
  phone?: string;
}) {
  return prisma.order.create({ data: { ...input, status: "requested" } });
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
 * Terapkan notifikasi webhook secara idempotent.
 * Mengembalikan apakah ini transisi sukses pertama (untuk trigger email sekali).
 */
export async function applyWebhook(params: {
  midtransOrderId: string;
  transactionId: string;
  transactionStatus: string;
  paymentType?: string;
  status: PaymentStatus;
}): Promise<{ firstSuccess: boolean; type?: string; orderId?: string }> {
  const { midtransOrderId, transactionId, transactionStatus, paymentType, status } = params;

  const payment = await prisma.payment.findUnique({
    where: { midtransOrderId },
    include: { order: true },
  });
  if (!payment) return { firstSuccess: false };

  const wasPaid = payment.paidAt != null;

  await prisma.payment.update({
    where: { midtransOrderId },
    data: {
      transactionId,
      transactionStatus,
      paymentType,
      paidAt: status === "success" ? payment.paidAt ?? new Date() : payment.paidAt,
    },
  });

  // Transisi status order pada sukses pertama
  if (status === "success" && !wasPaid) {
    if (payment.type === "dp" && payment.order.status === "quoted") {
      await prisma.order.update({ where: { id: payment.orderId }, data: { status: "dp_paid" } });
    } else if (payment.type === "settlement" && payment.order.status === "awaiting_settlement") {
      await prisma.order.update({ where: { id: payment.orderId }, data: { status: "completed" } });
    }
    return { firstSuccess: true, type: payment.type, orderId: payment.orderId };
  }

  return { firstSuccess: false, type: payment.type, orderId: payment.orderId };
}
