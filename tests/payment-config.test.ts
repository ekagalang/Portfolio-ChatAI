import { describe, it, expect } from "vitest";
import {
  canTransition,
  ORDER_STATUS_LABEL,
  ORDER_LIFECYCLE,
  ALLOWED_TRANSITIONS,
} from "@/lib/payment-config";

describe("order state machine", () => {
  it("mengizinkan alur normal", () => {
    expect(canTransition("requested", "quoted")).toBe(true);
    expect(canTransition("quoted", "dp_paid")).toBe(true);
    expect(canTransition("dp_paid", "in_progress")).toBe(true);
    expect(canTransition("in_progress", "awaiting_settlement")).toBe(true);
    expect(canTransition("awaiting_settlement", "completed")).toBe(true);
  });

  it("mengizinkan pembatalan dari status aktif", () => {
    expect(canTransition("requested", "cancelled")).toBe(true);
    expect(canTransition("in_progress", "cancelled")).toBe(true);
  });

  it("menolak lompatan / transisi tidak valid", () => {
    expect(canTransition("requested", "completed")).toBe(false);
    expect(canTransition("quoted", "in_progress")).toBe(false);
    expect(canTransition("completed", "in_progress")).toBe(false);
    expect(canTransition("cancelled", "quoted")).toBe(false);
  });

  it("status terminal tidak punya transisi keluar", () => {
    expect(ALLOWED_TRANSITIONS.completed).toEqual([]);
    expect(ALLOWED_TRANSITIONS.cancelled).toEqual([]);
  });

  it("setiap status lifecycle punya label id & en", () => {
    for (const s of ORDER_LIFECYCLE) {
      expect(ORDER_STATUS_LABEL[s]?.id).toBeTruthy();
      expect(ORDER_STATUS_LABEL[s]?.en).toBeTruthy();
    }
  });
});
