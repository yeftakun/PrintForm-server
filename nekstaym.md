## Yang perlu dikerjakan lain waktu

### Catatan hasil uji skenario (2026-03-08)

- Skenario 1: client berhasil terdaftar, tetapi status tetap `offline` dan tidak berubah saat client dimatikan/dihidupkan. Sudah ditangani pada 2026-03-10.
- Skenario 2: lolos.
- Skenario 3: lolos.
- Skenario 4: sama seperti skenario 1 (masalah status online/offline). Sudah ditangani pada 2026-03-10.
- Skenario 5: ditunda dulu.
- Skenario 6: dilewati (sudah pernah diuji dan seharusnya bisa).
- Skenario 7: sejauh ini aman.

### PR fokus berikutnya

- Presence status (`online`/`offline`) sudah diimplementasikan ulang:
	- register/heartbeat/ping sekarang memaksa cache status jadi `online`.
	- realtime presence sync menyelaraskan cache status DB berdasarkan TTL.
	- monitoring dashboard menghitung status langsung dari `last_seen_at` + `CLIENT_TTL_MS`.
- Sisa tindak lanjut: jalankan UAT ulang untuk verifikasi transisi online -> offline setelah heartbeat berhenti sesuai nilai TTL.

