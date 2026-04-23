# 🎓 PANDUAN LENGKAP SETUP StudyPal CHATBOT
## Untuk Pemula Total — Windows 11

---

> **Catatan:** Panduan ini ditulis untuk orang yang belum pernah coding sama sekali.
> Ikuti langkah demi langkah, jangan dilewati!

---

## 📋 DAFTAR ISI
1. [Apa yang Dibutuhkan](#1-apa-yang-dibutuhkan)
2. [Install Node.js](#2-install-nodejs)
3. [Install Git](#3-install-git)
4. [Buat Akun GitHub](#4-buat-akun-github)
5. [Buat Akun Vercel (Gratis)](#5-buat-akun-vercel-gratis)
6. [Upload Kode ke GitHub](#6-upload-kode-ke-github)
7. [Deploy ke Vercel](#7-deploy-ke-vercel)
8. [Setup n8n (Opsional)](#8-setup-n8n-opsional)
9. [Jalankan Lokal (untuk Testing)](#9-jalankan-lokal-untuk-testing)

---

## 1. APA YANG DIBUTUHKAN

### Software yang perlu diinstall (GRATIS semua!):
| Software | Fungsi | Link Download |
|----------|--------|---------------|
| Node.js | Menjalankan kode JavaScript | nodejs.org |
| Git | Menyimpan & upload kode | git-scm.com |
| VS Code | Text editor kode | code.visualstudio.com |

### Akun online yang perlu dibuat (GRATIS semua!):
| Layanan | Fungsi | Link |
|---------|--------|------|
| GitHub | Menyimpan kode di cloud | github.com |
| Vercel | Hosting website gratis | vercel.com |
| n8n.cloud | Workflow AI (opsional) | n8n.io |

**💰 BIAYA TOTAL: Rp 0 (GRATIS SEPENUHNYA!)**

---

## 2. INSTALL NODE.JS

**Node.js itu seperti "mesin" yang diperlukan untuk menjalankan aplikasi kita.**

### Langkah-langkah:

1. Buka browser (Chrome/Edge/Firefox)
2. Pergi ke **https://nodejs.org**
3. Klik tombol besar bertuliskan **"LTS"** (yang warnanya hijau)
   - LTS = Long Term Support, versi yang paling stabil
4. File akan terunduh (namanya seperti `node-v20.x.x-x64.msi`)
5. Buka file yang terunduh tadi (klik 2x)
6. Klik **"Next"** terus sampai selesai, jangan ubah apapun
7. Klik **"Install"** → tunggu sampai selesai
8. Klik **"Finish"**

### Cara cek berhasil:
1. Tekan tombol **Windows + R** di keyboard
2. Ketik `cmd` → tekan Enter
3. Di jendela hitam yang muncul, ketik: `node --version`
4. Tekan Enter
5. Kalau muncul angka seperti `v20.x.x` → ✅ BERHASIL!

---

## 3. INSTALL GIT

**Git itu seperti "kurir" yang membantu kita mengirim kode ke internet.**

### Langkah-langkah:
1. Buka browser
2. Pergi ke **https://git-scm.com**
3. Klik tombol unduh untuk Windows
4. Buka file yang terunduh (klik 2x)
5. Klik **"Next"** terus sampai ada opsi editor
6. Di bagian "default editor", pilih **"Use Visual Studio Code"** (atau biarkan default)
7. Klik **"Next"** terus → klik **"Install"** → tunggu → klik **"Finish"**

### Cara cek berhasil:
1. Buka Command Prompt (Windows + R → ketik `cmd` → Enter)
2. Ketik: `git --version`
3. Tekan Enter
4. Kalau muncul `git version x.x.x` → ✅ BERHASIL!

---

## 4. BUAT AKUN GITHUB

**GitHub itu seperti "Google Drive khusus kode".**

### Langkah-langkah:
1. Buka **https://github.com**
2. Klik **"Sign up"**
3. Isi:
   - Username: nama pengguna unikmu (misal: `budi-belajar`)
   - Email: email aktifmu
   - Password: password yang kuat
4. Verifikasi email yang dikirim ke emailmu
5. Pilih plan **Free** (gratis)

---

## 5. BUAT AKUN VERCEL (GRATIS)

**Vercel adalah layanan hosting gratis yang akan membuat website kita bisa diakses siapa saja di internet.**

### Langkah-langkah:
1. Buka **https://vercel.com**
2. Klik **"Sign Up"**
3. Pilih **"Continue with GitHub"**
4. Login dengan akun GitHub yang baru dibuat
5. Pilih plan **"Hobby"** (gratis)
6. Klik **"Continue"**

---

## 6. UPLOAD KODE KE GITHUB

**Sekarang kita akan menaruh semua file kode ke GitHub.**

### Langkah 1: Buka folder proyek
1. Buka **File Explorer** (ikon folder di taskbar)
2. Navigasi ke folder `studypal-project` (bukan subfolder — package.json ada langsung di sini)
3. Di address bar di atas, klik → ketik `cmd` → tekan Enter
   - Ini akan membuka Command Prompt tepat di folder tersebut

### Langkah 2: Setup Git di folder proyek
Di Command Prompt yang terbuka, ketik satu per satu (tekan Enter setelah tiap baris):

```
git init
git add .
git commit -m "Initial StudyPal commit"
```

### Langkah 3: Buat repository di GitHub
1. Buka **https://github.com**
2. Klik tombol **"+"** di pojok kanan atas
3. Klik **"New repository"**
4. Isi:
   - Repository name: `studypal`
   - Description: `AI Chatbot Pendidikan`
   - Pilih **Public**
5. Klik **"Create repository"**

### Langkah 4: Hubungkan folder dengan GitHub
Di Command Prompt tadi, copy-paste perintah yang GitHub berikan (yang ada tulisan `git remote add origin`), contohnya:

```
git remote add origin https://github.com/USERNAME-KAMU/studypal.git
git branch -M main
git push -u origin main
```

Ganti `USERNAME-KAMU` dengan username GitHub kamu.

---

## 7. DEPLOY KE VERCEL

**Ini langkah paling keren — website kita akan live di internet!**

### Langkah-langkah:
1. Buka **https://vercel.com** dan login
2. Klik tombol **"Add New..."** → **"Project"**
3. Di bawah "Import Git Repository", cari `studypal`
4. Klik **"Import"**

### Konfigurasi sebelum deploy:
5. Di halaman konfigurasi:
   - **Framework Preset:** pilih **"Next.js"** (biasanya auto-detect)
   - **Root Directory:** biarkan default
6. Klik **"Environment Variables"** (penting!)
7. Tambahkan variabel berikut:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyA-SkA6Fj81ubsaaC12Xdx-_6YK497gYGM`
   - Klik **"Add"**
8. Klik **"Deploy"** → tunggu 2-3 menit

### Selesai! 🎉
- Vercel akan memberikan URL seperti: `https://studypal.vercel.app`
- URL ini bisa dibagikan ke siapa saja!
- **GRATIS selamanya** untuk proyek personal/pendidikan

---

## 8. SETUP n8n (OPSIONAL)

**n8n adalah platform workflow otomatis. Untuk proyek ini, n8n bisa digunakan sebagai "otak" tambahan untuk memproses permintaan AI dengan lebih canggih.**

> ⚠️ **Catatan:** Aplikasi sudah berfungsi tanpa n8n. n8n hanya diperlukan jika ingin
> menambahkan fitur otomasi lebih lanjut atau integrasi dengan sistem lain.

### Opsi A: n8n Cloud (Gratis, Lebih Mudah)

1. Buka **https://n8n.io**
2. Klik **"Start for Free"**
3. Daftar dengan email
4. Kamu dapat 2 minggu trial gratis, setelah itu plan gratis terbatas

### Opsi B: n8n Lokal dengan Docker (Gratis Selamanya)

**Install Docker dulu:**
1. Buka **https://docker.com/products/docker-desktop**
2. Download Docker Desktop untuk Windows
3. Install (ikuti wizard)
4. Restart komputer setelah install

**Jalankan n8n:**
1. Buka Command Prompt sebagai Administrator (klik kanan icon CMD → "Run as administrator")
2. Ketik perintah berikut:

```
docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

3. Tunggu sekitar 1-2 menit
4. Buka browser → pergi ke **http://localhost:5678**
5. Buat akun admin (email + password bebas)

### Import Workflow StudyPal ke n8n:

1. Di n8n, klik **"Workflows"** di menu kiri
2. Klik tombol **"Import from File"** (ikon import)
3. Pilih file `n8n-workflows/studypal-workflow.json`
4. Klik **"Import"**

### Tambahkan Gemini API Key di n8n:

1. Di n8n, pergi ke **"Settings"** → **"Credentials"**
2. Klik **"Add Credential"**
3. Cari **"Google Gemini"**
4. Isi API Key: `AIzaSyA-SkA6Fj81ubsaaC12Xdx-_6YK497gYGM`
5. Klik **"Save"**

### Aktifkan Workflow:
1. Buka workflow yang baru diimport
2. Toggle switch di pojok kanan atas ke **"Active"**
3. Copy webhook URL yang muncul
4. Tempel di file `.env.local`: `N8N_WEBHOOK_URL=https://...`

---

## 9. JALANKAN LOKAL (UNTUK TESTING)

**Sebelum deploy, kamu bisa test dulu di komputermu sendiri.**

### Langkah-langkah:
1. Buka Command Prompt di folder `vercel-app`
2. Buat file `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSyA-SkA6Fj81ubsaaC12Xdx-_6YK497gYGM
   ```
3. Install dependencies (cukup sekali):
   ```
   npm install
   ```
4. Jalankan server lokal:
   ```
   npm run dev
   ```
5. Buka browser → pergi ke **http://localhost:3000**

---

## 🔧 TROUBLESHOOTING (Kalau Ada Masalah)

### ❓ "npm: command not found"
→ Node.js belum terinstall dengan benar. Ulangi langkah 2.

### ❓ Website loading lama
→ Normal! Vercel perlu sekitar 30 detik untuk "wake up" setelah lama tidak dipakai (free tier).

### ❓ AI tidak menjawab
→ Cek apakah `GEMINI_API_KEY` sudah ditambahkan di Vercel Environment Variables.

### ❓ "git: command not found"
→ Git belum terinstall. Ulangi langkah 3.

### ❓ Error saat `npm install`
→ Pastikan koneksi internet stabil. Coba lagi.

### ❓ Halaman putih saat dibuka
→ Tekan Ctrl+F5 untuk hard refresh browser.

---

## 📱 FITUR-FITUR YANG TERSEDIA

| Fitur | Keterangan |
|-------|------------|
| 💬 Chat AI | Tanya apa saja tentang pelajaran |
| 📋 Study Plan | Buat daftar tugas + to-do list |
| 📅 Jadwal Mingguan | Atur jadwal belajar per hari |
| 🗺️ Mind Map | Generate mind map otomatis dengan AI |
| 🃏 Flashcards | Kartu belajar bolak-balik interaktif |
| 📊 Progress | Statistik dan tracking belajar |
| 📄 Worksheet PDF | Generate soal latihan + kunci jawaban |
| 🎨 Kustomisasi | Ganti tema, warna, background, nama AI |
| 👤 Profil AI | Pilih avatar dan nama AI Buddy |
| 💾 Auto-save | Data tersimpan otomatis di browser |

---

## ❓ FAQ

**Q: Apakah ada biaya?**
A: TIDAK. Semua layanan yang digunakan (Vercel, GitHub, Gemini API) memiliki free tier yang cukup untuk proyek ini.

**Q: Apakah data pengguna aman?**
A: Data disimpan di browser lokal pengguna (localStorage), tidak ke server. Riwayat chat dikirim ke Gemini API Google untuk diproses.

**Q: Berapa batas penggunaan gratis?**
A: Gemini API gratis memberikan sekitar 60 request/menit. Sangat cukup untuk penggunaan normal.

**Q: Bisakah di-custom lebih lanjut?**
A: Ya! Kode sepenuhnya open dan bisa dimodifikasi sesuai kebutuhan.

---

*StudyPal Platform — Dibuat untuk memajukan pendidikan Indonesia 🇮🇩*
*Free, Open, Inclusive — Belajar untuk semua!*
