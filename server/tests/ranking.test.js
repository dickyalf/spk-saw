/**
 * Integration test: pipeline lengkap sampai ranking SAW.
 * 3 pelamar mengikuti seleksi penuh, lalu kita panggil GET /ranking/:lowonganId.
 */
const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const {
  registerPerusahaan,
  registerPelamar,
  auth,
  buatLowonganLengkap,
} = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('Ranking SAW — Pipeline E2E', () => {
  test('✅ 3 pelamar disusun ranking sesuai skor SAW', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);

    // 3 pelamar dengan profil berbeda
    const profilList = [
      {
        nama: 'Andi (S1, 3thn, tes 80, wwc 85)',
        cv: { pendidikan:[{jenjang:'S1'}], pengalaman:[{tahunMulai:2022,tahunSelesai:2025}] },
        nilaiTes: 80, nilaiWwc: 85,
      },
      {
        nama: 'Budi (S2, 1thn, tes 90, wwc 80)',
        cv: { pendidikan:[{jenjang:'S2'}], pengalaman:[{tahunMulai:2024,tahunSelesai:2025}] },
        nilaiTes: 90, nilaiWwc: 80,
      },
      {
        nama: 'Citra (S1, 5thn, tes 70, wwc 90)',
        cv: { pendidikan:[{jenjang:'S1'}], pengalaman:[{tahunMulai:2020,tahunSelesai:2025}] },
        nilaiTes: 70, nilaiWwc: 90,
      },
    ];

    for (const profil of profilList) {
      const { token: tA } = await registerPelamar(app, { namaLengkap: profil.nama });
      await request(app).put('/api/cv/manual').set(auth(tA)).send(profil.cv);
      const r = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});

      const lamId = r.body._id;
      // Loloskan administrasi
      await request(app).put(`/api/lamaran/${lamId}/tahap/administrasi`).set(auth(tP))
        .send({ status: 'lolos', nilai: 100 });
      // Set nilai tes
      await request(app).put(`/api/lamaran/${lamId}/tahap/tes`).set(auth(tP))
        .send({ status: 'lolos', nilai: profil.nilaiTes });
      // Set nilai wawancara
      await request(app).put(`/api/lamaran/${lamId}/tahap/wawancara`).set(auth(tP))
        .send({ status: 'lolos', nilai: profil.nilaiWwc });
    }

    // Hitung ranking
    const res = await request(app).get(`/api/ranking/${lowongan._id}`).set(auth(tP));
    expect(res.status).toBe(200);
    expect(res.body.hasil).toHaveLength(3);
    expect(res.body.kriteria).toHaveLength(4);

    // Validasi ranking — semua skor antara 0 dan 1, urut menurun
    const skor = res.body.hasil.map((h) => h.skor);
    for (let i = 1; i < skor.length; i++) {
      expect(skor[i - 1]).toBeGreaterThanOrEqual(skor[i]);
    }
    res.body.hasil.forEach((h) => {
      expect(h.skor).toBeGreaterThanOrEqual(0);
      expect(h.skor).toBeLessThanOrEqual(1);
      expect(h.ranking).toBeGreaterThanOrEqual(1);
      expect(h.ranking).toBeLessThanOrEqual(3);
    });

    // Setiap pelamar punya nilai per kriteria (length = 4)
    res.body.hasil.forEach((h) => expect(h.nilai).toHaveLength(4));
  });

  test('❌ Ranking lowongan yang belum ada kriteria → 400', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(tP)).send({ judul:'X', posisi:'Y' });
    // Hapus semua kriteria auto-generated
    const list = await request(app).get(`/api/kriteria?lowonganId=${r.body._id}`).set(auth(tP));
    for (const k of list.body) {
      await request(app).delete(`/api/kriteria/${k._id}`).set(auth(tP));
    }
    const res = await request(app).get(`/api/ranking/${r.body._id}`).set(auth(tP));
    expect(res.status).toBe(400);
  });

  test('❌ Perusahaan tidak boleh lihat ranking lowongan milik perusahaan lain → 404', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tA);
    const res = await request(app).get(`/api/ranking/${lowongan._id}`).set(auth(tB));
    expect(res.status).toBe(404);
  });
});
