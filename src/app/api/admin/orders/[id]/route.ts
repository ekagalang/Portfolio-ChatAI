import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getOrderById,
  setQuote,
  updateStatus,
  updateProgress,
} from "@/lib/orders";
import { sendQuoteToCustomer, sendSettlementInvoice } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const actor = { actorId: session.user.id, actorEmail: session.user.email ?? "?" };

  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const action = body.action as string;

    // Konteks untuk audit (email customer + status lama).
    const meta = await prisma.order.findUnique({
      where: { id },
      select: { status: true, user: { select: { email: true } } },
    });
    const targetEmail = meta?.user.email;

    if (action === "quote") {
      const agreedTotal = Math.round(Number(body.agreedTotal));
      const dpAmount = Math.round(Number(body.dpAmount));
      if (!Number.isFinite(agreedTotal) || !Number.isFinite(dpAmount)) {
        return NextResponse.json({ error: "Nominal tidak valid" }, { status: 400 });
      }
      await setQuote(id, agreedTotal, dpAmount);
      const order = await getOrderById(id);
      if (order) {
        void sendQuoteToCustomer({
          to: order.user.email,
          customerName: order.user.name ?? order.user.email,
          orderId: order.id,
          serviceTitle: order.serviceTitle,
          agreedTotal,
          dpAmount,
        });
      }
      void logAudit({
        ...actor,
        action: "order_quote",
        targetId: id,
        targetEmail,
        detail: `Total ${agreedTotal.toLocaleString("id-ID")} · DP ${dpAmount.toLocaleString("id-ID")}`,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "status") {
      const next = String(body.status);
      await updateStatus(id, next);
      void logAudit({
        ...actor,
        action: "order_status",
        targetId: id,
        targetEmail,
        detail: `${meta?.status ?? "?"} → ${next}`,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "progress") {
      const pct = Number(body.progressPct);
      await updateProgress(id, pct, body.progressNote);
      void logAudit({
        ...actor,
        action: "order_progress",
        targetId: id,
        targetEmail,
        detail: `${Math.max(0, Math.min(100, Math.round(pct)))}%`,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "issue_settlement") {
      await updateStatus(id, "awaiting_settlement");
      const order = await getOrderById(id);
      if (order) {
        const remaining = (order.agreedTotal ?? 0) - (order.dpAmount ?? 0);
        void sendSettlementInvoice({
          to: order.user.email,
          customerName: order.user.name ?? order.user.email,
          orderId: order.id,
          serviceTitle: order.serviceTitle,
          remaining,
        });
      }
      void logAudit({
        ...actor,
        action: "order_issue_settlement",
        targetId: id,
        targetEmail,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (err) {
    console.error("[admin/orders PATCH]", err);
    // Jangan bocorkan pesan error internal ke client.
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 400 });
  }
}
