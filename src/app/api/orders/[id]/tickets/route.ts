import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrderForUser } from "@/lib/orders";
import { createTicket, isTicketType } from "@/lib/tickets";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Harus login" }, { status: 401 });
  }
  const { id } = await ctx.params;

  // Batasi agar tak dipakai spam — 5 pengajuan / 10 menit per user.
  const rl = await rateLimit(`ticket:${session.user.id}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu banyak pengajuan. Coba lagi nanti." }, { status: 429 });
  }

  // Kepemilikan order (cegah IDOR).
  const order = await getOrderForUser(id, session.user.id);
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (!isTicketType(body.type)) {
    return NextResponse.json({ error: "Jenis tidak valid" }, { status: 400 });
  }
  const message = String(body.message ?? "").trim();
  if (message.length < 5) {
    return NextResponse.json({ error: "Pesan minimal 5 karakter" }, { status: 400 });
  }

  await createTicket({ orderId: id, type: body.type, message: message.slice(0, 2000) });
  return NextResponse.json({ ok: true });
}
