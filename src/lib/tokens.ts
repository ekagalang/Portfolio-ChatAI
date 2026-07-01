import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

export type EmailTokenType = "verify" | "reset";

const TTL_HOURS: Record<EmailTokenType, number> = { verify: 48, reset: 1 };

/** Buat token email baru; token lama dengan tipe sama untuk user ini dihapus. */
export async function createEmailToken(userId: string, type: EmailTokenType): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_HOURS[type] * 3_600_000);
  await prisma.emailToken.deleteMany({ where: { userId, type } });
  await prisma.emailToken.create({ data: { token, type, userId, expiresAt } });
  return token;
}

/** Validasi & pakai token (sekali pakai). Mengembalikan userId bila valid. */
export async function consumeEmailToken(
  token: string,
  type: EmailTokenType
): Promise<string | null> {
  if (!token) return null;
  const rec = await prisma.emailToken.findUnique({ where: { token } });
  if (!rec || rec.type !== type) return null;
  await prisma.emailToken.delete({ where: { token } }).catch(() => {});
  if (rec.expiresAt.getTime() < Date.now()) return null;
  return rec.userId;
}
