import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateTicket, isTicketStatus, getTicketById } from "@/lib/tickets";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const data: { status?: "open" | "in_review" | "resolved" | "rejected"; response?: string } = {};
  if (body.status !== undefined) {
    if (!isTicketStatus(body.status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.response !== undefined) {
    data.response = String(body.response).slice(0, 2000);
  }
  if (data.status === undefined && data.response === undefined) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  try {
    const existing = await getTicketById(id);
    await updateTicket(id, data);
    void logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? "?",
      action: "ticket_update",
      targetId: id,
      targetEmail: existing?.order.user.email,
      detail: [data.status, data.response ? "+balasan" : null].filter(Boolean).join(" "),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/tickets PATCH]", err);
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 400 });
  }
}
