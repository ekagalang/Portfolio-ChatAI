# Roadmap Pengembangan — Dashboard Pemesanan & Pembayaran

Acuan eksekusi PRD (`docs/PRD.md`). Dibagi per **fase** yang masing-masing bisa diuji & dirilis sendiri. Tiap fase punya **prasyarat**, **tugas**, **file**, dan **selesai bila** (acceptance).

> **STATUS: Fase 0–5 SELESAI & terverifikasi** (build + smoke test login/RBAC/IDOR/order/quote/Snap DP lolos).
> Sisa aksi manual owner: isi kredensial Google OAuth (opsional), daftarkan Notification URL Midtrans, set `.env.production` + volume DB saat deploy.

> Status awal: Migrasi Midtrans Snap + Prisma/SQLite + order dasar sudah ada. Sebagian akan **di-refactor** mengikuti model baru (harga di-set admin, satu order banyak transaksi).

Legend status: ☐ belum · ◐ proses · ☑ selesai

---

## Fase 0 — Fondasi Data & Autentikasi
**Tujuan:** user bisa daftar/login/logout; route terproteksi sesuai peran. Belum ada fitur order.
**Prasyarat:** `AUTH_SECRET` di-set; (opsional) `GOOGLE_CLIENT_ID/SECRET`; `ADMIN_EMAILS`.

**Tugas**
- ☐ Perluas skema Prisma: `User`, `Account`, `Session`, `VerificationToken`; update `Order` (userId, status quote, agreedTotal, dpAmount, progress); `Payment` (midtransOrderId unik, type dp/settlement)
- ☐ Migrasi DB (`prisma migrate dev`)
- ☐ Install & konfigurasi Auth.js v5 + Prisma adapter + bcrypt
- ☐ Provider: Credentials (email/password) + Google OAuth
- ☐ Halaman `/login` & `/register`
- ☐ Util session helper (`getCurrentUser`, `requireUser`, `requireAdmin`)
- ☐ Middleware proteksi: `/dashboard/**` (login), `/admin/**` (admin)
- ☐ Tombol login/logout di Navbar/Sidebar

**File:** `prisma/schema.prisma`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/middleware.ts`, `src/lib/session.ts`, `.env*`

**Selesai bila:**
- Daftar + login email/password berhasil; login Google berhasil (bila env terisi)
- `/dashboard` & `/admin` menolak akses tanpa hak (redirect/403)
- Email di `ADMIN_EMAILS` mendapat role admin

---

## Fase 1 — Pemesanan & Dashboard Customer (read)
**Tujuan:** customer bisa membuat order request & melihatnya. Belum ada pembayaran (harga belum ada).
**Prasyarat:** Fase 0.

**Tugas**
- ☐ `POST /api/orders` — buat order status `requested` (validasi jasa + brief)
- ☐ `GET /api/orders` — daftar order milik user
- ☐ `GET /api/orders/[id]` — detail (cek kepemilikan, cegah IDOR)
- ☐ Halaman `/order/new` — form (prefill jasa dari query, brief, phone)
- ☐ Ubah tombol "Pesan" di Services → arah ke `/order/new` (atau login dulu); **hapus PaymentModal lama**
- ☐ `/dashboard` — daftar order + status badge
- ☐ `/dashboard/orders/[id]` — detail order (read-only di fase ini)
- ☐ Email ke admin saat order baru

**File:** `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`, `src/app/order/new/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/orders/[id]/page.tsx`, `src/lib/orders.ts`, `src/components/views/ServicesView.tsx`, `src/components/ServicesPageContent.tsx`

**Selesai bila:**
- Guest klik "Pesan" → login → `/order/new` → submit → muncul di `/dashboard` (`requested`)
- Customer A tidak bisa buka order Customer B
- Admin terima email order baru

---

## Fase 2 — Dashboard Admin & Penetapan Harga
**Tujuan:** admin kelola order: set harga/DP, status, progress.
**Prasyarat:** Fase 1.

**Tugas**
- ☐ `/admin` — daftar semua order + filter status
- ☐ `/admin/orders/[id]` — detail + form set `agreedTotal` & `dpAmount` → status `quoted`
- ☐ Update status (validasi transisi state machine)
- ☐ Update progress (persen + catatan)
- ☐ `PATCH /api/admin/orders/[id]` — admin-only (harga/status/progress)
- ☐ Email ke customer saat `quoted`

**File:** `src/app/admin/page.tsx`, `src/app/admin/orders/[id]/page.tsx`, `src/app/api/admin/orders/[id]/route.ts`, `src/lib/orders.ts` (transisi status)

**Selesai bila:**
- Admin set harga → status `quoted`, customer dapat email
- Admin update progress → terlihat di dashboard customer
- Non-admin ditolak di semua endpoint admin

---

## Fase 3 — Pembayaran DP & Pelunasan
**Tujuan:** pembayaran end-to-end via Snap dari dashboard.
**Prasyarat:** Fase 2; Notification URL Midtrans aktif.

**Tugas**
- ☐ Refactor `POST /api/payment/create` — terima `orderId` + `type` (dp|settlement); hitung nominal dari order; buat `Payment` + `midtransOrderId` unik
- ☐ Refactor `POST /api/payment/callback` — cari Payment by `midtransOrderId`/`transactionId`, idempotent, update Order (`dp_paid`/`completed`)
- ☐ Tombol **Bayar DP** (status `quoted`) & **Bayar Pelunasan** (status `awaiting_settlement`) di dashboard
- ☐ Admin "Terbitkan pelunasan" → status `awaiting_settlement`
- ☐ Komponen Snap pay (reuse `window.snap.pay`) + redirect ke detail order
- ☐ Email DP diterima & pelunasan diterima

**File:** `src/app/api/payment/create/route.ts`, `src/app/api/payment/callback/route.ts`, `src/lib/midtrans.ts`, `src/lib/orders.ts`, komponen tombol bayar di `dashboard/orders/[id]`

**Selesai bila:**
- Bayar DP → `dp_paid` (terverifikasi webhook, idempotent terhadap notifikasi ganda)
- Bayar pelunasan → `completed`
- Signature webhook salah → 403; nominal sesuai order

---

## Fase 4 — Notifikasi Email Lengkap
**Tujuan:** semua trigger email PRD §10 aktif & rapi.
**Prasyarat:** Fase 3.

**Tugas**
- ☐ Template & pengiriman: order baru, quoted, DP diterima, tagihan pelunasan, pelunasan diterima
- ☐ Escape semua nilai dinamis (anti HTML injection)
- ☐ Kegagalan email tidak menggagalkan transaksi (log saja)

**File:** `src/lib/email.ts`

**Selesai bila:** tiap transisi mengirim email yang benar ke penerima yang benar.

---

## Fase 5 — Polish, Uji E2E & Submit Midtrans
**Tujuan:** siap produksi & submit Midtrans.
**Prasyarat:** Fase 4.

**Tugas**
- ☐ Uji alur penuh di sandbox (request → quote → DP → progress → pelunasan → completed)
- ☐ Responsif mobile + konsistensi tema
- ☐ Edge case: order batal, pembayaran expire, dobel-bayar
- ☐ `noindex` halaman privat; review keamanan akhir (RBAC/IDOR/secrets)
- ☐ Update `.env.example`, `DEPLOYMENT.md`, Dockerfile (Prisma engine + volume DB)
- ☐ Siapkan screenshot flow → submit Midtrans

**Selesai bila:** seluruh kriteria penerimaan PRD §16 ✔ dan dokumen lampiran Midtrans siap.

---

## Ringkasan Dependensi
```
Fase 0 (auth+DB) → Fase 1 (pesan) → Fase 2 (admin/harga) → Fase 3 (bayar) → Fase 4 (email) → Fase 5 (polish/submit)
```
Tiap fase shippable. Aksi yang dibutuhkan dari owner: `AUTH_SECRET`, kredensial Google OAuth (untuk login Google), `ADMIN_EMAILS`, dan aktivasi Notification URL Midtrans (Fase 3).
