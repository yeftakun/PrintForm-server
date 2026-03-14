# Plan: Migrasi Bertahap ke Stack Prod & Modularisasi (Revisi Scope TA)

TL;DR: Fokus pada arsitektur sederhana tapi stabil untuk purwarupa tugas akhir: **PostgreSQL + WebSocket + internal scheduler + single-node deployment**. Hindari over-engineering (Redis/RabbitMQ/HA multi-node) pada fase ini.

## Scope Guard

### Wajib dikerjakan

- PostgreSQL sebagai penyimpanan utama.
- Realtime notifikasi memakai WebSocket/SignalR-equivalent.
- Cleanup file/sesi/client berjalan otomatis via scheduler internal.
- Secure upload + validasi MIME/size + quota storage.
- Security baseline dengan akun user (username/password), JWT/refresh token, dan binding akun ke client.
- Representasi kios percetakan di sisi pelanggan berbasis akun (minimal punya 1 client), bukan per-device client tunggal.
- Deploy single-node dengan Docker + Nginx (TLS).

### Di luar scope saat ini (dibatalkan)

- Redis dependency untuk presence/pubsub/rate-limit.
- External message broker (RabbitMQ/BullMQ).
- Horizontal scaling, load balancer, shared FS lintas node.

## Steps

1. Baseline refactor — pecah `server.js` ke `src/` (config, storage/jsonStore, services, routes, cleanup); tambah error handler. **Selesai.**
2. Observability — logging terstruktur + req id + latency; healthcheck tetap. **Selesai.**
3. Persistensi DB — Postgres + `pg`, repositories ganti JSON store; schema/migrasi tersedia; fallback JSON hanya untuk sanity check. **Selesai.**
4. Presence & rate-limit tanpa Redis — status online/offline tetap *derived* dari `last_seen_at` + TTL; rate-limit register/heartbeat dengan in-memory limiter sederhana (scope single-node). **Selesai.**
5. File storage & privacy controls — enforce kuota 1GB, validasi MIME/size, cleanup orphan, pencatatan usage, dan mekanisme penghapusan aman pasca-cetak. **Selesai.**
6. Realtime channel — implement WebSocket endpoint untuk push event (job masuk, status job berubah, client online/offline) ke Web UI dan .NET client. **Selesai — server + .NET client + Web UI utama realtime aktif (polling fallback tetap ada).**
7. Security baseline — API key/JWT minimal untuk web & print client, audit log perubahan status, hardening endpoint upload/download, dan fondasi akun user (username/password) untuk Web UI + desktop client. **Selesai untuk scope `PrintForm-server` (JWT + refresh token, ownership guard, hardening endpoint, audit log, dashboard mitra `/mitra`, self-service akun). Integrasi login/logout desktop dieksekusi di repo client terpisah.**
8. Kios berbasis akun (account-centric queue) — rombak alur agar sesi/job berorientasi akun (kios), bukan client device. Root page menampilkan daftar akun kios (hanya akun dengan minimal 1 client), dan job akun tersinkron ke semua client yang login pada akun tersebut.
9. Internal scheduler — gunakan `setInterval`/`node-cron` dalam process Node utama untuk cleanup retention, orphan scan, dan housekeeping periodik.
10. Frontend/client update — Web UI dan .NET client pindah dari polling berat ke subscribe realtime (REST tetap fallback). **Selesai untuk model client-centric lama; perlu penyesuaian lanjutan setelah Step 8 account-centric.**
11. Deployment single-node — dockerize app + PostgreSQL + Nginx reverse proxy TLS; siapkan backup DB, log rotation, dan SOP recovery.

## Detail Step 7 (Akun dan Auth)

1. Implementasi local auth dulu: login `username/password` + hash password kuat (`argon2`/`bcrypt`).
2. Gunakan `access token` pendek + `refresh token` untuk Web UI dan desktop client.
3. Tambahkan binding `owner_user_id` ke client agar identitas client tidak hanya berdasarkan GUID.
4. Lindungi endpoint sensitif (`/api/clients/*`, `/api/sessions/*`, `/api/jobs/*`) dengan verifikasi token.
5. Pisahkan surface UI: halaman pelanggan print tetap di `/`, dashboard mitra auth di `/mitra/`, dan halaman pengaturan akun di `/mitra/account/`.
6. Mitra dapat mengelola data akun sendiri: update profil (`PATCH /api/auth/me`) dan update password (`PATCH /api/auth/me/password`).
7. Desktop client login via endpoint auth, simpan refresh token secara aman (Windows Credential Manager/DPAPI), refresh token otomatis saat access token expired (implementasi sisi client ada di repo desktop terpisah; endpoint server sudah siap).
8. Google login dikerjakan setelah local auth stabil, sebagai provider tambahan (bukan mengganti alur token yang sudah ada).

## Detail Step 8 (Kios Berbasis Akun / Account-Centric Queue)

- **8a. Data model ownership**
	- Tambah ownership akun pada `sessions` dan `jobs` (mis. `owner_user_id`), lalu backfill dari relasi `clients.owner_user_id` saat migrasi.
	- Pastikan query akses job/session berbasis `owner_user_id`, bukan hanya `target_client_id`.

- **8b. API daftar kios untuk pelanggan (`/`)**
	- Root page pelanggan tidak lagi menampilkan daftar client device mentah.
	- Sediakan daftar kios berbasis akun (mis. `display_name akun`), dengan syarat akun tersebut punya minimal 1 client terdaftar.

- **8c. Session creation berbasis akun**
	- Endpoint create session menerima identitas kios/akun (bukan `clientId` langsung).
	- Server memilih/menilai client aktif milik akun tersebut untuk eksekusi, tanpa mengubah fakta bahwa owner session adalah akun.

- **8d. Queue sinkron lintas client dalam akun**
	- Semua client yang login pada akun yang sama melihat antrean job akun yang sama.
	- Tambahkan mekanisme claim/lock job agar tidak terjadi double print saat beberapa client akun aktif bersamaan.

- **8e. Guard handover antar akun**
	- Unpair/re-pair device tidak boleh mewariskan antrean akun lama ke akun baru.
	- Job/session akun lama tetap dimiliki akun lama walau device fisik dipindah akun.

- **8f. Penyesuaian desktop & web**
	- Desktop tidak lagi fetch list job murni berdasar `clientId`; query harus terikat akun login + mekanisme claim.
	- Web pelanggan (`/`) memilih kios berbasis akun, bukan device client.

- **8g. Rollout aman**
	- Lakukan migration + compatibility layer (sementara) agar transisi dari model client-centric ke account-centric tidak memutus flow yang sedang berjalan.

## Pra-Realtime Stabilization

- Klien reuse ID stabil (GUID persist di sisi klien), register/heartbeat selalu kirim `clientId`; server upsert by `id`.
- Validasi `clientId` GUID/UUID di server; request invalid dikembalikan `400`.
- Hilangkan fallback generate ID random di endpoint register agar identitas benar-benar stabil.
- Status online/offline tetap *derived* dari `last_seen_at` + TTL; soft purge retention untuk data stale.
- FK `ON DELETE SET NULL` untuk relasi yang perlu agar cleanup tidak memblokir transaksi.
- Monitoring tetap baca DB untuk validasi kondisi operasional.

## Verification

- Manual flow end-to-end: register/heartbeat, create session, upload, print/reject, update status, cleanup pasca-cetak.
- Reconnect check: client GUID sama harus update row existing (bukan insert row baru).
- Status check: online/offline harus konsisten dengan TTL (`last_seen_at`), bukan status statis di DB.
- Race check: ping/job event saat client putus cepat tidak boleh bikin server crash saat restart.
- Cleanup check: file orphan, session expired, dan stale client berjalan sesuai interval.
- Security check: endpoint sensitif menolak request tanpa kredensial valid.
- Auth check web: login berhasil/gagal, refresh token, logout, dan revoke token berjalan benar.
- Auth check mitra web: modal login/daftar, tombol akun/logout, update profil, dan update password berjalan benar di `/mitra`.
- Auth check desktop: login user sukses, token refresh otomatis, dan request gagal jika token invalid/expired tanpa refresh.
- Identity check: satu user bisa mengelola beberapa client GUID, audit log menyimpan `user_id` dan `client_id`.
- Ownership guard check: akses client/session/job milik akun lain harus ditolak (`403`).
- Account queue isolation check: job dari akun A tidak boleh muncul di akun B meskipun device yang sama di-unpair lalu di-pair ulang.
- Multi-client same-account sync check: 2+ client pada akun yang sama melihat queue akun yang sama; job yang sama tidak boleh diproses ganda.
- Customer kiosk list check: halaman `/` menampilkan kios berbasis akun (hanya akun dengan minimal 1 client).

## Decisions

- Arsitektur target fase TA: **single-node, non-HA**.
- PostgreSQL adalah source utama data; JSON fallback hanya untuk pengujian lokal.
- Realtime tetap prioritas tinggi, tetapi tanpa Redis dependency.
- Background processing cukup internal scheduler, bukan message broker.
- Identitas klien wajib GUID stabil sebagai identitas device, tetapi kepemilikan antrean/sesi ditambatkan ke akun kios.
- Urutan auth: local auth (username/password) dikerjakan sekarang pada Step 7, Google login menyusul sebagai fase lanjutan.
- Pemisahan UI: `/` tetap untuk pelanggan print (pilih kios berbasis akun), sedangkan dashboard mitra dan akun berjalan di `/mitra`.
