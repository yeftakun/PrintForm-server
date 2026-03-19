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
[Detail Step 7](detail_step7.md)
8. Kios berbasis akun (account-centric queue) — rombak alur agar sesi/job berorientasi akun (kios), bukan client device. Root page menampilkan daftar akun kios (hanya akun dengan minimal 1 client), dan job akun tersinkron ke semua client yang login pada akun tersebut. **Selesai untuk scope `PrintForm-server` (mode account-centric ketat default + fallback legacy opsional via env).**
[Detail Step 8](detail_step8.md)
9. Internal scheduler — gunakan `setInterval`/`node-cron` dalam process Node utama untuk cleanup retention, orphan scan, dan housekeeping periodik. **Selesai untuk scope `PrintForm-server` (scheduler internal terpusat + lifecycle start/stop).**
10. Frontend/client update — Web UI dan .NET client pindah dari polling berat ke subscribe realtime (REST tetap fallback). **Selesai untuk scope `PrintForm-server`; adaptasi desktop lanjutan dieksekusi di repo client terpisah.**
11. Perancangan mockup pada [UI_MOCKUP_CONCEPT.md](UI_MOCKUP_CONCEPT.md).
12. Lengkapi konfigurasi cetak pada tugas cetak (konfigurasi akan dieksekusi pelanggan di web). [Detail Step 12](detail_step12.md)
13. Penyesuaian role akun: Admin, Mitra, Pelanggan.
14. Deployment single-node — dockerize app + PostgreSQL + Nginx reverse proxy TLS; siapkan backup DB, log rotation, dan SOP recovery.




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
- Claim/release conflict check: endpoint `POST /api/jobs/:id/claim` dan `POST /api/jobs/:id/release` menolak actor yang tidak valid atau beda akun dengan status error yang sesuai (`403/409`).
- Compatibility rollout check: `POST /api/sessions` mode `kioskId` dan fallback `clientId` sama-sama berjalan selama masa transisi; payload menyertakan metadata sumber target.

## Decisions

- Arsitektur target fase TA: **single-node, non-HA**.
- PostgreSQL adalah source utama data; JSON fallback hanya untuk pengujian lokal.
- Realtime tetap prioritas tinggi, tetapi tanpa Redis dependency.
- Background processing cukup internal scheduler, bukan message broker.
- Identitas klien wajib GUID stabil sebagai identitas device, tetapi kepemilikan antrean/sesi ditambatkan ke akun kios.
- Urutan auth: local auth (username/password) dikerjakan sekarang pada Step 7, Google login menyusul sebagai fase lanjutan.
- Pemisahan UI: `/` tetap untuk pelanggan print (pilih kios berbasis akun), sedangkan dashboard mitra dan akun berjalan di `/mitra`.
