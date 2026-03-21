# Setup Postman untuk UAT Step 8 (TC-07 dan TC-08)

Dokumen ini fokus pada pengujian claim lock agar tidak bergantung pada tombol UI realtime.

## 1. Environment Variables

Buat Postman Environment, lalu isi variabel berikut:

- `baseUrl` = `http://localhost:3000`
- `tokenA` = access token akun A
- `tokenB` = access token akun B (opsional untuk cross-check)
- `d1ClientId` = clientId desktop D1
- `d2ClientId` = clientId desktop D2
- `jobId` = id job untuk TC-07
- `jobIdRelease` = id job untuk TC-08 (disarankan job terpisah)

Header auth untuk request akun A:

- `Authorization: Bearer {{tokenA}}`
- `Content-Type: application/json`

## 2. Persiapan Data

1. Pastikan Akun A punya D1 dan D2 yang aktif.
2. Buat session Akun A (`POST /api/sessions` dengan `kioskId`).
3. Upload minimal 2 job status `ready`.
4. Simpan job pertama ke `jobId`, job kedua ke `jobIdRelease`.

## 3. TC-07 Claim Conflict Anti Double Print

### 3.1 D1 Claim Job

- Method: `POST`
- URL: `{{baseUrl}}/api/jobs/{{jobId}}/claim`
- Body:

```json
{
	"clientId": "{{d1ClientId}}"
}
```

Ekspektasi:

- HTTP `200`
- `ok: true`
- `alreadyClaimed: false`
- `job.claimedByClientId` = `d1ClientId`

### 3.2 D2 Claim Job Yang Sama

- Method: `POST`
- URL: `{{baseUrl}}/api/jobs/{{jobId}}/claim`
- Body:

```json
{
	"clientId": "{{d2ClientId}}"
}
```

Ekspektasi:

- HTTP `409`
- `code: "JOB_ALREADY_CLAIMED"`
- `claimedByClientId` tetap `d1ClientId`

### 3.3 D2 Coba Ubah Status Job Yang Sama

- Method: `PATCH`
- URL: `{{baseUrl}}/api/jobs/{{jobId}}`
- Body:

```json
{
	"status": "printing",
	"clientId": "{{d2ClientId}}"
}
```

Ekspektasi:

- HTTP `409`
- `code: "JOB_CLAIM_CONFLICT"` atau conflict claim setara

### 3.4 D1 Tetap Bisa Lanjut

- Method: `PATCH`
- URL: `{{baseUrl}}/api/jobs/{{jobId}}`
- Body:

```json
{
	"status": "printing",
	"clientId": "{{d1ClientId}}"
}
```

Ekspektasi:

- HTTP `200`
- Status job ter-update sesuai request D1

## 4. TC-08 Release Claim

### 4.1 D1 Claim Job Release

- Method: `POST`
- URL: `{{baseUrl}}/api/jobs/{{jobIdRelease}}/claim`
- Body:

```json
{
	"clientId": "{{d1ClientId}}"
}
```

Ekspektasi: HTTP `200`.

### 4.2 D1 Release Claim

- Method: `POST`
- URL: `{{baseUrl}}/api/jobs/{{jobIdRelease}}/release`
- Body:

```json
{
	"clientId": "{{d1ClientId}}"
}
```

Ekspektasi:

- HTTP `200`
- `alreadyReleased: false`
- `job.claimedByClientId` = `null`

### 4.3 D2 Claim Setelah Release

- Method: `POST`
- URL: `{{baseUrl}}/api/jobs/{{jobIdRelease}}/claim`
- Body:

```json
{
	"clientId": "{{d2ClientId}}"
}
```

Ekspektasi:

- HTTP `200`
- `job.claimedByClientId` = `d2ClientId`

### 4.4 Negative Check Release Oleh Non-Pemegang Claim

Skenario:

1. D1 claim job.
2. D2 langsung release job yang sama.

Ekspektasi:

- HTTP `409`
- `code: "JOB_CLAIM_CONFLICT"`

## 5. Template Evidence

Untuk setiap request, simpan:

- Timestamp
- Endpoint
- Actor (Akun/Client)
- HTTP status
- Response body ringkas (`code`, `claimedByClientId`, `status`)

Checklist lulus:

- TC-07: D2 tidak bisa ambil lock saat D1 memegang claim.
- TC-08: lock bisa dilepas pemegang claim dan diambil client lain setelah release.
