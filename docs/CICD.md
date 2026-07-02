# CI/CD — self-hosted runner (VPS)

Pipeline portfolio: **CI** (uji) → **Deploy** (rilis) berjalan di **self-hosted
runner** di VPS. CodeQL tetap di GitHub-hosted (scan keamanan).

```
push/PR ──► CI (self-hosted: lint, typecheck, test, build)
                     │ sukses & branch=main
                     ▼
              Deploy (self-hosted: rsync → compose up --build → healthcheck → reload nginx)
```

Repo: `github.com/ekagalang/Portfolio-ChatAI`. Runner **level-repo**, label `portfolio`.

---

## 1. Infra VPS (ringkas)

| Komponen | Nilai |
|---|---|
| Deploy dir (build context) | `/home/a/dck/main` |
| Container app | `main_apps` (service `app_main`) |
| Nginx | `nginx_utama` → `proxy_pass http://app_main:3000` (domain `ekagalang.my.id`) |
| Postgres | `postgres_docker` (network `dck_backend`, DB `portfolio`) |
| Redis | `redis_cache` (network `dck_backend`, opsional) |
| Network app | `dck_frontend` (nginx) + `dck_backend` (db/redis) |
| User runner/deploy | `adminbass` (grup `docker` + `sudo`) |

Migrasi Postgres dijalankan otomatis oleh `CMD` Dockerfile (`prisma migrate deploy`)
saat container start — tidak ada langkah migrate terpisah di workflow.

---

## 2. Daftarkan runner (sekali)

Di GitHub: repo **Settings → Actions → Runners → New self-hosted runner → Linux x64**,
salin **token** registrasi (berlaku ~1 jam).

Di VPS (sebagai `adminbass`):

```bash
sudo -iu adminbass
mkdir -p ~/runner-portfolio && cd ~/runner-portfolio
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.334.0/actions-runner-linux-x64-2.334.0.tar.gz
tar xzf actions-runner.tar.gz
./config.sh --url https://github.com/ekagalang/Portfolio-ChatAI \
  --token <TOKEN> --name portfolio-runner --labels portfolio --unattended
sudo ./svc.sh install adminbass
sudo ./svc.sh start
```

Cek: `sudo ./svc.sh status` → running. Di GitHub, runner `portfolio-runner` idle.

---

## 3. Prasyarat deploy pertama (sekali)

1. **DB Postgres** — buat DB + user `portfolio` di `postgres_docker`
   (lihat `docs/SCALING.md` §4.1).
2. **Kepemilikan deploy dir** — agar runner bisa rsync tanpa sudo:
   ```bash
   sudo chown -R adminbass:adminbass /home/a/dck/main
   ```
3. **`.env.production`** — isi lengkap di `/home/a/dck/main/.env.production` (lihat §4).
4. **rsync** ada di host (`which rsync` — Ubuntu biasanya sudah).

---

## 4. `.env.production` (checklist)

Wajib:

```
DATABASE_URL=postgresql://portfolio:<PASS>@postgres_docker:5432/portfolio?schema=public
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://ekagalang.my.id        # WAJIB di belakang proxy (kalau tidak, callback OAuth = 0.0.0.0:3000)
NEXT_PUBLIC_APP_URL=https://ekagalang.my.id
GEMINI_API_KEY=...
GITHUB_USERNAME=ekagalang
RESEND_API_KEY=...
CONTACT_EMAIL=...
FROM_EMAIL=...
MIDTRANS_SERVER_KEY=...                 # sandbox dulu
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...     # di-inline saat build (Snap) → jadi build arg
```

> `NEXT_PUBLIC_*` (client key, app url, umami) di-*inline* saat `next build`,
> jadi di-pass sebagai **build arg** oleh `compose.yml` dari `.env.production`.

Opsional: `ADMIN_EMAILS`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`,
`MIDTRANS_ENV` (`sandbox`|`production`), `REDIS_URL=redis://redis_cache:6379`,
`GITHUB_TOKEN`, `NEXT_PUBLIC_UMAMI_*`.

Secret **tidak** disimpan di GitHub — runner deploy lokal membaca file ini di VPS.

---

## 5. Cara kerja deploy

1. Push ke `main` → CI jalan (uji). Sukses → workflow **Deploy** ter-trigger.
2. Deploy: rsync source → `/home/a/dck/main` (kecuali `.env.production`) →
   `docker compose --env-file .env.production up -d --build` (image dibangun saat
   container lama masih melayani; migrasi jalan saat container baru start) →
   tunggu healthcheck → `docker exec nginx_utama nginx -s reload`.
3. Downtime: hanya jendela recreate container (~detik), bukan durasi build.

## 6. Rollback

```bash
cd /home/a/dck/main
git checkout <commit-lama> -- .        # atau reset source
docker compose --env-file .env.production up -d --build
docker exec nginx_utama nginx -s reload
```

Backup DB sebelum rilis besar: `docker exec postgres_docker pg_dump -U postgres portfolio > portfolio_$(date +%F).sql`.

## 7. Catatan

- **Blue/green tidak dipakai** (situs pribadi, deploy simpel cukup). Bila perlu
  zero-downtime, adopsi pola `set $upstream ...; proxy_pass $upstream;` + resolver
  seperti app lain di nginx-config, plus 2 container blue/green.
- CI/build membebani VPS sesaat — build jarang (per push ke `main`).
