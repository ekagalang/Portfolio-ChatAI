// Konfigurasi & label status order. Aman dipakai client maupun server.

export type OrderStatus =
  | "requested"
  | "quoted"
  | "dp_paid"
  | "in_progress"
  | "awaiting_settlement"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABEL: Record<string, { id: string; en: string }> = {
  requested: { id: "Menunggu penawaran", en: "Awaiting quote" },
  quoted: { id: "Siap dibayar (DP)", en: "Ready for down payment" },
  dp_paid: { id: "DP dibayar", en: "Down payment received" },
  in_progress: { id: "Dalam pengerjaan", en: "In progress" },
  awaiting_settlement: { id: "Menunggu pelunasan", en: "Awaiting settlement" },
  completed: { id: "Selesai", en: "Completed" },
  cancelled: { id: "Dibatalkan", en: "Cancelled" },
};

// Urutan lifecycle untuk progress bar (cancelled di luar urutan)
export const ORDER_LIFECYCLE: OrderStatus[] = [
  "requested",
  "quoted",
  "dp_paid",
  "in_progress",
  "awaiting_settlement",
  "completed",
];

// Transisi status yang diizinkan (state machine)
export const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  requested: ["quoted", "cancelled"],
  quoted: ["dp_paid", "cancelled"],
  dp_paid: ["in_progress", "cancelled"],
  in_progress: ["awaiting_settlement", "cancelled"],
  awaiting_settlement: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: string, to: string): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to as OrderStatus) ?? false;
}
