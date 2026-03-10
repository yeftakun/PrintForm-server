# Plan: Migrasi Bertahap ke Stack Prod & Modularisasi (Revisi Scope TA)

TL;DR: Fokus pada arsitektur sederhana tapi stabil untuk purwarupa tugas akhir: **PostgreSQL + WebSocket + internal scheduler + single-node deployment**. Hindari over-engineering (Redis/RabbitMQ/HA multi-node) pada fase ini.

## Scope Guard

### Wajib dikerjakan
- PostgreSQL sebagai penyimpanan utama.
- Realtime notifikasi memakai WebSocket/SignalR-equivalent.
- Cleanup file/sesi/client berjalan otomatis via scheduler internal.
- Secure upload + validasi MIME/size + quota storage.
- Deploy single-node dengan Docker + Nginx (TLS).

### Di luar scope saat ini (dibatalkan)
- Redis dependency untuk presence/pubsub/rate-limit.
- External message broker (RabbitMQ/BullMQ).
- Horizontal scaling, load balancer, shared FS lintas node.

## Steps

1. Baseline refactor — pecah `server.js` ke `src/` (config, storage/jsonStore, services, routes, cleanup); tambah error handler. **Selesai.**
2. Observability — logging terstruktur + req id + latency; healthcheck tetap. **Selesai.**
3. Persistensi DB — Postgres + `pg`, repositories ganti JSON store; schema/migrasi tersedia; fallback JSON hanya untuk sanity check. **Selesai.**
4. Presence & rate-limit tanpa Redis — status online/offline tetap *derived* dari `last_seen_at` + TTL; rate-limit register/heartbeat dengan in-memory limiter sederhana (scope single-node). **Selesai — Beberapa tertunda**
5. File storage & privacy controls — enforce kuota 1GB, validasi MIME/size, cleanup orphan, pencatatan usage, dan mekanisme penghapusan aman pasca-cetak. **Selesai.**
6. Realtime channel — implement WebSocket endpoint untuk push event (job masuk, status job berubah, client online/offline) ke Web UI dan .NET client. **Selesai — server + .NET client + Web UI utama realtime aktif (polling fallback tetap ada).**
7. Security baseline — API key/JWT minimal untuk web & print client, audit log perubahan status, hardening endpoint upload/download.
8. Internal scheduler — gunakan `setInterval`/`node-cron` dalam process Node utama untuk cleanup retention, orphan scan, dan housekeeping periodik.
9. Frontend/client update — Web UI dan .NET client pindah dari polling berat ke subscribe realtime (REST tetap fallback). **Selesai.**
10. Deployment single-node — dockerize app + PostgreSQL + Nginx reverse proxy TLS; siapkan backup DB, log rotation, dan SOP recovery.

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

## Decisions

- Arsitektur target fase TA: **single-node, non-HA**.
- PostgreSQL adalah source utama data; JSON fallback hanya untuk pengujian lokal.
- Realtime tetap prioritas tinggi, tetapi tanpa Redis dependency.
- Background processing cukup internal scheduler, bukan message broker.
- Identitas klien wajib GUID stabil; nanti bisa diikat ke akun/API key.