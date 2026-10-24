# Arah — Aplikasi Islami

Arah adalah prototipe aplikasi web Islami untuk membantu pengguna melihat jadwal salat, membaca Al-Qur’an, menemukan doa harian, dan menyimpan progres ibadah. Antarmuka responsif dibuat dengan Next.js; fitur akun dan progres didukung API NestJS serta MySQL.

**Situs:** [prototype-aplikasi-islami.vercel.app](https://prototype-aplikasi-islami.vercel.app/) · **API:** [arah-backend-rho.vercel.app/api](https://arah-backend-rho.vercel.app/api)

> Frontend mem-proxy seluruh permintaan `/api/*` ke backend, jadi cookie sesi tetap first-party dan tidak perlu konfigurasi CORS di browser. Panduan lengkap ada di [Konfigurasi deployment](#konfigurasi-deployment).

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

- **Frontend:** Next.js (Pages Router), React, TypeScript, CSS.
- **Backend:** NestJS, TypeScript, JWT, `class-validator`, `mysql2`.
- **Database:** MySQL-compatible, termasuk Aiven MySQL.
- **Data eksternal:** AlQuran Cloud API untuk katalog dan bacaan Al-Qur’an; Aladhan API untuk jadwal salat.
- **Hosting:** frontend dan backend di Vercel, database MySQL di Aiven.

## Struktur repository

```text
.
├── backend/                  # API NestJS
│   ├── src/                  # controller, service, DTO, guard
│   ├── vercel.json           # region function Vercel (bom1)
│   └── .env.example          # contoh konfigurasi backend
├── frontend/                 # Next.js
│   ├── pages/                # halaman: beranda, quran, doa, prayer, bookmarks, login
│   ├── src/                  # komponen, data lokal, helper API & tema
│   └── .env.example          # contoh konfigurasi frontend
├── database/
│   ├── schema.sql            # skema lengkap + seed misi harian
│   └── migrations/           # migrasi untuk skema lama
└── docs/                     # blueprint arsitektur & screenshot
```

## Menjalankan secara lokal

### Persyaratan

- Node.js **20.19 atau lebih baru** dan npm.
- MySQL 8 atau layanan MySQL-compatible yang bisa dijangkau backend.
- Sertifikat CA database apabila provider mewajibkan TLS, misalnya Aiven.

### 1. Siapkan database

Pilih database untuk aplikasi, misalnya `islami_app` pada MySQL lokal atau database `defaultdb` yang disediakan layanan cloud. Jalankan [`database/schema.sql`](database/schema.sql) **pada database yang sudah dipilih** untuk instalasi baru. File tersebut tidak memilih nama database secara otomatis.

```powershell
mysql --host=127.0.0.1 --port=3306 --user=root --password islami_app < database/schema.sql
```

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
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=islami_app
DB_PASSWORD=<kata-sandi-database>
DB_NAME=islami_app
DB_SSL=false
DB_SSL_CA=./certs/ca.pem
DB_CONNECTION_LIMIT=10
JWT_SECRET=<rahasia-acak-minimal-32-karakter>
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
```

Untuk database Aiven atau layanan lain yang memerlukan TLS:

- Atur `DB_SSL=true`.
- Unduh CA certificate dari penyedia database. `DB_SSL_CA` menerima path file, isi PEM, atau `base64:<isi-base64>`.
- Contoh lokal: simpan sebagai `backend/certs/ca.pem` dan atur `DB_SSL_CA=./certs/ca.pem`.
- Contoh hosting: atur `DB_SSL_CA=base64:<hasil base64 ca.pem>` agar tidak perlu mengunggah file.
- Backend memvalidasi sertifikat; jangan mematikan verifikasi TLS.
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

Frontend mem-proxy `/api` ke backend melalui `BACKEND_URL` (default `http://127.0.0.1:3001`), sehingga tidak perlu mengatur `NEXT_PUBLIC_API_URL` untuk pengembangan lokal. Jika alamat backend berbeda, salin `frontend/.env.example` ke `frontend/.env.local`, atur `BACKEND_URL`, lalu jalankan ulang frontend.

## Variabel environment

### Backend

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `PORT` | tidak | `3001` | Diisi otomatis oleh Vercel/Railway. |
| `NODE_ENV` | tidak | `development` | `production` mengaktifkan cookie `Secure`. |
| `FRONTEND_ORIGIN` | tidak | — | Origin frontend yang diizinkan, pisahkan koma bila lebih dari satu. |
| `DB_HOST` | ya | `127.0.0.1` | Host MySQL. |
| `DB_PORT` | tidak | `3306` | Port MySQL. |
| `DB_USER` | ya | — | User database. |
| `DB_PASSWORD` | ya | — | Kata sandi database. |
| `DB_NAME` | tidak | `islami_app` | Nama database. |
| `DB_SSL` | tidak | `false` | `true` untuk Aiven/TLS. |
| `DB_SSL_CA` | bila TLS | — | Path file, isi PEM, atau `base64:<...>`. |
| `DB_CONNECTION_LIMIT` | tidak | `10` | Batas pool koneksi; di serverless gunakan `3`. |
| `JWT_SECRET` | ya | — | Minimal 32 karakter. Rotasi akan membatalkan semua sesi. |
| `COOKIE_SAMESITE` | tidak | `lax` | `none` hanya bila frontend memanggil backend lintas domain. |
| `COOKIE_SECURE` | tidak | `false` | Set `true` di produksi (HTTPS). |

### Frontend

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `BACKEND_URL` | tidak | `http://127.0.0.1:3001` | Target rewrite `/api/*`, tanpa akhiran `/api`. Dibaca saat build. |
| `NEXT_PUBLIC_API_URL` | tidak | — | Biarkan kosong agar memakai proxy `/api`. |

## Referensi API

Semua endpoint berada di bawah prefix `/api`. Endpoint bertanda 🔒 memerlukan cookie sesi hasil login.

| Method | Path | Body / keterangan |
|---|---|---|
| `GET` | `/api` | Health check, mengembalikan teks `Backend Aplikasi Islami berjalan`. |
| `POST` | `/api/auth/register` | `{ username, password, name? }` — username 3–32 karakter (`a-z`, `A-Z`, `0-9`, `.`, `_`, `-`), password 8–72 karakter. |
| `POST` | `/api/auth/login` | `{ username, password }` — memasang cookie sesi HTTP-only. |
| `GET` | `/api/auth/me` 🔒 | Data akun yang sedang masuk. |
| `POST` | `/api/auth/check-in` 🔒 | Mencatat streak login harian. |
| `POST` | `/api/auth/logout` 🔒 | Menghapus cookie sesi. |
| `GET` | `/api/profile` 🔒 | Ringkasan streak, misi, poin, dan bacaan terakhir. |
| `POST` | `/api/profile/quran` 🔒 | `{ surahNumber, surahName, ayahNumber, completed? }`. |
| `POST` | `/api/profile/dua` 🔒 | `{ duaId, duaTitle }`. |
| `GET` | `/api/profile/bookmarks` 🔒 | Daftar kategori dan bookmark pengguna. |
| `POST` | `/api/profile/bookmark-categories` 🔒 | `{ name, type: "custom" }`. |
| `DELETE` | `/api/profile/bookmark-categories/:id` 🔒 | Menghapus kategori kustom. |
| `POST` | `/api/profile/bookmarks` 🔒 | `{ categoryId, contentType: "quran" \| "dua", surahNumber?, ayahNumber?, surahName?, duaId?, duaTitle? }`. |
| `DELETE` | `/api/profile/bookmarks/:id` 🔒 | Menghapus bookmark. |

Contoh uji cepat setelah deploy:

```powershell
curl.exe https://<domain-backend>/api
```

## Konfigurasi deployment

Arsitektur yang dipakai:

- **Frontend** di Vercel (Next.js), project `prototype-aplikasi-islami`.
- **Backend** di Vercel (NestJS, zero configuration), project `arah-backend`.
- **Database** MySQL Aiven 8.4 (`defaultdb`).
- Browser memanggil `/api/*` pada domain frontend, lalu Vercel meneruskannya ke backend. Dengan proxy ini cookie sesi tetap first-party dan CORS tidak diperlukan.
- Function backend berjalan di region `bom1` (Mumbai) agar dekat dengan Aiven Bengaluru.

### 1. Siapkan database Aiven

1. Buat layanan MySQL di Aiven, lalu catat host, port, user, password, dan nama database (`defaultdb`).
2. Unduh CA certificate dari halaman koneksi Aiven.
3. Jalankan [`database/schema.sql`](database/schema.sql) pada database tersebut (`DB_NAME=defaultdb` untuk database bawaan Aiven). Contoh:

   ```bash
   mysql --host=<host> --port=<port> --user=<user> --password \
     --ssl-mode=VERIFY_CA --ssl-ca=ca.pem defaultdb < database/schema.sql
   ```

   Skema memuat tabel akun, progres, bookmark, dan seed misi harian. Jangan jalankan ulang pada database yang sudah berisi tabel; untuk skema lama gunakan migrasi di `database/migrations/`.
4. Simpan CA certificate untuk environment backend.
5. Catat batas koneksi paket yang dipakai. Untuk paket gratis, jaga `DB_CONNECTION_LIMIT` tetap kecil.

### 2. Deploy backend ke Vercel

1. Buat project Vercel dari repository ini dan set **Root Directory** ke `backend`.
2. Pada **Settings → Build & Development**, pilih **Framework Preset: NestJS** dan biarkan Build/Output Command kosong (Vercel mendeteksinya otomatis). Vercel menjalankan aplikasi Nest sebagai satu Function.
3. [`backend/vercel.json`](backend/vercel.json) mengatur region function `bom1` (Mumbai, terdekat dengan Aiven Bengaluru). Ubah bila database berada di region lain.
4. Atur environment berikut:

   | Variabel | Nilai |
   |---|---|
   | `NODE_ENV` | `production` |
   | `FRONTEND_ORIGIN` | `https://<domain-vercel-frontend>` |
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | kredensial Aiven |
   | `DB_SSL` | `true` |
   | `DB_SSL_CA` | `base64:<isi-base64 ca.pem>` atau isi PEM |
   | `DB_CONNECTION_LIMIT` | `3` (serverless membuat beberapa instance; jaga di bawah batas Aiven) |
   | `JWT_SECRET` | rahasia acak minimal 32 karakter |
   | `COOKIE_SAMESITE` | `lax` untuk mode proxy |
   | `COOKIE_SECURE` | `true` |

   `PORT` diisi otomatis oleh Vercel. Untuk membuat nilai base64 CA di PowerShell:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("ca.pem"))
   ```

   Lalu set `DB_SSL_CA=base64:<hasil-perintah-di-atas>`.
5. Nonaktifkan Deployment Protection (**Settings → Deployment Protection → Vercel Authentication: Disabled**) agar API bisa dipanggil dari domain frontend.
6. Deploy, lalu pastikan `https://<domain-backend>/api` mengembalikan teks `Backend Aplikasi Islami berjalan`.

### 3. Deploy frontend ke Vercel

1. Import repository ini di Vercel dan set **Root Directory** ke `frontend`.
2. Tambahkan environment `BACKEND_URL=https://<domain-backend>` (tanpa akhiran `/api`) untuk Production dan Preview.
3. Deploy. Biarkan `NEXT_PUBLIC_API_URL` kosong agar frontend memakai proxy `/api`. Jika domain backend berubah, perbarui `BACKEND_URL` lalu redeploy frontend karena rewrite dibaca saat build.
4. Setelah domain Vercel diketahui, perbarui `FRONTEND_ORIGIN` di backend dan redeploy backend.

### 4. Deployment otomatis

Kedua project Vercel terhubung ke repository GitHub pada branch `main`. Setiap `git push` ke `main` akan:

1. Membangun backend dari folder `backend` (root directory `backend`) dan menerbitkannya ke `https://arah-backend-rho.vercel.app`.
2. Membangun frontend dari folder `frontend` dan menerbitkannya ke `https://prototype-aplikasi-islami.vercel.app`.

Pull request dan branch lain menghasilkan Preview Deployment dengan URL sementara. Environment Preview memakai variabel yang sama, jadi berhati-hatilah: data preview menulis ke database produksi Aiven.

Untuk deploy manual tanpa Git:

```powershell
# backend
cd backend
npx vercel --prod

# frontend
cd frontend
npx vercel --prod
```

> Deploy manual dari subfolder memakai isi folder tersebut sebagai root, sedangkan setting **Root Directory** berlaku untuk deploy berbasis Git. Jika CLI menolak dengan pesan `Root Directory ... does not exist`, deploy lewat `git push` atau jalankan dari root repository.

### 5. Verifikasi

- Buka situs, daftar akun, lalu refresh halaman untuk memastikan sesi tetap masuk.
- Simpan bookmark, buka surah/doa, dan cek progres pada beranda.
- Uji langsung API: `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout` (harus `401` setelah logout).
- Jika login gagal, periksa `FRONTEND_ORIGIN`, atribut cookie, dan CA certificate Aiven.

### Catatan produksi

- Jangan commit `.env`, password database, JWT secret, atau CA certificate. Simpan semuanya di dashboard hosting.
- Gunakan `JWT_SECRET` produksi yang berbeda dari lokal. Mengganti nilai ini membatalkan semua sesi aktif.
- Kecilkan `DB_CONNECTION_LIMIT` (misalnya `3`) agar tidak melewati batas koneksi Aiven.
- Mode proxy adalah pilihan yang disarankan. Jika frontend memanggil backend secara langsung, set `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`, dan pastikan `FRONTEND_ORIGIN` cocok; sebagian browser tetap dapat memblokir cookie pihak ketiga.
- `FRONTEND_ORIGIN` menerima beberapa origin dipisahkan koma, misalnya domain produksi dan preview Vercel. Tulis origin secara lengkap dengan `https://` dan tanpa garis miring di akhir.
- Aiven free plan mematikan layanan setelah periode tanpa aktivitas. Jika API tiba-tiba gagal koneksi database, nyalakan kembali layanan dari konsol Aiven lalu tunggu 1–2 menit.

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

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Setelah login lalu refresh kembali ke tampilan tamu | Cookie tidak tersimpan | Pastikan akses lewat HTTPS, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=lax`, dan frontend memakai proxy `/api` (bukan memanggil backend lintas domain). |
| `401 Silakan masuk untuk menyimpan progres` padahal sudah login | Cookie tidak terkirim atau `JWT_SECRET` berubah | Cek cookie di DevTools, login ulang, dan pastikan `JWT_SECRET` tidak diganti setelah sesi dibuat. |
| Error CORS di konsol browser | `FRONTEND_ORIGIN` tidak cocok | Tulis origin lengkap (`https://domain.tanpa-garis-miring`). Bila memakai proxy, origin yang terlihat oleh backend adalah domain backend. |
| `ECONNREFUSED`, `ETIMEDOUT`, atau host tidak ditemukan | Layanan Aiven mati atau jaringan diblokir | Nyalakan layanan di konsol Aiven, cek host/port, dan pastikan `DB_SSL=true` beserta CA yang benar. |
| `ER_TOO_MANY_USER_CONNECTIONS` | Pool koneksi terlalu besar | Turunkan `DB_CONNECTION_LIMIT` (mis. `3`) dan redeploy. |
| `No Output Directory named "public"` saat deploy backend | Framework preset belum NestJS | Set **Framework Preset: NestJS** pada project backend. |
| `The specified Root Directory "frontend" does not exist` | Deploy CLI dari subfolder project yang punya Root Directory | Deploy via `git push`, atau jalankan CLI dari root repository. |
| Halaman terbuka tetapi data gagal dimuat | Backend/database belum siap | Buka `<domain-backend>/api`; bila gagal, periksa log deployment backend. |

## Catatan data

Teks dan terjemahan ayat dimuat dari AlQuran Cloud; jadwal salat dihitung menggunakan Aladhan. Doa harian merupakan data lokal di `frontend/src/data/dailyDuas.ts`; periksa keterangan sumber pada tiap doa. Ketersediaan layanan eksternal memerlukan koneksi internet.

Skema database, seed misi, dan migrasi berada di [`database/`](database). Proyek ini adalah prototipe; untuk penggunaan publik, tinjau ulang kebijakan privasi, pencadangan database, serta sumber dan lisensi konten keagamaan yang dipakai.
