# Analisis Proyek & Saran Pengembangan — portfolio-ai

**Produk:** Portfolio AI — Eka Galang (ekagalang.my.id)
**Tanggal analisis:** 2026-07-01
**Status:** Dokumen acuan hidup — perbarui saat item dikerjakan.

Stack: Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind 4 · Auth.js v5 · Prisma + SQLite · Google Gemini · Resend · Midtrans Snap.

---

## 1. Penilaian umum

Proyek **matang secara fitur & rapi secara arsitektur** untuk skala 1 owner. Fondasi kuat:
Auth.js v5 + RBAC, i18n cookie-based (EN/ID), sistem order/pembayaran Midtrans (DP + pelunasan),
dashboard user & admin, analytics, dan user management lengkap (freeze, reset password, audit log,
verifikasi email, notes).

Yang **belum matang** = lapisan *production-hardening*: keamanan berbasis skala, keandalan
pembayaran (idempotency/verifikasi nominal), dan quality gates (test/CI).

### Kekuatan yang layak dipertahankan
- Proteksi IDOR & kepemilikan order solid (`getOrderForUser`).
- Nominal pembayaran dihitung **server-side** (anti price-tampering) — `api/payment/create`.
- Webhook Midtrans **terverifikasi signature** sebelum diterapkan.
- Admin ditentukan via **allowlist `ADMIN_EMAILS`** (source of truth), signup email admin diblokir.
- Tidak ada secret ter-commit; anti user-enumeration di reset password; bcrypt cost 10.

---

## 2. Temuan per area (dengan referensi file)

### Pembayaran (paling kritikal — menyangkut uang)
- **Idempotency webhook tidak atomic** — `src/lib/orders.ts` (~129–155): pola `findUnique` → cek
  `wasPaid` → `update` terpisah, tanpa transaksi/conditional update. Midtrans retry agresif → dua
  notifikasi bisa lolos bersamaan → **transisi status & email ganda**.
- **Webhook tidak memverifikasi nominal** — `gross_amount` hanya dipakai untuk hash signature,
  tidak dicocokkan ke `payment.grossAmount`.
- **Signature dibandingkan dengan `===`** (`src/lib/midtrans.ts:29`) — bukan constant-time.
- **Payment record dibuat tiap klik "create"** tanpa dedup (`payment/create`) — hanya menumpuk
  record `pending` (mitigasi: status gating), bukan bug fatal.

### Rate limiting & abuse
- Semua limiter **in-memory `Map`** (`api/chat` 20/60s, `api/contact` 3/10m, `api/payment/create`
  5/60s) — reset saat restart, tak lintas-instance, unbounded (memory leak). IP dari
  `x-forwarded-for` (chat/contact) **bisa dipalsukan**.
- `api/suggestions` & `api/models` **tanpa rate limit & tanpa auth**, padahal memicu Gemini/Google
  API berbayar → cost-amplification.
- `api/payment/create` satu-satunya yang key-nya identitas terautentikasi (pola yang benar).

### AI / Chat
- **Streaming palsu** (`api/chat/route.ts` ~111–138): respons Gemini di-`await` penuh lalu dipotong
  dengan `setTimeout(18ms)` per chunk → TTFB = waktu generasi penuh. `sendMessageStream` tak dipakai.
- **`history` tidak divalidasi** (tanpa cap panjang/shape) — risiko token cost & error.
- Field **`language` dikirim client tapi diabaikan** server (`useChat.ts:154` vs `chat/route.ts`).
- **Tidak ada timeout** pada call Gemini (`gemini.ts`) — upstream hang = request hang (diperparah
  retry × fallback).

### Email
- **HTML injection** — `api/contact/route.ts` (~169/175/182/198): `name`/`email`/`message`
  disisipkan **mentah** ke HTML email. Fungsi `esc()` sudah ada di `email.ts` tapi tak dipakai di sini.

### Keamanan umum / config
- **Tidak ada security header global** di `next.config.ts` (satu-satunya: `Referrer-Policy` di
  `/order/:id`). Belum ada CSP, `X-Frame-Options`, `X-Content-Type-Options`, HSTS,
  `Permissions-Policy`. `X-Powered-By` masih aktif.
- 2× `dangerouslySetInnerHTML` (JSON-LD `page.tsx`, theme-init `layout.tsx`) — aman (statis) tapi
  butuh nonce agar cocok CSP ketat.
- Error `err.message` mentah dikembalikan ke client di `api/admin/orders/[id]` (~72–74).

### Data model (Prisma)
- **SQLite** = single-instance (sejalan dengan rate-limit in-memory → belum bisa horizontal scale).
- **Cascade tidak konsisten:** `Account`/`Session`/`EmailToken` cascade dari user, tapi `Order.user`
  **tanpa `onDelete`** (hapus user berorder gagal — sebetulnya sejalan dengan kebijakan "bekukan,
  jangan hapus").
- `AuditLog.actorId` belum ter-index; uang disimpan `Int` (OK untuk IDR, tanpa field currency).
- `role`/`status` free-form `String` (enum lewat komentar, tak di-enforce DB — batasan SQLite).

### Testing / CI
- **Tidak ada test sama sekali**; **tidak ada `.github/`** (tak ada CI/lint/build gate,
  Dependabot, CodeQL). Nol quality gate otomatis.
- `package.json`: tak ada script `test`/`typecheck`/`format`. `next-auth@^5.0.0-beta.31` masih
  **beta** dengan caret (bisa tertarik beta baru yang breaking).

### SEO / a11y / performa
- SEO kuat (metadata, OG, alternates, robots, sitemap) **tapi `sitemap.ts` hanya 1 URL**.
- `<img>` avatar GitHub (`ProjectsView.tsx:141`) — lewati optimisasi `next/image` & allowlist,
  tanpa width/height (risiko CLS).

### Deployment
- Dockerfile multi-stage, non-root, `prisma migrate deploy` saat start — baik. Tak ada `HEALTHCHECK`
  di Dockerfile (ada di compose).
- **Dokumentasi env kurang lengkap** di `DEPLOYMENT.md` (kurang `AUTH_SECRET`, `MIDTRANS_*`,
  `GOOGLE_*`). compose tak expose `ports` tapi docs menyebut `3000:3000` (mismatch).

---

## 3. Saran pengembangan (diprioritaskan)

### 🔴 P0 — Correctness & keamanan (dulu; menyangkut uang & data)
1. Idempotency webhook **atomic** — `updateMany({ where: { midtransOrderId, paidAt: null }, ... })`
   lalu cek affected count.
2. **Verifikasi nominal** di webhook (cocokkan `gross_amount` ↔ `payment.grossAmount`; idealnya
   re-fetch status Midtrans).
3. **Escape input** di email kontak (pakai `esc()`).
4. **Rate limiting terpusat + Redis** (mis. Upstash); tambah limit ke route LLM; tutup/auth
   `/api/models`.
5. `crypto.timingSafeEqual` untuk bandingkan signature Midtrans.

### 🟠 P1 — Keandalan, kualitas, & skala
6. **Test + CI:** Vitest (state machine order, signature, idempotency, guard RBAC) + Playwright
   (login→order→bayar sandbox) + GitHub Actions (lint+typecheck+build+test) + Dependabot/CodeQL.
7. **Security headers global** + CSP + `poweredByHeader: false` (+ nonce untuk skrip inline).
8. **Jalur scaling:** Postgres (ganti provider Prisma) + Redis.
9. **Streaming chat asli** (`sendMessageStream`); validasi `history`; hormati/hapus `language`.
10. **Timeout** semua call Gemini (`AbortController`).
11. Putuskan kebijakan **`emailVerified`** (soft badge vs gating aksi).
12. Konsistensi: pin `next-auth`, index `AuditLog.actorId`, tinjau cascade `Order.user`.

### 🟢 P2 — Fitur produk (banyak sudah tercantum di PRD §18)
13. **Invoice/kwitansi PDF** per order (nilai tinggi untuk freelance).
14. **Termin pembayaran (cicilan pelunasan)** — model Payment sudah mendukung.
15. **Komplain/revisi terstruktur** + **refund request flow**.
16. **Notifikasi WhatsApp** (melengkapi email).
17. **Audit log global** (`/admin/audit`) + halaman detail order admin (catatan, filter, ekspor).

### 🔵 P3 — Polish, SEO, a11y, DevX
18. Sitemap multi-URL (`/services`, `/projects`, `/contact`, legal, `/en`).
19. `<img>` GitHub → `next/image` + width/height.
20. Lengkapi dokumentasi env di `DEPLOYMENT.md`; rapikan mismatch `ports` compose.
21. Samarkan `err.message` mentah ke client (admin orders).
22. Script `typecheck`/`format` + Prettier.

---

## 4. Urutan eksekusi yang disarankan

| Sprint | Fokus | Item |
|---|---|---|
| **1** | Hardening uang & abuse | P0 #1–5 |
| **2** | Jaring pengaman | P1 #6–7 (test + CI + security headers) |
| **3+** | Nilai produk | P2 — mulai dari **Invoice PDF** + **WhatsApp notif** |

---

*Temuan dikumpulkan dari audit menyeluruh (pipeline AI/chat, seluruh API route, konfigurasi, data
model, keamanan). Perbarui checklist ini saat item selesai.*
