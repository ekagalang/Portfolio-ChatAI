import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEmailToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  // Batasi agar tidak dipakai spam kirim email — 3 per jam per user.
  const rl = rateLimit(`resend-verify:${session.user.id}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu sering. Coba lagi nanti." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, emailVerified: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const token = await createEmailToken(session.user.id, "verify");
  void sendVerificationEmail(user.email, user.name ?? user.email, token);
  return NextResponse.json({ ok: true });
}
