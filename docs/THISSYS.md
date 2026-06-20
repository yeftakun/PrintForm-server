# THISSYS - Penjelasan Sistem PrintOrder Server

Dokumen ini menjelaskan keseluruhan sistem dengan gaya berpikir sequence diagram, tetapi ditulis sebagai narasi dan poin. Jadi setiap bagian tidak hanya menjelaskan "file ini untuk apa", tetapi juga menjelaskan urutan interaksi: aktor mengirim request, server memvalidasi, service/repository menyimpan data, lalu sistem mengirim response atau event realtime.

## 1. Gambaran Besar

PrintOrder Server adalah sistem web dan API untuk menghubungkan pelanggan yang ingin mencetak dokumen dengan mitra/toko percetakan yang menjalankan desktop print client.

Secara garis besar, sistem bekerja seperti ini:

1. Mitra membuat akun dan mengatur profil toko.
2. Desktop print client milik mitra melakukan register, heartbeat, pairing, dan membuka koneksi realtime.
3. Pelanggan mencari toko lewat kode toko atau URL `/p/:kodeToko`.
4. Pelanggan membuat session cetak ke toko yang siap.
5. Pelanggan upload dokumen dan konfigurasi cetak.
6. Desktop client mengambil job dari server, melakukan claim agar tidak diproses ganda, lalu mengubah status job selama proses cetak.
7. Server menyimpan status, mengurangi kredit mitra ketika print mulai/dikirim, menghapus file jika job selesai atau session berakhir, dan mengirim update realtime ke UI.

Aplikasi utama berjalan dari `server.js`, membangun Express app dari `src/app.js`, melayani static frontend dari `public/`, menyediakan REST API di `/api/*`, dan WebSocket realtime di path default `/ws`.

Ada juga aplikasi monitoring terpisah di folder `monitoring/`. Monitoring membaca database Postgres secara read-only dan menampilkan snapshot realtime lewat SSE.

## 2. Aktor Utama

- Pelanggan: pengguna guest yang membuka halaman publik, mencari toko, membuat session, upload dokumen, clone job, dan membatalkan job dalam session miliknya.
- Mitra: pemilik toko percetakan yang login ke portal, mengatur profil toko, layanan, harga, kode toko, melihat order/kredit, dan mengelola desktop client.
- Admin: user pertama yang terdaftar atau user dengan role `admin`; mengelola toko, pembayaran, plan, kupon, suspend, job, dan audit.
- Desktop print client: aplikasi lokal di komputer mitra yang register ke server, mengirim heartbeat, pair ke akun mitra, mengambil daftar job, claim job, download file, mencetak lokal, lalu update status job.
- PrintOrder server: Express server yang menerima request HTTP, WebSocket, upload file, session, job, billing, auth, cleanup, dan audit.
- Database/storage: Postgres jika `USE_DB=true`, atau JSON files di folder `storage/` jika mode JSON. File dokumen disimpan di filesystem.
- Monitoring app: aplikasi read-only yang membaca database untuk menampilkan clients, sessions, jobs, preview files, users, tokens, audit, dan storage usage.

## 3. Struktur Modul

### 3.1 Entrypoint

- `server.js`
  - Menjalankan bootstrap aplikasi.
  - Memanggil `ensureStorage()` agar folder/file JSON tersedia.
  - Membuat Express app via `createApp()`.
  - Membuat HTTP server.
  - Mengaktifkan WebSocket via `initializeRealtime(server)`.
  - Menghitung snapshot awal storage usage dari jobs.
  - Menjalankan scheduler internal untuk cleanup session, file orphan, dan client stale.
  - Menangani shutdown `SIGINT`/`SIGTERM` dengan menghentikan scheduler, realtime, dan HTTP server.

- `src/app.js`
  - Menyusun middleware global dan semua route.
  - Melayani static assets dari `public/`.
  - Melayani portal mitra di `/portal`.
  - Melayani halaman toko publik di `/p/:kodeToko`.
  - Mendaftarkan route API:
    - `/api/health`
    - `/api/auth`
    - `/api/clients`
    - `/api/sessions`
    - `/api/jobs`
    - `/api/billing`
    - `/api/admin`
  - Memasang `errorHandler` sebagai middleware terakhir.

- `src/config.js`
  - Membaca `.env`.
  - Menentukan mode storage (`USE_DB`), port, folder storage/upload, TTL session/client, batas upload, quota storage, realtime config, auth secret/TTL, SMTP, billing instruction, dan feature toggle legacy.

### 3.2 Route Layer

- `src/routes/auth.js`: registrasi/login/logout, refresh token, forgot/reset password, profil user, profil toko, password, PIN, upload foto profil.
- `src/routes/clients.js`: daftar client/kios, detail toko publik, register heartbeat desktop client, ping queue, pair/bind/unbind client ke akun, unregister client.
- `src/routes/sessions.js`: membuat session cetak, heartbeat session, close session.
- `src/routes/jobs.js`: list job, preview upload, download preview, detail/download job, clone, claim, release, update status, upload job baru.
- `src/routes/billing.js`: plan, kupon, order, bukti pembayaran, saldo kredit, admin review pembayaran.
- `src/routes/admin.js`: summary dashboard, toko, suspend, job admin, audit log.
- `src/routes/health.js`: health check dan state realtime.

### 3.3 Service Layer

- `src/services/auth.js`: hash password, JWT access token, JWT refresh token, token hashing, public user mapper.
- `src/services/billing.js`: plan, kupon, order, payment proof, kredit, pemotongan kredit saat print job.
- `src/services/realtime.js`: WebSocket server, channel subscribe, presence client, event broadcast.
- `src/services/status.js`: status online/offline client, readiness client, session active/expired.
- `src/services/cleanup.js`: cleanup expired session, file job, preview file, orphan file, stale client.
- `src/services/storageUsage.js`: hitung pemakaian file aktif dan proyeksi quota.
- `src/services/scheduler.js`: menjalankan cleanup berkala.
- `src/services/emailService.js`: kirim email via SMTP atau log driver.
- `src/services/convertToPdf.js`: konversi DOC/DOCX/PPT/PPTX ke PDF memakai LibreOffice headless.
- `src/services/audit.js`: menulis audit log dengan mode safe, supaya error audit tidak memutus request utama.

### 3.4 Repository Layer

Repository menyembunyikan perbedaan Postgres dan JSON storage.

- Jika `USE_DB=false`, data dibaca/tulis dari:
  - `storage/jobs.json`
  - `storage/clients.json`
  - `storage/sessions.json`
  - `storage/pings.json`
- Jika `USE_DB=true`, repository memakai Postgres via `src/db.js`.

Repository utama:

- `clientsRepository.js`: clients, owner binding, presence, delete stale.
- `sessionsRepository.js`: sessions, kompatibel dengan schema lama yang punya `client_id` dan schema baru berbasis `owner_user_id`.
- `jobsRepository.js`: jobs, print config, claim, file retention, status, owner.
- `usersRepository.js`: users dan mitra profile.
- `refreshTokensRepository.js`: refresh token persistence dan revocation.
- `passwordResetTokensRepository.js`: reset password token.
- `auditLogsRepository.js`: audit trail.
- `pingsRepository.js`: ping queue untuk client.

### 3.5 Frontend Static

- `public/index.html` dan `public/home/index.js`: halaman awal pelanggan untuk memasukkan kode toko atau scan QR.
- `public/store/index.html` dan `public/store/index.js`: halaman toko publik `/p/:kodeToko`, mengambil detail toko lalu membuat session.
- `public/session/*`: halaman session pelanggan untuk upload dokumen, preview, melihat job, clone/cancel job, heartbeat session, dan realtime update.
- `public/portal/*`: portal mitra untuk login/register, dashboard, billing, order, client, profil toko, account settings.
- `public/portal/admin/*`: dashboard admin untuk summary, toko, payment, plan, coupon, job, audit.
- `public/mitra/reset-password/*`: halaman reset password.
- `public/shared/*`: helper API sederhana, alert UI, dan bantuan pelanggan/mitra.

### 3.6 Monitoring

- `monitoring/server.js`
  - Aplikasi Express terpisah.
  - Membaca `.env` dari root.
  - Wajib `DATABASE_URL`.
  - Menyediakan `/api/state` untuk snapshot sekali ambil.
  - Menyediakan `/api/stream` dengan SSE snapshot tiap 2 detik.
  - Tidak menulis data apa pun ke database.

## 4. Data Inti

### 4.1 Tabel/Entity Utama

- `users`
  - Akun admin/mitra.
  - Menyimpan `username`, `email`, `password_hash`, `role`, dan data dasar.

- `mitra_profiles`
  - Profil toko mitra.
  - Menyimpan `kode_toko`, `alamat`, `pin_hash`, dan `konfigurasi_toko` seperti nama toko, layanan, jam operasional, harga, foto profil, status suspend.

- `clients`
  - Identitas desktop print client.
  - Menyimpan `id`, `name`, daftar printer, printer terpilih, `owner_user_id`, status cached, dan last seen.

- `sessions`
  - Session cetak pelanggan.
  - Versi saat ini account-centric: session diarahkan ke `owner_user_id` toko, bukan hanya client tertentu.
  - Menyimpan alias pelanggan, waktu dibuat, last seen, dan status.

- `jobs`
  - Dokumen cetak.
  - Menyimpan session, owner toko, file path fisik, nama asli, ukuran, status, print config, notes, claim lock, dan status file.

- `preview_files`
  - File hasil preview/konversi office ke PDF.
  - Dipakai supaya file preview bisa dilacak dan dibersihkan.

- `plans`, `coupons`, `orders`, `payment_proofs`, `credits`, `credit_usages`, `coupon_usages`
  - Modul billing dan kredit cetak.

- `refresh_tokens`
  - Refresh token tersimpan dalam bentuk hash.
  - Dipakai untuk token rotation dan logout.

- `password_reset_tokens`
  - Token reset password tersimpan dalam bentuk hash.

- `audit_logs`
  - Catatan event penting seperti login, register, session created, job status changed, billing review, suspend.

- `storage_usage`
  - Snapshot pemakaian file aktif untuk menjaga quota.

### 4.2 File Fisik

- Dokumen job disimpan di `storage/files/` dengan nama random tanpa extension.
- Preview juga disimpan di `storage/files/`.
- Bukti pembayaran disimpan di `uploads/payment-proofs/`.
- Foto profil toko disimpan di `uploads/profile-photos/`.

Sistem sengaja menyimpan nama file asli di record job/proof/profile, sedangkan file fisik memakai nama internal untuk mengurangi kebocoran informasi lewat path.

## 5. Sequence Startup Server

Urutan saat server utama dinyalakan:

1. `node server.js` dijalankan.
2. `server.js` memanggil `ensureStorage()`.
3. `ensureStorage()` memastikan:
   - folder `storage/files/` ada,
   - `jobs.json`, `clients.json`, `sessions.json`, `pings.json` tersedia untuk fallback JSON mode.
4. `server.js` memanggil `createApp()` dari `src/app.js`.
5. `createApp()` memasang middleware:
   - request logger,
   - JSON body parser,
   - cache-control `no-store`,
   - static file serving,
   - route API,
   - error handler.
6. `server.js` membuat HTTP server dari app.
7. `initializeRealtime(server)` memasang WebSocket server di path `REALTIME_PATH` default `/ws`.
8. Server mengambil semua jobs dari repository dan menghitung `storage_usage` awal.
9. HTTP server listen di `PORT`.
10. `startInternalScheduler({ runOnStart: true })` menjalankan cleanup awal dan memasang interval cleanup berkala.

Jika startup storage gagal, proses berhenti dengan exit code 1.

## 6. Sequence Auth dan Akun

### 6.1 Register User

Alur registrasi:

1. Frontend portal mengirim `POST /api/auth/register`.
2. `auth.js` memvalidasi:
   - public register diizinkan oleh `AUTH_ALLOW_PUBLIC_REGISTER`,
   - username valid,
   - password minimal 8 karakter,
   - email valid jika dikirim,
   - username/email belum dipakai.
3. Route menghitung jumlah user.
4. Jika user pertama, role menjadi `admin`; selain itu role default `mitra`.
5. Password di-hash dengan bcrypt.
6. `usersRepository.createUser()` menyimpan user.
7. Audit log `auth.register` ditulis.
8. Server menerbitkan access token dan refresh token.
9. Refresh token disimpan sebagai hash di `refresh_tokens`.
10. Response mengembalikan public user, access token, refresh token, dan expiry refresh token.

### 6.2 Login

Alur login:

1. Frontend mengirim identifier dan password ke `POST /api/auth/login`.
2. Server mencari user berdasarkan username/email.
3. Server memverifikasi password dengan bcrypt.
4. Server membuat token bundle.
5. Refresh token disimpan sebagai hash.
6. Audit log `auth.login` ditulis.
7. Response mengembalikan user dan token.

### 6.3 Refresh Token

Alur refresh:

1. Frontend mengirim refresh token ke `POST /api/auth/refresh`.
2. Server memverifikasi JWT refresh token.
3. Server hash token mentah dan mencari record aktif di `refresh_tokens`.
4. Jika record cocok, server membuat access token dan refresh token baru.
5. Refresh token lama di-revoke dan ditandai diganti oleh token baru.
6. Audit log `auth.refresh` ditulis.
7. Response mengembalikan token baru.

Konsekuensi: refresh token memakai rotation. Token lama tidak seharusnya dipakai ulang setelah refresh sukses.

### 6.4 Logout dan Logout All

- `POST /api/auth/logout`
  - Client mengirim refresh token.
  - Server revoke hash token tersebut.
  - Audit log `auth.logout` ditulis.

- `POST /api/auth/logout-all`
  - Wajib auth.
  - Server revoke semua refresh token user.
  - Audit log `auth.logout_all` ditulis.

### 6.5 Forgot dan Reset Password

Alur forgot password:

1. User mengirim email ke `POST /api/auth/forgot-password`.
2. Endpoint dirate-limit per IP.
3. Jika email terdaftar:
   - server membuat raw token random,
   - menyimpan hash token ke `password_reset_tokens`,
   - invalidate token aktif sebelumnya untuk user itu,
   - mengirim email berisi URL reset,
   - menulis audit `auth.password_reset.requested`.
4. Response selalu generik agar tidak membocorkan apakah email terdaftar.

Alur reset:

1. UI membuka `/mitra/reset-password?token=...`.
2. UI bisa mengecek token via `GET /api/auth/reset-password/validate`.
3. User mengirim token dan password baru ke `POST /api/auth/reset-password`.
4. Server mencari hash token aktif.
5. Password baru di-hash.
6. Token ditandai used dan password user diganti.
7. Semua refresh token user di-revoke.

### 6.6 Profil, Toko, PIN

- `GET /api/auth/me`
  - Mengembalikan public profile user.

- `PATCH /api/auth/me`
  - Update username/email dengan validasi uniqueness.

- `PATCH /api/auth/me/store`
  - Update konfigurasi toko:
    - `kodeToko`,
    - nama toko,
    - alamat,
    - status toko open/closed,
    - jam/waktu operasional,
    - kontak,
    - layanan,
    - jenis kertas,
    - mode warna,
    - harga dasar dan harga mode warna.

- `POST /api/auth/me/store/profile-photo`
  - Upload foto profil dengan MIME/extension allowlist.
  - File masuk ke `uploads/profile-photos/`.
  - URL disimpan dalam `konfigurasiToko`.

- `PATCH /api/auth/me/password`
  - Verifikasi password lama.
  - Password baru harus berbeda.
  - Semua refresh token di-revoke.

- `PATCH /api/auth/me/pin`
  - Verifikasi password akun.
  - PIN 4-8 digit di-hash bcrypt.

- `POST /api/auth/verify-pin`
  - Verifikasi PIN untuk aksi sensitif di client/portal.

## 7. Sequence Desktop Client dan Kios

### 7.1 Register Client

Alur register desktop client:

1. Desktop client mengirim `POST /api/clients/register`.
2. Payload berisi:
   - `clientId` UUID/GUID,
   - `name`,
   - daftar printer,
   - selected printer.
3. Rate limiter memeriksa frekuensi register.
4. Server memvalidasi client ID.
5. Server mencari client lama:
   - jika belum ada, membuat row baru dengan `ownerUserId=null`,
   - jika sudah ada, update name/printers/selected printer/last seen/status.
6. Jika request membawa bearer token, server memastikan client bukan milik akun lain.
7. Runtime auth client disinkronkan:
   - jika client punya owner dan user bearer cocok, client runtime dianggap authenticated,
   - jika tidak, runtime auth dihapus.
8. Server menyimpan clients.
9. Audit `client.registered` atau `client.updated` ditulis.
10. Realtime event `client.upserted` dikirim.
11. Response berisi public client dan flag `recognized`.

Makna status:

- `recognized=false`: desktop client sudah dikenal server tetapi belum terikat akun mitra.
- `recognized=true`: client sudah terikat akun.
- `readiness=ready`: client online, recognized, dan runtime authenticated.
- `readiness=owned`: client online dan recognized, tetapi belum login aktif/runtime authenticated.
- `readiness=unowned`: client online tetapi belum punya owner.
- `readiness=offline`: client tidak online menurut TTL/status/realtime.

### 7.2 Heartbeat Client

Alur heartbeat:

1. Desktop client mengirim `POST /api/clients/heartbeat`.
2. Server validasi `clientId`.
3. Server mencari client.
4. Jika client milik akun lain dari bearer token, request ditolak.
5. Server update selected printer jika ada.
6. Server update `lastSeen` dan status `online`.
7. Runtime auth disinkronkan.
8. Server menyimpan client dan broadcast `client.upserted`.

Heartbeat adalah fallback presence. Presence utama untuk kesiapan realtime tetap WebSocket.

### 7.3 WebSocket Presence Client

Alur koneksi realtime:

1. Client membuka WebSocket ke `/ws?clientId=<uuid>&role=client`, atau connect dulu lalu mengirim message `{"action":"identify","clientId":"...","role":"client"}`.
2. `realtime.js` memvalidasi client ID.
3. Socket dicatat dalam `presenceSocketsByClientId`.
4. `updateClientPresence()` mengubah client menjadi online dan menyentuh `lastSeen`.
5. Jika status berubah, server broadcast `client.status.changed`.
6. Server mengirim `realtime.identified`.
7. Selama socket hidup, ping/pong menjaga presence.
8. Saat socket close/error, server menunggu `REALTIME_CLIENT_OFFLINE_GRACE_MS`.
9. Jika tidak ada socket aktif lain untuk client itu, server mark offline dan broadcast status changed.

### 7.4 Pair Client ke Akun Mitra

Alur pair:

1. Desktop client mengirim `POST /api/clients/:id/pair` dengan identifier dan password akun mitra.
2. Server memvalidasi client ID dan credential user.
3. Jika client sudah punya owner berbeda, request ditolak.
4. Server menjalankan queue handover guard:
   - menjaga ownership job lama,
   - melepas claim lama milik client tersebut,
   - mencegah antrean akun lama diwariskan ke akun baru.
5. Server membuat token bundle untuk akun mitra.
6. `clients.owner_user_id` diisi dengan user id.
7. Runtime auth client ditandai authenticated.
8. Audit `client.paired` ditulis.
9. Realtime event `client.upserted` dikirim.
10. Response berisi user, client, access token, refresh token.

### 7.5 Bind/Unbind Client

- `POST /api/clients/:id/bind`
  - Wajib auth.
  - Mengikat client ke user yang login.
  - Admin boleh override client milik akun lain.
  - Menjalankan handover guard.

- `POST /api/clients/:id/unbind`
  - Wajib auth.
  - Owner atau admin melepas owner client.
  - Jika client sudah unbound, response tetap sukses dengan `alreadyUnbound=true`.
  - Runtime auth dihapus.

## 8. Sequence Daftar Toko Publik

### 8.1 Ambil Daftar Kios

Alur `GET /api/clients/kiosks`:

1. Server mengambil semua clients.
2. Server hanya memakai clients yang punya `ownerUserId`.
3. Clients dikelompokkan berdasarkan owner akun.
4. Untuk tiap owner:
   - server mengambil data user/toko,
   - menghitung readiness tiap client,
   - memilih ready client terbaru sebagai target preferred.
5. Response berisi list kios dengan:
   - display name,
   - readiness,
   - `canStartSession`,
   - target client,
   - jumlah client online/ready,
   - last seen.

### 8.2 Ambil Detail Toko via Kode Toko

Alur `GET /api/clients/stores/:kodeToko`:

1. Frontend publik mengirim kode toko.
2. Server mencari user dari `kodeToko`.
3. Server mengambil clients milik user tersebut.
4. Jika DB mode aktif, server mengambil saldo kredit toko.
5. Server menghitung:
   - status suspend,
   - status jam operasional,
   - kredit aktif atau kosong,
   - readiness client,
   - apakah pelanggan boleh mulai session.
6. Response berisi profil toko publik, layanan, jam, alamat, kontak, dan readiness.

## 9. Sequence Session Cetak

Session adalah kontrak sementara antara pelanggan dan toko. Pelanggan tidak langsung memilih printer fisik; pelanggan memilih toko/kios, lalu server memilih desktop client ready milik toko.

### 9.1 Membuat Session

Alur `POST /api/sessions`:

1. Pelanggan memilih toko dari kode toko atau `kioskId`.
2. Frontend mengirim `kioskId`, `kodeToko`, atau legacy `clientId`.
3. Server menjalankan `cleanupExpiredSessions()` lebih dulu.
4. Jika request memakai `kodeToko`:
   - server mencari toko,
   - menolak jika toko tidak ditemukan,
   - menolak jika toko disuspend,
   - menolak jika kredit toko kosong,
   - menolak jika toko sedang closed menurut jadwal operasional,
   - mengubah `kodeToko` menjadi `kioskId` user.
5. Jika tidak ada `kioskId` dan legacy client target dimatikan, server menolak.
6. Server mengambil semua clients.
7. Untuk `kioskId`:
   - server mengambil clients milik owner itu,
   - menolak jika tidak ada client,
   - menolak jika user bearer bukan owner/admin,
   - memilih client dengan readiness `ready` terbaru.
8. Server memeriksa readiness target:
   - `unowned` ditolak,
   - `owned` ditolak karena desktop client belum login aktif,
   - offline/unavailable ditolak.
9. Jika client tidak punya WebSocket realtime aktif, server menunggu confirmation window singkat:
   - jika client reconnect atau lastSeen bergerak, session dilanjutkan,
   - jika timeout, client ditandai offline dan request ditolak.
10. Server membuat object session:
    - id `session_<timestamp>_<random>`,
    - legacy `clientId` untuk compatibility,
    - `ownerUserId` toko,
    - alias pelanggan,
    - `createdAt`,
    - `lastSeen`.
11. `sessionsRepository.saveSessions()` menyimpan session.
12. Audit `session.created` ditulis.
13. Response mengembalikan session id, owner/kiosk id, source target, alias, dan metadata compatibility.

### 9.2 Heartbeat Session

Alur `POST /api/sessions/heartbeat`:

1. Frontend session mengirim `sessionId` berkala.
2. Server cleanup expired session dulu.
3. Server mencari session.
4. Jika ada user bearer, server memastikan owner session cocok dengan user.
5. Server update `lastSeen`.
6. Response `{ ok: true }`.

Jika heartbeat berhenti lebih lama dari `SESSION_TTL_MS`, scheduler akan menganggap session expired.

### 9.3 Close Session

Alur `POST /api/sessions/close`:

1. Frontend mengirim `sessionId`.
2. Server mencari session.
3. Jika request authenticated, server memastikan owner cocok.
4. Server mengambil semua jobs.
5. Untuk setiap job milik session:
   - file fisik dihapus aman jika masih ada,
   - status waiting (`ready`, `pending`, `send`) diubah ke `canceled`,
   - metadata file ditandai removed/not available.
6. Session ditandai `closed`.
7. Jobs dan sessions disimpan.
8. Storage usage dihitung ulang.
9. Preview files untuk session dibersihkan jika DB mode aktif.
10. Realtime event job/session dikirim sesuai perubahan.

## 10. Sequence Preview Dokumen

Preview dipakai terutama untuk dokumen Office yang perlu dikonversi ke PDF sebelum job final dibuat.

### 10.1 Upload Preview

Alur `POST /api/jobs/preview`:

1. Frontend session upload file office.
2. Middleware multer menyimpan file sementara di `storage/files/`.
3. `previewController.handlePreviewUpload()` memvalidasi extension hanya:
   - `.doc`,
   - `.docx`,
   - `.ppt`,
   - `.pptx`.
4. File temp direname menjadi nama `preview_*` dengan extension asli.
5. Jika `CONVERSION_MODE=HYBRID`:
   - server segera response `202 accepted`,
   - response menyertakan source URL dan PDF status URL,
   - konversi PDF berjalan background,
   - hasil PDF dipindah ke nama canonical random,
   - record `preview_files` disimpan jika DB mode aktif.
6. Jika mode sync/default:
   - server menjalankan `convertToPdf()`,
   - `convertToPdf()` menjalankan LibreOffice `soffice --headless --convert-to pdf`,
   - source file dihapus aman di finally,
   - PDF hasil konversi dipindah ke nama canonical random,
   - record `preview_files` disimpan jika DB mode aktif,
   - response `200` berisi `previewId` dan URL file.
7. Jika gagal, file sementara dihapus dan response error.

### 10.2 Cek dan Download Preview

- `GET /api/jobs/preview/status/:fileName`
  - Memvalidasi filename aman.
  - Mengembalikan `ready: true/false` tanpa 404 noisy polling.

- `GET /api/jobs/preview/file/:fileName`
  - Memvalidasi filename aman.
  - Mengirim file preview jika tersedia.

## 11. Sequence Upload Job

Alur `POST /api/jobs`:

1. Pelanggan mengirim multipart form:
   - `document` atau `previewId`,
   - `sessionId`,
   - `paperSize`,
   - `copies`,
   - `colorMode`,
   - `orientation`,
   - `pageRange`,
   - `contentScale`,
   - `notes`,
   - optional `colorDetection` dan `estimatedPrice`.
2. Multer memvalidasi:
   - batas ukuran `MAX_UPLOAD_BYTES`,
   - MIME allowlist,
   - extension allowlist.
3. Route memvalidasi print config:
   - paper size didukung,
   - copies 1-999,
   - session id ada.
4. Server menjalankan `cleanupExpiredSessions()`.
5. Server mengambil session:
   - session harus ada,
   - session harus aktif,
   - jika owner toko disuspend, request ditolak,
   - jika request authenticated, akses owner dicek.
6. Server mengambil konfigurasi layanan toko dari profil owner session.
7. Server memastikan:
   - ukuran kertas dipilih tersedia di toko,
   - mode warna tersedia di toko.
8. Server mengambil semua jobs dan menghitung storage usage.
9. Server memproyeksikan quota:
   - upload biasa menambah ukuran file baru,
   - job dari previewId dianggap tidak menambah storage baru karena file sudah ada.
10. Jika quota lewat `FILE_QUOTA_BYTES`, upload ditolak dan file temp dihapus.
11. Jika pakai `previewId`:
    - server memastikan file preview ada,
    - jika DB mode aktif, record preview harus ada dan status `ready`,
    - original name diambil dari `preview_files`.
12. Server membuat job baru:
    - id `job_<timestamp>_<random>`,
    - status `ready`,
    - fileStatus `available`,
    - sessionId,
    - ownerUserId dari session,
    - claim kosong,
    - printConfig lengkap.
13. Job disimpan.
14. Storage usage dihitung ulang.
15. Audit `job.created` ditulis.
16. Jika job dibuat dari preview, record `preview_files` dihapus supaya tidak dibersihkan dua kali sebagai preview.
17. Realtime event `job.created` dikirim ke channel `jobs`.
18. Response mengembalikan public job.

## 12. Sequence List Job

### 12.1 Pelanggan Guest

Alur `GET /api/jobs?sessionId=...` tanpa auth:

1. Server cleanup expired session.
2. Server wajib menerima `sessionId`.
3. Server mencari session.
4. Jika session tidak ada atau expired, response list kosong.
5. Jobs difilter hanya untuk session tersebut.
6. File status fisik dicek.
7. Response berisi public jobs.

### 12.2 Mitra/Desktop Client Authenticated

Alur `GET /api/jobs` dengan bearer token:

1. Server cleanup expired session.
2. Server mengambil semua jobs.
3. Server membangun set client yang boleh diakses user.
4. Jobs difilter berdasarkan ownership account.
5. Jika query owner/kiosk/account id dikirim:
   - user biasa hanya boleh meminta miliknya sendiri,
   - admin boleh meminta owner lain.
6. Jika `claimClientId` dikirim:
   - server memastikan client itu milik user,
   - list difilter agar cocok dengan view claim-aware.
7. Query legacy `clientId` diabaikan dan server mengirim header Warning.
8. Optional filter `sessionId`, `status`, active sessions diterapkan.
9. File status fisik dicek.
10. Response berisi public jobs.

## 13. Sequence Claim, Print, dan Status Job

### 13.1 Claim Job

Claim mencegah job yang sama diproses dua desktop client sekaligus.

Alur `POST /api/jobs/:id/claim`:

1. Desktop client authenticated mengirim job id dan `clientId`.
2. Server cleanup expired session.
3. Server wajib auth.
4. Server wajib menerima `clientId`.
5. Server mengambil lock in-memory per job id (`acquireJobLock`).
6. Server mengambil jobs dan mencari job.
7. Server mengecek akses user terhadap job.
8. Jika job sudah diklaim client lain, response `409 JOB_ALREADY_CLAIMED`.
9. Jika status job bukan `ready`, response `409 JOB_NOT_READY`.
10. Jika job sudah diklaim client yang sama, response sukses idempotent.
11. Jika DB mode aktif, server memanggil guard kredit:
    - `deductCreditForJobPrint(job)` mencoba mengurangi 1 kredit,
    - jika kredit tidak cukup, job diubah `rejected`, audit ditulis, event realtime dikirim, response `402`.
12. Server mengisi `claimedByClientId` dan `claimedAt`.
13. Jobs disimpan.
14. Storage usage dihitung ulang.
15. Audit `job.claimed` ditulis.
16. Realtime event `job.claimed` dikirim.
17. Lock dilepas.

### 13.2 Download File Job

Alur `GET /api/jobs/:id/download`:

1. Desktop client wajib authenticated.
2. Server cleanup expired session.
3. Server mencari job.
4. Server memeriksa akses owner.
5. Server menolak jika file sudah deleted/removed.
6. Server memastikan path fisik masih ada.
7. Server mengirim file dengan nama original.

Server tidak pernah mencetak. Pencetakan terjadi di desktop client lokal setelah file didownload.

### 13.3 Update Status Job

Alur `PATCH /api/jobs/:id`:

1. Client atau pelanggan mengirim status baru.
2. Server cleanup expired session.
3. Server mengambil lock per job id.
4. Server mencari job dan memeriksa akses.
5. Status dinormalisasi:
   - `reject` menjadi `rejected`,
   - `cancelled` menjadi `canceled`.
6. Status harus salah satu:
   - `ready`,
   - `printing`,
   - `done`,
   - `pending`,
   - `failed`,
   - `rejected`,
   - `canceled`,
   - `send`.
7. Jika request guest:
   - wajib membawa session id,
   - session id harus sama dengan job,
   - guest hanya boleh `canceled` atau `rejected`.
8. Untuk status claim-guarded (`printing`, `pending`, `done`, `failed`, `rejected`, `send`):
   - server mencari claimant client id dari request,
   - jika tidak ada, fallback dari existing claim,
   - jika tidak ada, fallback dari legacy session client,
   - jika tidak ada, fallback preferred client owner,
   - jika tetap tidak ada, server lanjut tetapi tanpa claim metadata.
9. Jika job masih `ready` dan belum diklaim, server mengisi claim otomatis.
10. Jika job diklaim client lain, response `409 JOB_CLAIM_CONFLICT`.
11. Jika transisi status masuk kategori print charge (`printing`, `send`, `done`) dan sebelumnya belum masuk kategori tersebut:
    - billing mengurangi 1 kredit,
    - jika kredit tidak cukup, job diubah rejected dan response `402`.
12. Jika status terminal dan `AUTO_DELETE_TERMINAL_JOB_FILES=true`:
    - file fisik dihapus aman,
    - job ditandai `fileDeleted/fileRemoved`,
    - event `job.file.removed` dikirim.
13. Status job diubah.
14. Jika status dikembalikan ke `ready`, claim dilepas.
15. Jobs disimpan dan storage usage di-refresh.
16. Audit `job.status.changed` ditulis.
17. Realtime event `job.status.changed` dikirim.
18. Response berisi public job terbaru.
19. Lock dilepas.

### 13.4 Release Claim

Alur `POST /api/jobs/:id/release`:

1. Client authenticated mengirim job id dan `clientId`.
2. Server mengambil lock per job.
3. Server memastikan job ada dan user boleh akses.
4. Jika job belum diklaim, response sukses idempotent.
5. Jika bukan admin, request harus berasal dari client yang sedang memegang claim.
6. Server menghapus `claimedByClientId` dan `claimedAt`.
7. Jobs disimpan.
8. Audit `job.claim.released` ditulis.
9. Realtime event `job.claim.released` dikirim.
10. Lock dilepas.

## 14. Sequence Clone dan Cancel Job

### 14.1 Clone Job

Alur `POST /api/jobs/:id/clone`:

1. Pelanggan atau mitra memilih job lama.
2. Server cleanup expired session.
3. Server mencari source job.
4. Jika guest, request wajib membawa session id yang sama dengan source job.
5. Jika authenticated, akses owner dicek.
6. Session source harus aktif.
7. File source harus masih ada dan belum removed.
8. Server menghitung ukuran file source dan mengecek quota.
9. File fisik dicopy ke path baru.
10. Job baru dibuat dengan:
    - status `ready`,
    - printConfig sama,
    - owner/session sama,
    - claim kosong.
11. Jobs disimpan.
12. Audit `job.cloned` ditulis.
13. Realtime event `job.created` source `clone` dikirim.

### 14.2 Cancel Job oleh Guest

Cancel guest memakai `PATCH /api/jobs/:id` status `canceled`.

Alurnya:

1. Pelanggan mengirim job id, session id, dan status `canceled`.
2. Server memastikan session id sesuai job.
3. Server menolak status selain `canceled` atau `rejected`.
4. Jika auto delete terminal file aktif, file fisik dihapus.
5. Job ditandai canceled dan file not available.
6. Realtime event dikirim.

## 15. Sequence Billing dan Kredit

Billing hanya efektif saat `USE_DB=true`. Beberapa flow tetap tersedia di route, tetapi service billing memerlukan database.

### 15.1 Melihat Plan dan Validasi Kupon

- `GET /api/billing/plans`
  - User authenticated mengambil plan aktif.

- `POST /api/billing/coupons/validate`
  - User memilih plan, quantity, coupon code.
  - Server mengambil plan aktif.
  - Server memvalidasi coupon:
    - aktif,
    - tanggal berlaku,
    - target plan,
    - minimum order,
    - limit pemakaian global/user.
  - Server menghitung subtotal, diskon, total, dan kredit yang didapat.

### 15.2 Membuat Order

Alur `POST /api/billing/orders`:

1. Mitra authenticated memilih plan/quantity/coupon.
2. Server menghitung pricing.
3. Server membuat row `orders` dengan status awal.
4. Jika plan gratis atau total 0, service dapat langsung membuat kredit aktif.
5. Jika perlu bayar manual, order menunggu pembayaran.
6. Audit `billing.order.created` ditulis.
7. Response berisi order dan instruksi pembayaran.

### 15.3 Upload Bukti Pembayaran

Alur `POST /api/billing/orders/:id/payment-proof`:

1. Mitra upload file proof.
2. Multer memvalidasi MIME/extension:
   - PDF,
   - JPG/JPEG,
   - PNG,
   - WebP.
3. File masuk ke `uploads/payment-proofs/`.
4. Server memastikan order milik user dan masih bisa menerima bukti.
5. Row `payment_proofs` dibuat.
6. Order berubah ke status menunggu verifikasi.
7. Audit `billing.payment_proof.uploaded` ditulis.

### 15.4 Review Pembayaran Admin

Alur `POST /api/billing/admin/orders/:id/review`:

1. Admin membuka order yang menunggu verifikasi.
2. Admin mengirim action approve/reject.
3. Jika approve:
   - order menjadi `paid`,
   - kredit dibuat di `credits`,
   - proof ditandai approved.
4. Jika reject:
   - order menjadi `rejected`,
   - alasan ditulis,
   - proof ditandai rejected.
5. Audit `billing.order.approved` atau `billing.order.rejected` ditulis.

### 15.5 Pemotongan Kredit Saat Print

Pemotongan kredit terjadi saat job mulai diproses cetak, bukan saat upload.

Alurnya:

1. Desktop client claim job atau update status ke `printing`/`send`/`done`.
2. `jobs.js` memanggil `deductCreditForJobPrint(job)`.
3. Billing service membuka transaction.
4. Service memastikan belum ada `credit_usages` untuk job itu.
5. Service mencari kredit aktif user owner job:
   - status active,
   - sudah mulai,
   - belum expired,
   - masih punya sisa.
6. Kredit terdekat expiry dipakai.
7. `used_credits` dinaikkan 1.
8. `credit_usages` dibuat dengan snapshot job.
9. Jika tidak ada kredit cukup:
   - route mengubah job menjadi `rejected`,
   - audit `job.print.credit_rejected` ditulis,
   - realtime status changed dikirim,
   - response `402 INSUFFICIENT_CREDIT`.

## 16. Sequence Admin

Admin memakai route `/api/admin` dan sebagian `/api/billing/admin`.

### 16.1 Summary Admin

Alur `GET /api/admin/summary`:

1. Wajib auth dan role admin.
2. Server mengambil paralel:
   - orders,
   - clients,
   - jobs,
   - recent audit logs.
3. Server membangun ringkasan kios dari clients dan owner user.
4. Server menghitung stats:
   - pembayaran,
   - toko ready/offline,
   - client online/ready,
   - jobs total/today/active/problem.
5. Server membangun action queue:
   - pembayaran menunggu review,
   - toko offline.
6. Response berisi stats, signals, recent data, dan errors jika salah satu sumber gagal.

### 16.2 Stores Admin

- `GET /api/admin/stores`
  - Menggabungkan users mitra, clients, jobs, orders, dan credit balance.
  - Mendukung search, filter suspend, signal, pagination.

- `GET /api/admin/stores/:id`
  - Detail satu toko.

- `PATCH /api/admin/stores/:id/suspend`
  - Toggle atau set `is_suspend`.
  - Menyimpan flag di konfigurasi toko.
  - Audit `admin.store.suspended` atau `admin.store.unsuspended`.

Suspend berdampak ke route pelanggan dan mitra melalui middleware/utility `isUserSuspended()`.

### 16.3 Jobs Admin

- `GET /api/admin/jobs`
  - Menggabungkan job dengan owner user dan client claim.
  - Mendukung search, status, date, pagination.

- `GET /api/admin/jobs/:id`
  - Detail job admin.

### 16.4 Audit Admin

- `GET /api/admin/audit`
  - Mengambil audit logs dengan pagination, search, dan date filter.

## 17. Realtime Event System

Realtime memakai package `ws`.

### 17.1 Koneksi Observer/UI

Alur UI connect:

1. Browser membuka WebSocket ke `/ws`.
2. Server menyimpan metadata socket:
   - role default `observer`,
   - channels default `*`.
3. Server mengirim event `realtime.connected`.
4. Server mengirim snapshot clients awal `clients.snapshot`.
5. UI dapat mengirim:
   - `{"action":"subscribe","channels":["jobs","clients"]}`
   - `{"action":"ping"}`

### 17.2 Koneksi Client Presence

Desktop client memakai role `client` dan clientId. Setelah identify, socket itu dihitung sebagai presence aktif.

### 17.3 Channel dan Event

Channel:

- `*`
- `clients`
- `jobs`
- `sessions`
- `system`

Event penting:

- `realtime.connected`
- `realtime.identified`
- `clients.snapshot`
- `client.upserted`
- `client.status.changed`
- `client.removed`
- `job.created`
- `job.claimed`
- `job.claim.released`
- `job.status.changed`
- `job.file.removed`
- `jobs.removed`
- `session.closed`
- `sessions.expired`

### 17.4 Presence Sync

Selain event langsung dari socket:

1. Timer presence sync berjalan tiap `REALTIME_PRESENCE_SYNC_INTERVAL_MS`.
2. Server mengambil semua clients.
3. Untuk setiap client, status efektif adalah:
   - online jika ada active presence socket,
   - selain itu dihitung dari TTL `CLIENT_TTL_MS`.
4. Jika cached status berbeda, repository mengupdate status.
5. Jika status berubah, server broadcast `client.status.changed`.

## 18. Cleanup dan Retention

Scheduler berjalan dari `src/services/scheduler.js`.

### 18.1 Cleanup Expired Sessions

Berjalan berkala berdasarkan `SESSION_CLEANUP_INTERVAL_MS`.

Alur:

1. Ambil sessions.
2. Cari session active yang `lastSeen` lebih tua dari `SESSION_TTL_MS`.
3. Tandai session `expired`.
4. Ambil jobs.
5. File job dari expired session dihapus aman.
6. Waiting jobs dari inactive session diubah `canceled`.
7. Preview files untuk session dibersihkan jika DB mode aktif.
8. Jobs/sessions disimpan.
9. Storage usage di-refresh.
10. Realtime event dikirim.

### 18.2 Cleanup Orphan Files

Berjalan berdasarkan `FILE_CLEANUP_INTERVAL_MS`.

Alur:

1. Ambil semua jobs.
2. Buat set basename file yang masih direferensikan job.
3. Jika DB mode aktif, ambil `preview_files` yang masih aktif agar tidak terhapus.
4. Scan folder `storage/files/`.
5. Lewati:
   - `.gitkeep`,
   - file job aktif,
   - preview aktif,
   - file yang masih lebih muda dari `ORPHAN_GRACE_MS`.
6. File orphan dihapus aman.
7. Record preview orphan dihapus jika DB mode aktif.

### 18.3 Cleanup Stale Clients

Berjalan berdasarkan `RETENTION_CLEANUP_INTERVAL_MS`.

Alur:

1. Ambil clients, sessions, jobs.
2. Client stale adalah client dengan lastSeen lebih tua dari `CLIENT_RETENTION_MS`.
3. Jobs dari session stale dibersihkan file-nya.
4. Session terkait ditandai expired.
5. Jika DB mode aktif, clients stale dihapus dari DB.
6. Jika JSON mode, clients stale difilter dari JSON.
7. Storage usage di-refresh.
8. Realtime `client.removed` dikirim.

## 19. Storage, Privacy, dan Secure Delete

### 19.1 Upload Validation

Dokumen job:

- Batas ukuran: `MAX_UPLOAD_BYTES`.
- MIME allowlist: `ALLOWED_UPLOAD_MIME_TYPES`.
- Extension allowlist: `ALLOWED_UPLOAD_EXTENSIONS`.

Bukti pembayaran:

- Batas ukuran: `PAYMENT_PROOF_MAX_BYTES`.
- MIME/extension terbatas ke gambar dan PDF.

Foto profil:

- Batas ukuran: `PROFILE_PHOTO_MAX_BYTES`.
- MIME/extension terbatas ke JPG, PNG, WebP.

### 19.2 Quota

Alur quota:

1. Sebelum upload/clone, server memanggil `refreshStorageUsageSnapshot(jobs)`.
2. Service menghitung ukuran file fisik yang masih direferensikan job.
3. Service memproyeksikan total setelah file baru.
4. Jika lebih besar dari `FILE_QUOTA_BYTES`, request ditolak `413`.
5. Jika DB mode aktif, snapshot disimpan ke `storage_usage`.

### 19.3 Penghapusan File

File dihapus lewat `secureDelete()`:

1. Path divalidasi eksis.
2. File ditimpa buffer nol beberapa pass.
3. File dihapus dengan unlink.

Penghapusan dipakai untuk:

- session close,
- session expired,
- terminal job status,
- orphan cleanup,
- stale client cleanup,
- preview conversion cleanup,
- upload failure cleanup.

## 20. Middleware dan Guard

### 20.1 Request Logger

`requestLogger`:

1. Membuat request id.
2. Menaruh `X-Request-Id` di response.
3. Saat response finish, log JSON berisi method, path, status, durasi, content length, dan mode DB.

### 20.2 Auth Middleware

- `optionalAuth`
  - Jika bearer token ada, token diverifikasi dan `req.user` diisi.
  - Jika tidak ada token, request lanjut sebagai guest.

- `requireAuth`
  - Bearer token wajib.
  - Token harus valid, type access, user masih ada.

### 20.3 Suspension Middleware

`rejectSuspendedMitra`:

1. Jika ada `req.user` dan user suspended, request ditolak `403`.
2. Dipakai pada route utama agar mitra suspended tidak bisa memakai flow operasional.

### 20.4 Rate Limiter

Rate limiter in-memory dipakai untuk:

- client register,
- client heartbeat,
- client pair,
- forgot password.

Limiter bekerja per key, menyimpan bucket di memory process, dan mengirim `429` plus `Retry-After` jika lewat batas.

### 20.5 Error Handler

`errorHandler`:

1. Jika headers belum terkirim, tentukan status code dari `err.statusCode`.
2. Error 500 selalu dikirim sebagai `Internal Server Error`.
3. Error client boleh membawa `err.code`.
4. Semua error dilog sebagai JSON dengan request id.

## 21. Mode JSON vs Postgres

Sistem masih mendukung dua mode storage.

### 21.1 JSON Mode

Dipakai jika `USE_DB=false`.

Kelebihan:

- Mudah untuk prototype/local.
- Tidak butuh database.

Batasan:

- Tidak cocok untuk concurrency berat.
- Billing/auth penuh banyak bergantung DB.
- Tidak ada constraint relational.

### 21.2 Postgres Mode

Dipakai jika `USE_DB=true`.

Kelebihan:

- Data relational.
- Billing/kredit/token/audit aktif.
- Query admin dan monitoring lebih lengkap.
- Mendukung migrasi account-centric queue.

Repository dibuat toleran terhadap schema migrasi bertahap. Beberapa repository mengecek kolom dulu lewat `information_schema`, misalnya:

- `sessions.client_id` mungkin sudah dihapus.
- `sessions.owner_user_id` mungkin baru ditambah.
- `jobs.claimed_by_client_id` dan `jobs.claimed_at` mungkin baru tersedia setelah migration.
- kolom print config dan file retention dicek sebelum dipakai.

## 22. Frontend Flow

### 22.1 Halaman Home Pelanggan

Alur:

1. Pelanggan membuka `/`.
2. UI menampilkan form alias dan kode toko.
3. Alias disimpan di `localStorage`.
4. Kode toko bisa diinput manual atau discan via QR.
5. UI mengambil detail toko via `/api/clients/stores/:kodeToko`.
6. Jika toko siap, pelanggan lanjut ke flow session.

### 22.2 Halaman Store Publik

Alur `/p/:kodeToko`:

1. Express mengirim `public/store/index.html`.
2. JS membaca kode toko dari URL.
3. UI mengambil detail toko.
4. UI mengirim `POST /api/sessions` dengan `kodeToko` dan alias.
5. Session id dan metadata toko disimpan di `sessionStorage`.
6. User diarahkan ke halaman session.

### 22.3 Halaman Session Pelanggan

Alur:

1. JS membaca `printorderSessionId` dari `sessionStorage`.
2. JS mengirim heartbeat ke `/api/sessions/heartbeat`.
3. JS membuka WebSocket untuk menerima update jobs/clients/sessions.
4. Jika WebSocket gagal, UI tetap bisa polling.
5. User upload dokumen biasa atau preview office.
6. UI mengirim `POST /api/jobs`.
7. UI mengambil list jobs via `/api/jobs?sessionId=...`.
8. User bisa clone atau cancel job.
9. Saat session ditutup, UI mengirim `/api/sessions/close` dan menghapus sessionStorage.

### 22.4 Portal Mitra

Alur:

1. Mitra membuka `/portal/`.
2. `auth-client.js` mengelola localStorage auth state.
3. Login/register memakai `/api/auth/*`.
4. Request portal memakai `PortalAuth.apiFetch/apiJson`.
5. Jika access token expired, helper mencoba refresh token otomatis.
6. Jika refresh gagal atau idle timeout tercapai, session dihapus dan user diarahkan login.
7. Portal mengambil:
   - clients,
   - jobs,
   - plans,
   - orders,
   - credit balance,
   - payment instructions,
   - profil user/toko.

### 22.5 Portal Admin

Alur:

1. Admin membuka `/portal/admin/`.
2. Helper auth memastikan user punya session aktif.
3. UI mengambil summary, payments, plans, coupons, stores, jobs, audit.
4. Admin bisa review order, mengaktif/nonaktifkan plan/coupon, suspend toko, dan melihat detail job/toko.

## 23. Monitoring App

Monitoring adalah aplikasi terpisah dan read-only.

Sequence `/api/stream`:

1. Browser monitoring membuka EventSource ke `/api/stream`.
2. Server monitoring mengirim header `text/event-stream`.
3. Server memanggil `fetchSnapshot()` langsung ke Postgres.
4. Snapshot dikirim segera.
5. Setiap 2 detik, snapshot dikirim ulang.
6. Jika client menutup koneksi, interval dihentikan.

Snapshot berisi:

- clients dan status online/offline turunan TTL,
- sessions,
- jobs,
- preview files,
- events,
- audit logs,
- users,
- refresh tokens,
- storage usage,
- summary count.

Monitoring toleran terhadap kolom/tabel yang belum ada. Jika query gagal karena table/column belum tersedia, data bagian itu dikosongkan.

## 24. Status Job

Status yang dikenal sistem:

- `ready`: job baru dibuat dan siap diambil.
- `printing`: desktop client mulai proses print.
- `send`: job dikirim ke spooler/printer dari sisi client.
- `done`: job selesai dikirim ke printer/spooler.
- `pending`: printer offline atau client belum bisa mengirim job.
- `failed`: print/download/proses client gagal.
- `rejected`: job ditolak client atau ditolak karena kredit tidak cukup.
- `canceled`: pelanggan/session/system membatalkan job.

Status terminal:

- `done`
- `failed`
- `rejected`
- `canceled`

Jika `AUTO_DELETE_TERMINAL_JOB_FILES=true`, transisi ke status terminal menghapus file fisik.

## 25. Cabang Gagal Penting

### 25.1 Toko Tidak Bisa Menerima Session

Session create ditolak jika:

- kode toko tidak ditemukan,
- toko suspended,
- kredit kosong,
- toko closed menurut jadwal,
- tidak ada client milik toko,
- client belum recognized,
- client recognized tetapi desktop belum login aktif,
- tidak ada client ready,
- client realtime tidak connected dan confirmation timeout.

### 25.2 Upload Job Ditolak

Upload ditolak jika:

- dokumen tidak ada,
- MIME/extension tidak didukung,
- ukuran file terlalu besar,
- session tidak ada atau expired,
- toko suspended,
- paper size tidak tersedia di toko,
- color mode tidak tersedia di toko,
- storage quota terlampaui,
- preview id tidak ada atau belum ready.

### 25.3 Print Ditolak

Print/claim/status guarded ditolak jika:

- user tidak authenticated,
- job tidak ada,
- user tidak boleh akses owner job,
- job sudah diklaim client lain,
- status job tidak siap,
- claim conflict,
- kredit akun tidak cukup.

### 25.4 Auth Ditolak

Auth ditolak jika:

- access token tidak ada untuk route protected,
- access token invalid/expired,
- refresh token invalid/expired/revoked,
- user tidak ditemukan,
- user suspended pada route yang memakai suspension middleware.

## 26. Konfigurasi Penting

Core:

- `PORT`
- `USE_DB`
- `DATABASE_URL`
- `STORAGE_DIR`
- `UPLOADS_DIR`

Upload/storage:

- `MAX_UPLOAD_BYTES`
- `FILE_QUOTA_BYTES`
- `ALLOWED_UPLOAD_MIME_TYPES`
- `ALLOWED_UPLOAD_EXTENSIONS`
- `AUTO_DELETE_TERMINAL_JOB_FILES`

Session/client:

- `CLIENT_TTL_MS`
- `SESSION_TTL_MS`
- `SESSION_CLEANUP_INTERVAL_MS`
- `SESSION_CREATE_CONFIRM_TIMEOUT_MS`
- `SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS`
- `ORPHAN_GRACE_MS`
- `CLIENT_RETENTION_DAYS`

Realtime:

- `REALTIME_PATH`
- `REALTIME_PRESENCE_SYNC_INTERVAL_MS`
- `REALTIME_PING_INTERVAL_MS`
- `REALTIME_CLIENT_OFFLINE_GRACE_MS`

Auth:

- `AUTH_ENFORCE`
- `AUTH_ALLOW_PUBLIC_REGISTER`
- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `AUTH_ACCESS_TOKEN_TTL`
- `AUTH_REFRESH_TOKEN_TTL_DAYS`
- `AUTH_BCRYPT_ROUNDS`

Mail/reset password:

- `MAIL_DRIVER`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM_NAME`
- `MAIL_FROM_ADDRESS`
- `APP_BASE_URL`
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`

Billing:

- `PAYMENT_BANK_NAME`
- `PAYMENT_ACCOUNT_NUMBER`
- `PAYMENT_ACCOUNT_NAME`
- `PAYMENT_MANUAL_INSTRUCTIONS`
- `PAYMENT_ORDER_TTL_HOURS`
- `PAYMENT_PROOF_MAX_BYTES`

Compatibility:

- `ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE`
- `JOBS_LIST_ALLOW_LEGACY_CLIENT_FILTER`

## 27. Kesimpulan Arsitektur

Sistem ini sekarang berpusat pada akun toko, bukan hanya ID desktop client. Desktop client tetap penting sebagai worker print lokal, tetapi ownership queue berada di `ownerUserId`.

Implikasinya:

1. Pelanggan memilih toko/kios.
2. Server memilih client ready milik toko.
3. Session dan job disimpan atas nama owner toko.
4. Desktop client mengambil job berdasarkan akun.
5. Claim lock mencegah multi-client satu akun mencetak job yang sama.
6. Billing kredit juga mengikuti owner job.
7. Realtime menjaga UI dan server tahu client mana yang benar-benar aktif.
8. Cleanup menjaga dokumen tidak tersimpan lebih lama dari kebutuhan operasional.

Pola sequence utama sistem adalah:

1. Request masuk dari UI/client.
2. Middleware mengisi request id, auth optional/required, dan guard suspend.
3. Route memvalidasi payload dan akses.
4. Service menjalankan aturan domain seperti readiness, billing, cleanup, realtime, storage usage.
5. Repository membaca/menulis JSON atau Postgres.
6. Audit ditulis untuk event penting.
7. Realtime event dikirim bila state berubah.
8. Response dikirim ke caller.

Dengan pola ini, setiap modul bisa dipahami sebagai bagian dari rantai pesan: UI atau desktop client meminta aksi, route menjadi koordinator, service memegang aturan domain, repository menyimpan state, dan realtime/audit/cleanup menjadi efek samping yang menjaga sistem tetap konsisten.
