# PrintOrder Server

PrintOrder Server adalah layanan backend untuk sistem PrintOrder, yaitu platform layanan cetak dokumen yang membantu pelanggan mengirim tugas cetak ke percetakan secara mandiri melalui halaman web.

Server ini menangani proses utama seperti autentikasi akun, pengelolaan toko mitra, pembuatan sesi cetak, pengunggahan dokumen, antrean tugas cetak, status client desktop, billing, kredit layanan, serta dashboard admin.

## Tentang PrintOrder

PrintOrder dirancang untuk membantu proses cetak dokumen menjadi lebih terstruktur dan privat. Pelanggan dapat mengunggah dokumen, mengatur spesifikasi cetak, lalu mengirim tugas cetak ke percetakan tanpa harus mengirim file melalui WhatsApp, flashdisk, atau media lain.

Bagi mitra percetakan, PrintOrder menyediakan portal pengelolaan toko dan aplikasi klien desktop untuk menerima serta memproses tugas cetak pelanggan.

## Komponen Sistem

Secara umum, sistem PrintOrder terdiri dari beberapa komponen berikut:

| Komponen               | Keterangan                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Server                 | Mengelola API, autentikasi, data toko, sesi cetak, job cetak, billing, kredit, dan komunikasi realtime                    |
| Portal Mitra           | Digunakan mitra percetakan untuk mengelola akun, toko, layanan, billing, client desktop, dan daftar tugas cetak           |
| Portal Admin           | Digunakan admin untuk memantau toko, pembayaran, job, audit log, dan installer client                                     |
| Halaman Pelanggan      | Digunakan pelanggan untuk membuka toko percetakan, membuat sesi cetak, mengunggah dokumen, dan mengatur spesifikasi cetak |
| Aplikasi Klien Desktop | Digunakan oleh pihak percetakan untuk menerima dan memproses tugas cetak dari pelanggan                                   |

## Fitur Utama

### Untuk Pelanggan

* Membuka halaman toko melalui kode toko atau QR code.
* Membuat sesi cetak pada toko tujuan.
* Mengunggah dokumen.
* Mengatur spesifikasi cetak, seperti ukuran kertas, mode warna, jumlah salinan, rentang halaman, skala, dan catatan.
* Mengirim tugas cetak ke percetakan.
* Melihat status tugas cetak.
* Mengakhiri sesi cetak setelah selesai.

### Untuk Mitra Percetakan

* Membuat dan mengelola akun mitra.
* Mengatur profil toko, kode toko, kontak, alamat, dan waktu operasional.
* Mengatur layanan cetak yang tersedia.
* Menghubungkan aplikasi klien desktop ke akun mitra.
* Melihat daftar client desktop yang terhubung.
* Menerima dan memproses tugas cetak pelanggan.
* Mengelola billing, paket layanan, order, bukti pembayaran, dan kredit akun.

### Untuk Admin

* Melihat ringkasan kondisi sistem.
* Memantau data toko mitra.
* Melihat status client desktop.
* Memantau daftar tugas cetak.
* Mengelola order dan verifikasi pembayaran.
* Mengelola plan, kupon, installer, serta audit log.
* Melakukan suspend atau unsuspend toko apabila diperlukan.

## Alur Umum Sistem

1. Mitra membuat akun dan mengatur informasi toko.
2. Mitra menginstal aplikasi klien desktop PrintOrder.
3. Aplikasi klien desktop dihubungkan ke akun mitra.
4. Pelanggan membuka halaman toko melalui QR code, kode toko, atau tautan toko.
5. Pelanggan membuat sesi cetak.
6. Pelanggan mengunggah dokumen dan mengatur spesifikasi cetak.
7. Tugas cetak dikirim ke server.
8. Aplikasi klien desktop menerima tugas cetak.
9. Pihak percetakan memproses tugas cetak.
10. Status tugas cetak diperbarui.
11. Setelah sesi selesai, dokumen yang terkait dengan sesi dapat dibersihkan dari server.

## Peran Pengguna

| Peran     | Keterangan                                                                 |
| --------- | -------------------------------------------------------------------------- |
| Pelanggan | Pengguna yang mengunggah dokumen dan membuat tugas cetak                   |
| Mitra     | Pemilik atau pengelola percetakan yang menerima dan memproses tugas cetak  |
| Admin     | Pengelola sistem yang memantau toko, pembayaran, job, dan data operasional |

## Keamanan dan Privasi

PrintOrder dirancang dengan memperhatikan keamanan dasar dan privasi dokumen pelanggan. Beberapa mekanisme yang diterapkan antara lain:

* Autentikasi akun menggunakan access token dan refresh token.
* Password dan PIN disimpan dalam bentuk hash.
* Verifikasi manusia pada proses register dan lupa password.
* Pembatasan akses berdasarkan akun dan peran pengguna.
* Pembatasan tipe dan ukuran file yang dapat diunggah.
* Pengelolaan status sesi dan status tugas cetak.
* Pembersihan dokumen setelah sesi selesai atau sesuai konfigurasi sistem.
* Audit log untuk mencatat aktivitas penting pada sistem.

## Dokumentasi Internal

Dokumentasi teknis tambahan disimpan pada direktori `docs/`.

Contoh dokumentasi internal:

| Dokumen                | Keterangan                           |
| ---------------------- | ------------------------------------ |
| `docs/API_INTERNAL.md` | Ringkasan endpoint API internal      |
| `docs/`                | Dokumentasi teknis pendukung lainnya |

Dokumentasi API yang tersedia bersifat internal dan tidak dimaksudkan sebagai dokumentasi API publik.

## Status Proyek

Proyek ini dikembangkan sebagai bagian dari tugas akhir/skripsi dengan fokus pada perancangan dan pembangunan platform cetak dokumen pada layanan percetakan.

## Catatan Hak Akses

[LICENCE](LICENCE)

## Ringkasan

PrintOrder Server berperan sebagai pusat layanan yang menghubungkan pelanggan, mitra percetakan, aplikasi klien desktop, dan admin sistem. Dengan sistem ini, proses pengiriman dokumen, pengaturan spesifikasi cetak, penerimaan tugas cetak, serta pengelolaan layanan percetakan dapat dilakukan secara lebih terstruktur.