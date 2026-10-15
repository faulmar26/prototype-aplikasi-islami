# Panduan Git Workflow & Pencegahan Konflik AI Agent

Dokumen ini berisi standar alur kerja git untuk pengembangan repository `prototype-aplikasi-islami`, khususnya saat berkolaborasi dengan AI Agent coding (Antigravity, Cursor, Copilot, Claude, dsb.) guna menghindari masalah konflik merge.

---

## 1. Penyebab Konflik di Masa Lalu (Post-Mortem PR #2)

Pada PR sebelumnya, terjadi merge conflict pada 6 file frontend meskipun tidak ada dua orang yang sengaja mengubah baris berbeda. Penyebabnya adalah:
1. **Squash Merge**: PR #1 di-merge ke `main` menggunakan opsi *Squash and Merge*. Ini menghasilkan satu commit baru di `main` dengan hash berbeda.
2. **Branch Re-use**: Pekerjaan dilanjutkan di branch yang sama tanpa melakukan sinkronisasi (`rebase`) dengan `main`.
3. **Diverged History**: Titik temu git (*merge-base*) tertinggal di commit sebelum PR #1, sehingga Git mendeteksi modifikasi ganda pada file yang sama (*false conflict*).

---

## 2. SOP Alur Kerja (Workflow) yang Wajib Diikuti

### A. Buat Branch Baru untuk Setiap Fitur / Task (One Branch, One Feature)
Setiap kali memulai pekerjaan baru:
```bash
# 1. Pindah ke branch main dan perbarui dari remote
git checkout main
git pull origin main

# 2. Buat branch baru dari main
git checkout -b feature/nama-fitur
```
> **Jangan pernah melanjutkan pekerjaan di branch yang PR-nya sudah berhasil di-merge.** Hapus branch lama setelah PR selesai.

---

### B. Jika Terpaksa Meneruskan di Branch yang Ada
Jika Anda atau AI Agent perlu melanjutkan pekerjaan di branch yang belum di-rebase:
```bash
# Simpan perubahan saat ini
git add .
git commit -m "feat: simpan progres"

# Sinkronkan dengan branch main
git fetch origin
git rebase origin/main

# Dorong kembali ke remote
git push --force-with-lease origin <nama-branch>
```

---

### C. Prompt Rekomendasi untuk Diberikan ke AI Agent

Saat meminta AI Agent mengerjakan tugas baru, Anda dapat menambahkan potongan instruksi berikut:
```markdown
Mohon kerjakan task ini dengan mengikuti aturan Git berikut:
1. Selalu pastikan branch yang digunakan berasal dari commit terbaru `origin/main`.
2. Jangan mendasarkan pekerjaan baru pada branch lama yang PR-nya sudah di-merge.
3. Sebelum membuat commit atau PR baru, jalankan `npm run lint` dan `npm run build` untuk memverifikasi tidak ada error.
```
