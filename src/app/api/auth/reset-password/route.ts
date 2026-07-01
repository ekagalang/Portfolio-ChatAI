import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { consumeEmailToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));

  if (String(password ?? "").length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  const userId = await consumeEmailToken(String(token ?? ""), "reset");
  if (!userId) {
    return NextResponse.json(
      { error: "Link tidak valid atau sudah kedaluwarsa." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
