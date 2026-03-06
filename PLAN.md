# Plan: Migrasi Bertahap ke Stack Prod & Modularisasi

TL;DR: Upgrade dari polling + JSON ke arsitektur prod (DB, Redis, WebSocket, object storage) sambil modularisasi. Fokus: tetap jalan di tiap tahap dengan rollback mudah.

## Steps

1. Baseline refactor — pecah `server.js` ke `src/` (config, storage/jsonStore, services, routes, cleanup); tambah error handler. **Selesai.**
2. Observability — logging terstruktur + req id + latency; healthcheck tetap. **Selesai.**
3. Persistensi DB — Postgres + `pg`, repositories ganti JSON store; schema/migrasi tersedia; feature flag JSON fallback. **Selesai.**
4. Redis layer — Redis untuk TTL session/client (ganti isSessionActive/isClientOnline), Pub/Sub notifikasi job/status, rate-limit heartbeat/register.
5. File storage lokal/shared — kuota 1GB; guard kapasitas sebelum upload; cleanup orphan; penghitung usage; siap untuk shared/mounted FS.
6. Realtime — WebSocket/SignalR; push events (client online/offline, job created/updated, kapasitas penuh); Web UI + client .NET subscribe; REST fallback.
7. Security — auth (JWT/API key) untuk web & print client; validasi upload size/MIME; audit log status change.
8. Background worker — queue (BullMQ/RabbitMQ) untuk cleanup/clone/notifikasi; pindah setInterval ke worker; periodic usage scan.
9. Frontend update — `index.html` adapt WebSocket + notifikasi kapasitas penuh; tampilkan pesan kuota; upload tetap multipart.
10. Deployment — containerize; reverse proxy (TLS, gzip, buffering); horizontal scale dengan shared Redis/DB; volume/shared FS; dashboards metrics/logs termasuk storage.

## Pre-Redis Stabilization (dijalankan sebelum Step 4)
- Klien reuse ID stabil (persist di sisi klien), register/heartbeat selalu kirim `clientId`; server upsert by `id`.
- Status online/offline *derived* dari `last_seen_at` + TTL; tidak hard-delete langsung saat offline, pembersihan dilakukan via soft purge berbasis retensi.
- FK schema longgar: `ON DELETE SET NULL` untuk referensi klien (jobs target_client_id, events client/session/job, websocket_subscriptions), sehingga prune tidak blok.
- Monitoring sudah mencakup semua tabel; highlight last_seen_at stale vs fresh.
- Jalankan migrasi/normalisasi data (migrate JSON→DB jika perlu), cek konsistensi counts.

## Verification
- Manual: register/heartbeat; job create; session lifecycle; client restart reuse ID; status derived sesuai TTL; monitoring mencerminkan perubahan realtime.
- DB checks: FK “set null” aktif; tidak ada constraint violation; data stale terhapus sesuai `CLIENT_RETENTION_DAYS`/interval cleanup.
- Toggle USE_DB: JSON fallback tetap jalan.

## Decisions
- Simpan riwayat klien sementara; status online/offline dihitung dari `last_seen_at` + TTL, lalu soft purge berdasarkan retensi.
- FK: `ON DELETE SET NULL` agar prune aman bila diperlukan.
- Identitas klien: wajib reuse `clientId` stabil; kelak diikat ke akun/API key.