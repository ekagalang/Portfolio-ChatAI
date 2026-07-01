// Helper UI tiket — client-safe & server-safe (bukan "use client").

export interface TicketRow {
  id: string;
  type: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: string;
}

export function ticketStatusClass(status: string): string {
  switch (status) {
    case "resolved":
      return "border-accent/30 bg-accent/10 text-accent";
    case "rejected":
      return "border-red-400/30 bg-red-400/10 text-red-400";
    case "in_review":
      return "border-sky-400/30 bg-sky-400/10 text-sky-400";
    default: // open
      return "border-amber-400/30 bg-amber-400/10 text-amber-400";
  }
}
