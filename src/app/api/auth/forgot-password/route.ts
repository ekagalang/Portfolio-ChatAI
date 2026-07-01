import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createEmailToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  const normalized = String(email ?? "").toLowerCase().trim();

  if (normalized) {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, name: true, email: true, passwordHash: true, suspended: true },
    });
    // Hanya kirim untuk akun password yang aktif.
    if (user?.passwordHash && !user.suspended) {
      const token = await createEmailToken(user.id, "reset");
      void sendPasswordResetEmail(user.email, user.name ?? user.email, token);
    }
  }

  // Selalu balas ok — jangan bocorkan keberadaan email.
  return NextResponse.json({ ok: true });
}
