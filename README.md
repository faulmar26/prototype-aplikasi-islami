# Prototype Aplikasi Islami

Blueprint Arsitektur Enterprise - Aplikasi Web Islami (Jadwal Shalat, Qur'an, Doa, Gamifikasi Ibadah, Artikel Keislaman)

**Versi:** 1.0
**Tipe Platform:** Progressive Web App (PWA) — Desktop & Mobile

## Akun dan progres ibadah

Frontend menyediakan masuk/daftar menggunakan nama pengguna dan kata sandi. Untuk menjalankan fitur akun, siapkan MySQL dan terapkan salah satu skema berikut:

- Database baru: jalankan `database/schema.sql`.
- Database blueprint versi lama: jalankan `database/migrations/001-user-accounts-reading-progress.sql` satu kali. Migrasi menghapus kolom kata sandi lama yang mungkin menyimpan teks biasa; akun lama perlu membuat akun baru dengan nama pengguna berbeda.

Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `DB_USER`, `DB_PASSWORD`, dan `JWT_SECRET` dengan konfigurasi sendiri. `JWT_SECRET` harus acak dan sedikitnya 32 karakter. Backend memerlukan koneksi database yang aktif saat mulai. Jalankan backend dari folder `backend` dengan `npm run start:dev`; frontend dari folder `frontend` dengan `npm run dev`. Jika host API berbeda dari `http://localhost:3001`, set `NEXT_PUBLIC_API_URL` di environment frontend dan sesuaikan `FRONTEND_ORIGIN` backend.

Sesi memakai cookie HTTP-only yang berlaku tujuh hari. Streak login, misi harian, poin, serta posisi terakhir surah/ayat dan doa disimpan di MySQL per akun. Daftar surah dan teks/terjemahan ayat penuh dimuat dari API AlQuran Cloud.
