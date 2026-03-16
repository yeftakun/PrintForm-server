## Detail Step 8 (Kios Berbasis Akun / Account-Centric Queue)

- **8a. Data model ownership**
  - Tambah ownership akun pada `sessions` dan `jobs` (mis. `owner_user_id`), lalu backfill dari relasi `clients.owner_user_id` saat migrasi.
  - Pastikan query akses job/session berbasis `owner_user_id`, bukan hanya `target_client_id`.
  - Status implementasi server: **Selesai**.

- **8b. API daftar kios untuk pelanggan (`/`)**
  - Root page pelanggan tidak lagi menampilkan daftar client device mentah.
  - Sediakan daftar kios berbasis akun (mis. `display_name akun`), dengan syarat akun tersebut punya minimal 1 client terdaftar.
  - Status implementasi server/web root: **Selesai**.

- **8c. Session creation berbasis akun**
  - Endpoint create session menerima identitas kios/akun (bukan `clientId` langsung).
  - Server memilih/menilai client aktif milik akun tersebut untuk eksekusi, tanpa mengubah fakta bahwa owner session adalah akun.
  - Status implementasi server: **Selesai** (mode strict default mewajibkan `kioskId`; fallback `clientId` dapat diaktifkan sementara via env).

- **8d. Queue sinkron lintas client dalam akun**
  - Semua client yang login pada akun yang sama melihat antrean job akun yang sama.
  - Tambahkan mekanisme claim/lock job agar tidak terjadi double print saat beberapa client akun aktif bersamaan.
  - Status implementasi server: **Selesai** (claim-aware status update + endpoint claim/release eksplisit).

- **8e. Guard handover antar akun**
  - Unpair/re-pair device tidak boleh mewariskan antrean akun lama ke akun baru.
  - Job/session akun lama tetap dimiliki akun lama walau device fisik dipindah akun.
  - Status implementasi server: **Selesai** (handover guard saat pair/bind/unbind).

- **8f. Penyesuaian desktop & web**
  - Desktop tidak lagi fetch list job murni berdasar `clientId`; query harus terikat akun login + mekanisme claim.
  - Web pelanggan (`/`) memilih kios berbasis akun, bukan device client.
  - Status implementasi server + web pelanggan: **Selesai**.

- **8g. Rollout aman**
  - Lakukan migration + compatibility layer (sementara) agar transisi dari model client-centric ke account-centric tidak memutus flow yang sedang berjalan.
  - Status implementasi server: **Selesai** (mode strict default; fallback legacy dikontrol via env untuk rollback terbatas).

### Snapshot Progress Step 8 (Server)

- Migration aktif: `20260314_step8a_account_queue_ownership.sql`, `20260314_step8d_job_claim_lock.sql`.
- Endpoint baru/transisi:
  - `GET /api/clients/kiosks`
  - `POST /api/sessions` berbasis `kioskId` (strict default)
  - `POST /api/jobs/:id/claim`, `POST /api/jobs/:id/release`
- Guard transisi:
  - ownership guard berbasis `owner_user_id`
  - claim conflict guard multi-client akun sama
  - handover guard saat pair/bind/unbind
  - legacy fallback dikontrol env (`ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE`, `JOBS_LIST_ALLOW_LEGACY_CLIENT_FILTER`)

### Acceptance & UAT Step 8e/8f/8g

1. **Handover isolation (8e)**
  Setup: akun A punya device D + job aktif; lalu D di-unbind dan di-bind ke akun B.
  Ekspektasi: job/session lama tetap milik akun A; akun B tidak melihat job akun A; claim lock lama yang terkait D tidak memblokir queue akun A.

1. **Multi-client claim conflict (8d + 8f)**
  Setup: akun A login pada client D1 dan D2, keduanya melihat queue akun A.
  Aksi: D1 claim job J, lalu D2 mencoba claim J atau update status print untuk J.
  Ekspektasi: D2 menerima `409` conflict claim, sedangkan D1 tetap bisa lanjut status print J.

1. **Account-scope queue fetch (8f)**
  Setup: akun A dan akun B masing-masing memiliki job.
  Aksi: login sebagai akun A lalu panggil `GET /api/jobs`, kemudian login sebagai akun B dan panggil endpoint yang sama.
  Ekspektasi: masing-masing hanya melihat queue milik akunnya.

1. **Compatibility behavior (8g)**
  Aksi: flow baru create session pakai `kioskId`; flow lama create session pakai `clientId` hanya jika fallback env diaktifkan.
  Ekspektasi: mode strict default menolak flow lama dengan kode kompatibilitas yang jelas; jika fallback env diaktifkan sementara, flow lama tetap bekerja selama fase transisi; respons session menyertakan metadata transisi (`targetSource`, `compatibility.legacyClientTarget`) untuk monitoring cutover.

1. **Guest flow non-regression**
  Aksi: pelanggan guest upload + cancel via `sessionId`.
  Ekspektasi: guest tetap terbatas pada session miliknya dan tidak bisa akses detail/download job lintas akun.

### Rollout Order (Server)

1. Jalankan migration 8a lalu 8d pada semua environment.
2. Verifikasi endpoint baru (`/api/clients/kiosks`, claim/release) lewat smoke test.
3. Aktifkan mode strict default (tanpa fallback legacy).
4. Pantau conflict claim + audit log handover minimal 3-7 hari.
5. Jika rollback darurat diperlukan, aktifkan fallback env secara sementara lalu nonaktifkan kembali setelah insiden selesai.