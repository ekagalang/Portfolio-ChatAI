# PRD — Sistem Pemesanan Jasa & Pembayaran (Dashboard User + Admin)

**Produk:** Portfolio AI — Galang (ekagalang.my.id)
**Versi dokumen:** 1.0
**Tanggal:** 2026-06-30
**Status:** Disetujui untuk dikembangkan

---

## 1. Latar Belakang

Portfolio ini sudah punya integrasi pembayaran **Midtrans Snap (sandbox)** dan penyimpanan order dasar (Prisma + SQLite, "Fase 1"). Namun model lama mengasumsikan harga tetap dari katalog — padahal jasa freelance bersifat **custom** ("harga tergantung kompleksitas"). Selain itu Midtrans meminta konfirmasi penggunaan (DP/pelunasan) + flow transaksi.

Keputusan produk: bergerak ke model **komunikasi dulu → harga disepakati → bayar**, dengan **dashboard untuk customer dan admin**.

## 2. Tujuan & Non-Tujuan

### Tujuan
- Customer dapat memesan jasa, melihat status & progress, serta membayar **DP dan pelunasan** secara mandiri lewat dashboard.
- Admin (Galang) dapat mengelola order, **menetapkan harga kesepakatan + DP**, mengubah status, dan menerbitkan tagihan pelunasan.
- Pembayaran terintegrasi Midtrans Snap untuk DP & pelunasan.
- Semua pembayaran tercatat (idempotent) dan terverifikasi via webhook.

### Non-Tujuan (di luar scope versi ini)
- Sistem komplain/ticketing formal (cukup WhatsApp/email).
- Refund flow otomatis (refund manual via dashboard Midtrans).
- Multi-admin / tim. Hanya 1 admin (owner).
- Multi-currency. Hanya IDR.
- Multi-instance/horizontal scaling (SQLite single-instance; lihat §13).

## 3. Persona & Peran

| Peran | Siapa | Akses |
|---|---|---|
| **Guest** | Pengunjung belum login | Halaman publik, chat AI, lihat jasa |
| **Customer** | User terdaftar | Buat order, dashboard, bayar DP/pelunasan |
| **Admin** | Galang (email di allowlist) | Semua order, set harga, update status, terbitkan tagihan |

Peran admin ditentukan oleh **email allowlist** (env `ADMIN_EMAILS`). Tidak ada UI promosi peran.

## 4. Keputusan Kunci (sudah final)

1. **Harga ditetapkan admin** setelah komunikasi (bukan diinput customer).
2. **Auth:** Google OAuth **dan** email/password (Auth.js v5).
3. **Urutan:** dashboard dibangun lebih dulu, submit Midtrans menyusul.
4. DP **variabel per order** (nominal dari kesepakatan), dipotong dari total.

## 5. Alur Utama (User Flow)

### 5.1 Pemesanan (komunikasi-dulu)
```
Guest klik "Pesan" di /services
  → belum login? redirect /login?callback=/order/new?service=<id>
  → sudah login → /order/new (form: jasa + brief kebutuhan)
  → submit → Order status "requested" → redirect /dashboard
  → kartu order: "Menunggu penawaran harga"

Admin di /admin/orders/[id]:
  → diskusi (di luar app: WA/chat) → set agreedTotal + dpAmount
  → status menjadi "quoted"
  → email otomatis ke customer: "Penawaran siap"

Customer di /dashboard/orders/[id]:
  → lihat harga + DP → klik "Bayar DP" → Snap popup → bayar
  → webhook verifikasi → status "dp_paid" → email konfirmasi

Admin:
  → update progress & status ("in_progress")
  → saat siap pelunasan → terbitkan tagihan → status "awaiting_settlement"

Customer:
  → klik "Bayar Pelunasan" → Snap → webhook → status "completed"
```

### 5.2 Status lifecycle (state machine)
```
requested ──(admin set harga)──► quoted ──(bayar DP)──► dp_paid
   │                                                       │
   │                                            (admin mulai kerja)
   ▼                                                       ▼
cancelled ◄──(admin/customer batal)             in_progress
                                                           │
                                          (admin terbitkan pelunasan)
                                                           ▼
                                                awaiting_settlement
                                                           │
                                                  (bayar pelunasan)
                                                           ▼
                                                      completed
```
Transisi hanya boleh sesuai panah. Pembayaran gagal/expire tidak mengubah status order (tetap di state sebelumnya), hanya mencatat Payment gagal.

## 6. Kebutuhan Fungsional

### F1 — Autentikasi
- F1.1 Register via email + password (password di-hash bcrypt, min 8 karакter).
- F1.2 Login via email + password.
- F1.3 Login via Google OAuth.
- F1.4 Logout.
- F1.5 Session berbasis cookie (Auth.js, HttpOnly, Secure di production).
- F1.6 Email yang sama tidak bisa dobel-daftar; akun Google & password dengan email sama digabung (account linking) bila aman.
- F1.7 Proteksi route: `/dashboard/**` butuh login; `/admin/**` butuh role admin.
- F1.8 Admin ditentukan dari `ADMIN_EMAILS` (comma-separated).

### F2 — Pemesanan (Order Request)
- F2.1 Form `/order/new`: pilih jasa (prefill dari query `service`), isi brief/kebutuhan, kontak (phone opsional).
- F2.2 Submit membuat Order status `requested`, terkait `userId`.
- F2.3 Email notifikasi ke admin tentang order baru.
- F2.4 Customer diarahkan ke `/dashboard` setelah submit.
- F2.5 Validasi: jasa wajib valid, brief min 10 karakter.

### F3 — Dashboard Customer
- F3.1 `/dashboard`: daftar order milik user (status, jasa, tanggal).
- F3.2 `/dashboard/orders/[id]`: detail order — status, progress (%/catatan), rincian harga (total, DP, sisa), riwayat pembayaran.
- F3.3 Tombol **Bayar DP** muncul saat status `quoted`.
- F3.4 Tombol **Bayar Pelunasan** muncul saat status `awaiting_settlement`.
- F3.5 Customer hanya bisa mengakses order miliknya (cegah IDOR).

### F4 — Dashboard Admin
- F4.1 `/admin`: daftar semua order + filter status.
- F4.2 `/admin/orders/[id]`: detail order + form set `agreedTotal` & `dpAmount` (→ status `quoted`).
- F4.3 Update status manual (mis. `in_progress`) sesuai transisi yang valid.
- F4.4 Update progress (persen 0–100 + catatan teks).
- F4.5 Terbitkan tagihan pelunasan (→ status `awaiting_settlement`).
- F4.6 Lihat riwayat pembayaran tiap order.
- F4.7 Hanya role admin yang boleh akses semua endpoint admin.

### F5 — Pembayaran (Midtrans Snap)
- F5.1 Buat transaksi Snap untuk **DP** (nominal = `dpAmount`).
- F5.2 Buat transaksi Snap untuk **pelunasan** (nominal = `agreedTotal − dpAmount`).
- F5.3 Setiap pembayaran punya `midtransOrderId` unik (Order bisa banyak pembayaran).
- F5.4 Webhook memverifikasi signature SHA512 dan memperbarui Payment + Order **idempotent**.
- F5.5 Halaman/komponen pembayaran membaca status final dari DB (bukan dari event JS).

### F6 — Notifikasi Email (Resend)
- F6.1 Order baru → email ke admin.
- F6.2 Harga ditetapkan (`quoted`) → email ke customer.
- F6.3 DP diterima → email ke customer + admin.
- F6.4 Tagihan pelunasan terbit → email ke customer.
- F6.5 Pelunasan diterima → email ke customer + admin.
- F6.6 Semua nilai dinamis di-escape (cegah HTML injection).

## 7. Data Model (Prisma)

> Perubahan dari Fase 1: tambah `User` + tabel Auth.js, Order dapat `userId` + field quote, Payment dapat `midtransOrderId` unik per transaksi.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?   // null untuk akun OAuth-only
  role          String    @default("customer") // customer | admin
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  createdAt     DateTime  @default(now())
}

// + model Account, Session, VerificationToken (skema standar Auth.js Prisma adapter)

model Order {
  id            String    @id @default(cuid())
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  serviceId     String
  serviceTitle  String
  brief         String
  phone         String?

  status        String    @default("requested")
  // requested | quoted | dp_paid | in_progress | awaiting_settlement | completed | cancelled

  agreedTotal   Int?      // diisi admin saat quote
  dpAmount      Int?      // diisi admin saat quote
  progressPct   Int       @default(0)
  progressNote  String?

  payments      Payment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([status])
}

model Payment {
  id                String    @id @default(cuid())
  order             Order     @relation(fields: [orderId], references: [id])
  orderId           String
  type              String    // dp | settlement
  grossAmount       Int
  midtransOrderId   String    @unique // dikirim ke Midtrans, mis. <orderId>-DP
  transactionId     String?   @unique // transaction_id Midtrans (idempotency)
  transactionStatus String    @default("pending")
  paymentType       String?
  snapToken         String?
  paidAt            DateTime?
  createdAt         DateTime  @default(now())

  @@index([orderId])
}
```

## 8. Rute & Halaman

| Rute | Akses | Fungsi |
|---|---|---|
| `/`, `/services`, `/contact`, `/projects`, legal | Guest | Publik (sudah ada) |
| `/login`, `/register` | Guest | Auth |
| `/api/auth/[...nextauth]` | — | Auth.js handler |
| `/order/new` | Customer | Form request order |
| `/dashboard` | Customer | Daftar order |
| `/dashboard/orders/[id]` | Customer (pemilik) | Detail + bayar |
| `/admin` | Admin | Daftar semua order |
| `/admin/orders/[id]` | Admin | Set harga, status, progress |
| `/api/orders` | Customer | POST buat order, GET list |
| `/api/orders/[id]` | Customer (pemilik) | GET detail |
| `/api/admin/orders/[id]` | Admin | PATCH harga/status/progress |
| `/api/payment/create` | Customer (pemilik) | Buat Snap (DP/pelunasan) |
| `/api/payment/callback` | Midtrans | Webhook notifikasi |

## 9. Integrasi Midtrans

- **Snap** create transaction: `POST /snap/v1/transactions`, Basic auth Server Key.
- **Notification URL** (dashboard Midtrans) → `/api/payment/callback`.
- **Signature webhook:** `SHA512(order_id + status_code + gross_amount + serverKey)`.
- **Mapping status:** `capture`(fraud=accept)/`settlement` → success; `pending` → pending; `deny`/`cancel`/`expire`/`failure` → failed.
- **order_id Midtrans = `Payment.midtransOrderId`** (bukan `Order.id`), karena satu order punya banyak transaksi.
- **Konfirmasi ke Midtrans:** "DP **dan** pelunasan" — DP saat order disetujui, pelunasan saat pekerjaan siap dilunasi.

## 10. Notifikasi (ringkas)

| Trigger | Penerima | Channel |
|---|---|---|
| Order `requested` | Admin | Email |
| Order `quoted` | Customer | Email |
| DP `dp_paid` | Customer + Admin | Email |
| Tagihan pelunasan terbit | Customer | Email |
| Pelunasan `completed` | Customer + Admin | Email |

## 11. Kebutuhan Non-Fungsional

- **Keamanan:**
  - RBAC di middleware + verifikasi kepemilikan order (cegah IDOR) di setiap endpoint.
  - Password hash bcrypt; tidak pernah simpan plaintext.
  - Webhook wajib verifikasi signature; tolak 403 bila invalid.
  - Idempotency pembayaran via `transactionId`/`midtransOrderId` unik.
  - Secrets via env; tidak ada di repo.
  - Validasi & sanitasi input; escape HTML pada email.
  - Rate limit pada endpoint pembuatan order & pembayaran.
- **Privasi:** halaman order tidak diindeks (`noindex`).
- **Performa:** dashboard render < 1s untuk < 1000 order (SQLite cukup).
- **Responsif:** mobile-first, konsisten dengan tema gelap/mono yang ada.
- **Observability:** log webhook & error pembayaran.

## 12. Tech Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 (existing).
- **Auth.js v5** (`next-auth@beta`) + Prisma Adapter; provider Google + Credentials.
- **bcrypt** untuk hashing password.
- Prisma 6 + **SQLite** (existing; upgrade Postgres bila scale).
- Midtrans Snap (existing `src/lib/midtrans.ts`).
- Resend untuk email (existing).

## 13. Asumsi & Batasan

- Single instance (SQLite + rate-limit in-memory). Untuk multi-instance perlu Postgres + Redis.
- 1 admin (owner). Email admin via `ADMIN_EMAILS`.
- Refund & komplain ditangani manual (Midtrans dashboard + WA/email).
- Google OAuth butuh credential dari Google Cloud (disediakan owner).

## 14. Variabel Environment (tambahan)

```
# Auth.js
AUTH_SECRET=                # openssl rand -base64 32
AUTH_URL=                   # https://domain (production)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=eka.galang@...

# (existing) MIDTRANS_*, RESEND_*, DATABASE_URL, NEXT_PUBLIC_APP_URL
```

## 15. Milestone & Urutan Build

| # | Milestone | Output |
|---|---|---|
| **M1** | Skema DB + migrasi | User/Account/Session + Order(quote) + Payment(midtransOrderId) |
| **M2** | Auth | Auth.js (Google + email/password), `/login`, `/register`, middleware RBAC |
| **M3** | Flow Pesan | `/order/new`, ganti PaymentModal lama, endpoint `POST /api/orders` |
| **M4** | Dashboard customer | `/dashboard`, `/dashboard/orders/[id]` |
| **M5** | Dashboard admin | `/admin`, set harga/status/progress |
| **M6** | Pembayaran DP & pelunasan | refactor `/api/payment/*`, tombol bayar, webhook multi-payment |
| **M7** | Notifikasi email | semua trigger §10 |
| **M8** | Polish + uji E2E | uji alur penuh sandbox, siapkan screenshot Midtrans |

## 16. Kriteria Penerimaan (acceptance)

- [ ] Guest klik "Pesan" → diarahkan login bila belum, lalu ke `/order/new`.
- [ ] Customer dapat membuat order; muncul di dashboard sebagai `requested`.
- [ ] Admin set harga → status `quoted`, customer dapat email.
- [ ] Customer bayar DP via Snap → status `dp_paid` (terverifikasi webhook, idempotent).
- [ ] Admin update progress → terlihat di dashboard customer.
- [ ] Admin terbitkan pelunasan → customer bayar → status `completed`.
- [ ] Customer A tidak bisa membuka order milik Customer B (IDOR ditolak).
- [ ] Non-admin tidak bisa akses `/admin/**` atau endpoint admin.
- [ ] Webhook dengan signature salah ditolak 403.
- [ ] Pembayaran ganda (notifikasi duplikat) tidak menggandakan record.

## 17. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Scope besar, waktu molor | Build per-milestone, bisa rilis bertahap |
| Friksi login menurunkan konversi | Sediakan Google OAuth (1 klik) + email/password |
| SQLite bottleneck saat ramai | Path upgrade ke Postgres sudah disiapkan (ganti provider) |
| Submit Midtrans tertunda | Flow Fase 1 tetap bisa dipakai untuk submit lebih awal bila perlu |

## 18. Pengembangan Lanjutan (Fase berikut, di luar PRD ini)

- Termin pembayaran (cicilan pelunasan).
- Komplain/revisi terstruktur.
- Refund request flow.
- Notifikasi WhatsApp (API).
- Multi-admin / kolaborator.
- Invoice PDF.

---

*Dokumen ini acuan hidup — perbarui saat keputusan berubah.*
