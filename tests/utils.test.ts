import { describe, it, expect } from "vitest";
import { formatIDR, orderLabel, truncate, cn } from "@/lib/utils";

describe("formatIDR", () => {
  it("format rupiah tanpa desimal", () => {
    expect(formatIDR(1500000)).toContain("1.500.000");
    expect(formatIDR(0)).toContain("0");
  });
});

describe("orderLabel", () => {
  it("pakai orderNumber padded 4 digit", () => {
    expect(orderLabel({ orderNumber: 1, id: "abcdef123456" })).toBe("#0001");
    expect(orderLabel({ orderNumber: 1234, id: "x" })).toBe("#1234");
    expect(orderLabel({ orderNumber: 12345, id: "x" })).toBe("#12345");
  });

  it("fallback ke potongan id bila orderNumber null", () => {
    expect(orderLabel({ orderNumber: null, id: "aaaaaabcdef6" })).toBe("#bcdef6");
  });
});

describe("truncate", () => {
  it("memotong string yang panjang", () => {
    expect(truncate("halo dunia", 4)).toBe("halo...");
    expect(truncate("hi", 4)).toBe("hi");
  });
});

describe("cn", () => {
  it("merge kelas tailwind yang bertabrakan", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
