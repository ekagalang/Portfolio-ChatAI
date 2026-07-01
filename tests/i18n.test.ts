import { describe, it, expect } from "vitest";
import { t, dateLocale } from "@/lib/i18n";

describe("i18n dictionary", () => {
  it("id & en punya kunci nav yang sama", () => {
    expect(Object.keys(t("id").nav).sort()).toEqual(Object.keys(t("en").nav).sort());
  });

  it("mengembalikan teks sesuai bahasa", () => {
    expect(t("id").nav.home).toBe("Halaman Utama");
    expect(t("en").nav.home).toBe("Home");
  });

  it("fungsi interpolasi bekerja", () => {
    expect(t("id").dash.greeting("Eka")).toContain("Eka");
    expect(t("en").users.showing(3, 10)).toBe("3 of 10");
    expect(t("id").actions.percentage(50)).toContain("50%");
  });

  it("dateLocale sesuai", () => {
    expect(dateLocale("id")).toBe("id-ID");
    expect(dateLocale("en")).toBe("en-US");
  });
});
