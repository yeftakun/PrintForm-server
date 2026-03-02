# Plan: Migrasi Bertahap ke Stack Prod & Modularisasi

TL;DR: Kita urutkan upgrade dari polling + JSON ke arsitektur prod (DB, Redis, WebSocket, object storage) sambil memecah `server.js` menjadi modul per domain (clients, sessions, jobs, files, ping, cleanup). Fokus: tetap jalan di tiap tahap, dengan rollback mudah.

**Steps**

1. Baseline refactor: pecah `server.js` jadi folder `src/` dengan modul `config` (TTL, paths, env), `storage/jsonStore` (read/write), `services` (clients, sessions, jobs, pings, files, cleanup), dan `routes` per resource; tambahkan error handler middleware. Pastikan perilaku identik.
2. Observability dasar: tambahkan logging terstruktur dan request tracing ringan (req id + latency) di layer Express; healthcheck tetap di `server.js`.
3. Persistensi DB: perkenalkan Postgres + ORM (Prisma/Sequelize); buat adaptor `repositories/*` menggantikan JSON store; migrasi schema (clients, sessions, jobs, pings/events); fallback JSON masih ada via feature flag/env.
4. Redis layer: pakai Redis untuk TTL session/client (ganti isSessionActive/isClientOnline logika file) dan Pub/Sub notifikasi job/status; rate-limit heartbeat/register.
5. File storage: ganti multer dest ke object storage (S3/MinIO) via presigned URL; simpan metadata saja di DB; matikan `cleanupOrphanFiles` file system, ganti lifecycle di bucket.
6. Realtime: tambahkan WebSocket/SignalR endpoint; push events (client online/offline, job created/updated). Web UI dan client .NET pindah dari polling ke subscribe; REST tetap sebagai fallback.
7. Security: tambah auth (JWT/API key) untuk web & print client; validate upload size/MIME; audit log perubahan status (Ready→Send) di service jobs.
8. Background worker: gunakan queue (BullMQ/RabbitMQ) untuk clone, cleanup, fan-out notifikasi; matikan setInterval di proses web, pindah ke worker.
9. rontend update: adapt `index.html` untuk WebSocket + signed upload; sesuaikan status display dan error handling.
10. Deployment: containerize, reverse proxy (TLS, gzip, upload buffering), horizontal scaling dengan shared Redis/DB; tambahkan dashboards (metrics/logs).

**Verification**

- Uji regresi manual: daftar client/job, start/end session, upload, clone, status update, download.
- Uji integrasi untuk services (clients/sessions/jobs) dengan adaptor JSON dan DB.
- Load test kecil untuk upload + event fan-out; verifikasi TTL cleanup via Redis.
- E2E: web UI + client .NET terhadap WebSocket dan REST fallback.

**Decisions**

- Modularisasi diperlukan: **server.js** sudah memuat config, storage, domain, routes, cleanup; dipecah per domain/service.
- Tahap bertahap: mulai dari refactor tanpa ubah perilaku, lalu DB, Redis, file storage, realtime, security, worker.