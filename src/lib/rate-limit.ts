// Rate limiter terpusat, "Redis-ready".
//
// - Default: in-memory (cukup untuk single-instance).
// - Bila `REDIS_URL` diset: pakai Redis (atomic INCR + PEXPIRE) untuk
//   multi-instance / horizontal scaling — hitungan dibagi antar-instance.
// - Bila Redis gagal (konek/eksekusi): fallback ke in-memory per-call (fail-open
//   ke ketersediaan), agar request tidak ikut gagal saat Redis bermasalah.
//
// API `rateLimit()` bersifat async karena Redis async. Redis di VPS (`redis_cache`)
// dibagi banyak app → semua key diberi prefix `pf:rl:` agar tidak bentrok.

import type { Redis } from "ioredis";

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

// ───────────────────────── In-memory backend ─────────────────────────

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

function memoryRateLimit(key: string, limit: number, windowMs: number): RateResult {
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

// ───────────────────────── Redis backend (lazy) ─────────────────────────

// Client dibuat sekali, hanya bila REDIS_URL ada. Import ioredis secara dinamis
// agar dependency tidak wajib di-load saat berjalan tanpa Redis.
let clientPromise: Promise<Redis | null> | null = null;

function getRedis(): Promise<Redis | null> {
  if (clientPromise) return clientPromise;
  const url = process.env.REDIS_URL;
  if (!url) {
    clientPromise = Promise.resolve(null);
    return clientPromise;
  }
  clientPromise = import("ioredis")
    .then(({ default: IORedis }) => {
      const c = new IORedis(url, {
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false, // jangan tumpuk perintah saat Redis down
      });
      c.on("error", (e) => console.error("[rate-limit] redis error:", e.message));
      return c as unknown as Redis;
    })
    .catch((e) => {
      console.error("[rate-limit] redis init gagal:", e);
      return null;
    });
  return clientPromise;
}

// Atomic: INCR lalu set TTL saat pertama kali; kembalikan (count, ttl-ms).
const INCR_LUA = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return {c, redis.call('PTTL', KEYS[1])}
`;

async function redisRateLimit(
  client: Redis,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateResult> {
  const res = (await client.eval(INCR_LUA, 1, `pf:rl:${key}`, windowMs)) as [number, number];
  const count = Number(res[0]);
  const ttlMs = Number(res[1]);
  const retryAfterSec = ttlMs > 0 ? Math.ceil(ttlMs / 1000) : Math.ceil(windowMs / 1000);
  if (count > limit) {
    return { ok: false, remaining: 0, retryAfterSec };
  }
  return { ok: true, remaining: Math.max(0, limit - count), retryAfterSec: 0 };
}

// ───────────────────────── Public API ─────────────────────────

/** Naikkan hitungan untuk `key`. Mengembalikan apakah masih dalam batas. */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  const client = await getRedis();
  if (client) {
    try {
      return await redisRateLimit(client, key, limit, windowMs);
    } catch (e) {
      console.error("[rate-limit] redis eval gagal, fallback in-memory:", e);
    }
  }
  return memoryRateLimit(key, limit, windowMs);
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
