import crypto from "crypto";
import type { DuitkuCreateRequest, DuitkuCreateResponse } from "@/types/payment";

const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE!;
const API_KEY = process.env.DUITKU_API_KEY!;

const BASE_URL =
  process.env.DUITKU_ENV === "production"
    ? "https://api-prod.duitku.com"
    : "https://api-sandbox.duitku.com";

// Auth melalui header, bukan body — sesuai docs Pop API
function buildRequestHeaders() {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", API_KEY)
    .update(`${MERCHANT_CODE}${timestamp}`)
    .digest("hex");

  return {
    "Content-Type": "application/json",
    "x-duitku-timestamp": timestamp,
    "x-duitku-signature": signature,
    "x-duitku-merchantcode": MERCHANT_CODE,
  };
}

// Verifikasi callback: HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)
export function verifyCallbackSignature(
  merchantCode: string,
  amount: string,
  orderId: string,
  incomingSignature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", API_KEY)
    .update(`${merchantCode}${amount}${orderId}`)
    .digest("hex");
  return expected === incomingSignature;
}

export async function createInvoice(
  params: DuitkuCreateRequest
): Promise<DuitkuCreateResponse> {
  const res = await fetch(`${BASE_URL}/api/merchant/createInvoice`, {
    method: "POST",
    headers: buildRequestHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Duitku API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<DuitkuCreateResponse>;
}
