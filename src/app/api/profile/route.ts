import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await req.json();
    const action = body.action as string;

    // ── Ubah nama ──
    if (action === "name") {
      const name = String(body.name ?? "").trim();
      if (name.length < 2) {
        return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
      }
      if (name.length > 80) {
        return NextResponse.json({ error: "Nama maksimal 80 karakter." }, { status: 400 });
      }
      await prisma.user.update({ where: { id: userId }, data: { name } });
      return NextResponse.json({ ok: true, name });
    }

    // ── Atur / ubah password ──
    if (action === "password") {
      const newPassword = String(body.newPassword ?? "");
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password baru minimal 8 karakter." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
      }

      // Jika sudah punya password → wajib verifikasi password lama
      if (user.passwordHash) {
        const current = String(body.currentPassword ?? "");
        const ok = current.length > 0 && (await bcrypt.compare(current, user.passwordHash));
        if (!ok) {
          return NextResponse.json({ error: "Password saat ini salah." }, { status: 400 });
        }
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  } catch (err) {
    console.error("[profile PATCH]", err);
    return NextResponse.json({ error: "Gagal memproses." }, { status: 500 });
  }
}
