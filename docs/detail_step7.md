## Detail Step 7 (Akun dan Auth)
[Kembali](PLAN.md)

1. Implementasi local auth dulu: login `username/password` + hash password kuat (`argon2`/`bcrypt`).
2. Gunakan `access token` pendek + `refresh token` untuk Web UI dan desktop client.
3. Tambahkan binding `owner_user_id` ke client agar identitas client tidak hanya berdasarkan GUID.
4. Lindungi endpoint sensitif (`/api/clients/*`, `/api/sessions/*`, `/api/jobs/*`) dengan verifikasi token.
5. Pisahkan surface UI: halaman pelanggan print tetap di `/`, dashboard mitra auth di `/mitra/`, dan halaman pengaturan akun di `/mitra/account/`.
6. Mitra dapat mengelola data akun sendiri: update profil (`PATCH /api/auth/me`) dan update password (`PATCH /api/auth/me/password`).
7. Desktop client login via endpoint auth, simpan refresh token secara aman (Windows Credential Manager/DPAPI), refresh token otomatis saat access token expired (implementasi sisi client ada di repo desktop terpisah; endpoint server sudah siap).
8. Google login dikerjakan setelah local auth stabil, sebagai provider tambahan (bukan mengganti alur token yang sudah ada).