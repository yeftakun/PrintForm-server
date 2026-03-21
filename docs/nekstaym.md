# Yang perlu dikerjakan lain waktu

## Catatan hasil

## Tunda sementara (UAT Step 8)

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
**Status: Lulus**

TC-06 Isolasi antar akun.
Langkah: setelah upload ke Akun A, cek D3 (Akun B).
Lulus jika: D3 tidak melihat job Akun A.
Langkah ulang kebalikannya untuk verifikasi dua arah.
**Status: Lulus**

TC-07 Claim conflict anti double print.
Tujuan: memastikan lock claim mencegah double print pada akun yang memiliki multi-client aktif.

Prasyarat:

- Akun A memiliki 2 client aktif: D1 dan D2.
- Tersedia job J berstatus `ready` milik Akun A.

Langkah uji (disarankan via Postman/API agar tidak terhalang tombol UI):

1. D1 claim job J:
   - `POST /api/jobs/:id/claim`
   - body: `{ "clientId": "<D1_ID>" }`
2. D2 mencoba claim job J yang sama:
   - `POST /api/jobs/:id/claim`
   - body: `{ "clientId": "<D2_ID>" }`
3. D2 mencoba ubah status job J (misalnya `printing`):
   - `PATCH /api/jobs/:id`
   - body: `{ "status": "printing", "clientId": "<D2_ID>" }`
4. D1 lanjutkan update status job J (misalnya `printing` atau `done`).

Lulus jika:

- Langkah 2 ditolak `409` dengan code conflict claim.
- Langkah 3 ditolak `409` (conflict claim).
- Langkah 4 tetap berhasil untuk D1.

Catatan:

- Jika setelah D1 claim nilai `claimedBy` tetap D1 saat D2 mencoba claim, itu perilaku yang benar (bukan bug).

Status: Tunda (perlu verifikasi API terstruktur).

TC-08 Release claim.
Tujuan: memastikan claim bisa dilepas oleh pemegang lock dan diambil client lain secara aman.

Prasyarat:

- Akun A memiliki D1 dan D2 aktif.
- Tersedia job J2 berstatus `ready`.

Langkah uji:

1. D1 claim J2.
2. D1 release J2:
   - `POST /api/jobs/:id/release`
   - body: `{ "clientId": "<D1_ID>" }`
3. Verifikasi `claimedBy` menjadi `null`.
4. D2 claim J2.
5. (Negative check) Ulangi skenario dengan D2 mencoba release saat claim masih dipegang D1; harus ditolak conflict.

Lulus jika:

- Release oleh pemegang claim berhasil.
- Setelah release, client lain bisa claim job yang sama.
- Status job tetap konsisten (tidak lompat status secara tidak valid).

Status: Tunda (perlu verifikasi API terstruktur).

Penjelasan id_kendala_001: Ketika akun A terhubung dengan D1 dan D2, di halaman utama bagian opsi/pilihan kios, yang client/Desktop yang ditampilkan berubah-ubah/bergantian. (Misalnya D1 > D2 > D1 > D2). Nah apabila kebetulan yang ditampilkan D1 dan kemudian membuat sesi, maka nanti kolom Client pada tabel Jobs adalah D1. Lalu ketika mencoba claim job, misalnya yang pertama adalah D1 yang claim, memang isi dari kolom `Claimed By` pada tabel jobs berisi id dari D1. tapi ketika D2 mencoba claim job yang sama, maka isi dari kolom `Claimed By` pada tabel jobs tetap adalah id dari D1 (bukan id dari D2).

Tindak lanjut id_kendala_001:

- Perlu perbaikan UX agar user tidak bingung saat target client akun berganti dinamis (D1/D2) pada daftar kios.
- Perlu catatan edukasi di UI/UAT bahwa kolom `Client` (target saat session dibuat) berbeda dengan `Claimed By` (pemegang lock saat ini).
- Nilai `Claimed By` yang tetap D1 ketika D2 ditolak claim adalah expected behavior.

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

- TC-05: Lulus
- TC-06: Lulus
- TC-07: Tunda
- TC-08: Tunda

