import { prisma } from "@/lib/db";

export interface AuditEntry {
  action: string; // freeze | unfreeze | reset_password_temp | reset_password_email | edit_notes
  actorId: string;
  actorEmail: string;
  targetId?: string;
  targetEmail?: string;
  detail?: string;
}

/** Catat aksi admin. Kegagalan log tidak menggagalkan aksi utama. */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (err) {
    console.error("[audit] gagal mencatat:", err);
  }
}

export async function getAuditForTarget(targetId: string, take = 20) {
  return prisma.auditLog.findMany({
    where: { targetId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
