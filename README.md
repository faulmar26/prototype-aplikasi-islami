# Arah — Aplikasi Islami

Arah adalah prototipe aplikasi web Islami untuk membantu pengguna melihat jadwal salat, membaca Al-Qur’an, menemukan doa harian, dan menyimpan progres ibadah. Antarmuka responsif dibuat dengan Next.js; fitur akun dan progres didukung API NestJS serta MySQL.

**Deploy:** [prototype-aplikasi-islami.vercel.app](https://prototype-aplikasi-islami.vercel.app/)

> Situs deploy menyajikan frontend. Fitur akun, progres, dan bookmark memerlukan backend API yang dapat dijangkau serta database MySQL yang telah dikonfigurasi. Lihat [Konfigurasi deployment](#konfigurasi-deployment).

## Fitur

- **Beranda dashboard** dengan sapaan akun, jadwal salat ringkas, hitung mundur waktu salat berikutnya, pengingat harian, dan ringkasan progres.
- **Jadwal salat** berdasarkan lokasi perangkat atau kota, beserta pilihan waktu salat berikutnya.
- **Al-Qur’an** dengan katalog 114 surah, pencarian, halaman baca per surah, ayat Arab, transliterasi, terjemahan, dan navigasi ayat.
- **Doa harian** dengan 24 doa, pencarian, kategori, serta halaman detail berisi teks Arab, transliterasi, terjemahan, dan keterangan sumber.
- **Akun pengguna** dengan registrasi dan login memakai nama pengguna serta kata sandi. Kata sandi disimpan sebagai hash; sesi menggunakan cookie HTTP-only.
- **Progres ibadah per akun:** streak login, misi harian, poin, dan bacaan terakhir Al-Qur’an/doa.
- **Bookmark pribadi** untuk ayat dan doa. Koleksi memiliki kategori Al-Qur’an dan Doa, serta kategori kustom yang dapat dibuat pengguna.
- **Tema terang dan gelap**, preferensi tema tersimpan di browser, efek glow kursor sederhana pada tema gelap, dan transisi antartema.
- **Antarmuka responsif** dengan header acrylic, animasi ringan, dan dukungan preferensi reduced motion.

## Tampilan

Screenshot berikut memperlihatkan contoh halaman pada tema terang dan gelap. Nilai akun pada screenshot login telah disamarkan.

### Tema terang

| Jadwal salat | Katalog Al-Qur’an |
|---|---|
| ![Jadwal salat — tema terang](docs/screenshots/jadwal-salat-terang.png) | ![Katalog surah — tema terang](docs/screenshots/katalog-quran-terang.png) |

| Doa harian | Halaman masuk |
|---|---|
| ![Katalog doa — tema terang](docs/screenshots/katalog-doa-terang.png) | ![Halaman masuk — tema terang, nilai akun disamarkan](docs/screenshots/masuk-terang.png) |

### Tema gelap

| Beranda | Pembaca Al-Qur’an |
|---|---|
| ![Dashboard — tema gelap](docs/screenshots/beranda-gelap.png) | ![Pembaca Al-Qur’an — tema gelap](docs/screenshots/pembaca-quran-gelap.png) |

| Detail doa | Halaman masuk |
|---|---|
| ![Detail doa — tema gelap](docs/screenshots/detail-doa-gelap.png) | ![Halaman masuk — tema gelap, nilai akun disamarkan](docs/screenshots/masuk-gelap.png) |

Gunakan tombol tema di header untuk berpindah antara **Terang** dan **Gelap**. Pilihan disimpan pada browser yang digunakan. Tema gelap menyesuaikan latar, kartu, navigasi, dan teks agar nyaman dibaca; efek glow kursor hanya aktif pada perangkat dengan pointer yang sesuai dan tidak aktif jika reduced motion dipilih.

## Teknologi

- **Frontend:** Next.js, React, TypeScript, CSS.
- **Backend:** NestJS, TypeScript, JWT, `class-validator`.
- **Database:** MySQL-compatible.
- **Data eksternal:** AlQuran Cloud API untuk katalog dan bacaan Al-Qur’an; Aladhan API untuk jadwal salat.
- **Hosting frontend:** Vercel.

## Menjalankan secara lokal

### Persyaratan

- Node.js **20.19 atau lebih baru** dan npm.
- MySQL 8 atau layanan MySQL-compatible yang bisa dijangkau backend.
- Sertifikat CA database apabila provider mewajibkan TLS, misalnya Aiven.

### 1. Siapkan database

Pilih database untuk aplikasi, misalnya `islami_app` pada MySQL lokal atau database `defaultdb` yang disediakan layanan cloud. Jalankan [`database/schema.sql`](database/schema.sql) **pada database yang sudah dipilih** untuk instalasi baru. File tersebut tidak memilih nama database secara otomatis.

Untuk instalasi lama yang masih memakai skema blueprint, jalankan migrasi berikut satu kali dan berurutan:

1. [`database/migrations/001-user-accounts-reading-progress.sql`](database/migrations/001-user-accounts-reading-progress.sql)
2. [`database/migrations/002-user-bookmarks.sql`](database/migrations/002-user-bookmarks.sql)

Migrasi pertama menghapus kolom kata sandi lama yang mungkin menyimpan teks biasa. Akun lama perlu mendaftar kembali dengan nama pengguna baru.

### 2. Konfigurasikan backend

Salin `backend/.env.example` ke `backend/.env`, lalu isi sesuai database yang dipakai. Contoh PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Isi variabel berikut tanpa menyimpan rahasia ke Git:

```dotenv
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=islami_app
DB_PASSWORD=<kata-sandi-database>
DB_NAME=islami_app
DB_SSL=false
DB_SSL_CA=./certs/ca.pem
JWT_SECRET=<rahasia-acak-minimal-32-karakter>
```

Untuk database Aiven atau layanan lain yang memerlukan TLS:

- Atur `DB_SSL=true`.
- Unduh CA certificate dari penyedia database dan simpan sebagai `backend/certs/ca.pem`.
- Pastikan `DB_SSL_CA=./certs/ca.pem`. Backend memvalidasi sertifikat; jangan mematikan verifikasi TLS.
- Isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` menggunakan kredensial privat database.

`backend/.env` dan `backend/certs/ca.pem` diabaikan Git. Jangan membagikan atau melakukan commit kata sandi, JWT secret, atau sertifikat privat.

### 3. Instal dependensi dan jalankan

Buka dua terminal dari direktori repository.

Terminal pertama — backend:

```powershell
cd backend
npm ci
npm run start:dev
```

Terminal kedua — frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Backend berjalan pada `http://localhost:3001` dan harus berhasil terhubung ke database sebelum API akun siap.

Jika alamat API bukan `http://localhost:3001`, atur `NEXT_PUBLIC_API_URL` pada environment frontend, contohnya `http://localhost:3001`, lalu jalankan ulang frontend. Nilai variabel `NEXT_PUBLIC_*` dibundel saat frontend dibangun.

## Konfigurasi deployment

Frontend tersedia di [https://prototype-aplikasi-islami.vercel.app/](https://prototype-aplikasi-islami.vercel.app/).

Untuk mengaktifkan login/registrasi dan penyimpanan progres pada deployment:

1. Deploy backend NestJS ke layanan yang dapat diakses melalui HTTPS.
2. Siapkan database MySQL dan jalankan skema atau migrasi yang sesuai.
3. Atur environment backend (`DB_*`, `DB_SSL`, `DB_SSL_CA`, `JWT_SECRET`, dan `FRONTEND_ORIGIN`) pada hosting backend. Gunakan `FRONTEND_ORIGIN=https://prototype-aplikasi-islami.vercel.app`.
4. Atur `NEXT_PUBLIC_API_URL` pada Vercel ke origin backend, tanpa akhiran `/api`, lalu deploy ulang frontend.
5. Pastikan koneksi jaringan database mengizinkan backend dan sertifikat TLS provider terpasang dengan benar.

Tautan frontend saja tidak mengaktifkan layanan akun apabila backend atau database belum dideploy dan dikonfigurasi.

## Pemeriksaan

Jalankan perintah dari folder masing-masing.

Frontend:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Backend:

```powershell
npm run typecheck
npm run build
```

## Catatan data

Teks dan terjemahan ayat dimuat dari AlQuran Cloud; jadwal salat dihitung menggunakan Aladhan. Doa harian merupakan data lokal di `frontend/src/data/dailyDuas.ts`; periksa keterangan sumber pada tiap doa. Ketersediaan layanan eksternal memerlukan koneksi internet.
