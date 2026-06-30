import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOrderById,
  setQuote,
  updateStatus,
  updateProgress,
} from "@/lib/orders";
import { sendQuoteToCustomer, sendSettlementInvoice } from "@/lib/email";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const action = body.action as string;

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
      return NextResponse.json({ ok: true });
    }

    if (action === "status") {
      await updateStatus(id, String(body.status));
      return NextResponse.json({ ok: true });
    }

    if (action === "progress") {
      await updateProgress(id, Number(body.progressPct), body.progressNote);
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
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal memproses";
    console.error("[admin/orders PATCH]", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
