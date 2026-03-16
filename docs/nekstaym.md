# Yang perlu dikerjakan lain waktu

### Catatan hasil

### Tunda sementara (UAT Step 8)
Test Case Inti Step 8

TC-01 Kiosk list berbasis akun.
Langkah: buka halaman pelanggan root, lihat daftar kios.
Lulus jika: yang tampil adalah akun kios, bukan device mentah; hanya akun dengan client recognized yang muncul.

TC-02 Create session berbasis kios berhasil.
Langkah: pilih kios Akun A, buat sesi.
Lulus jika: sesi sukses dibuat, target sesi masuk konteks Akun A.

TC-03 Create session negative path.
Langkah: kirim create session tanpa kioskId.
Lulus jika: gagal dengan status 400 (kioskId wajib).
Langkah tambahan: kirim create session dengan clientId legacy saja.
Lulus jika: ditolak sesuai mode strict (status 410 legacy disabled).

TC-04 Upload job setelah session.
Langkah: upload dokumen dari sesi Akun A.
Lulus jika: data job masuk database dan owner job terkait akun sesi.

TC-05 Queue muncul di semua client akun yang sama.
Langkah: cek Job List di D1 dan D2.
Lulus jika: job yang sama terlihat di keduanya.

TC-06 Isolasi antar akun.
Langkah: setelah upload ke Akun A, cek D3 (Akun B).
Lulus jika: D3 tidak melihat job Akun A.
Langkah ulang kebalikannya untuk verifikasi dua arah.

TC-07 Claim conflict anti double print.
Langkah: D1 claim job J, lalu D2 claim atau ubah status J.
Lulus jika: D2 ditolak konflik 409, D1 tetap bisa lanjut.

TC-08 Release claim.
Langkah: client pemegang claim melakukan release, lalu client lain claim.
Lulus jika: claim berpindah normal dan status job tetap konsisten.

TC-09 Handover guard akun.
Langkah: unbind device dari Akun A lalu bind ke Akun B.
Lulus jika: job dan session lama tetap milik Akun A, tidak bocor ke Akun B.

TC-10 Guest non-regression.
Langkah: guest membuat sesi, upload, lalu cancel via session sendiri.
Lulus jika: guest hanya bisa akses job di session miliknya sendiri.

TC-11 Kompatibilitas desktop lama.
Langkah: desktop lama yang masih mengirim query clientId melakukan GET jobs dengan token auth.
Lulus jika: request tidak memblokir queue akun; queue tetap muncul untuk akun login.

TC-12 Verifikasi monitoring.
Langkah: buka dashboard monitoring.
Lulus jika: tabel Sessions menampilkan owner user; tabel Jobs menampilkan owner user, claimed by, claimed at; summary menampilkan jobs claimed.

- TC-05: Tunda
- TC-06: Tunda
- TC-07: Tunda
- TC-08: Tunda

