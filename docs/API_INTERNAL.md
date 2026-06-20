# Dokumentasi API Internal PrintOrder

Ringkasan endpoint API internal pada server PrintOrder. Dokumentasi ini tidak ditujukan sebagai dokumentasi API publik, melainkan sebagai catatan teknis komunikasi antara aplikasi web, portal mitra, portal admin, server, dan aplikasi klien desktop.

## Informasi Umum

| Item               | Keterangan                            |
| ------------------ | ------------------------------------- |
| Nama sistem        | PrintOrder                            |
| Jenis dokumentasi  | Dokumentasi API internal              |
| Base path API      | `/api`                                |
| Format data utama  | JSON                                  |
| Format upload file | `multipart/form-data`                 |
| Autentikasi        | Bearer Token JWT                      |
| Header autentikasi | `Authorization: Bearer <accessToken>` |

## Catatan Akses

| Jenis akses    | Keterangan                                                           |
| -------------- | -------------------------------------------------------------------- |
| Publik / Guest | Dapat diakses tanpa login, biasanya untuk pelanggan atau client awal |
| Authenticated  | Memerlukan login dan access token                                    |
| Mitra          | Digunakan oleh akun mitra percetakan                                 |
| Admin          | Digunakan oleh akun admin                                            |
| Client Desktop | Digunakan oleh aplikasi klien desktop PrintOrder                     |

## Endpoint Health

Endpoint health digunakan untuk memeriksa status server dan status layanan realtime.

| Method | Endpoint      | Akses  | Keterangan                                   |
| ------ | ------------- | ------ | -------------------------------------------- |
| GET    | `/api/health` | Publik | Memeriksa status server dan realtime service |

## Endpoint Auth

Endpoint auth digunakan untuk autentikasi, pendaftaran akun, reset password, profil akun, pengaturan toko, pengaturan password, dan PIN akun.

| Method | Endpoint                            | Akses              | Keterangan                                                                 |
| ------ | ----------------------------------- | ------------------ | -------------------------------------------------------------------------- |
| GET    | `/api/auth/turnstile-config`        | Publik             | Mengambil konfigurasi Cloudflare Turnstile untuk frontend                  |
| POST   | `/api/auth/forgot-password`         | Publik + Turnstile | Mengirim tautan reset password ke email akun mitra apabila email terdaftar |
| GET    | `/api/auth/reset-password/validate` | Publik             | Memvalidasi token reset password                                           |
| POST   | `/api/auth/reset-password`          | Publik             | Mengatur password baru berdasarkan token reset password                    |
| POST   | `/api/auth/register`                | Publik + Turnstile | Membuat akun baru                                                          |
| POST   | `/api/auth/login`                   | Publik             | Login menggunakan username/email dan password                              |
| POST   | `/api/auth/refresh`                 | Publik             | Memperbarui access token menggunakan refresh token                         |
| POST   | `/api/auth/logout`                  | Publik             | Logout dan mencabut refresh token tertentu                                 |
| POST   | `/api/auth/logout-all`              | Authenticated      | Logout dari seluruh sesi aktif                                             |
| GET    | `/api/auth/me`                      | Authenticated      | Mengambil data akun yang sedang login                                      |
| PATCH  | `/api/auth/me`                      | Authenticated      | Memperbarui username dan/atau email akun                                   |
| PATCH  | `/api/auth/me/store`                | Authenticated      | Memperbarui pengaturan toko mitra                                          |
| POST   | `/api/auth/me/store/profile-photo`  | Authenticated      | Mengunggah foto profil toko                                                |
| PATCH  | `/api/auth/me/password`             | Authenticated      | Mengubah password akun                                                     |
| PATCH  | `/api/auth/me/pin`                  | Authenticated      | Mengatur atau memperbarui PIN akun                                         |
| POST   | `/api/auth/verify-pin`              | Authenticated      | Memverifikasi PIN akun                                                     |

### Contoh Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "identifier": "username_atau_email",
  "password": "password"
}
```

### Contoh Respons Login

```json
{
  "user": {
    "id": "user_xxx",
    "username": "mitra",
    "email": "mitra@example.com",
    "role": "mitra"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "accessTokenTtl": "15m",
  "refreshTokenExpiresAt": "2026-07-20T00:00:00.000Z"
}
```

### Contoh Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "mitra_cetak",
  "email": "mitra@example.com",
  "password": "password123",
  "turnstileToken": "token_turnstile"
}
```

### Contoh Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "mitra@example.com",
  "turnstileToken": "token_turnstile"
}
```

## Endpoint Installer

Endpoint installer digunakan untuk mengambil katalog installer aplikasi klien desktop.

| Method | Endpoint          | Akses  | Keterangan                               |
| ------ | ----------------- | ------ | ---------------------------------------- |
| GET    | `/api/installers` | Publik | Mengambil daftar installer klien desktop |

## Endpoint Clients

Endpoint clients digunakan untuk registrasi client desktop, heartbeat, pairing akun, unbinding, serta pencarian toko/kios.

| Method | Endpoint                        | Akses                  | Keterangan                                                                             |
| ------ | ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/api/clients`                  | Opsional Auth          | Mengambil daftar client yang terlihat oleh pengguna                                    |
| GET    | `/api/clients/kiosks`           | Publik / Opsional Auth | Mengambil ringkasan kios berdasarkan client yang sudah dikenali                        |
| GET    | `/api/clients/stores/:kodeToko` | Publik                 | Mengambil informasi toko berdasarkan kode toko                                         |
| POST   | `/api/clients/register`         | Client Desktop         | Mendaftarkan atau memperbarui data client desktop                                      |
| POST   | `/api/clients/heartbeat`        | Client Desktop         | Memperbarui status aktif client desktop                                                |
| POST   | `/api/clients/:id/ping`         | Client Desktop / Auth  | Mengirim sinyal ping ke client tertentu                                                |
| GET    | `/api/clients/:id/ping`         | Client Desktop / Auth  | Mengambil daftar ping untuk client tertentu                                            |
| POST   | `/api/clients/:id/pair`         | Client Desktop         | Menghubungkan client desktop dengan akun mitra menggunakan username/email dan password |
| POST   | `/api/clients/:id/bind`         | Authenticated          | Mengikat client ke akun yang sedang login                                              |
| POST   | `/api/clients/:id/unbind`       | Authenticated          | Melepas ikatan client dari akun                                                        |
| POST   | `/api/clients/unregister`       | Client Desktop         | Menghapus registrasi client desktop dari server                                        |

### Contoh Register Client

```http
POST /api/clients/register
Content-Type: application/json
```

```json
{
  "clientId": "uuid-client",
  "name": "Client Kasir 1",
  "printers": ["Printer A", "Printer B"],
  "selectedPrinter": "Printer A"
}
```

### Contoh Pair Client

```http
POST /api/clients/{clientId}/pair
Content-Type: application/json
```

```json
{
  "identifier": "username_atau_email",
  "password": "password"
}
```

## Endpoint Sessions

Endpoint sessions digunakan untuk membuat sesi cetak pelanggan, memperbarui aktivitas sesi, dan menutup sesi. Saat sesi ditutup, file dokumen terkait dapat dibersihkan dari server.

| Method | Endpoint                  | Akses                  | Keterangan                                                            |
| ------ | ------------------------- | ---------------------- | --------------------------------------------------------------------- |
| POST   | `/api/sessions`           | Publik / Opsional Auth | Membuat sesi cetak berdasarkan `kodeToko`, `kioskId`, atau `clientId` |
| POST   | `/api/sessions/heartbeat` | Publik / Opsional Auth | Memperbarui aktivitas sesi agar tidak dianggap kedaluwarsa            |
| POST   | `/api/sessions/close`     | Publik / Opsional Auth | Menutup sesi cetak dan membersihkan file dokumen terkait              |

### Contoh Membuat Sesi dengan Kode Toko

```http
POST /api/sessions
Content-Type: application/json
```

```json
{
  "kodeToko": "TOKO-001",
  "alias": "Pelanggan 1"
}
```

### Contoh Menutup Sesi

```http
POST /api/sessions/close
Content-Type: application/json
```

```json
{
  "sessionId": "session_xxx"
}
```

## Endpoint Jobs

Endpoint jobs digunakan untuk upload dokumen, membuat tugas cetak, mengambil daftar tugas cetak, mengunduh dokumen, clone tugas cetak, claim/release job oleh client, serta memperbarui status job.

| Method | Endpoint                             | Akses                  | Keterangan                                                                         |
| ------ | ------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/api/jobs`                          | Publik / Authenticated | Mengambil daftar job. Guest memerlukan `sessionId`; mitra mengambil job milik akun |
| POST   | `/api/jobs/preview`                  | Publik / Opsional Auth | Mengunggah dokumen untuk preview/konversi awal                                     |
| GET    | `/api/jobs/preview/file/:fileName`   | Publik / Opsional Auth | Mengunduh file preview                                                             |
| GET    | `/api/jobs/preview/status/:fileName` | Publik / Opsional Auth | Mengecek status file preview                                                       |
| GET    | `/api/jobs/:id`                      | Authenticated          | Mengambil detail job tertentu                                                      |
| GET    | `/api/jobs/:id/download`             | Authenticated          | Mengunduh dokumen job                                                              |
| POST   | `/api/jobs/:id/clone`                | Publik / Authenticated | Membuat salinan job dari job yang sudah ada                                        |
| POST   | `/api/jobs/:id/claim`                | Authenticated          | Mengunci/claim job agar diproses oleh client tertentu                              |
| POST   | `/api/jobs/:id/release`              | Authenticated          | Melepas claim job                                                                  |
| PATCH  | `/api/jobs/:id`                      | Publik / Authenticated | Memperbarui status job                                                             |
| POST   | `/api/jobs`                          | Publik / Opsional Auth | Membuat tugas cetak baru dengan upload dokumen atau `previewId`                    |

### Status Job

| Status     | Keterangan                                      |
| ---------- | ----------------------------------------------- |
| `ready`    | Job siap diproses                               |
| `pending`  | Job sedang menunggu atau dalam antrean proses   |
| `printing` | Job sedang dicetak                              |
| `send`     | Job telah dikirim/diselesaikan dari sisi client |
| `done`     | Job selesai                                     |
| `failed`   | Job gagal diproses                              |
| `rejected` | Job ditolak                                     |
| `canceled` | Job dibatalkan                                  |

### Contoh Membuat Job

Gunakan `multipart/form-data`.

```http
POST /api/jobs
Content-Type: multipart/form-data
```

| Field            | Keterangan                                    |
| ---------------- | --------------------------------------------- |
| `document`       | File dokumen yang diunggah                    |
| `previewId`      | ID file preview apabila memakai hasil preview |
| `sessionId`      | ID sesi cetak                                 |
| `paperSize`      | Ukuran kertas, misalnya `A4` atau `F4`        |
| `copies`         | Jumlah salinan                                |
| `colorMode`      | Mode warna, misalnya `bw` atau `color`        |
| `orientation`    | Orientasi cetak                               |
| `pageRange`      | Rentang halaman                               |
| `contentScale`   | Skala konten                                  |
| `notes`          | Catatan tambahan                              |
| `estimatedPrice` | Estimasi harga                                |
| `colorDetection` | Data deteksi warna halaman                    |

### Contoh Update Status Job

```http
PATCH /api/jobs/{jobId}
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "status": "printing",
  "clientId": "uuid-client"
}
```

## Endpoint Billing

Endpoint billing digunakan oleh mitra untuk melihat paket, membuat order, memvalidasi kupon, mengunggah bukti pembayaran, membatalkan order, serta memeriksa saldo kredit. Seluruh endpoint billing memerlukan autentikasi.

| Method | Endpoint                                         | Akses         | Keterangan                                   |
| ------ | ------------------------------------------------ | ------------- | -------------------------------------------- |
| GET    | `/api/billing/plans`                             | Authenticated | Mengambil daftar plan aktif                  |
| POST   | `/api/billing/coupons/validate`                  | Authenticated | Memvalidasi kupon dan menghitung harga order |
| POST   | `/api/billing/orders`                            | Authenticated | Membuat order pembelian plan/top up          |
| GET    | `/api/billing/orders`                            | Authenticated | Mengambil daftar order milik user            |
| GET    | `/api/billing/orders/:id`                        | Authenticated | Mengambil detail order                       |
| POST   | `/api/billing/orders/:id/cancel`                 | Authenticated | Membatalkan order                            |
| POST   | `/api/billing/orders/:id/payment-proof`          | Authenticated | Mengunggah bukti pembayaran                  |
| GET    | `/api/billing/orders/:id/payment-proof/preview`  | Authenticated | Melihat preview bukti pembayaran             |
| GET    | `/api/billing/orders/:id/payment-proof/download` | Authenticated | Mengunduh bukti pembayaran                   |
| GET    | `/api/billing/credits/balance`                   | Authenticated | Mengambil saldo kredit akun                  |
| GET    | `/api/billing/payment-instructions`              | Authenticated | Mengambil instruksi pembayaran manual        |

### Contoh Membuat Order

```http
POST /api/billing/orders
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "planId": "plan_xxx",
  "quantity": 1,
  "couponCode": "KODEKUPON"
}
```

### Contoh Upload Bukti Pembayaran

Gunakan `multipart/form-data`.

```http
POST /api/billing/orders/{orderId}/payment-proof
Authorization: Bearer <accessToken>
```

| Field      | Keterangan                                   |
| ---------- | -------------------------------------------- |
| `proof`    | File bukti pembayaran berupa gambar atau PDF |
| `userNote` | Catatan tambahan dari user                   |

## Endpoint Billing Admin

Endpoint billing admin digunakan oleh admin untuk mengelola plan, kupon, order, bukti pembayaran, dan verifikasi pembayaran.

| Method | Endpoint                                               | Akses | Keterangan                             |
| ------ | ------------------------------------------------------ | ----- | -------------------------------------- |
| GET    | `/api/billing/admin/plans`                             | Admin | Mengambil daftar seluruh plan          |
| POST   | `/api/billing/admin/plans`                             | Admin | Membuat plan baru                      |
| PATCH  | `/api/billing/admin/plans/:id`                         | Admin | Memperbarui plan                       |
| PATCH  | `/api/billing/admin/plans/:id/active`                  | Admin | Mengaktifkan atau menonaktifkan plan   |
| GET    | `/api/billing/admin/coupons`                           | Admin | Mengambil daftar kupon                 |
| POST   | `/api/billing/admin/coupons`                           | Admin | Membuat kupon baru                     |
| PATCH  | `/api/billing/admin/coupons/:id`                       | Admin | Memperbarui kupon                      |
| PATCH  | `/api/billing/admin/coupons/:id/active`                | Admin | Mengaktifkan atau menonaktifkan kupon  |
| GET    | `/api/billing/admin/orders`                            | Admin | Mengambil daftar order seluruh user    |
| GET    | `/api/billing/admin/orders/:id`                        | Admin | Mengambil detail order                 |
| GET    | `/api/billing/admin/orders/:id/payment-proof/preview`  | Admin | Melihat preview bukti pembayaran order |
| GET    | `/api/billing/admin/orders/:id/payment-proof/download` | Admin | Mengunduh bukti pembayaran order       |
| POST   | `/api/billing/admin/orders/:id/review`                 | Admin | Menyetujui atau menolak pembayaran     |

### Contoh Review Pembayaran

```http
POST /api/billing/admin/orders/{orderId}/review
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "action": "approve"
}
```

Contoh penolakan:

```json
{
  "action": "reject",
  "rejectedReason": "Nominal pembayaran tidak sesuai."
}
```

## Endpoint Admin

Endpoint admin digunakan oleh admin untuk melihat ringkasan sistem, daftar toko, job, audit log, dan pengelolaan installer.

| Method | Endpoint                            | Akses | Keterangan                                |
| ------ | ----------------------------------- | ----- | ----------------------------------------- |
| GET    | `/api/admin/summary`                | Admin | Mengambil ringkasan dashboard admin       |
| GET    | `/api/admin/stores`                 | Admin | Mengambil daftar toko/mitra               |
| GET    | `/api/admin/stores/:id`             | Admin | Mengambil detail toko/mitra               |
| PATCH  | `/api/admin/stores/:id/suspend`     | Admin | Suspend atau unsuspend toko               |
| GET    | `/api/admin/jobs`                   | Admin | Mengambil daftar job seluruh toko         |
| GET    | `/api/admin/jobs/:id`               | Admin | Mengambil detail job                      |
| GET    | `/api/admin/audit`                  | Admin | Mengambil audit log                       |
| GET    | `/api/admin/installers`             | Admin | Mengambil daftar installer                |
| POST   | `/api/admin/installers`             | Admin | Membuat data installer                    |
| PATCH  | `/api/admin/installers/:id`         | Admin | Memperbarui data installer                |
| PATCH  | `/api/admin/installers/:id/active`  | Admin | Mengaktifkan atau menonaktifkan installer |
| PATCH  | `/api/admin/installers/:id/primary` | Admin | Menetapkan installer sebagai versi utama  |

### Contoh Suspend Toko

```http
PATCH /api/admin/stores/{storeId}/suspend
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "is_suspend": true
}
```

## Halaman Non-API yang Berkaitan

Selain endpoint API, server juga menyediakan beberapa halaman frontend.

| Path                    | Keterangan                                   |
| ----------------------- | -------------------------------------------- |
| `/portal`               | Portal mitra                                 |
| `/portal/admin`         | Portal admin                                 |
| `/mitra/reset-password` | Halaman reset password                       |
| `/p/:kodeToko`          | Halaman toko pelanggan berdasarkan kode toko |

## Keamanan dan Pembatasan

1. Endpoint internal tidak ditujukan sebagai API publik.
2. Endpoint yang membutuhkan autentikasi wajib menggunakan Bearer Token.
3. Endpoint admin hanya dapat digunakan oleh akun dengan role `admin`.
4. Endpoint register dan lupa password menggunakan Cloudflare Turnstile untuk verifikasi manusia.
5. Endpoint lupa password menggunakan respons generik agar tidak membocorkan apakah email terdaftar atau tidak.
6. Beberapa endpoint upload membatasi tipe file dan ukuran file.
7. Dokumen pelanggan dapat dibersihkan ketika sesi ditutup atau ketika job masuk status terminal sesuai konfigurasi server.
8. Setiap perubahan penting seperti login, register, update profil, update toko, pembayaran, claim job, dan perubahan status dicatat melalui audit log.

## Catatan Penggunaan Internal

Dokumentasi ini digunakan sebagai referensi teknis internal untuk pengembangan dan pemeliharaan sistem PrintOrder. Apabila sistem dikembangkan lebih lanjut, dokumentasi ini dapat diperluas dengan contoh response lengkap, kode error, dan skema database yang terkait.
