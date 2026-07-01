import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeEmailToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));

  const userId = await consumeEmailToken(String(token ?? ""), "verify");
  if (!userId) {
    return NextResponse.json(
      { error: "Link verifikasi tidak valid atau sudah kedaluwarsa." },
      { status: 400 }
    );
  }

  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  return NextResponse.json({ ok: true });
}
