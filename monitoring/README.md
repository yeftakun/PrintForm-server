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
- Ringkasan: total/online clients, total sessions, total jobs, distribusi status job & session (diringkas di summary).
- Tabel Clients: id, name, status, selected printer, last seen (limit 50 terbaru).
- Tabel Jobs: id, status, client, nama file, size, created_at (limit 50 terbaru).

## Catatan teknis
- Membaca langsung tabel `clients`, `sessions`, `jobs` (harus sudah schema text-id sesuai `temp_initial_synax.sql`).
- Interval polling SSE: 2 detik. Read-only, tidak ada mutasi.
- Menggunakan env dari root `.env` (DATABASE_URL, optional `MONITORING_PORT`).
