import { prisma } from "@/lib/db";

export const TICKET_TYPES = ["revision", "complaint", "refund"] as const;
export const TICKET_STATUSES = ["open", "in_review", "resolved", "rejected"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export function isTicketType(v: unknown): v is TicketType {
  return typeof v === "string" && (TICKET_TYPES as readonly string[]).includes(v);
}
export function isTicketStatus(v: unknown): v is TicketStatus {
  return typeof v === "string" && (TICKET_STATUSES as readonly string[]).includes(v);
}

export async function createTicket(input: { orderId: string; type: TicketType; message: string }) {
  return prisma.ticket.create({ data: input });
}

export async function getTicketsForOrder(orderId: string) {
  return prisma.ticket.findMany({ where: { orderId }, orderBy: { createdAt: "desc" } });
}

export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: { order: { select: { id: true, user: { select: { email: true, name: true } } } } },
  });
}

export async function updateTicket(id: string, data: { status?: TicketStatus; response?: string }) {
  return prisma.ticket.update({ where: { id }, data });
}

export async function listTickets(status?: string) {
  return prisma.ticket.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: { id: true, orderNumber: true, serviceTitle: true, user: { select: { email: true } } },
      },
    },
  });
}

export async function countOpenTickets() {
  return prisma.ticket.count({ where: { status: { in: ["open", "in_review"] } } });
}
