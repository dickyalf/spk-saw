# SPK Seleksi Karyawan Baru — Metode SAW (MERN Stack)

Implementasi Sistem Pendukung Keputusan untuk seleksi karyawan baru menggunakan metode **Simple Additive Weighting (SAW)**, dibangun dengan **MongoDB, Express.js, React, dan Node.js**.

Proyek ini adalah implementasi dari proposal Tugas Akhir *"Sistem Pendukung Keputusan Seleksi Karyawan Baru Menggunakan Metode Simple Additive Weighting (SAW)"* oleh **Dicky Al Fayed Baghja Suhendra** — Universitas Ciputra Surabaya, 2026.

---

## ✨ Fitur Utama

### Untuk Pelamar
- Registrasi & login pelamar
- Lengkapi CV manual **atau** upload CV PDF (auto-parse dengan Google Gemini AI)
- Browse & melamar lowongan
- Mengerjakan tes tulis online dengan timer + auto-grading
- Memantau status lamaran (Administrasi → Tes → Wawancara → Hasil) secara real-time
- Info wawancara online (link Zoom/Meet) atau offline (lokasi)
- Notifikasi tiap perubahan status (in-app + email opsional)

### Untuk Perusahaan
- Registrasi & login perusahaan
- CRUD lowongan pekerjaan (draft / publish / close)
- CRUD bank soal tes (pilihan ganda + esai)
- **Atur kriteria & bobot SAW** per lowongan (auto-generate 4 kriteria default)
- Lihat semua pelamar masuk + ubah status tahap (administrasi/tes/wawancara)
- Jadwalkan wawancara (online/offline) + penilaian wawancara berbobot
- **Ranking SAW otomatis** dengan tabel matriks keputusan
- Finalisasi keputusan: Terima / Tolak
- Cetak / unduh **laporan hasil seleksi PDF**

### Untuk Admin
- Statistik global sistem
- Verifikasi perusahaan
- Aktifkan / nonaktifkan akun user

---

## 🧮 Algoritma SAW

Implementasi mengikuti rumus standar Simple Additive Weighting:

1. **Normalisasi bobot** sehingga Σ Wj = 1
2. **Matriks keputusan** Xij (alternatif × kriteria)
3. **Normalisasi**:
   - *Benefit*: `rij = Xij / max(Xj)`
   - *Cost*: `rij = min(Xj) / Xij`
4. **Nilai preferensi**: `Vi = Σ (Wj × rij)`
5. Alternatif dengan Vi terbesar = kandidat terbaik

Lihat `server/services/sawService.js` (pure function, sudah ada unit test di `server/tests/saw.test.js`).

**Verifikasi manual** dengan contoh 3 kandidat × 4 kriteria:

```bash
cd server
node -e "
const { hitungSAW } = require('./services/sawService');
const hasil = hitungSAW(
  [
    { id:'A1', nama:'Andi',  nilai:[5,3,80,85] },
    { id:'A2', nama:'Budi',  nilai:[6,1,90,80] },
    { id:'A3', nama:'Citra', nilai:[5,5,70,90] },
  ],
  [
    { kode:'C1', nama:'Pendidikan',  bobot:0.20, tipe:'benefit' },
    { kode:'C2', nama:'Pengalaman',  bobot:0.30, tipe:'benefit' },
    { kode:'C3', nama:'Tes',         bobot:0.25, tipe:'benefit' },
    { kode:'C4', nama:'Wawancara',   bobot:0.25, tipe:'benefit' },
  ]
);
hasil.forEach(h => console.log(h.ranking, h.nama, h.skor.toFixed(4)));
"
# Output:
# 1 Citra 0.9111
# 2 Andi  0.8050
# 3 Budi  0.7322
```

---

## 🏗️ Arsitektur

```
┌──────────────────────┐      ┌──────────────────────┐      ┌────────────────┐
│   React (Vite)       │ HTTP │  Express + Mongoose  │      │   MongoDB      │
│   Tailwind, axios    │◄────►│  JWT, multer, pdfkit │◄────►│                │
│   Pelamar/Perusahaan │      │  Service SAW         │      └────────────────┘
└──────────────────────┘      └────────┬─────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Gemini AI       │
                              │  (parsing CV)    │
                              └──────────────────┘
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+ (rekomendasi 20)
- MongoDB lokal **atau** akun MongoDB Atlas (gratis)
- (Opsional) API key Google Gemini: https://aistudio.google.com/app/apikey
- (Opsional) SMTP credentials untuk email notifikasi

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend (terminal baru)
cd client
npm install
```

### 2. Konfigurasi environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/spk_saw
JWT_SECRET=ganti_dengan_string_random_panjang
GEMINI_API_KEY=AIza...your_key   # opsional, fallback parser regex
SMTP_HOST=                       # opsional
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
```

### 3. Seed data contoh (opsional tapi disarankan)

```bash
cd server
npm run seed
```

Akan membuat:
- 1 admin: `admin@spk-saw.com` / `admin12345`
- 2 perusahaan: `hr@techcorp.com`, `hrd@finansa.com` (password: `pass12345`)
- 5 pelamar contoh (semua password: `pass12345`)
- 2 lowongan + 4 kriteria SAW default + 3 soal tes

### 4. Run server & client

```bash
# Terminal 1 - backend
cd server
npm run dev    # http://localhost:5000

# Terminal 2 - frontend
cd client
npm run dev    # http://localhost:5173
```

Buka **http://localhost:5173**.

### 5. Jalankan unit test SAW

```bash
cd server
npm test
```

---

## 🐳 Docker (opsional)

```bash
docker compose up --build
```

Buka http://localhost:5173 (frontend) dan http://localhost:5000 (API).

---

## 📂 Struktur Proyek

```
spk-saw/
├── docker-compose.yml
├── server/                      # Backend (Node.js + Express + Mongoose)
│   ├── server.js
│   ├── seed.js                  # Seed data contoh
│   ├── config/db.js
│   ├── middleware/              # auth, upload, error
│   ├── models/                  # User, Perusahaan, Pelamar, CV, Lowongan,
│   │                            # Kriteria, SoalTes, Lamaran, Wawancara,
│   │                            # JawabanTes, Notifikasi
│   ├── controllers/             # 1 file per route domain
│   ├── routes/                  # Express routers
│   ├── services/
│   │   ├── sawService.js        # ◄ Algoritma SAW (pure function)
│   │   ├── rankingService.js    # Ambil data DB → matriks → SAW
│   │   ├── geminiService.js     # Parse CV pakai Gemini AI
│   │   ├── emailService.js      # SMTP nodemailer
│   │   ├── notifikasiService.js
│   │   └── pdfReportService.js  # PDF laporan
│   ├── utils/jwt.js
│   ├── tests/saw.test.js        # Jest unit test
│   └── uploads/                 # File upload (CV, logo, foto)
└── client/                      # Frontend (React + Vite + Tailwind)
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx / App.jsx
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/          # DashboardLayout, ProtectedRoute, StatBadge
        └── pages/
            ├── public/          # Home, daftar lowongan, detail
            ├── auth/            # Login, register perusahaan/pelamar
            ├── perusahaan/      # Dashboard, lowongan, kriteria, soal,
            │                    # pelamar masuk, ranking SAW, wawancara
            ├── pelamar/         # Dashboard, CV, browse lowongan, tes tulis
            └── admin/           # Dashboard, verifikasi perusahaan
```

---

## 📡 Daftar Endpoint API (ringkas)

### Auth
| Method | Endpoint                          | Role        |
|--------|-----------------------------------|-------------|
| POST   | `/api/auth/register/perusahaan`   | public      |
| POST   | `/api/auth/register/pelamar`      | public      |
| POST   | `/api/auth/login`                 | public      |
| GET    | `/api/auth/me`                    | any         |
| PUT    | `/api/auth/change-password`       | any         |

### Lowongan
| Method | Endpoint                          | Role         |
|--------|-----------------------------------|--------------|
| GET    | `/api/lowongan`                   | public       |
| GET    | `/api/lowongan/:id`               | public       |
| GET    | `/api/lowongan/saya/list`         | perusahaan   |
| POST   | `/api/lowongan`                   | perusahaan   |
| PUT    | `/api/lowongan/:id`               | perusahaan   |
| POST   | `/api/lowongan/:id/publish`       | perusahaan   |
| POST   | `/api/lowongan/:id/close`         | perusahaan   |
| DELETE | `/api/lowongan/:id`               | perusahaan   |
| PUT    | `/api/lowongan/:id/soal`          | perusahaan   |

### Kriteria SAW
| Method | Endpoint                          | Role         |
|--------|-----------------------------------|--------------|
| GET    | `/api/kriteria?lowonganId=...`    | perusahaan   |
| POST   | `/api/kriteria`                   | perusahaan   |
| PUT    | `/api/kriteria/:id`               | perusahaan   |
| DELETE | `/api/kriteria/:id`               | perusahaan   |
| PUT    | `/api/kriteria/bobot-batch`       | perusahaan   |

### Soal Tes
| Method | Endpoint                          | Role         |
|--------|-----------------------------------|--------------|
| GET    | `/api/soal-tes`                   | perusahaan   |
| POST   | `/api/soal-tes`                   | perusahaan   |
| PUT    | `/api/soal-tes/:id`               | perusahaan   |
| DELETE | `/api/soal-tes/:id`               | perusahaan   |

### CV
| Method | Endpoint                          | Role         |
|--------|-----------------------------------|--------------|
| GET    | `/api/cv/me`                      | pelamar      |
| PUT    | `/api/cv/manual`                  | pelamar      |
| POST   | `/api/cv/upload`                  | pelamar (multipart `cv`) |

### Lamaran
| Method | Endpoint                                  | Role         |
|--------|-------------------------------------------|--------------|
| POST   | `/api/lamaran/:lowonganId`                | pelamar      |
| GET    | `/api/lamaran/saya`                       | pelamar      |
| GET    | `/api/lamaran/saya/:id`                   | pelamar      |
| GET    | `/api/lamaran/lowongan/:lowonganId`       | perusahaan   |
| PUT    | `/api/lamaran/:id/tahap/:tahap`           | perusahaan   |
| PUT    | `/api/lamaran/:id/finalisasi`             | perusahaan   |

### Tes
| Method | Endpoint                                  | Role         |
|--------|-------------------------------------------|--------------|
| GET    | `/api/tes/:lamaranId/soal`                | pelamar      |
| POST   | `/api/tes/:lamaranId/submit`              | pelamar      |
| GET    | `/api/tes/:lamaranId/jawaban`             | perusahaan   |

### Wawancara
| Method | Endpoint                                  | Role         |
|--------|-------------------------------------------|--------------|
| POST   | `/api/wawancara/:lamaranId/jadwal`        | perusahaan   |
| PUT    | `/api/wawancara/:lamaranId/nilai`         | perusahaan   |
| GET    | `/api/wawancara/:lamaranId`               | any          |

### Ranking SAW & Laporan
| Method | Endpoint                                  | Role         |
|--------|-------------------------------------------|--------------|
| GET    | `/api/ranking/:lowonganId`                | perusahaan   |
| GET    | `/api/laporan/lowongan/:id/pdf`           | perusahaan   |

### Notifikasi & Admin
| Method | Endpoint                                  | Role         |
|--------|-------------------------------------------|--------------|
| GET    | `/api/notifikasi`                         | any          |
| PUT    | `/api/notifikasi/baca-semua`              | any          |
| PUT    | `/api/notifikasi/:id/baca`                | any          |
| GET    | `/api/admin/statistik`                    | admin        |
| GET    | `/api/admin/perusahaan`                   | admin        |
| PUT    | `/api/admin/perusahaan/:id/verifikasi`    | admin        |
| GET    | `/api/admin/pelamar`                      | admin        |
| PUT    | `/api/admin/user/:id/toggle`              | admin        |

---

## ✅ Pengujian (sesuai Bab 2.2.5–2.2.6 Proposal)

### 1. Black Box Testing
Unit test untuk algoritma SAW di `server/tests/saw.test.js`:
- Normalisasi bobot Σ=1
- Normalisasi matriks benefit & cost
- Ranking output sesuai contoh
- Validasi kriteria kosong

Jalankan: `cd server && npm test`.

### 2. User Test Scenario
Lakukan skenario:
1. Register pelamar → upload CV → lihat parsing AI
2. Browse lowongan → kirim lamaran
3. Login perusahaan → lolosan administrasi → buat soal → atur ke lowongan
4. Pelamar kerjakan tes → auto-grade
5. Perusahaan jadwalkan wawancara online → input nilai
6. Klik **Hitung Ranking SAW** → cek tabel ranking
7. Klik **Unduh PDF** → terima laporan hasil seleksi

---

## 📌 Catatan Implementasi
- **Default 4 kriteria SAW** (Pendidikan, Pengalaman, Tes, Wawancara) otomatis dibuat saat lowongan baru, sesuai *Ruang Lingkup* proposal.
- **Bobot otomatis dinormalisasi** ke Σ=1 di service SAW — perusahaan bebas input bobot dalam skala apa pun.
- **Parsing CV** mencoba Gemini AI dulu; bila API key kosong / gagal, fallback ke regex parser sederhana.
- **Wawancara online** disimpan sebagai link eksternal (Zoom/Meet/Teams) — paling realistis & ringan.
- **Tahapan dinamis**: perusahaan bisa skip tahap (mis. tes saja, tanpa wawancara) via `tahapanSeleksi` di Lowongan.

---

## 📚 Referensi

Berbasis pada referensi pustaka di Bab II proposal, terutama:
- Hamidah dkk. (2021), Ahsan & Chotijah (2022), Simbolon dkk. (2025) — SPK + SAW
- Kamal & Gunaryati (2023), Permono dkk. (2024) — MERN Stack
- Pratama dkk. (2023), Andika dkk. (2025) — Black Box Testing
- Pressman (2015) — Software Engineering: A Practitioner's Approach (model Waterfall)

---

© 2026 — Dicky Al Fayed Baghja Suhendra · Universitas Ciputra Surabaya
