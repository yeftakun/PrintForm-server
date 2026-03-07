## Yang perlu dikerjakan lain waktu

1. Hapus fallback generate ID random di server pada endpoint register client.
	- Lokasi saat ini: `src/routes/clients.js` (masih ada pola `incomingId || client_${Date.now()}...`).
	- Target: server hanya menerima `clientId` dari client (GUID persisten), tidak membuat ID baru otomatis.

2. Tambahkan validasi format `clientId` GUID/UUID di server.
	- Lokasi utama: `src/routes/clients.js` (`register`, `heartbeat`, `unregister`).
	- Target: jika format invalid, kembalikan `400 Bad Request` dengan pesan yang jelas.

Catatan: Poin terkait unit retensi (`CLIENT_RETENTION_DAYS` vs ms) ditunda dan akan diubah manual nanti.
