import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

/** Label order rapi: #0001. Fallback ke potongan id bila nomor belum ada. */
export function orderLabel(order: { orderNumber?: number | null; id: string }): string {
  return order.orderNumber != null
    ? `#${String(order.orderNumber).padStart(4, "0")}`
    : `#${order.id.slice(-6)}`;
}