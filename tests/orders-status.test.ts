import { describe, it, expect } from "vitest";
import { mapTransactionStatus } from "@/lib/orders";

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
