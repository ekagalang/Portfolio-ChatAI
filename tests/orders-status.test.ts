import { describe, it, expect } from "vitest";
import { mapTransactionStatus, paidSoFar, outstandingAmount } from "@/lib/orders";

describe("mapTransactionStatus", () => {
  it("settlement → success", () => {
    expect(mapTransactionStatus("settlement")).toBe("success");
  });

  it("capture + fraud accept → success", () => {
    expect(mapTransactionStatus("capture", "accept")).toBe("success");
  });

  it("capture tanpa accept → pending (perlu review)", () => {
    expect(mapTransactionStatus("capture", "challenge")).toBe("pending");
    expect(mapTransactionStatus("capture")).toBe("pending");
  });

  it("deny/cancel/expire/failure → failed", () => {
    for (const s of ["deny", "cancel", "expire", "failure"]) {
      expect(mapTransactionStatus(s)).toBe("failed");
    }
  });

  it("pending & status tak dikenal → pending", () => {
    expect(mapTransactionStatus("pending")).toBe("pending");
    expect(mapTransactionStatus("whatever")).toBe("pending");
  });
});

describe("paidSoFar / outstandingAmount (cicilan)", () => {
  const d = new Date();
  it("hanya menjumlah pembayaran yang paidAt terisi", () => {
    const payments = [
      { grossAmount: 1_500_000, paidAt: d }, // DP lunas
      { grossAmount: 1_000_000, paidAt: d }, // cicilan 1 lunas
      { grossAmount: 2_500_000, paidAt: null }, // pending
    ];
    expect(paidSoFar(payments)).toBe(2_500_000);
    expect(outstandingAmount({ agreedTotal: 5_000_000, payments })).toBe(2_500_000);
  });

  it("sisa tidak pernah negatif (overpay diclamp)", () => {
    const payments = [{ grossAmount: 6_000_000, paidAt: d }];
    expect(outstandingAmount({ agreedTotal: 5_000_000, payments })).toBe(0);
  });

  it("agreedTotal null → sisa 0", () => {
    expect(outstandingAmount({ agreedTotal: null, payments: [] })).toBe(0);
  });
});
