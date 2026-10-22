# Prototype Aplikasi Islami

Blueprint Arsitektur Enterprise - Aplikasi Web Islami (Jadwal Shalat, Qur'an, Doa, Gamifikasi Ibadah, Artikel Keislaman)

**Versi:** 1.0
**Tipe Platform:** Progressive Web App (PWA) — Desktop & Mobile

## Akun dan progres ibadah

Frontend menyediakan masuk/daftar menggunakan nama pengguna dan kata sandi. Untuk menjalankan fitur akun, siapkan MySQL, pilih database yang dipakai aplikasi, lalu jalankan file skema/migrasi dari koneksi database tersebut:

- Database baru: pilih/buat database (misalnya `islami_app` atau database `defaultdb` dari penyedia cloud), lalu jalankan `database/schema.sql`.
- Database blueprint versi lama: jalankan `database/migrations/001-user-accounts-reading-progress.sql` satu kali, lalu `database/migrations/002-user-bookmarks.sql`. Migrasi pertama menghapus kolom kata sandi lama yang mungkin menyimpan teks biasa; akun lama perlu membuat akun baru dengan nama pengguna berbeda.

Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, dan `JWT_SECRET` sesuai koneksi database. `JWT_SECRET` harus acak dan sedikitnya 32 karakter. Untuk database Aiven, aktifkan `DB_SSL=true`, unduh CA certificate dari halaman service Aiven ke `backend/certs/ca.pem`, dan gunakan `DB_SSL_CA=./certs/ca.pem`; validasi sertifikat TLS tetap aktif. Jangan commit file `.env` atau kredensial.

Jalankan backend dari folder `backend` dengan `npm run start:dev`, dan frontend dari folder `frontend` dengan `npm run dev` pada terminal terpisah. Backend hanya siap setelah koneksi database berhasil. Jika host API berbeda dari `http://localhost:3001`, set `NEXT_PUBLIC_API_URL` di environment frontend dan sesuaikan `FRONTEND_ORIGIN` backend.

Sesi memakai cookie HTTP-only yang berlaku tujuh hari. Streak login, misi harian, poin, serta posisi terakhir surah/ayat dan doa disimpan di MySQL per akun. Bookmark disimpan terpisah dari posisi terakhir, dengan kategori bawaan Al-Qur’an dan Doa serta kategori kustom. Daftar surah dan teks/terjemahan ayat penuh dimuat dari API AlQuran Cloud.
