# Scaling: Postgres + Redis

Panduan migrasi dari **SQLite + rate limiter in-memory** ke **Postgres + Redis**,
disesuaikan dengan infrastruktur yang **sudah berjalan** di VPS produksi.

> Status saat ini (dev): `provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`,
> rate limiter in-memory (`src/lib/rate-limit.ts`). Cukup untuk single-instance,
> tapi tidak durable (file volume) dan tidak bisa dibagi antar-instance.

---

## 1. Apa yang sudah tersedia di VPS

Hasil inspeksi (`ssh VPS`, read-only) pada `/home/a/dck`:

| Layanan | Container | Image | Network | Port | Catatan |
|---|---|---|---|---|---|
| Postgres | `postgres_docker` | `postgres:16-alpine` | `dck_backend` | 5432 (internal) | `POSTGRES_USER=postgres`, DB `app_db` (dipakai app lain) |
| Redis | `redis_cache` | `redis:7-alpine` | `dck_backend` | 6379 (internal) | `PING → PONG`, sehat |
| Portfolio | `main_apps` | build lokal | `dck_frontend` | 3000 | **versi lama** (chat-only, belum ada Prisma/auth/order) |

Fakta penting:

1. **Postgres & Redis sudah ada dan sehat** — tinggal dipakai. Keduanya di network
   `dck_backend`, **tidak** dipublish ke host (hanya bisa diakses dari dalam network itu).
2. **Portfolio (`main_apps`) hanya di `dck_frontend`** → saat ini **tidak bisa** menjangkau
   Postgres/Redis. Perlu ikut join `dck_backend`.
3. **Versi yang ter-deploy sudah usang.** Git di `/home/a/dck/main` masih di commit
   "Add standalone /contact and /services pages" — semua pekerjaan sesi ini (auth, order,
   pembayaran, dashboard, i18n, analytics, user-management) **belum di-push / belum di-deploy**.
4. Jangan pakai ulang database `app_db` — buat database **terpisah** `portfolio` agar
   isolasi dari aplikasi bisnis lain.

**Konsekuensi urutan kerja:** migrasi Postgres di produksi baru relevan **setelah**
kode terbaru di-deploy. Deploy kode terbaru = deploy auth + pembayaran → butuh secret
produksi asli (`AUTH_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `MIDTRANS_*`,
`GOOGLE_*`). Itu langkah rilis tersendiri yang harus kamu jalankan sadar-penuh.

---

## 2. Keputusan yang perlu diambil dulu

Prisma hanya punya **satu** `provider`. Mengubahnya ke `postgresql` membuat **dev lokal
juga butuh Postgres** (SQLite tidak lagi dipakai). Postgres VPS internal-only, jadi tidak
bisa dipakai langsung dari laptop. Pilih salah satu untuk dev:

- **A. Postgres lokal via Docker** (rekomendasi) — 1 container kecil, paling mirip produksi.
- **B. Postgres cloud gratis** (Neon / Supabase) untuk dev.
- **C. Tetap SQLite di dev, Postgres hanya di produksi** — *tidak disarankan*: beda dialek
  (tipe kolom, `@db.*`, migrasi) bisa lolos di dev tapi gagal di produksi.

Panduan di bawah mengasumsikan **A**.

---

## 3. Migrasi Postgres — langkah kode (lokal)

### 3.1 Postgres lokal untuk dev

`docker run` sekali pakai (atau tambahkan ke compose dev):

```bash
docker run -d --name pf-postgres \
  -e POSTGRES_USER=portfolio -e POSTGRES_PASSWORD=portfolio -e POSTGRES_DB=portfolio \
  -p 5432:5432 postgres:16-alpine
```

`.env.local`:

```
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio?schema=public"
```

### 3.2 Ganti provider di schema

`prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   // sebelumnya "sqlite"
  url      = env("DATABASE_URL")
}
```

Cek tipe kolom yang SQLite-toleran tapi Postgres ketat. Skema ini aman (String/Int/
DateTime/Boolean + `@unique`/`@id`), tidak ada tipe SQLite-spesifik. `orderNumber Int?`
dan index tetap valid.

### 3.3 Buat baseline migrasi Postgres

Migrasi SQLite lama **tidak** bisa dipakai ulang (sintaks beda). Buat baseline baru:

```bash
rm -rf prisma/migrations          # buang histori migrasi SQLite
npx prisma migrate dev --name init_postgres
npx prisma generate
```

Data di `dev.db` hanya data uji → diabaikan. (Produksi lama tidak punya DB sama sekali,
jadi **tidak ada migrasi data** — mulai bersih.)

### 3.4 Verifikasi lokal

```bash
npm run build          # pastikan Prisma client Postgres kompilasi
npx prisma studio      # cek skema di Postgres
npm test               # unit test tetap hijau (tidak menyentuh DB)
```

---

## 4. Migrasi Postgres — langkah produksi (VPS)

> Semua langkah di bawah **mengubah** produksi → jalankan sadar-penuh, saat siap rilis.
> Prasyarat: kode terbaru sudah di-push & tersedia di `/home/a/dck/main`.

### 4.1 Buat database `portfolio` di Postgres yang sudah ada

```bash
ssh VPS
docker exec -it postgres_docker psql -U postgres -c "CREATE DATABASE portfolio;"
docker exec -it postgres_docker psql -U postgres -c \
  "CREATE USER portfolio WITH PASSWORD 'GANTI_PASSWORD_KUAT';"
docker exec -it postgres_docker psql -U postgres -c \
  "GRANT ALL PRIVILEGES ON DATABASE portfolio TO portfolio;"
# Postgres 16: beri hak schema public
docker exec -it postgres_docker psql -U postgres -d portfolio -c \
  "GRANT ALL ON SCHEMA public TO portfolio;"
```

### 4.2 Set env produksi

`/home/a/dck/main/.env.production` — host = **nama container** (resolusi via network Docker):

```
DATABASE_URL="postgresql://portfolio:GANTI_PASSWORD_KUAT@postgres_docker:5432/portfolio?schema=public"
REDIS_URL="redis://redis_cache:6379"     # opsional, lihat §5
```

### 4.3 Sambungkan portfolio ke network backend

`main_apps` harus bisa melihat `postgres_docker`/`redis_cache` (network `dck_backend`).
Di `compose.yml` portfolio:

```yaml
services:
  app_main:
    networks:
      - frontend
      - backend        # tambah ini
networks:
  frontend:
    external: true
    name: dck_frontend
  backend:
    external: true
    name: dck_backend
```

(Sesuaikan nama network eksternal dengan yang ada: `docker network ls`.)

### 4.4 Jalankan migrasi & deploy

Migrasi dijalankan saat start container (entrypoint) atau manual sekali:

```bash
# migrasi (via container yang punya prisma + DATABASE_URL produksi)
docker compose -f /home/a/dck/main/compose.yml run --rm app_main npx prisma migrate deploy

# build & up (blue/green atau restart biasa)
docker compose -f /home/a/dck/main/compose.yml up -d --build
```

### 4.5 Verifikasi

```bash
docker exec postgres_docker psql -U postgres -d portfolio -c "\dt"   # tabel muncul
curl -fsS http://localhost:3000/ >/dev/null && echo OK
docker logs --tail=50 main_apps
```

### 4.6 Rollback

- DB terisolasi (`portfolio`), tidak menyentuh `app_db` → aman.
- Untuk balik: kembalikan `DATABASE_URL` lama + image sebelumnya, `up -d`.
- Backup: `docker exec postgres_docker pg_dump -U postgres portfolio > portfolio.sql`.

---

## 5. Redis untuk rate limiting (opsional)

**Kapan perlu:** hanya jika portfolio berjalan **multi-instance** (beberapa container
melayani bersamaan). Saat ini portfolio **single-container** (`main_apps`, bukan
blue/green simultan), jadi rate limiter in-memory **sudah cukup** dan Redis **belum
mendesak**. Skala ke Redis saat benar-benar horizontal.

Bila diaktifkan, `src/lib/rate-limit.ts` dibuat "Redis-ready": pakai `REDIS_URL` bila ada
(atomic `INCR` + `EXPIRE`), fallback ke in-memory bila tidak. Karena Redis async, API
`rateLimit()` menjadi `async` dan 5 pemanggil di-`await`:
`api/chat`, `api/contact`, `api/suggestions`, `api/payment/create`, `api/auth/resend-verification`.

Redis VPS (`redis_cache`) dibagi banyak app → pakai **prefix key** unik, mis. `pf:` +
key rate-limit, agar tidak bentrok.

> Belum diterapkan di kode karena nilai praktisnya rendah untuk setup single-container
> saat ini. Aktifkan saat scaling horizontal.

---

## 6. Ringkasan urutan aman

1. (Dev) Postgres lokal → ganti provider → baseline migrasi → build/test hijau. ✅ aman
2. (Rilis) Push kode terbaru + set secret produksi. ⚠️ langkah rilis sadar-penuh
3. (Prod) Buat DB `portfolio` di `postgres_docker` → set `DATABASE_URL` → join `dck_backend`
   → `migrate deploy` → deploy. ⚠️ mengubah produksi
4. (Nanti) Redis rate limiter saat scaling horizontal. ⏸️ opsional
