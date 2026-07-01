import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth.config";
import { getOrderById } from "@/lib/orders";
import { getLang } from "@/lib/i18n.server";
import { renderInvoicePdf } from "@/lib/invoice";
import { orderLabel } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const order = await getOrderById(id); // include: user + payments
  if (!order) return new Response("Not found", { status: 404 });

  // Admin boleh akses semua; user hanya miliknya (404 agar tak bocorkan keberadaan).
  const isAdmin = session.user.role === "admin" || isAdminEmail(session.user.email);
  if (!isAdmin && order.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  // Invoice hanya bermakna setelah ada penawaran (Total kesepakatan).
  if (order.agreedTotal == null) {
    return new Response("Invoice belum tersedia", { status: 409 });
  }

  const lang = await getLang();
  const pdf = await renderInvoicePdf(order, lang);
  const filename = `Invoice-${orderLabel(order).replace("#", "")}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
