// Rate limiter in-memory sederhana & terpusat.
// Cukup untuk single-instance. Untuk multi-instance/serverless, ganti backend
// ke Redis (mis. Upstash) — API-nya bisa tetap sama.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();
let lastSweep = 0;

// Buang entri kedaluwarsa secara berkala agar Map tidak tumbuh tak terbatas.
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of store) {
    if (now > b.resetAt) store.delete(k);
  }
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/** Naikkan hitungan untuk `key`. Mengembalikan apakah masih dalam batas. */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);

  const b = store.get(key);
  if (!b || now > b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, remaining: limit - b.count, retryAfterSec: 0 };
}

/**
 * IP klien dari header proxy (hop pertama). Andalkan hanya bila di belakang
 * reverse proxy tepercaya (Nginx/Caddy) yang menulis ulang x-forwarded-for.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Bangun response 429 standar dengan header Retry-After. */
export function tooMany(retryAfterSec: number, message = "Terlalu banyak request. Coba lagi nanti.") {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfterSec)) } }
  );
}
