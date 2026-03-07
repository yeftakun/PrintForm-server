# Plan: Migrasi Bertahap ke Stack Prod & Modularisasi

TL;DR: Upgrade dari polling + JSON ke arsitektur prod (DB, Redis, WebSocket, object storage) sambil modularisasi. Fokus: tetap jalan di tiap tahap dengan rollback mudah.

## Steps

1. Baseline refactor — pecah `server.js` ke `src/` (config, storage/jsonStore, services, routes, cleanup); tambah error handler. **Selesai.**
2. Observability — logging terstruktur + req id + latency; healthcheck tetap. **Selesai.**
3. Persistensi DB — Postgres + `pg`, repositories ganti JSON store; schema/migrasi tersedia; feature flag JSON fallback. **Selesai.**
4. Redis layer — Redis untuk TTL session/client (presence), Pub/Sub notifikasi job/status, rate-limit heartbeat/register, serta migrasi antrean ping ephemeral dari `events` ke Redis; siapkan fallback saat Redis down agar endpoint kritikal tetap hidup.
5. File storage lokal/shared — kuota 1GB; guard kapasitas sebelum upload; cleanup orphan; penghitung usage; siap untuk shared/mounted FS.
6. Realtime — WebSocket/SignalR; push events (client online/offline, job created/updated, kapasitas penuh); Web UI + client .NET subscribe; REST fallback.
7. Security — auth (JWT/API key) untuk web & print client; validasi upload size/MIME; audit log status change.
8. Background worker — queue (BullMQ/RabbitMQ) untuk cleanup/clone/notifikasi; pindah setInterval ke worker; periodic usage scan.
9. Frontend update — `index.html` adapt WebSocket + notifikasi kapasitas penuh; tampilkan pesan kuota; upload tetap multipart.
10. Deployment — containerize; reverse proxy (TLS, gzip, buffering); horizontal scale dengan shared Redis/DB; volume/shared FS; dashboards metrics/logs termasuk storage.

## Pre-Redis Stabilization (dijalankan sebelum Step 4)
- Klien reuse ID stabil (persist di sisi klien), register/heartbeat selalu kirim `clientId`; server upsert by `id`.
- Server validasi format `clientId` GUID/UUID; request invalid dikembalikan `400`.
- Hilangkan fallback generate ID random di endpoint register agar identitas benar-benar stabil.
- Status online/offline *derived* dari `last_seen_at` + TTL; tidak hard-delete langsung saat offline, pembersihan dilakukan via soft purge berbasis retensi.
- FK schema longgar: `ON DELETE SET NULL` untuk referensi klien (jobs target_client_id, events client/session/job, websocket_subscriptions), sehingga prune tidak blok.
- Monitoring sudah mencakup semua tabel; highlight last_seen_at stale vs fresh.
- Jalankan migrasi/normalisasi data (migrate JSON→DB jika perlu), cek konsistensi counts.

## Verification
- Manual: register/heartbeat; job create; session lifecycle; client restart reuse ID; status derived sesuai TTL; monitoring mencerminkan perubahan realtime.
- Reconnect check: client dengan GUID yang sama harus update row existing (bukan insert row baru).
- DB checks: FK “set null” aktif; tidak ada constraint violation; data stale terhapus sesuai `CLIENT_RETENTION_DAYS`/interval cleanup.
- Race check: kirim ping lalu matikan client sebelum poll; restart server tidak boleh crash karena leftover ping.
- FK behavior check: purge/delete client tidak boleh memicu error FK (events/jobs/subscriptions mengikuti aturan `SET NULL`/cascade yang ditentukan).
- USE_DB=true adalah jalur utama; USE_DB=false hanya sanity check fallback.

## Decisions
- Simpan riwayat klien sementara; status online/offline dihitung dari `last_seen_at` + TTL, lalu soft purge berdasarkan retensi.
- Sumber kebenaran status adalah perhitungan `last_seen_at` + TTL; kolom `status` di DB diperlakukan sebagai cache/opsional.
- FK: `ON DELETE SET NULL` agar prune aman bila diperlukan.
- Identitas klien: wajib reuse `clientId` stabil; kelak diikat ke akun/API key.