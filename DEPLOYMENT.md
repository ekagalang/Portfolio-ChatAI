# Docker Compose Deployment

Panduan ini diasumsikan untuk server Ubuntu 22.04/24.04. Jika Anda deploy ke distro lain, intinya tetap sama: install Git, Docker Engine, dan Docker Compose plugin.

## 1. Kebutuhan

- Domain atau IP server
- Akses SSH ke server
- Git
- Docker Engine
- Docker Compose plugin

## 2. Siapkan file environment

Di root project, copy `.env.example` menjadi `.env.production`, lalu isi nilainya:

```bash
cp .env.example .env.production
```

Variable yang wajib diisi:

- `GEMINI_API_KEY`
- `GITHUB_USERNAME`
- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `FROM_EMAIL`

Variable opsional:

- `GITHUB_TOKEN`
- `NEXT_PUBLIC_UMAMI_ID`
- `NEXT_PUBLIC_UMAMI_URL`

Catatan:

- `NEXT_PUBLIC_UMAMI_*` dibaca saat image dibuild. Karena itu jalankan Compose dengan `--env-file .env.production`.
- Jika analytics Umami tidak dipakai, biarkan kosong.

## 3. Install dependency server

Hapus package Docker lama kalau ada:

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt remove -y $pkg; done
```

Update package system:

```bash
sudo apt update
sudo apt upgrade -y
```

Install utilitas dasar:

```bash
sudo apt install -y ca-certificates curl gnupg git ufw
```

Tambahkan repository Docker resmi:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

Install Docker Engine + Compose plugin:

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run hello-world
```

Opsional agar tidak perlu `sudo` saat menjalankan Docker:

```bash
sudo usermod -aG docker $USER
```

Logout lalu login lagi setelah menjalankan perintah di atas.

## 4. Ambil source code

Clone project dan masuk ke folder-nya:

```bash
git clone <repo-url>
cd portfolio-ai
```

Buat file environment production:

```bash
cp .env.example .env.production
nano .env.production
```

## 5. Build dan jalankan container

Jalankan aplikasi:

```bash
docker compose --env-file .env.production up -d --build
```

Karena file `docker-compose.yml` memetakan port `3000:3000`, aplikasi akan tersedia di:

```text
http://SERVER_IP:3000
```

Jika port `3000` bentrok, ganti bagian kiri mapping port di `docker-compose.yml`.

## 6. Verifikasi hasil deploy

Lihat status container:

```bash
docker compose ps
```

Lihat log aplikasi:

```bash
docker compose logs -f app
```

Tes endpoint utama:

```bash
curl http://127.0.0.1:3000
```

## 7. Buka firewall

Jika aplikasi diakses langsung lewat port `3000`:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw enable
```

Jika nanti dipasang reverse proxy, biasanya yang dibuka cukup `80` dan `443`.

## 8. Update deployment

Saat ada perubahan code:

```bash
git pull
docker compose --env-file .env.production up -d --build
```

## 9. Perintah operasional

Restart container:

```bash
docker compose restart app
```

Stop aplikasi:

```bash
docker compose down
```

Lihat image yang terbangun:

```bash
docker images | grep portfolio-ai
```

## 10. Rekomendasi production

- Gunakan reverse proxy seperti Nginx atau Caddy di depan container agar domain dan SSL lebih mudah.
- Jangan commit `.env.production`.
- Untuk perubahan pada `NEXT_PUBLIC_UMAMI_*`, rebuild image dengan `docker compose --env-file .env.production up -d --build`.
- Untuk API AI/email, pastikan outbound network server tidak diblokir ke Google, GitHub, dan Resend.
