import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth.config";
import { logAudit } from "@/lib/audit";
import { createEmailToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

type Actor = { id: string; email: string };
type Target = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  passwordHash: string | null;
};

async function resolveTarget(
  id: string
): Promise<{ res: NextResponse } | { actor: Actor; user: Target }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { res: NextResponse.json({ error: "Akses ditolak." }, { status: 403 }) };
  }
  if (id === session.user.id) {
    return {
      res: NextResponse.json(
        { error: "Tidak bisa melakukan aksi ini pada akun sendiri." },
        { status: 400 }
      ),
    };
  }
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });
  if (!user) {
    return { res: NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 }) };
  }
  if (user.role === "admin" || isAdminEmail(user.email)) {
    return {
      res: NextResponse.json({ error: "Tidak bisa melakukan aksi ini pada admin." }, { status: 403 }),
    };
  }
  return {
    actor: { id: session.user.id, email: session.user.email ?? "" },
    user,
  };
}

/** PATCH — bekukan / aktifkan / catatan admin. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const t = await resolveTarget(id);
  if ("res" in t) return t.res;
  const { actor, user } = t;

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "suspend" || action === "unsuspend") {
    await prisma.user.update({ where: { id }, data: { suspended: action === "suspend" } });
    await logAudit({
      action: action === "suspend" ? "freeze" : "unfreeze",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: id,
      targetEmail: user.email,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "notes") {
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 2000) : "";
    await prisma.user.update({ where: { id }, data: { notes: notes || null } });
    await logAudit({
      action: "edit_notes",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: id,
      targetEmail: user.email,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
}

/** POST — reset password. mode: "temp" (default) atau "email". */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const t = await resolveTarget(id);
  if ("res" in t) return t.res;
  const { actor, user } = t;

  const body = await req.json().catch(() => ({}));
  const mode = body.mode === "email" ? "email" : "temp";

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "User login via Google — tidak ada password untuk direset." },
      { status: 400 }
    );
  }

  if (mode === "email") {
    const token = await createEmailToken(user.id, "reset");
    void sendPasswordResetEmail(user.email, user.name ?? user.email, token);
    await logAudit({
      action: "reset_password_email",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: id,
      targetEmail: user.email,
    });
    return NextResponse.json({ ok: true, mode: "email" });
  }

  const tempPassword = randomBytes(9).toString("base64url").slice(0, 12);
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await logAudit({
    action: "reset_password_temp",
    actorId: actor.id,
    actorEmail: actor.email,
    targetId: id,
    targetEmail: user.email,
  });
  return NextResponse.json({ ok: true, mode: "temp", tempPassword });
}
