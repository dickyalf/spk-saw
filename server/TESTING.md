# Panduan Testing & TDD — SPK SAW Backend

Dokumen ini menjelaskan cara menjalankan test, dan workflow **Test-Driven Development (TDD)** untuk setiap fitur baru.

## Daftar Test yang Sudah Ada

| File | Fitur yang Dicover | Jumlah Test Case |
|---|---|---|
| `tests/saw.test.js` | Pure function SAW (normalisasi, ranking) | 6 |
| `tests/auth.test.js` | Register, login, /me, change password | 15 |
| `tests/lowongan.test.js` | CRUD lowongan, publish, close, ownership | 12 |
| `tests/kriteria.test.js` | CRUD kriteria, batch bobot | 7 |
| `tests/soalTes.test.js` | CRUD soal tes, role check | 6 |
| `tests/cv.test.js` | Upsert CV manual, model helper | 7 |
| `tests/lamaran.test.js` | Lamar, status tahapan, finalisasi | 10 |
| `tests/tes.test.js` | Ambil soal, submit auto-grade, audit | 7 |
| `tests/wawancara.test.js` | Jadwal online/offline, input nilai | 6 |
| `tests/ranking.test.js` | Pipeline E2E ranking SAW | 3 |
| `tests/admin.test.js` | Statistik, verifikasi, toggle user | 5 |
| `tests/notifikasi.test.js` | Auto-generated, mark read | 4 |
| **TOTAL** | | **~88 test cases** |

Setiap fitur punya minimal:
- ✅ **Positive case** — input valid menghasilkan output yang benar
- ❌ **Negative case** — input tidak valid, role tidak berhak, atau data milik orang lain

---

## Cara Menjalankan Test

### Prasyarat (sekali setup)

```bash
cd server
npm install
```

Ini sekaligus menginstal `mongodb-memory-server` — saat test berjalan, Jest akan otomatis mengunduh binary MongoDB (sekali) dan menjalankannya in-memory. **Tidak perlu instalasi MongoDB lokal hanya untuk test.**

### Jalankan semua test

```bash
npm test
```

Output yang diharapkan (potongan):

```
🧪 In-memory MongoDB started at mongodb://127.0.0.1:xxxxx/

 PASS  tests/saw.test.js
  SAW Service
    ✓ normalisasi bobot menjadi total 1
    ✓ normalisasi matriks benefit: rij = Xij / max
    ✓ normalisasi matriks cost: rij = min / Xij
    ✓ hitungSAW menghasilkan ranking benar
    ✓ hitungSAW: lempar error bila kriteria kosong
    ✓ hitungSAW: cost kriteria membuat nilai kecil unggul

 PASS  tests/auth.test.js
  Auth — Register Perusahaan
    ✓ POST /auth/register/perusahaan dengan data valid → 200 + token
    ✓ email tidak valid → 400
    ...

Test Suites: 12 passed, 12 total
Tests:       88 passed, 88 total
```

### Jalankan satu file saja

```bash
npm test -- tests/lowongan.test.js
```

### Jalankan test yang cocok dengan keyword

```bash
npm test -- -t "ranking"
```

### Watch mode (auto-rerun saat file berubah — ideal untuk TDD)

```bash
npm test -- --watch
```

### Coverage report

```bash
npx jest --coverage
```

---

## Struktur Test

```
server/
├── jest.config.js              ← konfigurasi Jest
└── tests/
    ├── setup/
    │   ├── env.js              ← set env vars (JWT_SECRET, dll)
    │   ├── globalSetup.js      ← spin up in-memory MongoDB (1x)
    │   ├── globalTeardown.js   ← stop MongoDB
    │   ├── clearDB.js          ← afterEach: hapus semua collection
    │   ├── testApp.js          ← buildApp() factory (tanpa listen())
    │   └── helpers.js          ← registerPerusahaan, registerPelamar, auth(), dll
    ├── auth.test.js
    ├── lowongan.test.js
    ├── kriteria.test.js
    ├── soalTes.test.js
    ├── cv.test.js
    ├── lamaran.test.js
    ├── tes.test.js
    ├── wawancara.test.js
    ├── ranking.test.js
    ├── admin.test.js
    ├── notifikasi.test.js
    └── saw.test.js
```

### Bagaimana test ter-isolasi

- `globalSetup` menjalankan **satu** instance MongoDB in-memory untuk SEMUA test.
- `setupFilesAfterEnv` mendaftarkan hook `afterEach` global yang drop semua collection.
  - Catatan: nama option Jest yang benar adalah `setupFilesAfterEnv` (bukan `setupFilesAfterEach`).
- Setelah setiap test, semua collection di-drop → test berikutnya mulai bersih.
- Tiap helper `registerPerusahaan` / `registerPelamar` memakai email unik (timestamp + counter), jadi defensive tambahan agar tidak ada konflik bahkan tanpa cleanup.

---

## TDD Workflow untuk Fitur Baru

Ikuti siklus **Red → Green → Refactor**:

### Langkah 1 — RED: tulis test dulu (gagal)

Misalkan fitur baru: **perusahaan bisa bookmark pelamar**.

Buat file `tests/bookmark.test.js`:

```js
const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPerusahaan, registerPelamar, auth } = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('Bookmark Pelamar', () => {
  test('✅ POST /bookmark/:pelamarId menyimpan bookmark', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const { user } = await registerPelamar(app);

    const res = await request(app)
      .post(`/api/bookmark/${user.pelamar}`)
      .set(auth(tP));
    expect(res.status).toBe(201);
    expect(res.body.pelamar).toBe(user.pelamar);
  });

  test('❌ Bookmark pelamar yang tidak ada → 404', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/api/bookmark/${fakeId}`)
      .set(auth(tP));
    expect(res.status).toBe(404);
  });

  test('❌ Pelamar tidak boleh bookmark dirinya → 403', async () => {
    const { token } = await registerPelamar(app);
    const res = await request(app).post('/api/bookmark/xx').set(auth(token));
    expect(res.status).toBe(403);
  });
});
```

Jalankan: `npm test -- tests/bookmark.test.js` → semuanya **GAGAL** ❌ (model & route belum ada). Itu yang diharapkan.

### Langkah 2 — GREEN: tulis kode minimal supaya test lulus

1. Buat **model** `models/Bookmark.js`
2. Buat **controller** `controllers/bookmarkController.js`
3. Buat **route** `routes/bookmark.js`
4. Mount di `server.js`: `app.use('/api/bookmark', require('./routes/bookmark'));`
5. Mount juga di `tests/setup/testApp.js` (kalau lupa, test akan terus gagal — itu sinyal jelas)

Iterasi: jalankan test → lihat error → perbaiki → ulang sampai semua **HIJAU** ✅.

### Langkah 3 — REFACTOR: rapikan kode tanpa break test

Sekarang aman untuk refactor: ekstrak ke service, kasih nama variabel yang lebih baik, dll. Setiap perubahan dijaga test agar tidak regresi.

### Langkah 4 — Tambah edge case sebagai test baru

- Bookmark 2x → tetap 1 entry (test idempotency)
- DELETE bookmark
- GET list bookmark perusahaan
- Pagination bila list panjang

Tiap edge case = 1 test case baru.

---

## Template Test untuk Fitur Baru (copy-paste)

```js
const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPerusahaan, registerPelamar, auth } = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('NAMA_FITUR — Positive', () => {
  test('✅ kasus utama berhasil', async () => {
    // Arrange
    const { token } = await registerPerusahaan(app);
    // Act
    const res = await request(app)
      .post('/api/endpoint')
      .set(auth(token))
      .send({ ... });
    // Assert
    expect(res.status).toBe(200);
    expect(res.body.someField).toBe('expected');
  });
});

describe('NAMA_FITUR — Negative', () => {
  test('❌ tanpa token → 401', async () => {
    const res = await request(app).get('/api/endpoint');
    expect(res.status).toBe(401);
  });

  test('❌ role tidak berhak → 403', async () => {
    const { token } = await registerPelamar(app);
    const res = await request(app).get('/api/endpoint').set(auth(token));
    expect(res.status).toBe(403);
  });

  test('❌ input invalid → 400', async () => {
    const { token } = await registerPerusahaan(app);
    const res = await request(app)
      .post('/api/endpoint')
      .set(auth(token))
      .send({ /* missing required field */ });
    expect(res.status).toBe(400);
  });

  test('❌ resource milik orang lain → 404', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    // tA bikin resource, tB coba akses
    // ...
    expect(res.status).toBe(404);
  });
});
```

---

## Checklist Sebelum Commit Fitur Baru

- [ ] Minimal 1 positive test untuk happy path
- [ ] Minimal 2 negative test:
  - Auth (tanpa token / role salah)
  - Validation (input invalid / wajib hilang)
- [ ] Test ownership: user A tidak bisa modify data user B
- [ ] Edge case: data kosong, max length, boundary
- [ ] `npm test` semua HIJAU
- [ ] Route baru ter-mount di `server.js` **dan** `tests/setup/testApp.js`

---

## Tips & Trik

### Mock service eksternal (Gemini AI, email)

Sudah otomatis: kalau `GEMINI_API_KEY` & `SMTP_*` kosong (default di env test), service akan return mock / no-op.

Kalau perlu mock manual di file test:

```js
jest.mock('../services/geminiService', () => ({
  parseCVdariFile: jest.fn().mockResolvedValue({
    sumber: 'ai_parsed',
    ringkasan: 'Mocked CV',
    pendidikan: [{ jenjang: 'S1' }],
    pengalaman: [],
    skills: [],
  }),
}));
```

### Debugging test yang gagal

```bash
# Lihat output lengkap (tidak truncated)
npm test -- --verbose

# Run satu test by nama
npm test -- -t "register perusahaan dengan data valid"

# Inspect detail
npx jest --runInBand --detectOpenHandles
```

### Frontend testing (saran)

Untuk frontend React, gunakan Vitest + React Testing Library. Bisa ditambah belakangan setelah backend solid.

---

## CI/CD (saran)

Tambahkan `.github/workflows/test.yml` agar test jalan otomatis di GitHub:

```yaml
name: Backend tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd server && npm ci && npm test
```
