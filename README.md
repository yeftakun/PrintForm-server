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

UI routes:

- Customer print page: `http://localhost:3000/`
- Mitra dashboard: `http://localhost:3000/mitra/`
- Mitra account settings: `http://localhost:3000/mitra/account/`

Apply Step 7 auth migration (required before enabling auth features):

```powershell
psql "$env:DATABASE_URL" -f scripts/migrations/20260310_step7_auth_baseline.sql
```

```bash
psql "$DATABASE_URL" -f scripts/migrations/20260310_step7_auth_baseline.sql
```

Apply Step 8a account ownership migration for sessions/jobs:

```powershell
psql "$env:DATABASE_URL" -f scripts/migrations/20260314_step8a_account_queue_ownership.sql
```

```bash
psql "$DATABASE_URL" -f scripts/migrations/20260314_step8a_account_queue_ownership.sql
```

Apply Step 8d job claim/lock migration:

```powershell
psql "$env:DATABASE_URL" -f scripts/migrations/20260314_step8d_job_claim_lock.sql
```

```bash
psql "$DATABASE_URL" -f scripts/migrations/20260314_step8d_job_claim_lock.sql
```

## .env Reference

### Core

- `PORT`: HTTP port untuk PrintForm server.
- `USE_DB`: `true` untuk Postgres repository, `false` untuk JSON storage.
- `DATABASE_URL`: connection string Postgres, wajib jika `USE_DB=true`.
- `MONITORING_PORT`: port app monitoring (optional, dipakai `monitoring/server.js`).

### Authentication

- Catatan: fitur auth Step 7 hanya aktif jika `USE_DB=true`.
- `AUTH_ENFORCE`: wajibkan auth bearer untuk endpoint API utama.
- `AUTH_ALLOW_PUBLIC_REGISTER`: izinkan register user tanpa login admin.
- `AUTH_ACCESS_TOKEN_SECRET`: secret sign JWT access token.
- `AUTH_REFRESH_TOKEN_SECRET`: secret sign JWT refresh token.
- `AUTH_ACCESS_TOKEN_TTL`: masa berlaku access token (format `jsonwebtoken`).
- `AUTH_REFRESH_TOKEN_TTL_DAYS`: masa berlaku refresh token (hari).
- `AUTH_BCRYPT_ROUNDS`: cost hash bcrypt password.

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
- `CLIENT_LIST_INCLUDE_UNRECOGNIZED`: tampilkan semua client di daftar guest (`/`) untuk mode development.
- `ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE`: fallback sementara agar `POST /api/sessions` masih menerima `clientId` tanpa `kioskId` (default `false`).
- `JOBS_LIST_ALLOW_LEGACY_CLIENT_FILTER`: fallback sementara agar `GET /api/jobs?clientId=...` tetap diterima (default `false`, mode account-centric ketat).

### Cleanup and retention

- `ORPHAN_GRACE_MS`: usia minimum file orphan agar boleh dihapus (ms).
- `SESSION_CLEANUP_INTERVAL_MS`: interval scheduler untuk cleanup session expired (ms).
- `FILE_CLEANUP_INTERVAL_MS`: interval scanner cleanup orphan file (ms).
- `CLIENT_RETENTION_DAYS`: retensi stale client (hari).
- `RETENTION_CLEANUP_INTERVAL_MS`: interval cleanup retensi stale data (ms).

### Rate limit

- `CLIENT_REGISTER_RATE_LIMIT_WINDOW_MS`: window rate-limit register (ms).
- `CLIENT_REGISTER_RATE_LIMIT_MAX`: max request register per window.
- `CLIENT_HEARTBEAT_RATE_LIMIT_WINDOW_MS`: window rate-limit heartbeat (ms).
- `CLIENT_HEARTBEAT_RATE_LIMIT_MAX`: max request heartbeat per window.

## Flow overview

1. Web user selects a target kiosk account from customer page (`/`) and creates a session (optional alias for sender).
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

- Create session untuk kios terpilih (dengan optional sender alias).
- Halaman pelanggan (`/`) menampilkan daftar kios berbasis akun lewat `GET /api/clients/kiosks` (hanya akun dengan minimal 1 client recognized).
- Kios ditandai siap jika memiliki minimal 1 client `ready`; `POST /api/sessions` pada mode default mewajibkan `kioskId` dan server memilih target client siap milik akun tersebut.
- Legacy target berbasis `clientId` dinonaktifkan default; dapat diaktifkan sementara dengan env `ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE=true`.
- Respons `POST /api/sessions` menyertakan metadata transisi (`targetSource`, `requestedKioskId`, `compatibility.legacyClientTarget`, `compatibility.legacyClientTargetAllowed`).
- Create session ditolak jika target client offline/tidak responsif (`409 CLIENT_UNAVAILABLE`).
- Create session ditolak jika target client belum recognized/login owner (`409 CLIENT_UNRECOGNIZED`).
- Create session ditolak jika client sudah bind akun tetapi desktop client belum login aktif (`409 CLIENT_NOT_READY`).
- Jika websocket client tidak sedang connected, server menunggu confirmation window singkat untuk mendeteksi reconnect atau aktivitas terbaru client sebelum membuat session.
- Upload jobs (A4/A5, copies).
- Mekanisme claim/lock aktif untuk status print (`printing`/`done`/`failed`/`rejected`/`pending`/`send`) agar job yang sama tidak diproses ganda antar client akun.
- Desktop queue dianjurkan fetch per-akun (default auth scope) via `GET /api/jobs` dengan token login akun; hindari mode lama yang hanya bergantung `clientId`.
- Jika desktop lama masih mengirim query `clientId`, server mode strict akan mengabaikan filter itu (bukan fail), lalu tetap mengembalikan queue per-akun.
- Untuk kontrol lock yang lebih eksplisit, tersedia endpoint `POST /api/jobs/:id/claim` dan `POST /api/jobs/:id/release` (auth).
- Job list with:
  - "Buat lagi" (clone job with same file/config).
  - "Batal" (cancel job, only when status is `ready`).
- Web UI utama memakai WebSocket subscribe (`jobs`, `clients`, `sessions`) untuk update realtime.
- Polling tetap ada sebagai fallback ketika koneksi WebSocket terputus.

## Client features (summary)

- Registers to the server and sends heartbeat/ping poll.
- `clientId` is mandatory and must be a valid GUID/UUID format.
- Job list with Print / Reject (Reject only on `ready`).
- Untuk update status print, client sebaiknya kirim `clientId` pada `PATCH /api/jobs/:id` agar claim/lock bisa divalidasi eksplisit.
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
  - `GET /api/clients/kiosks`
  - `POST /api/clients/register`
  - `POST /api/clients/heartbeat`
  - `POST /api/clients/:id/ping`
  - `GET /api/clients/:id/ping`
  - `POST /api/clients/:id/pair` (credential verify + bind + token issue)
  - `POST /api/clients/:id/bind` (auth)
  - `POST /api/clients/:id/unbind` (auth owner/admin)
  - `POST /api/clients/unregister`
- Sessions:
  - `POST /api/sessions` (`kioskId` wajib pada mode default; fallback `clientId` hanya jika `ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE=true`)
  - `POST /api/sessions/heartbeat`
  - `POST /api/sessions/close`
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `POST /api/auth/logout-all`
  - `POST /api/auth/verify-pin`
  - `GET /api/auth/me`
  - `PATCH /api/auth/me`
  - `PATCH /api/auth/me/pin`
  - `PATCH /api/auth/me/password`
- Jobs:
  - `GET /api/jobs?sessionId=...`
  - `GET /api/jobs` (auth default account scope); optional query: `kioskId`/`ownerUserId`/`accountId`, dan `claimClientId` untuk view claim-aware (`clientId` query legacy diabaikan pada mode strict default).
  - `GET /api/jobs/:id`
  - `GET /api/jobs/:id/download`
  - `POST /api/jobs` (multipart upload)
  - `POST /api/jobs/:id/clone`
  - `POST /api/jobs/:id/claim` (auth, butuh `clientId`)
  - `POST /api/jobs/:id/release` (auth, butuh `clientId` kecuali admin)
  - `PATCH /api/jobs/:id` (status updates; claim-aware untuk status print, dapat kirim `clientId`)

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

- Step 7 authentication is now available (local account + JWT access/refresh token).
- Step 8 account-centric queue is now default on server scope (kiosk-first session create + claim-aware queue + handover guard).
- Legacy fallback path tetap tersedia sementara via env toggle (`ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE`, `JOBS_LIST_ALLOW_LEGACY_CLIENT_FILTER`) untuk rollback terkontrol jika diperlukan.
- Step 8a starts account-centric queue migration by anchoring `sessions` and `jobs` to `owner_user_id` (account ownership), with compatibility fallback while old rows are still client-centric.
  - Run migration first: `scripts/migrations/20260314_step8a_account_queue_ownership.sql`.
- Step 8d menambahkan claim/lock pada job (`claimed_by_client_id`, `claimed_at`) untuk mencegah double print pada multi-client akun yang sama.
  - Run migration first: `scripts/migrations/20260314_step8d_job_claim_lock.sql`.
- Step 8e menambahkan handover guard saat pair/bind/unbind client agar antrean akun lama tidak diwariskan ke akun baru (legacy queue di-preserve/detach, claim lama dirilis).
- Step 8 adds account PIN support (`users.pin_hash`) for sensitive client-side actions (e.g. desktop unpair verification).
  - Run migration first: `scripts/migrations/20260312_step8_account_pin.sql`.
- `POST /api/clients/:id/unbind` bersifat idempotent: jika client sudah unbound, endpoint tetap mengembalikan `200` dengan `alreadyUnbound=true`.
- Step 7 audit trail aktif di tabel `audit_logs` untuk event kritikal auth/client/session/job.
- Mode auth saat ini:
  - Binding owner ke client bersifat explicit lewat `POST /api/clients/:id/pair` (desktop pair sekali) atau `POST /api/clients/:id/bind` (flow auth bearer), bukan auto-bind dari heartbeat/register.
  - Desktop client yang sedang online tapi logout akan tampil sebagai `owned` (sudah bind, belum login aktif).
  - Web pelanggan di `/` tetap guest-first untuk membuat session/upload job.
  - Client yang belum recognized tidak bisa menerima job (`CLIENT_UNRECOGNIZED`).
  - Client recognized namun belum login aktif ditolak saat create session (`CLIENT_NOT_READY`).
  - Guest dibatasi per `sessionId` untuk aksi job (clone/cancel), sementara endpoint detail/download job tetap auth-only.
- For stricter privacy, you can shorten the orphan cleanup grace period or delete files immediately after successful print.
