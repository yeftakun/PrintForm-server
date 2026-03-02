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
- Original filenames are stored in `storage/jobs.json` as `originalName`.
- Sessions, jobs, clients, and ping queues are stored as JSON:
  - `storage/sessions.json`
  - `storage/jobs.json`
  - `storage/clients.json`
  - `storage/pings.json`
- Session cleanup removes jobs and files if a session expires or is closed.
- Orphan cleanup runs every 60 seconds and deletes files not referenced by any job (older than 2 minutes).

## Web UI features

- Create session for a selected client (with optional sender alias).
- Upload jobs (A4/A5, copies).
- Job list with:
  - "Buat lagi" (clone job with same file/config).
  - "Batal" (cancel job, only when status is `ready`).
- Real-time-ish updates via polling (jobs every ~3s, clients every ~5s).

## Client features (summary)

- Registers to the server and sends heartbeat/ping poll.
- Job list with Print / Reject (Reject only on `ready`).
- If printer is offline, job becomes `pending` (not sent to spooler).
- Prints locally on the client machine; server never prints.

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

## Notes

- No authentication or encryption is implemented. This is a local prototype.
- If you want stricter privacy, you can shorten the orphan cleanup grace period or delete files immediately after successful print.
