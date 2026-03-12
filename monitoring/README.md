# Monitoring (read-only)

Dashboard sederhana untuk membaca status PrintBridge secara realtime (read-only). Aplikasi ini hanya *membaca* database Postgres dan tidak menulis apa pun.

## Prasyarat
- Postgres aktif dan `DATABASE_URL` sudah terisi (mengambil dari `../.env`).
- Node.js 18+.

## Menjalankan
```bash
cd monitoring
npm install
npm start
```
Secara default akan jalan di `http://localhost:3100` (ubah via `MONITORING_PORT`).

## Endpoints
- `/` — UI dashboard.
- `/api/state` — snapshot JSON sekali ambil.
- `/api/stream` — SSE stream snapshot tiap 2 detik.
- `/api/health` — health check.

## Data yang ditampilkan
- Ringkasan: total/online/recognized clients, total sessions/jobs, status distribusi, serta token refresh aktif.
- Tabel Clients: id, name, status (TTL + cached status), owner user, recognized flag, selected printer, last seen.
- Tabel Sessions: id, client, alias, status, created, last seen.
- Tabel Jobs: id, status, target client, nama file, paper size, copies, size, created.
- Tabel Events dan Audit Logs (latest 50).
- Tabel Refresh Tokens (latest 50): user, created, expires, revoked, replaced_by.
- Tabel Users (latest 50): username/email/role + indikator PIN set/unset.
- Storage Usage singleton snapshot (`storage_usage`).

## Catatan teknis
- Monitoring membaca langsung struktur DB aktif: `clients`, `sessions`, `jobs`, `events`, `audit_logs`, `users`, `refresh_tokens`, `storage_usage`.
- Kolom `users.pin_hash` diperlakukan opsional (dashboard tetap jalan jika migrasi Step 8 belum dijalankan).
- Query monitoring toleran terhadap tabel/kolom opsional yang belum ada (akan tampil kosong, bukan 500).
- Interval polling SSE: 2 detik. Read-only, tidak ada mutasi.
- Menggunakan env dari root `.env` (DATABASE_URL, optional `MONITORING_PORT`).
