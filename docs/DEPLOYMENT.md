# Deployment PrintOrder Server

Dokumen ini berisi catatan deployment internal untuk PrintOrder Server pada VPS. Dokumentasi ini tidak ditujukan sebagai panduan publik, melainkan sebagai referensi pemeliharaan server.

## Ringkasan

PrintOrder Server dijalankan sebagai aplikasi Node.js yang melayani portal mitra, portal admin, halaman pelanggan, API internal, upload dokumen, billing, realtime WebSocket, dan integrasi aplikasi klien desktop.

Deployment dilakukan dengan pola:

```txt id="1v69a6"
Local development → push ke GitHub → pull di VPS → install dependency jika perlu → restart service
```

## Informasi Deployment

| Item                     | Nilai                                            |
| ------------------------ | ------------------------------------------------ |
| Aplikasi                 | PrintOrder Server                                |
| Runtime                  | Node.js                                          |
| Process manager          | PM2                                              |
| Web server/reverse proxy | Nginx                                            |
| Database                 | PostgreSQL                                       |
| Direktori deployment     | `/var/www/printorder-server`                     |
| Domain produksi          | `printorder.web.id`                              |
| Branch deployment        | `to_prod`
| Entry point              | `server.js`                                      |
| Perintah start           | `npm start`                                      |

## Struktur Direktori Penting

```txt id="k8ft2e"
/var/www/printorder-server
├── src/
├── public/
├── scripts/
├── storage/
├── uploads/
├── docs/
├── server.js
├── package.json
├── package-lock.json
└── .env
```

Direktori penting:

| Direktori/File | Keterangan                                                           |
| -------------- | -------------------------------------------------------------------- |
| `src/`         | Source code utama server                                             |
| `public/`      | File frontend statis                                                 |
| `storage/`     | Penyimpanan internal, file job, data JSON fallback, dan installer    |
| `uploads/`     | File upload publik/internal seperti bukti pembayaran dan foto profil |
| `scripts/`     | Script pendukung dan migrasi                                         |
| `.env`         | Konfigurasi environment produksi                                     |
| `server.js`    | Entry point aplikasi                                                 |
| `package.json` | Konfigurasi dependency dan script Node.js                            |

## Akses ke VPS

Masuk ke VPS melalui SSH:

```bash id="1q0gsw"
ssh printorder@printorder.web.id
```

Atau menggunakan private key:

```bash id="14g0qt"
ssh -i "path/to/private-key.pem" printorder@printorder.web.id
```

Masuk ke direktori server:

```bash id="o6gop9"
cd /var/www/printorder-server
```

Contoh file `.bat` dari Windows:

```bat id="gmq40f"
@echo off
title PrintOrder Server SSH

ssh -i "C:\Users\yefta\Documents\printorder-key.pem" -t printorder@printorder.web.id "cd /var/www/printorder-server && pwd && git status && exec bash"

echo.
echo Koneksi SSH ditutup.
pause
```

## Kebutuhan Server

Pastikan VPS sudah memiliki komponen berikut:

| Komponen    | Keterangan                                       |
| ----------- | ------------------------------------------------ |
| Node.js     | Runtime aplikasi server                          |
| npm         | Package manager Node.js                          |
| PostgreSQL  | Database utama                                   |
| PM2         | Process manager Node.js                          |
| Nginx       | Reverse proxy HTTP/HTTPS                         |
| LibreOffice | Konversi dokumen Office ke PDF                   |
| Git         | Sinkronisasi source code dari repository         |
| Certbot/SSL | Sertifikat HTTPS, jika menggunakan Let's Encrypt |

Contoh instalasi dependency dasar pada Ubuntu:

```bash id="lwov5o"
sudo apt update
sudo apt install -y git nginx postgresql postgresql-contrib libreoffice
```

Instal Node.js dan PM2 sesuai versi yang digunakan pada server:

```bash id="f57nud"
node -v
npm -v
pm2 -v
```

Jika PM2 belum tersedia:

```bash id="u3w40c"
sudo npm install -g pm2
```

Cek LibreOffice:

```bash id="tqguz7"
soffice --version
```

## Clone atau Update Repository

Jika repository belum ada di VPS:

```bash id="smdtmh"
cd /var/www
git clone https://github.com/yeftakun/PrintForm-server.git printorder-server
cd /var/www/printorder-server
```

Pilih branch deployment:

```bash id="vhf8gj"
git checkout to_prod
```

Atau jika sudah final dan deployment memakai `master`:

```bash id="64h6pb"
git checkout master
```

Jika repository sudah ada, lakukan update:

```bash id="76wjm3"
cd /var/www/printorder-server
git status
git fetch origin
git pull origin to_prod
```

Untuk branch final:

```bash id="5g1k5b"
cd /var/www/printorder-server
git status
git fetch origin
git pull origin master
```

## Strategi Branch

Selama tahap pengembangan akhir:

```txt id="ivzaw7"
Lokal branch to_prod → push ke GitHub → VPS pull branch to_prod
```

Setelah aplikasi final:

```txt id="jsgqtq"
Merge to_prod ke master → VPS dapat dipindahkan ke master
```

Rekomendasi:

| Kondisi                   | Branch    |
| ------------------------- | --------- |
| Masih ada perubahan aktif | `to_prod` |
| Sudah final/stabil        | `master`  |

Perintah merge di lokal:

```bash id="gcob2n"
git checkout master
git pull origin master
git merge to_prod
git push origin master
```

Perintah pindah VPS ke `master` setelah final:

```bash id="zcpnkl"
cd /var/www/printorder-server
git fetch origin
git checkout master
git pull origin master
npm install
pm2 restart printorder-server
```

## Instalasi Dependency

Setelah pull perubahan dari repository:

```bash id="jrbze6"
cd /var/www/printorder-server
npm install
```

Untuk deployment yang lebih stabil, jika tersedia `package-lock.json`, dapat menggunakan:

```bash id="7fkwf9"
npm ci
```

Gunakan `npm install` jika masih ada perubahan dependency atau lockfile belum stabil.

## Konfigurasi Environment Produksi

File konfigurasi environment berada di root project:

```txt id="z2xt9g"
/var/www/printorder-server/.env
```

File `.env` berisi konfigurasi khusus server produksi dan tidak boleh dipublikasikan ke repository.

Contoh struktur `.env` produksi:

```env id="kdohms"
# =========================
# Core app
# =========================
NODE_ENV=production
PORT=3000
USE_DB=true
DATABASE_URL=postgresql://username:password@localhost:5432/printorder

# =========================
# Authentication
# =========================
AUTH_ENFORCE=true
AUTH_ALLOW_PUBLIC_REGISTER=true
AUTH_ACCESS_TOKEN_SECRET=ISI_DENGAN_SECRET_RANDOM_1
AUTH_REFRESH_TOKEN_SECRET=ISI_DENGAN_SECRET_RANDOM_2
AUTH_ACCESS_TOKEN_TTL=15m
AUTH_REFRESH_TOKEN_TTL_DAYS=30
AUTH_BCRYPT_ROUNDS=12

ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE=false

# =========================
# Storage path - Linux VPS
# =========================
STORAGE_DIR=/var/www/printorder-server/storage

# =========================
# Presence & session
# =========================
CLIENT_TTL_MS=12000
SESSION_TTL_MS=30000
SESSION_CREATE_CONFIRM_TIMEOUT_MS=6500
SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS=300
SESSION_CLEANUP_INTERVAL_MS=10000
REALTIME_CLIENT_OFFLINE_GRACE_MS=1200

# =========================
# Realtime websocket
# =========================
REALTIME_PATH=/ws
REALTIME_PRESENCE_SYNC_INTERVAL_MS=1000
REALTIME_PING_INTERVAL_MS=15000

# =========================
# Upload & quota
# =========================
CONVERSION_MODE=SYNC
MAX_UPLOAD_BYTES=26214400
FILE_QUOTA_BYTES=524288000
AUTO_DELETE_TERMINAL_JOB_FILES=true

# =========================
# Billing & payment
# =========================
PAYMENT_BANK_NAME=bank xxx
PAYMENT_ACCOUNT_NUMBER=no_rek
PAYMENT_ACCOUNT_NAME=PrintOrder
PAYMENT_MANUAL_INSTRUCTIONS=Transfer sesuai nominal order ke rekening tujuan, lalu upload bukti pembayaran dari modal upload bukti.
PAYMENT_ORDER_TTL_HOURS=24

# =========================
# Cleanup & retention
# =========================
ORPHAN_GRACE_MS=5000
FILE_CLEANUP_INTERVAL_MS=5000
CLIENT_RETENTION_DAYS=14
RETENTION_CLEANUP_INTERVAL_MS=3000

# =========================
# Rate limit client endpoint
# =========================
CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS=60000
CLIENT_REGISTER_RATE_LIMIT_MAX=20
CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS=60000
CLIENT_HEARTBEAT_RATE_LIMIT_MAX=120

# =========================
# Email / password reset
# =========================
MAIL_DRIVER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=xxxx@gmail.com
SMTP_PASS=xxx xxx xxx xxx
MAIL_FROM_NAME=PrintOrder
MAIL_FROM_ADDRESS=xxxx@gmail.com
APP_BASE_URL=https://printorder.web.id
PASSWORD_RESET_TOKEN_TTL_MINUTES=10

# =========================
# Cloudflare Turnstile
# =========================
TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY=xxxxx
TURNSTILE_SECRET_KEY=xxxxx

# Opsional, untuk validasi hostname tambahan
TURNSTILE_ALLOWED_HOSTNAMES=printorder.web.id,localhost,127.0.0.1
```

### Keterangan Konfigurasi Penting

| Variabel                           | Keterangan                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `NODE_ENV`                         | Menandakan mode runtime aplikasi. Pada VPS produksi menggunakan `production`.             |
| `PORT`                             | Port internal aplikasi Node.js. Nginx akan meneruskan request ke port ini.                |
| `USE_DB`                           | Mengaktifkan penggunaan PostgreSQL sebagai penyimpanan utama.                             |
| `DATABASE_URL`                     | Connection string PostgreSQL produksi.                                                    |
| `AUTH_ENFORCE`                     | Mengaktifkan validasi autentikasi pada endpoint yang membutuhkan akses akun.              |
| `AUTH_ALLOW_PUBLIC_REGISTER`       | Mengizinkan pendaftaran akun mitra dari halaman publik.                                   |
| `AUTH_ACCESS_TOKEN_SECRET`         | Secret untuk access token. Wajib menggunakan nilai acak dan kuat.                         |
| `AUTH_REFRESH_TOKEN_SECRET`        | Secret untuk refresh token. Wajib berbeda dari access token secret.                       |
| `AUTH_ACCESS_TOKEN_TTL`            | Durasi access token.                                                                      |
| `AUTH_REFRESH_TOKEN_TTL_DAYS`      | Durasi refresh token dalam hari.                                                          |
| `STORAGE_DIR`                      | Direktori penyimpanan file internal server.                                               |
| `CLIENT_TTL_MS`                    | Durasi toleransi client sebelum dianggap offline.                                         |
| `SESSION_TTL_MS`                   | Durasi sesi pelanggan tanpa heartbeat sebelum dianggap kedaluwarsa.                       |
| `REALTIME_PATH`                    | Path WebSocket realtime.                                                                  |
| `CONVERSION_MODE`                  | Mode konversi dokumen Office ke PDF.                                                      |
| `MAX_UPLOAD_BYTES`                 | Batas ukuran upload per file.                                                             |
| `FILE_QUOTA_BYTES`                 | Batas total penyimpanan file aktif.                                                       |
| `AUTO_DELETE_TERMINAL_JOB_FILES`   | Menghapus file ketika job masuk status terminal.                                          |
| `PAYMENT_*`                        | Informasi pembayaran manual untuk billing.                                                |
| `MAIL_DRIVER`                      | Driver email. Pada produksi menggunakan SMTP.                                             |
| `SMTP_*`                           | Konfigurasi SMTP untuk pengiriman email reset password.                                   |
| `APP_BASE_URL`                     | URL dasar aplikasi, digunakan untuk membuat tautan reset password dan URL publik lainnya. |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Masa berlaku token reset password.                                                        |
| `TURNSTILE_ENABLED`                | Mengaktifkan Cloudflare Turnstile.                                                        |
| `TURNSTILE_SITE_KEY`               | Site key Cloudflare Turnstile untuk frontend.                                             |
| `TURNSTILE_SECRET_KEY`             | Secret key Cloudflare Turnstile untuk verifikasi server-side.                             |
| `TURNSTILE_ALLOWED_HOSTNAMES`      | Daftar hostname yang diizinkan untuk validasi Turnstile.                                  |

### Catatan Default yang Tidak Wajib Diisi

Beberapa variabel tidak wajib ditulis karena sudah memiliki nilai default pada server:

| Variabel                               | Default / Keterangan                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `UPLOADS_DIR`                          | Default ke folder `uploads` pada root project.                                           |
| `PAYMENT_PROOFS_DIR`                   | Default ke folder `uploads/payment-proofs`.                                              |
| `PROFILE_PHOTOS_DIR`                   | Default ke folder `uploads/profile-photos`.                                              |
| `PAYMENT_PROOF_MAX_BYTES`              | Default mengikuti `MAX_UPLOAD_BYTES`.                                                    |
| `PROFILE_PHOTO_MAX_BYTES`              | Default 5 MB.                                                                            |
| `ALLOWED_UPLOAD_MIME_TYPES`            | Default mendukung PDF, gambar, DOC/DOCX, dan PPT/PPTX.                                   |
| `ALLOWED_UPLOAD_EXTENSIONS`            | Default mendukung `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`, `.ppt`, dan `.pptx`. |
| `TURNSTILE_VERIFY_URL`                 | Default ke endpoint verifikasi Cloudflare Turnstile.                                     |
| `JOBS_LIST_ALLOW_LEGACY_CLIENT_FILTER` | Default `false`.                                                                         |

### Catatan Produksi

1. Jangan menggunakan secret placeholder pada server produksi.
2. Jangan commit file `.env` ke repository.
3. Gunakan `APP_BASE_URL` dengan HTTPS.
4. Pastikan `DATABASE_URL` hanya dapat diakses dari server.
5. Pastikan akun SMTP menggunakan app password, bukan password utama akun email.
6. Jika upload gagal karena ukuran file, sesuaikan `MAX_UPLOAD_BYTES` dan `client_max_body_size` pada Nginx.
7. Jika client desktop terlalu cepat terlihat offline, naikkan nilai `CLIENT_TTL_MS`.
8. Jika server terasa berat, naikkan `FILE_CLEANUP_INTERVAL_MS` dan `RETENTION_CLEANUP_INTERVAL_MS`.
9. Setelah mengubah `.env`, restart service dengan PM2.

```bash id="calfv2"
pm2 restart printorder-server
```

## Database

Server produksi menggunakan PostgreSQL.

Masuk ke PostgreSQL:

```bash id="qet4zy"
sudo -u postgres psql
```

Contoh membuat database dan user:

```sql id="3i0o9k"
CREATE DATABASE printorder;
CREATE USER printorder WITH PASSWORD 'password_database';
GRANT ALL PRIVILEGES ON DATABASE printorder TO printorder;
```

Keluar dari PostgreSQL:

```sql id="xln6hb"
\q
```

Contoh `DATABASE_URL`:

```env id="7v6te3"
DATABASE_URL=postgresql://printorder:password_database@localhost:5432/printorder
```

## Import atau Migrasi Database

Jika deployment awal menggunakan file SQL:

```bash id="lkkem6"
cd /var/www/printorder-server
psql "$DATABASE_URL" -f export_file.sql
```

Jika ada file migrasi baru:

```bash id="eb4nfx"
psql "$DATABASE_URL" -f scripts/migrations/nama_file_migration.sql
```

Sebelum menjalankan import atau migrasi, lakukan backup database.

```bash id="mut7kf"
pg_dump "$DATABASE_URL" > backup-printorder-$(date +%Y%m%d-%H%M%S).sql
```

Catatan:

1. Jangan import ulang file SQL produksi tanpa memahami isi perintah SQL di dalamnya.
2. Jika file SQL berisi `DROP TABLE`, `TRUNCATE`, atau `DELETE`, data lama dapat hilang.
3. Untuk perubahan skema, lebih aman menggunakan file migrasi terkontrol.
4. Simpan backup sebelum melakukan perubahan database.

## Menjalankan Server dengan PM2

Jalankan aplikasi:

```bash id="lixv4q"
cd /var/www/printorder-server
pm2 start server.js --name printorder-server
```

Cek status:

```bash id="j6s6ri"
pm2 status
```

Cek log:

```bash id="y1r7z9"
pm2 logs printorder-server
```

Restart aplikasi:

```bash id="c4mtjp"
pm2 restart printorder-server
```

Stop aplikasi:

```bash id="3rrfd4"
pm2 stop printorder-server
```

Simpan daftar proses PM2 agar otomatis aktif setelah reboot:

```bash id="lzmo4i"
pm2 save
```

Aktifkan startup PM2:

```bash id="2d339y"
pm2 startup
```

Ikuti perintah lanjutan yang diberikan oleh PM2.

## Konfigurasi Nginx

Contoh konfigurasi Nginx:

```nginx id="zfl4uy"
server {
    listen 80;
    server_name printorder.web.id www.printorder.web.id;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Simpan konfigurasi, misalnya:

```bash id="rjzsn0"
sudo nano /etc/nginx/sites-available/printorder
```

Aktifkan site:

```bash id="xgkngq"
sudo ln -s /etc/nginx/sites-available/printorder /etc/nginx/sites-enabled/printorder
```

Cek konfigurasi:

```bash id="wqhfdp"
sudo nginx -t
```

Reload Nginx:

```bash id="dazdx6"
sudo systemctl reload nginx
```

## HTTPS

Jika menggunakan Certbot:

```bash id="dmfknj"
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d printorder.web.id -d www.printorder.web.id
```

Cek perpanjangan otomatis:

```bash id="tksf0c"
sudo certbot renew --dry-run
```

Setelah HTTPS aktif, pastikan `.env` menggunakan:

```env id="eut6dj"
APP_BASE_URL=https://printorder.web.id
```

Lalu restart server:

```bash id="ocqrz8"
pm2 restart printorder-server
```

## Deployment Update Rutin

Setiap ada perubahan dari lokal:

```bash id="q6uknw"
cd /var/www/printorder-server
git status
git pull origin to_prod
npm install
pm2 restart printorder-server
```

Jika branch produksi sudah `master`:

```bash id="y4rxwr"
cd /var/www/printorder-server
git status
git pull origin master
npm install
pm2 restart printorder-server
```

Cek hasil deploy:

```bash id="gfbyxz"
pm2 status
pm2 logs printorder-server --lines 50
curl http://127.0.0.1:3000/api/health
```

Jika memakai domain:

```bash id="13ikk4"
curl https://printorder.web.id/api/health
```

## Script Deploy Sederhana

Contoh script `deploy.sh` di VPS:

```bash id="e9z31n"
#!/bin/bash
set -e

APP_DIR="/var/www/printorder-server"
BRANCH="to_prod"
PM2_NAME="printorder-server"

cd "$APP_DIR"

echo "==> Checking git status"
git status

echo "==> Pulling latest code"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Installing dependencies"
npm install

echo "==> Restarting PM2"
pm2 restart "$PM2_NAME"

echo "==> Deployment finished"
pm2 status "$PM2_NAME"
```

Beri permission:

```bash id="4n52wi"
chmod +x deploy.sh
```

Jalankan:

```bash id="6ae6tl"
./deploy.sh
```

Jika sudah menggunakan `master`, ubah:

```bash id="774go1"
BRANCH="master"
```

## Checklist Setelah Deploy

Setelah deploy, cek poin berikut:

| Pemeriksaan     | Perintah / Cara Cek                                             |
| --------------- | --------------------------------------------------------------- |
| Aplikasi hidup  | `pm2 status`                                                    |
| Log error       | `pm2 logs printorder-server --lines 100`                        |
| Health API      | `curl https://printorder.web.id/api/health`                     |
| Portal mitra    | Buka `https://printorder.web.id/portal`                         |
| Halaman toko    | Buka `https://printorder.web.id/p/<kodeToko>`                   |
| Reset password  | Buka `https://printorder.web.id/mitra/reset-password`           |
| WebSocket       | Cek client desktop/realtime dashboard                           |
| Upload dokumen  | Coba upload file PDF                                            |
| Konversi Office | Coba upload DOCX/PPTX dan pastikan preview PDF berhasil         |
| Billing         | Cek plan, order, dan upload bukti pembayaran                    |
| Email           | Coba fitur lupa password                                        |
| Turnstile       | Pastikan register/lupa password menampilkan verifikasi keamanan |

## Troubleshooting

### Server tidak bisa diakses

Cek PM2:

```bash id="mxhgjg"
pm2 status
pm2 logs printorder-server --lines 100
```

Cek port lokal:

```bash id="bxg73s"
curl http://127.0.0.1:3000/api/health
```

Cek Nginx:

```bash id="iidr7x"
sudo nginx -t
sudo systemctl status nginx
```

### Perubahan kode belum muncul

Pastikan branch benar:

```bash id="y96cqa"
git branch
git log --oneline -5
```

Pull ulang dan restart:

```bash id="iw40ev"
git pull origin to_prod
pm2 restart printorder-server
```

Jika memakai `master`:

```bash id="8ya4kk"
git pull origin master
pm2 restart printorder-server
```

### Database gagal terhubung

Cek `.env`:

```bash id="5vo9gm"
cat .env
```

Cek koneksi database:

```bash id="j497y3"
psql "$DATABASE_URL"
```

Cek log aplikasi:

```bash id="8tlbqj"
pm2 logs printorder-server --lines 100
```

### Upload gagal karena ukuran file

Cek nilai berikut di `.env`:

```env id="re3h87"
MAX_UPLOAD_BYTES=26214400
FILE_QUOTA_BYTES=1073741824
```

Cek juga `client_max_body_size` pada konfigurasi Nginx:

```nginx id="iiie0v"
client_max_body_size 30M;
```

Setelah perubahan:

```bash id="esg2cl"
sudo nginx -t
sudo systemctl reload nginx
pm2 restart printorder-server
```

### Preview DOCX/PPTX gagal

Pastikan LibreOffice tersedia:

```bash id="2xi9tq"
soffice --version
```

Coba instal ulang jika belum tersedia:

```bash id="6lfmww"
sudo apt install -y libreoffice
```

Cek log:

```bash id="i93c2b"
pm2 logs printorder-server --lines 100
```

### Email reset password tidak terkirim

Cek konfigurasi SMTP:

```env id="3l99zb"
MAIL_DRIVER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=email@example.com
SMTP_PASS=password_smtp
MAIL_FROM_ADDRESS=no-reply@printorder.web.id
```

Restart server:

```bash id="xvag7r"
pm2 restart printorder-server
```

Cek log:

```bash id="oqjxlq"
pm2 logs printorder-server --lines 100
```

### Turnstile tidak muncul atau gagal

Cek konfigurasi:

```env id="4nx6yb"
TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY=site_key
TURNSTILE_SECRET_KEY=secret_key
TURNSTILE_ALLOWED_HOSTNAMES=printorder.web.id,localhost,127.0.0.1
```

Cek endpoint config:

```bash id="hkr8vu"
curl https://printorder.web.id/api/auth/turnstile-config
```

Restart server setelah mengubah `.env`:

```bash id="wpbmf6"
pm2 restart printorder-server
```

## Rollback Sederhana

Jika deploy terbaru bermasalah, lihat commit sebelumnya:

```bash id="f1co2e"
git log --oneline -10
```

Checkout commit tertentu:

```bash id="m29alo"
git checkout <commit_sha>
npm install
pm2 restart printorder-server
```

Setelah stabil, buat branch/fix baru dari lokal atau kembalikan ke branch deployment:

```bash id="r8s024"
git checkout to_prod
git pull origin to_prod
pm2 restart printorder-server
```

Untuk rollback database, gunakan backup yang sudah dibuat sebelum migrasi:

```bash id="al1341"
psql "$DATABASE_URL" < backup-printorder-YYYYMMDD-HHMMSS.sql
```

Catatan: rollback database harus dilakukan hati-hati agar tidak menimpa data produksi yang masih diperlukan.

## Backup

Backup minimal yang disarankan:

| Item                | Keterangan                                              |
| ------------------- | ------------------------------------------------------- |
| Database PostgreSQL | Data akun, toko, billing, order, kredit, job, dan audit |
| `.env`              | Konfigurasi produksi                                    |
| `storage/`          | File aktif dan data fallback                            |
| `uploads/`          | Bukti pembayaran dan foto profil                        |

Contoh backup database:

```bash id="p6iuwb"
pg_dump "$DATABASE_URL" > backup-printorder-$(date +%Y%m%d-%H%M%S).sql
```

Contoh backup folder penting:

```bash id="h5drrc"
tar -czf backup-printorder-files-$(date +%Y%m%d-%H%M%S).tar.gz storage uploads .env
```

## Catatan Keamanan

1. Jangan commit file `.env`.
2. Jangan menampilkan secret, token, atau credential pada dokumentasi publik.
3. Gunakan HTTPS pada domain produksi.
4. Gunakan secret JWT yang panjang dan unik.
5. Batasi akses SSH hanya untuk user yang diperlukan.
6. Simpan private key dengan aman.
7. Lakukan backup sebelum migrasi database.
8. Periksa log setelah deploy.
9. Jangan menjalankan import database produksi tanpa backup.
10. Jangan memberikan akses repository atau VPS kepada pihak yang tidak berkepentingan.

## Catatan Pemeliharaan

Deployment normal cukup dilakukan dengan:

```bash id="nlixwn"
cd /var/www/printorder-server
git pull origin to_prod
npm install
pm2 restart printorder-server
```

Jika aplikasi sudah final dan VPS menggunakan `master`:

```bash id="15bc89"
cd /var/www/printorder-server
git pull origin master
npm install
pm2 restart printorder-server
```

Setelah itu, lakukan pemeriksaan:

```bash id="35dgjb"
pm2 status
curl https://printorder.web.id/api/health
```
