import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth.config";
import { createEmailToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }
    if (!isValidEmail(email.trim())) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email admin (allowlist) tidak boleh daftar via password — wajib via Google.
    // Mencegah penyerang "menyerobot" email admin lewat credentials (privilege escalation).
    if (isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Email ini harus masuk menggunakan Google." },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash },
    });

    // Kirim email verifikasi (non-blocking — kegagalan tidak menggagalkan daftar).
    try {
      const token = await createEmailToken(user.id, "verify");
      void sendVerificationEmail(normalizedEmail, name.trim(), token);
    } catch (e) {
      console.error("[register] gagal kirim verifikasi:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Gagal mendaftar. Coba lagi." }, { status: 500 });
  }
}
