# Konsep UI Mockup - Aplikasi Desktop Client (WinForms)

Dokumen ini merangkum konsep tata letak dan interaksi antarmuka (User Interface) untuk aplikasi Desktop Client (`PrintForm`) yang berjalan di mesin komputer Mitra. Mengingat aplikasi ini dibangun menggunakan Windows Forms (.NET), pendekatan desain mengutamakan aspek fungsional, ringan, serta informatif.

## 1. Jendela Utama (Main Dashboard - `Form1`)

Jendela utama adalah pusat kendali klien. Tujuannya untuk memberikan konfirmasi visual dengan cepat kepada pengguna mengenai status koneksi, printer, dan identitas agen/klien.

```text
+-------------------------------------------------------------+
|  PrintForm Client - Dashboard                         [-][X]|
+-------------------------------------------------------------+
|                                                             |
|  [ INFORMASI KONEKSI & AKUN ]                               |
|  Server      : https://print.nekstaym.com    [Pengaturan]   |
|  ID Klien    : a1b2c... (Otomatis dibuat)                   |
|  Akun Mitra  : [ Belum Ditautkan ]           [Tautkan Akun] |
|                                                             |
|  ---------------------------------------------------------  |
|                                                             |
|  [ PENGATURAN PRINTER LOKAL ]                               |
|  Printer Aktif : [ Dropdown List Printer di PC ▼ ]          |
|                                         [Pengaturan Kertas] |
|                                                             |
|  ---------------------------------------------------------  |
|                                                             |
|  [ KONTROL ANTREAN ]                                        |
|  Terdapat 3 dokumen baru menunggu untuk dicetak.            |
|                                                             |
|  [ LIHAT ANTREAN JOB (3) ]                                  |
|                                                             |
+-------------------------------------------------------------+
| Status:🟢 Terhubung ke Server | WebSocket Active | Siap Cetak |
+-------------------------------------------------------------+
```

**Skenario & State:**
- Jika *Belum Ditautkan*: Tombol `[Tautkan Akun]` muncul. Klien menolak instruksi dari server.
- Jika *Sudah Ditautkan*: Teks berubah menjadi *Akun Mitra: user_mitra01*, dan tombol berganti rupa menjadi `[Putuskan Akun]`.

---

## 2. Jendela Tautkan Akun (`LoginForm`)

Digunakan klien untuk menautkan (Pairing) komputer ini ke akun Mitra tertentu.

```text
+----------------------------------------+
| Tautkan ke Akun Mitra           [X]|
+----------------------------------------+
|                                        |
| Masukkan kredensial akun Mitra Anda    |
| untuk menghubungkan PC ini ke          |
| antrean cetak Anda.                    |
|                                        |
| ID / Username:                         |
| [____________________________________] |
|                                        |
| Password / PIN:                        |
| [____________________________________] |
|                                        |
|                  [Batal] [ Tautkan ]   |
+----------------------------------------+
```

---

## 3. Jendela Daftar Antrean (`JobListForm`)

Menampilkan daftar tugas cetak (jobs) spesifik yang menjadi milik klien (Client ID) atau terikat pada *Account* Mitra yang diloginkan secara *Realtime* via WebSocket.

```text
+-------------------------------------------------------------------------+
| Antrean Job Cetak                                                [-][X] |
+-------------------------------------------------------------------------+
|                                                                         |
| (Otomatis terbarui ketika ada tugas baru masuk... )       [  Refresh  ] |
|                                                                         |
| +---------------------------------------------------------------------+ |
| | ID Job   | Waktu Masuk | Nama / Identitas     | Status   | Aksi     | |
| +---------------------------------------------------------------------+ |
| | #J1001   | 10:05 AM    | (Dokumen A).pdf      | Ready    | [Cetak]  | |
| |          |             |                      |          | [Tolak]  | |
| +---------------------------------------------------------------------+ |
| | #J1002   | 10:10 AM    | image01.png          | Failed   | [Coba L.]| |
| +---------------------------------------------------------------------+ |
| | #J1003   | 10:15 AM    | berkas2.pdf          | Done     | -        | |
| +---------------------------------------------------------------------+ |
|                                                                         |
|  *Dokumen dicetak ke: EPSON L3150 Series                                |
+-------------------------------------------------------------------------+
| Status: Idle                                                            |
+-------------------------------------------------------------------------+
```

**Alur Pengoperasian Daftar Antrean:**
1. **Manual Action:** Mitra mengklik `[Cetak]`, lalu sistem mengambil *(claim lock)* token ke backend (Step 8d), mengunduh dokumen ke *temporary folder*, mem-bypass ke `SumatraPDF` / `PrintDocument`, lalu menandai *Done*.
2. **Rejection:** Jika dokumen gagal dicetak atau tinta habis, mitra mengklik `[Tolak]`, status kembali menjadi *Rejected* /*Failed* sehingga kustomer mengetahuinya dari Web Guest.

---

## 4. Jendela Pengaturan Klien (`SettingsForm`)

```text
+----------------------------------------+
| Pengaturan Server               [X]|
+----------------------------------------+
|                                        |
| Ganti alamat server:                   |
| (Pastikan URL diakhiri tanpa slash)    |
|                                        |
| Base Server URL:                       |
| [https://print.nekstaym.com..........] |
|                                        |
| (Perubahan URL akan me-reset koneksi)  |
|                                        |
|                  [Batal] [ Simpan ]    |
+----------------------------------------+
```

## Ide Tambahan / Enhancement (Saran)
1. **Auto-Print Toggle (Otomatis Cetak):** Sebuah Checkbox di `Form1` seperti `[ ] Izinkan Cetak Otomatis`. Jika dicentang, setiap WebSocket memicu `job.created`, desktop akan langsung mengunduh dan mencetak dokumen tersebut tanpa perlu Mitra mengklik *Cetak* lagi. Sangat efektif untuk *kiosk/warnet* mandiri.
2. **System Tray Icon (Minimize to Tray):** Aplikasi Desktop idealnya berjalan di *background* supaya tidak mengganggu pekerjaan PC Mitra. Bisa di-*minimize* dan hanya memunculkan notifikasi balon (Toast popup) di pojok bawah kanan *"1 Dokumen baru diterima!"*.
3. **Sound Alert (Notifikasi Suara):** Mainkan instrumen/suara *beep* singkat ketika *job* baru masuk di `JobListForm`.