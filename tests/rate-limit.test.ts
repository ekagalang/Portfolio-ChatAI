import { describe, it, expect, vi } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const uniq = () => "k:" + Math.random().toString(36).slice(2);

// Tanpa REDIS_URL di env test → rateLimit memakai backend in-memory.
describe("rateLimit (in-memory)", () => {
  it("mengizinkan sampai limit lalu menolak", async () => {
    const key = uniq();
    for (let i = 0; i < 3; i++) expect((await rateLimit(key, 3, 60_000)).ok).toBe(true);
    const blocked = await rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("key berbeda punya bucket terpisah", async () => {
    const a = uniq();
    const b = uniq();
    expect((await rateLimit(a, 1, 60_000)).ok).toBe(true);
    expect((await rateLimit(a, 1, 60_000)).ok).toBe(false);
    expect((await rateLimit(b, 1, 60_000)).ok).toBe(true);
  });

  it("reset setelah window lewat", async () => {
    vi.useFakeTimers();
    try {
      const key = uniq();
      expect((await rateLimit(key, 1, 1000)).ok).toBe(true);
      expect((await rateLimit(key, 1, 1000)).ok).toBe(false);
      vi.advanceTimersByTime(1001);
      expect((await rateLimit(key, 1, 1000)).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("clientIp", () => {
  it("ambil hop pertama x-forwarded-for", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("fallback x-real-ip lalu unknown", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe("9.9.9.9");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
