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

### Rencana Migrasi Bertahap Kolom Legacy `target_client_*`

Tujuan: mempertahankan model account-centric (`owner_user_id`) sebagai sumber otoritas, sambil tetap menjaga kompatibilitas desktop lama sampai fallback benar-benar dimatikan.

#### Tahap 0 - Prasyarat observability dan kompatibilitas

1. Pastikan mode strict tetap aktif: `ACCOUNT_QUEUE_ALLOW_LEGACY_CLIENT_SESSION_CREATE=false` dan `JOBS_LIST_ALLOW_LEGACY_CLIENT_FILTER=false`.
2. Pantau 7-14 hari untuk indikator: error `LEGACY_CLIENT_TARGET_DISABLED`, warning query `clientId` legacy, dan conflict claim (`JOB_ALREADY_CLAIMED`, `JOB_CLAIM_CONFLICT`).
3. Pastikan UI customer/monitoring tidak lagi bergantung pada `targetClientName`.

#### Tahap 1 - Deprecate `target_client_name` (drop lebih dulu)

1. Hentikan pemakaian field `targetClientName` pada UI customer dan monitoring.
2. Tetap biarkan server read/write `target_client_id` untuk fallback internal.
3. Jalankan migration: `ALTER TABLE jobs DROP COLUMN IF EXISTS target_client_name;`.
4. Hilangkan select/insert/update mapping `target_client_name` di repository jobs.
5. Validasi: UAT Step 8 (terutama TC-05 s.d. TC-08) tetap lulus dan monitoring jobs tetap menampilkan `owner_user_id`, `claimed_by_client_id`, `claimed_at`.

#### Tahap 2 - Sunset fallback `target_client_id` di runtime

1. Ubah guard status update claim-aware agar tidak fallback ke `job.targetClientId`; wajib `clientId` eksplisit dari actor saat claim/patch status guarded.
2. Pastikan semua desktop client sudah versi baru yang selalu kirim `clientId`.
3. Bekukan dependency handover guard yang masih merujuk `targetClientId` dan ganti ke relasi owner/claim/session yang setara.

#### Tahap 3 - Drop `target_client_id`

1. Jalankan migration: `ALTER TABLE jobs DROP COLUMN IF EXISTS target_client_id;`.
2. Bersihkan kode repository, mapper public, monitoring payload, dan audit detail yang masih menyertakan target client.
3. Lakukan UAT regresi penuh: TC-01 s.d. TC-12, pairing/unbind/rebind antar akun, serta guest flow dan monitoring summary.

#### Rollback Strategy

1. Tahap 1 rollback: tambahkan kembali `target_client_name` nullable jika diperlukan tampilan historis.
1. Tahap 2 rollback: aktifkan sementara logika fallback `targetClientId` di runtime sambil patch desktop lama.
1. Tahap 3 rollback: harus melalui forward-fix (re-introduce kolom + backfill terbatas) sehingga eksekusi drop kolom dilakukan hanya setelah freeze window dan backup tervalidasi.
