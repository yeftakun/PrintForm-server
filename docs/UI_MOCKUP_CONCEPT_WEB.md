# A. Konsep Mockup UI PrintForm (WEB)

## Halaman Utama (endpoint `/`) (Pelanggan)
Pelanggan yang ingin mencetak dokumennya dengan memakai layanan PrintForm akan membuka halaman ini (Untuk lebih lengkap lihat [USER_FLOW.md](FINAL_USER_FLOW.md)).
- [Metode 1 temukan toko] Untuk memudahkan apabila mitra sudah banyak akan menggunakan fitur pencarian toko/kios berdasarkan username toko/kios.
- [Metode 2 temukan toko] Selain itu terdapat "Scan QR code" (QR code akan di scan di lokasi toko/kios).
- Tombol Daftar/Login Pelanggan (akan membuka modal login/daftar).
- Tombol "Menjadi Mitra".

## Halaman Utama (endpoint `/`) (Pelanggan-SudahLogin)
- Tombol "menjadi mitra" dan tombol Daftar/Login akan hilang diganti dengan tombol Akun & Logout.

## Halaman Akun (Pelanggan)
- Menampilkan menu informasi akun pelanggan (nama, email, password) dan dapat mengubahnya.
- Menu Riwayat Cetak untuk melihat riwayat sesi cetak dan job yang berhasil di cetak.

## Halaman konfirmasi toko/kios (Pelanggan)
- Baik dari metode 1 atau 2 untuk menemukan toko, pelanggan akan diarahkan ke halaman konfirmasi yang menampilkan informasi ringkas toko yang berhasil ditemukan dari pencarian. Halaman ini memiliki tombol "Buat Sesi Cetak".

## Halaman sesi cetak (Pelanggan)
- Setelah itu pelanggan akan diarahkan ke halaman sesi cetak yang menampilkan informasi sesi, form upload dokumen, dan daftar job cetak yang sudah diupload.
- Form upload dokumen: ambil file, pengaturan cetak dasar (Full Collor/Grayscale; Jumlah salinan; Rentang halaman/halaman tertentu (1-5, 8, 11-13)), ukuran kertas (A4, F4/Folio, Letter), orientasi (portrait/landscape), Halaman per lembar/Pages per sheet, Catatan tambahan, request jenis kertas (opsi kertas yang disediakan oleh kios pada pengaturan akun mereka),  Kalkulasi harga. -- Ini masih perlu direvisi nanti.
- List printjob yang terkirim pada sesi ini.
- Tombol "Akhiri Sesi"
- Tombol "Download struk" (bukti job sudah selesai dieksekusi/yang status jobnya `terkirim`).

## Halaman Utama Mitra (Mitra-BelumLogin)
- Untuk sekarang halaman mitra yang belum login menampilkan text placeholder dulu.
- Header dengan tombol "Masuk" dan "Daftar" yang membuka modal login mitra.

## Halaman Utama Mitra (Mitra)
- Header dengan tombol "Akun" untuk pergi ke halaman akun mitra dan "Logout" yang membuka modal login mitra serta icon notifikasi yang akan membuka modal notifikasi yang belum dibaca.
- Dashboard mitra yang terdiri dari beberapa bagian pada tab sidebar.
- Tab Home: Menampilkan ringkasan informasi toko/kios, jumlah sesi cetak aktif, jumlah job cetak (selesai, batal, total terbuat), jumlah aplikasi client yang terhubung, Estimasi pendapatan (ada toogle switch antara `hari ini`, `minggu ini`, `bulan ini`), grafik pendapatan perhari selama 30 hari, grafik printjob selesai perhari selama 30 hari (ada toogle switch antara `hari ini`, `minggu ini`, `bulan ini`; selain itu juga ada toogle switch antara `jenis kertas`, `warna cetak`, `client eksekutor`).
- Tab Sesi Cetak: Menampilkan daftar sesi cetak yang sedang berlangsung dalam tabel; Di area tabel sesi cetak, terdapat tombol "Sesi Nonaktif" yang akan menampilkan modal semua sesi yang telah berakhir.
- Tab Aplikasi Client terhubung: Menampilkan daftar aplikasi client yang terhubung.
- Tab Riwayat Cetak: Menampilkan daftar riwayat tugas cetak yang sudah selesai. Terdapat seachbar untuk mencari berdasarkan nama pelanggan, nama file, sesi id, id job, dan tanggal cetak.

## Halaman Akun (Mitra)
- Terdapat beberapa bagian pada tab sidebar
- Tab Informasi Toko/Kios: Menampilkan informasi toko/kios (nama, alamat, nomor telepon, jam operasional) dan dapat mengedit data.
- Tab Pengaturan Cetak: Menampilkan pengaturan cetak yang dapat diubah (jenis kertas yang disediakan, harga per jenis kertas, harga per halaman warna, harga per halaman hitam putih, harga per halaman per jenis kertas).
- Tab Pengaturan Akun: Menampilkan informasi akun mitra (nama, username, email, password) dan dapat mengubahnya.
- Tab Langganan Mitra: Menampilkan informasi langganan mitra (jenis langganan, tanggal mulai, tanggal berakhir, status langganan) dan dapat melakukan pembaruan langganan.
- Ketika tekan pembaruan langganan akan membuka modal "Rencana Langganan" yang menampilkan pilihan rencana langganan. dan nantinya ketika memilih dan konfirmasi rencana, maka akan diteruskan ke payment gateway. [Lebih lanjut terkait langganan](pricing_plan.md)
- Tab Notifikasi: Menampilkan daftar notifikasi yang belum/sudah terbaca.

## Halaman Utama (Admin)
- Terdapat beberapa bagian pada tab sidebar
- Tab Dashboard: Menampilkan ringkasan informasi seluruh toko/kios, jumlah sesi cetak aktif, jumlah job cetak (selesai, batal, total terbuat), jumlah aplikasi client yang terhubung, grafik printjob selesai/sukses perhari selama 30 hari (ada toogle switch antara `hari ini`, `minggu ini`, `bulan ini`; selain itu juga ada toogle switch antara `jenis kertas`, `warna cetak`, `client eksekutor`), total file yang sementara disimpan di server beserta total ukurannya.
- Tab Manajemen Toko/Kios/mitra: Menampilkan daftar toko/kios yang sudah terdaftar, dengan fitur pencarian berdasarkan nama toko/kios, alamat, nomor telepon, dan username akun mitra. Terdapat tombol "Buat Toko/Kios" yang akan membuka modal untuk membuat toko/kios baru. Terdapat tombol nonaktifkan toko/kios pada setiap daftar. Terdapat tombol "Lihat Detail" yang akan membuka halaman detail toko/kios yang menampilkan informasi lengkap toko/kios, daftar sesi cetak yang sedang berlangsung, daftar aplikasi client yang terhubung, dan riwayat cetak toko/kios tersebut. Terdapat tombol "Kios Nonaktif" yang akan menampilkan modal semua toko/kios yang sudah dinonaktifkan.
- Tab Sesi & Job Cetak: Menampilkan daftar sesi cetak yang sedang berlangsung dalam tabel; Di area tabel sesi cetak, terdapat tombol "Sesi Nonaktif" yang akan menampilkan modal semua sesi yang telah berakhir. Selain itu juga terdapat tabel riwayat job cetak yang sudah selesai dengan fitur pencarian berdasarkan nama pelanggan, nama file, sesi id, id job, dan tanggal cetak.
- Tab Manajemen Aplikasi Client: Menampilkan daftar aplikasi client yang terhubung dengan fitur pencarian berdasarkan nama toko/kios, alamat, nomor telepon, dan username akun mitra. Terdapat tombol "Lihat Detail" yang akan membuka halaman detail aplikasi client yang menampilkan informasi lengkap aplikasi client tersebut, sesi cetak yang sedang berlangsung, dan riwayat cetak yang sudah selesai.
- Tab Manajemen File: Menampilkan daftar file yang sementara disimpan di server beserta informasi ukuran file, tanggal upload, dan toko/kios yang mengupload. Terdapat tombol "Hapus File" untuk menghapus file yang masih tersimpan di server.
- Tab Log Aktivitas: Menampilkan log aktivitas seluruh toko/kios, sesi cetak, job cetak, dan aplikasi client yang terhubung dengan fitur pencarian berdasarkan nama toko/kios, nama pelanggan, nama file, sesi id, id job, dan tanggal aktivitas.

## Halaman Akun (Admin)
- Tab informasi akun.
- Tab Pengaturan Akun: Menampilkan informasi akun mitra (nama, username, email, password) dan dapat mengubahnya.
- Tab: Notifikasi untuk melihat notifikasi yang belum dibaca.

## Halaman Utama (SuperAdmin)
- Sama dengan halaman utama admin, tetapi dengan akses penuh untuk melihat dan mengelola seluruh toko/kios, sesi cetak, job cetak, aplikasi client yang terhubung, file yang tersimpan di server, dan log aktivitas. Selain itu juga dapat melihat dan mengelola seluruh akun admin.
- Tab Manajemen Admin: Menampilkan daftar akun admin dengan fitur pencarian berdasarkan nama, username, dan email. Terdapat tombol "Buat Admin" yang akan membuka modal untuk membuat akun admin baru. Terdapat tombol "Lihat Detail" yang akan membuka halaman detail admin yang menampilkan informasi lengkap akun admin tersebut dan log aktivitas yang dilakukan oleh admin tersebut. Terdapat tombol "Nonaktifkan Admin" yang akan menampilkan modal semua akun admin yang sudah dinonaktifkan.
- Tab Manajemen Toko/Kios/mitra: Sama dengan halaman utama admin, tetapi dengan akses penuh untuk melihat dan mengelola seluruh toko/kios yang terdaftar. Selain itu juga dapat melihat dan mengelola akun mitra yang terkait dengan toko/kios tersebut.
- Tab Sesi & Job Cetak: Sama dengan halaman utama admin, tetapi dengan akses penuh untuk melihat dan mengelola seluruh sesi cetak yang sedang berlangsung dan seluruh job cetak yang sudah selesai.
- Tab Manajemen Aplikasi Client: Sama dengan halaman utama admin, tetapi dengan akses penuh untuk melihat dan mengelola seluruh aplikasi client yang terhubung.
- Tab Manajemen File: Sama dengan halaman utama admin, tetapi dengan akses penuh untuk melihat dan mengelola seluruh file yang sementara disimpan di server.
- Tab Log Aktivitas: Sama dengan halaman utama admin, tetapi dengan akses penuh untuk melihat seluruh log aktivitas yang terjadi di seluruh toko/kios, sesi cetak, job cetak, aplikasi client yang terhubung, dan akun admin yang ada. Selain itu juga dapat melihat log aktivitas berdasarkan akun admin tertentu.
- Tab Manajemen Admin: Menampilkan daftar akun admin dengan fitur pencarian berdasarkan nama, username, dan email. Terdapat tombol "Buat Admin" yang akan membuka modal untuk membuat akun admin baru. Terdapat tombol "Lihat Detail" yang akan membuka halaman detail admin yang menampilkan informasi lengkap akun admin tersebut dan log aktivitas yang dilakukan oleh admin tersebut. Terdapat tombol "Nonaktifkan Admin" yang akan menampilkan modal semua akun admin yang sudah dinonaktifkan.
- Tab Pricing: Menampilkan informasi rencana langganan mitra (Rencana Free Test, Rencana Pay As You Go, Rencana Monthly Subscription) dan ketentuan umum terkait langganan. [Lebih lanjut terkait langganan](pricing_plan.md). SuperAdmin dapat mengubah harga/informasi rencana langganan dan ketentuan umum terkait langganan.

## Halaman Akun (SuperAdmin)
- Tab informasi akun.
- Tab Pengaturan Akun: Menampilkan informasi akun superadmin (nama, username, email, password) dan dapat mengubahnya.
- Tab: Notifikasi untuk melihat notifikasi yang belum dibaca.