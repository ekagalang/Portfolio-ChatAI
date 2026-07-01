import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { E2E } from "./constants";

// Reset DB e2e ke keadaan bersih + seed 2 user: admin (email di allowlist) & customer.
// Admin di-seed langsung karena signup email admin diblokir (login credentials tetap boleh).
export default async function globalSetup() {
  const prisma = new PrismaClient({ datasources: { db: { url: E2E.dbUrl } } });
  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "Payment","Order","AuditLog","EmailToken","Session","Account","User" RESTART IDENTITY CASCADE'
    );
    const [adminHash, userHash] = await Promise.all([
      bcrypt.hash(E2E.adminPass, 10),
      bcrypt.hash(E2E.userPass, 10),
    ]);
    await prisma.user.create({
      data: {
        email: E2E.adminEmail,
        name: "E2E Admin",
        passwordHash: adminHash,
        emailVerified: new Date(),
        role: "admin",
      },
    });
    await prisma.user.create({
      data: {
        email: E2E.userEmail,
        name: "E2E User",
        passwordHash: userHash,
        emailVerified: new Date(),
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
