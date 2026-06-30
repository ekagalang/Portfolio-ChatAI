import crypto from "crypto";
import type { MidtransSnapRequest, MidtransSnapResponse } from "@/types/payment";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

const BASE_URL =
  process.env.MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";

// Auth Snap API: HTTP Basic — username = Server Key, password kosong
function buildAuthHeader(): string {
  const token = Buffer.from(`${SERVER_KEY}:`).toString("base64");
  return `Basic ${token}`;
}

// Verifikasi notifikasi webhook:
// signature_key = SHA512(order_id + status_code + gross_amount + serverKey)
export function verifyNotificationSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  incomingSignature: string
): boolean {
  const expected = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${SERVER_KEY}`)
    .digest("hex");
  return expected === incomingSignature;
}

export async function createSnapTransaction(
  params: MidtransSnapRequest
): Promise<MidtransSnapResponse> {
  const res = await fetch(`${BASE_URL}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: buildAuthHeader(),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Midtrans API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<MidtransSnapResponse>;
}
