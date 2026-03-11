Ceritanya ini pelanggan yang mau ngeprint dokumennya di kois percetakan (aplikasi client yang terinstall pada perangkat komputer kios percetakan).

1. Pelanggan mendatangi kios percetakan
2. Membuka web ui printform di browser (http://localhost:3000)
3. Di web, Pelanggan Scan QR code pada percetakan (atau) mencari nama percetakan di dropdown. (Intinya pelanggan harus memilih toko yang direpresentasikan oleh client yang terdaftar di dropdown, untuk membuat sesi cetak; Entah bagaimana nanti pendekatan yang efektif yang akan saya tetapkan).
4. Setelah memilih toko, pelanggan membuat session print dengan toko itu sebagai pilihannya.
5. Di session print sudah ada form untuk upload file dan konfigurasi cetak.
6. Ketika sudah selesai mengisinya, pelanggan mengirimnya sebagai job.
7. Di sisi lain, komputer percetakan yang sudah terinstall aplikasi client menerima job tersebut di aplikasinya itu.
8. Operator percetakan tinggal menekan print untuk melakukan print karena file ataupun segala konfigurasinya sudah diatur pelanggan.