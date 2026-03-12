Jadi terkait kapasitas saya sebagai mahasiswa yang mengerjakan proyek ini untuk skripsi (tahap seminar hasil), saya ingin agar aplikasi saya yang penting dapat berjalan dengan lancar tanpa kendala. Dan untuk estimasi traffic user sekitar 100 client (.NET) bersamaan. Nah mengingat topik saya adalah mengangkat suatu permasalahan dengan proyek ini, jadi untuk sekarang kita membuat perlahan dulu. baru nanti disempurnakan.

**Beberapa pertimbangan yang akan didiskusikan kepada dosen pembimbing:**

1. Terkait penggunaan penyimpanan untuk dokumen yang dikirim pelanggan percetakan, apakah dapat dilakukan pada direktori penyimpanan server? Atau harus menggunakan penyimpanan seperti AWS S3?

Untuk AI Agent, cukup sampai sini, jangan dibaca setelah ini.

Terdapat nenerapa yang ingin saya revisi:
1. Ketika unbind akun (dari browser), maka berhasil menghapus ikatan akun dengan client. Tapi apabila ada aplikasi client desktop yang masih login dengan akun tersebut, maka client id dan akun tersebut akan terikat kembali (memang sudah berhasil unbind sih, tapi beberapa saat kemudian dengan sendirinya bind lagi).
2a. Terkait kesiapan client desktop;
- Client desktop pertama kali dijalankan, client id belum pernah terikat dengan akun, status kesiapannya `belum login`.
- Ketika client desktop tersebut login akun, maka status kesiapannya akan `siap`.
- Tapi ketika client desktop tersebut logout akun, maka status kesiapannya tetap `siap`.
Jadi bagaimana yang ideal untuk aplikasi client, apakah:
- Belum bind akun: status `unowned`.
- Sudah bind akun dan logout: status `owned`.
- Sudah bind akun dan login: satus `ready`.
2b. Atau sebenarnya fitur login-logout di client desktop tidak diperlukan, namun menggunakan pendekatan yang sedikit mirip yaitu "bind akun" dengan tetap memasukkan identifier (username) dan password juga? Nah dengan adanya pendekatan ini maka statusnya akan:
- Belum bind akun: status `unowned`.
- Sudah bind akun: status `owned`.
3. Terdapat hal yang perlu dilengkapi pada aplikasi clientnya adalah setiap kali aplikasi dimatikan maka akan logout. Sehingga setiap kali aplikasi dijalankan perlu untuk login lagi. Namun apabila pendekatan "bind akun" akan diterapkan saya harap aplikasinya sudah tidak seperti itu.