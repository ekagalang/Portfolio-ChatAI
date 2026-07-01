import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyNotificationSignature } from "@/lib/midtrans";

// MIDTRANS_SERVER_KEY di-set ke "test-server-key" via vitest.config.ts
const KEY = "test-server-key";
const sign = (orderId: string, statusCode: string, grossAmount: string) =>
  crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${KEY}`).digest("hex");

describe("verifyNotificationSignature", () => {
  const orderId = "ORD-1-DP";
  const statusCode = "200";
  const gross = "150000.00";

  it("menerima signature yang benar", () => {
    expect(verifyNotificationSignature(orderId, statusCode, gross, sign(orderId, statusCode, gross))).toBe(true);
  });

  it("menolak signature ngawur", () => {
    expect(verifyNotificationSignature(orderId, statusCode, gross, "deadbeef")).toBe(false);
  });

  it("menolak bila gross_amount diubah (tamper)", () => {
    const sig = sign(orderId, statusCode, gross);
    expect(verifyNotificationSignature(orderId, statusCode, "999999.00", sig)).toBe(false);
  });

  it("menolak signature kosong", () => {
    expect(verifyNotificationSignature(orderId, statusCode, gross, "")).toBe(false);
  });
});
