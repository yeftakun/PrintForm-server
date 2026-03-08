## Yang perlu dikerjakan lain waktu

### Catatan hasil uji skenario (2026-03-08)

- Skenario 1: client berhasil terdaftar, tetapi status tetap `offline` dan tidak berubah saat client dimatikan/dihidupkan. Ditunda dulu (PR).
- Skenario 2: lolos.
- Skenario 3: lolos.
- Skenario 4: sama seperti skenario 1 (masalah status online/offline), ditunda dulu.
- Skenario 5: ditunda dulu.
- Skenario 6: dilewati (sudah pernah diuji dan seharusnya bisa).
- Skenario 7: sejauh ini aman.

### PR fokus berikutnya

- Investigasi kenapa status presence tidak berubah (`online`/`offline`) walau register/heartbeat berjalan.
- Validasi ulang alur update `lastSeen` dan pembacaan status di endpoint daftar client.
- Cek pengaruh konfigurasi TTL pada status client saat testing.

