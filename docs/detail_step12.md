## Detail Step 12 (Konfigurasi Cetak Dasar + Driver-Aware Resolution di Desktop)
[Kembali](PLAN.md)

Tujuan Step 12 adalah menjaga input pelanggan di Web UI tetap sederhana, tetapi tetap kompatibel dengan realita lapangan bahwa setiap kios (akun) bisa memiliki banyak client desktop dan printer dengan kemampuan driver yang berbeda.

### Prinsip Arsitektur

1. Pelanggan hanya mengisi konfigurasi dasar di Web UI.
2. Server menyimpan konfigurasi dasar sebagai kontrak job.
3. Desktop client yang mengeksekusi job melakukan penyesuaian atribut lanjutan berdasarkan printer driver lokal yang dipilih.
4. Mekanisme account-centric queue dan claim lock tetap menjadi guard utama agar tidak terjadi double print antar client dalam akun yang sama.

---

### 12a. Scope Konfigurasi Dasar di Web UI (Pelanggan)

Input yang direkomendasikan untuk fase ini:

- paperSize (A4, A5 pada fase awal)
- copies (1-999)
- colorMode (bw atau color)
- orientation (portrait atau landscape, opsional)
- pageRange (opsional, format sederhana seperti 1-3,5,8)
- notes (opsional, catatan pelanggan untuk operator)

Catatan implementasi awal:

- Minimal wajib tetap paperSize dan copies agar kompatibel dengan implementasi server saat ini.
- Field tambahan bisa dirilis bertahap mulai dari colorMode dulu, lalu orientation dan pageRange.

---

### 12b. Konfigurasi Kios di Level Akun Mitra

Setiap akun kios memiliki policy dasar layanan cetak, bukan policy per browser pelanggan. Policy ini dipakai server untuk memvalidasi request sebelum job masuk antrean.

Contoh policy minimal per akun:

- allowedPaperSizes
- maxCopiesPerJob
- allowColor
- allowPageRange
- defaultColorMode
- defaultOrientation

Aturan validasi:

- Jika input pelanggan tidak sesuai policy kios, request ditolak dengan pesan validasi yang jelas.
- Jika sesuai, job disimpan dan diteruskan ke antrean akun.

---

### 12c. Tanggung Jawab Server

Server tetap fokus pada kontrak dan orkestrasi, bukan detail driver printer.

Checklist server:

- Validasi konfigurasi dasar dari Web UI.
- Simpan konfigurasi dasar ke job.
- Pertahankan kompatibilitas kolom lama (paper_size, copies) selama masa transisi.
- Jika field dasar bertambah, lakukan perluasan struktur data secara backward compatible.
- Distribusikan job berdasarkan alur account-centric yang sudah ada (kioskId -> pilih client ready milik akun).

Catatan kompatibilitas schema:

- Fase awal dapat tetap memanfaatkan struktur saat ini untuk paperSize dan copies.
- Jika field dasar tambahan perlu dipersistenkan penuh, siapkan migrasi bertahap agar data tidak hilang saat repository DB dipakai.

---

### 12d. Tanggung Jawab Desktop Client (Driver-Aware Resolution)

Desktop client adalah tempat yang paling tepat untuk meniru perilaku seperti dialog print browser (driver-aware).

Alur eksekusi di desktop:

1. Claim job dari antrean akun.
2. Ambil konfigurasi dasar job dari server.
3. Ambil printer aktif dan kemampuan printer driver lokal.
4. Bentuk effective print settings (hasil merge antara job + policy kios + capability printer).
5. Jalankan print.
6. Update status job (printing, done, pending, failed, rejected) dan detail alasan jika ada fallback/error.

Contoh atribut yang ditentukan di desktop (bukan di web):

- duplex
- tray source
- dpi/quality
- scaling mode
- collate
- fallback media jika ukuran tidak tersedia

---

### 12e. Aturan Merge Konfigurasi (Disarankan)

Urutan prioritas nilai:

1. Request pelanggan (konfigurasi dasar job)
2. Policy default kios (akun mitra)
3. Profile printer pada client desktop
4. Driver default printer

Pembagian aturan:

- Hard requirement: paperSize, copies, pageRange (jika diisi), file printable.
- Soft requirement: duplex, quality, tray, scaling.

Perilaku saat tidak didukung printer:

- Untuk hard requirement yang gagal dipenuhi: job pindah ke pending atau failed dengan reason yang jelas.
- Untuk soft requirement yang gagal dipenuhi: lakukan fallback aman, lanjut print, dan catat reason fallback.

---

### 12f. Dampak untuk Multi-Client Satu Akun

Model ini mendukung satu akun dengan banyak client/printer berbeda:

- Job tetap satu antrean di level akun.
- Client yang berhasil claim job menjadi eksekutor tunggal job tersebut.
- Resolusi atribut lanjutan bisa berbeda antar client karena bergantung driver lokal, tetapi tidak menimbulkan double print karena claim lock tetap aktif.

---

### 12g. Rencana Implementasi Bertahap

1. Fase 12.1 (Server + Web dasar)
  - Tambah field konfigurasi dasar bertahap di form web.
  - Validasi field dasar di server.
  - Pastikan tetap kompatibel dengan client lama.

1. Fase 12.2 (Desktop resolver)
  - Tambah modul resolver konfigurasi berbasis printer profile/driver.
  - Terapkan fallback hard vs soft rule.
  - Kirim status dan reason secara konsisten ke server.

1. Fase 12.3 (Observability dan hardening)
  - Tambah audit detail untuk kasus fallback, pending, failed.
  - Tambah metrik sederhana: jumlah fallback, job gagal karena unsupported capability.

---

### Acceptance dan UAT Step 12

1. Input pelanggan tetap sederhana dan dapat dipahami tanpa harus memilih atribut teknis printer.
2. Job dengan konfigurasi dasar valid berhasil dibuat untuk kios yang ready.
3. Pada akun yang punya 2+ client/printer berbeda, job tetap diproses sekali (tidak double print) dan claim conflict tetap aman.
4. Jika printer target tidak mendukung requirement hard, status job berubah ke pending atau failed dengan alasan yang jelas.
5. Jika hanya atribut soft yang tidak didukung, job tetap tercetak dengan fallback aman.
6. Riwayat status job tetap konsisten dari created -> printing -> done/failed/rejected/pending.

---

### Out of Scope Step 12

- Menampilkan seluruh atribut driver printer secara dinamis di Web UI pelanggan seperti native print dialog browser.
- Menyamakan 100 persen perilaku semua jenis driver printer lintas OS.
- Orkestrasi printer lintas node (HA/distributed print scheduler).

---

### Ringkasan Keputusan Step 12

- Web UI pelanggan tetap basic-first.
- Server bertanggung jawab pada kontrak, validasi, dan orkestrasi antrean akun.
- Desktop client bertanggung jawab pada driver-aware resolution dan eksekusi print final.
- Pendekatan ini paling seimbang untuk scope TA: sederhana, realistis, dan kompatibel dengan arsitektur account-centric yang sudah berjalan.
