# PrintForm Server

Simple Node.js server for the PrintForm prototype. It hosts the web UI, stores uploaded files, and coordinates print jobs with the .NET client.

[Next move](PLAN.md)

## Quick start

```bash
cd server
npm install
npm start
```

Open `http://localhost:3000`.

## .env Reference

### Core

- `PORT`: HTTP port untuk PrintForm server.
- `USE_DB`: `true` untuk Postgres repository, `false` untuk JSON storage.
- `DATABASE_URL`: connection string Postgres, wajib jika `USE_DB=true`.
- `MONITORING_PORT`: port app monitoring (optional, dipakai `monitoring/server.js`).

### Storage and upload

- `STORAGE_DIR`: root folder storage lokal.
- `MAX_UPLOAD_BYTES`: batas ukuran upload per file (bytes).
- `FILE_QUOTA_BYTES`: batas total kuota file aktif (bytes).
- `AUTO_DELETE_TERMINAL_JOB_FILES`: hapus file fisik saat job terminal.
- `ALLOWED_UPLOAD_MIME_TYPES`: allowlist MIME upload (CSV).
- `ALLOWED_UPLOAD_EXTENSIONS`: allowlist extension upload (CSV).

### Presence, session, and realtime

- `CLIENT_TTL_MS`: TTL status client online/offline (ms).
- `SESSION_TTL_MS`: TTL session aktif (ms).
- `SESSION_CREATE_CONFIRM_TIMEOUT_MS`: window pending confirmation create session (ms).
- `SESSION_CREATE_CONFIRM_POLL_INTERVAL_MS`: interval polling selama pending confirmation (ms).
- `REALTIME_PATH`: path websocket realtime.
- `REALTIME_PRESENCE_SYNC_INTERVAL_MS`: interval sinkronisasi presence loop (ms).
- `REALTIME_PING_INTERVAL_MS`: interval ping keepalive websocket (ms).
- `REALTIME_CLIENT_OFFLINE_GRACE_MS`: grace disconnect WS sebelum client dipaksa offline (ms).

### Cleanup and retention

- `ORPHAN_GRACE_MS`: usia minimum file orphan agar boleh dihapus (ms).
- `FILE_CLEANUP_INTERVAL_MS`: interval scanner cleanup orphan file (ms).
- `CLIENT_RETENTION_DAYS`: retensi stale client (hari).
- `RETENTION_CLEANUP_INTERVAL_MS`: interval cleanup retensi stale data (ms).

### Rate limit

- `CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS`: window rate-limit register (ms).
- `CLIENT_REGISTER_RATE_LIMIT_MAX`: max request register per window.
- `CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS`: window rate-limit heartbeat (ms).
- `CLIENT_HEARTBEAT_RATE_LIMIT_MAX`: max request heartbeat per window.

## Flow overview

1. Web user selects a target .NET client and creates a session (optional alias for sender).
2. Web user uploads one or more jobs inside the session.
3. The .NET client opens its Job List and prints or rejects jobs.
4. Session end (or session timeout) deletes session jobs and their files.

## Job status rules (current)

- `ready`: job created and waiting.
- `printing`: client accepted and started printing.
- `done`: job was sent to the printer spooler (UI shows "sent").
- `pending`: client detected printer offline and did not send the job.
- `failed`: client failed to download or print.
- `rejected`: client rejected the job.
- `canceled`: web user canceled the job.

Client actions only work on the latest server status (the client re-checks before print/reject).

## Storage and privacy

- Uploaded files are stored in `storage/files/` with random names (no extension).
- Original filenames are stored as `originalName` in job records (JSON/DB repository).
- Upload validation enforces MIME/extension allowlist and max file size.
- Server enforces storage quota (`FILE_QUOTA_BYTES`, default 1GB) for upload and clone operations.
- Storage usage snapshot is tracked in `storage_usage` table (when DB mode is enabled).
- Terminal job statuses (`done`, `failed`, `rejected`, `canceled`) can trigger safe file deletion (`AUTO_DELETE_TERMINAL_JOB_FILES=true`).
- Sessions, jobs, clients, and ping queues are stored as JSON:
  - `storage/sessions.json`
  - `storage/jobs.json`
  - `storage/clients.json`
  - `storage/pings.json`
- Session cleanup removes jobs and files if a session expires or is closed.
- Orphan cleanup runs every 60 seconds and deletes files not referenced by any job (older than 2 minutes).

Tuning env vars for upload and storage:

- `MAX_UPLOAD_BYTES`
- `ALLOWED_UPLOAD_MIME_TYPES`
- `ALLOWED_UPLOAD_EXTENSIONS`
- `FILE_QUOTA_BYTES`
- `AUTO_DELETE_TERMINAL_JOB_FILES`

## Web UI features

- Create session for a selected client (with optional sender alias).
- Create session ditolak jika target client offline/tidak responsif (`409 CLIENT_UNAVAILABLE`).
- Jika websocket client tidak sedang connected, server menunggu confirmation window singkat untuk mendeteksi reconnect atau aktivitas terbaru client sebelum membuat session.
- Upload jobs (A4/A5, copies).
- Job list with:
  - "Buat lagi" (clone job with same file/config).
  - "Batal" (cancel job, only when status is `ready`).
- Web UI utama memakai WebSocket subscribe (`jobs`, `clients`, `sessions`) untuk update realtime.
- Polling tetap ada sebagai fallback ketika koneksi WebSocket terputus.

## Client features (summary)

- Registers to the server and sends heartbeat/ping poll.
- `clientId` is mandatory and must be a valid GUID/UUID format.
- Job list with Print / Reject (Reject only on `ready`).
- If printer is offline, job becomes `pending` (not sent to spooler).
- Prints locally on the client machine; server never prints.

## Presence and rate-limit

- Online/offline status is derived from `last_seen_at`/`lastSeen` and `CLIENT_TTL_MS`.
- Realtime presence is WS-first for print clients:
  - Print client websocket sends identity (`clientId`) on connect.
  - Socket disconnect triggers fast offline transition after grace window (`REALTIME_CLIENT_OFFLINE_GRACE_MS`).
  - TTL-based derivation remains as safety net for silent network failures.
- Offline clients are not deleted immediately; stale data cleanup uses retention settings.
- In-memory rate-limit is enabled for client endpoints:
  - `POST /api/clients/register`
  - `POST /api/clients/heartbeat`
- Tuning env vars:
  - `CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS`
  - `CLIENT_REGISTER_RATE_LIMIT_MAX`
  - `CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS`
  - `CLIENT_HEARTBEAT_RATE_LIMIT_MAX`
  - `REALTIME_CLIENT_OFFLINE_GRACE_MS`

## API summary

- Clients:
  - `GET /api/clients`
  - `POST /api/clients/register`
  - `POST /api/clients/heartbeat`
  - `POST /api/clients/:id/ping`
  - `GET /api/clients/:id/ping`
  - `POST /api/clients/unregister`
- Sessions:
  - `POST /api/sessions`
  - `POST /api/sessions/heartbeat`
  - `POST /api/sessions/close`
- Jobs:
  - `GET /api/jobs?sessionId=...` or `?clientId=...`
  - `GET /api/jobs/:id`
  - `GET /api/jobs/:id/download`
  - `POST /api/jobs` (multipart upload)
  - `POST /api/jobs/:id/clone`
  - `PATCH /api/jobs/:id` (status updates)

## Realtime WebSocket

- WebSocket path: `ws://<host>:<port>/ws` (configurable via `REALTIME_PATH`).
- Health endpoint now includes realtime state at `GET /api/health`.
- Default subscription channel is `*` (receive all events).
- Client can update subscription by sending JSON:
  - `{"action":"subscribe","channels":["jobs","clients"]}`
- Channels currently used:
  - `clients`
  - `jobs`
  - `sessions`
  - `system`

Main emitted events:

- `realtime.connected`
- `clients.snapshot`
- `client.upserted`
- `client.status.changed`
- `client.removed`
- `job.created`
- `job.status.changed`
- `job.file.removed`
- `jobs.removed`
- `session.closed`
- `sessions.expired`

Related realtime env vars:

- `REALTIME_PATH`
- `REALTIME_PRESENCE_SYNC_INTERVAL_MS`
- `REALTIME_PING_INTERVAL_MS`

## Notes

- No authentication or encryption is implemented. This is a local prototype.
- If you want stricter privacy, you can shorten the orphan cleanup grace period or delete files immediately after successful print.
