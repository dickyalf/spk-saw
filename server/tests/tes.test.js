const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const {
  registerPerusahaan,
  registerPelamar,
  auth,
  buatLowonganLengkap,
  isiCVPelamar,
} = require('./setup/helpers');
const Lamaran = require('../models/Lamaran');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

/** Setup: bikin perusahaan, lowongan + soal, pelamar lamar, lolos administrasi */
async function setupSampaiBolehTes() {
  const { token: tP } = await registerPerusahaan(app);
  const lowongan = await buatLowonganLengkap(app, tP);

  // Buat 2 soal
  const soal1 = await request(app).post('/api/soal-tes').set(auth(tP)).send({
    pertanyaan: 'Soal 1', jenis: 'pilihan_ganda', bobotNilai: 1,
    pilihan: [{teks:'A',kunci:true},{teks:'B'},{teks:'C'},{teks:'D'}],
  });
  const soal2 = await request(app).post('/api/soal-tes').set(auth(tP)).send({
    pertanyaan: 'Soal 2', jenis: 'pilihan_ganda', bobotNilai: 1,
    pilihan: [{teks:'A'},{teks:'B',kunci:true},{teks:'C'},{teks:'D'}],
  });
  await request(app).put(`/api/lowongan/${lowongan._id}/soal`).set(auth(tP))
    .send({ soalIds: [soal1.body._id, soal2.body._id] });

  // Pelamar lamar
  const { token: tA } = await registerPelamar(app);
  await isiCVPelamar(app, tA);
  const lam = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});

  // Lolos administrasi
  await request(app).put(`/api/lamaran/${lam.body._id}/tahap/administrasi`).set(auth(tP))
    .send({ status: 'lolos' });

  return { tP, tA, lowongan, lamaran: lam.body, soal1: soal1.body, soal2: soal2.body };
}

describe('Tes Tulis — Ambil Soal', () => {
  test('✅ GET /tes/:lamaranId/soal saat sudah lolos administrasi → 200', async () => {
    const { tA, lamaran } = await setupSampaiBolehTes();
    const res = await request(app).get(`/api/tes/${lamaran._id}/soal`).set(auth(tA));
    expect(res.status).toBe(200);
    expect(res.body.soal.length).toBe(2);
    // Pilihan TIDAK boleh expose kunci jawaban
    res.body.soal.forEach((s) => {
      s.pilihan.forEach((p) => expect(p.kunci).toBeUndefined());
    });
  });

  test('❌ GET soal sebelum lolos administrasi → 400', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);
    const r = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});

    // belum diset lolos administrasi
    const res = await request(app).get(`/api/tes/${r.body._id}/soal`).set(auth(tA));
    expect(res.status).toBe(400);
  });
});

describe('Tes Tulis — Submit & Auto-grade', () => {
  test('✅ Submit semua jawaban BENAR → nilai 100, statusKeseluruhan=wawancara', async () => {
    const { tA, lamaran, soal1, soal2 } = await setupSampaiBolehTes();
    const res = await request(app)
      .post(`/api/tes/${lamaran._id}/submit`)
      .set(auth(tA))
      .send({
        jawaban: [
          { soalId: soal1._id, pilihanIndex: 0 }, // benar
          { soalId: soal2._id, pilihanIndex: 1 }, // benar
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.nilai).toBe(100);
    expect(res.body.lolos).toBe(true);
    expect(res.body.lamaran.statusKeseluruhan).toBe('wawancara');
  });

  test('✅ Submit semua SALAH → nilai 0, statusKeseluruhan=ditolak', async () => {
    const { tA, lamaran, soal1, soal2 } = await setupSampaiBolehTes();
    const res = await request(app)
      .post(`/api/tes/${lamaran._id}/submit`)
      .set(auth(tA))
      .send({
        jawaban: [
          { soalId: soal1._id, pilihanIndex: 3 }, // salah
          { soalId: soal2._id, pilihanIndex: 3 }, // salah
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.nilai).toBe(0);
    expect(res.body.lolos).toBe(false);
    expect(res.body.lamaran.statusKeseluruhan).toBe('ditolak');
  });

  test('✅ Submit 50% benar dengan nilaiMinimumTes=50 → lolos (boundary)', async () => {
    const { tA, lamaran, soal1, soal2 } = await setupSampaiBolehTes();
    const res = await request(app)
      .post(`/api/tes/${lamaran._id}/submit`)
      .set(auth(tA))
      .send({
        jawaban: [
          { soalId: soal1._id, pilihanIndex: 0 }, // benar
          { soalId: soal2._id, pilihanIndex: 3 }, // salah
        ],
      });
    expect(res.body.nilai).toBe(50);
    expect(res.body.lolos).toBe(true); // tepat di batas
  });

  test('❌ Submit dengan jawaban kosong → 400', async () => {
    const { tA, lamaran } = await setupSampaiBolehTes();
    const res = await request(app).post(`/api/tes/${lamaran._id}/submit`).set(auth(tA)).send({});
    expect(res.status).toBe(400);
  });

  test('✅ Perusahaan bisa lihat jawaban pelamar (audit)', async () => {
    const { tP, tA, lamaran, soal1, soal2 } = await setupSampaiBolehTes();
    await request(app).post(`/api/tes/${lamaran._id}/submit`).set(auth(tA)).send({
      jawaban: [
        { soalId: soal1._id, pilihanIndex: 0 },
        { soalId: soal2._id, pilihanIndex: 2 },
      ],
    });
    const res = await request(app).get(`/api/tes/${lamaran._id}/jawaban`).set(auth(tP));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});
