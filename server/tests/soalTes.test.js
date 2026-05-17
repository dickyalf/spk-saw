const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPerusahaan, registerPelamar, auth } = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

const soalContoh = () => ({
  pertanyaan: 'Apa ibukota Indonesia?',
  jenis: 'pilihan_ganda',
  kategori: 'umum',
  bobotNilai: 1,
  pilihan: [
    { teks: 'Jakarta', kunci: true },
    { teks: 'Surabaya', kunci: false },
    { teks: 'Bandung', kunci: false },
    { teks: 'Medan', kunci: false },
  ],
});

describe('Soal Tes — CRUD', () => {
  test('✅ POST /soal-tes membuat soal baru', async () => {
    const { token } = await registerPerusahaan(app);
    const res = await request(app).post('/api/soal-tes').set(auth(token)).send(soalContoh());
    expect(res.status).toBe(201);
    expect(res.body.pertanyaan).toMatch(/ibukota/i);
    expect(res.body.pilihan.find((p) => p.kunci).teks).toBe('Jakarta');
  });

  test('✅ GET /soal-tes hanya berisi soal milik perusahaan login', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    await request(app).post('/api/soal-tes').set(auth(tA)).send(soalContoh());
    await request(app).post('/api/soal-tes').set(auth(tA)).send(soalContoh());
    await request(app).post('/api/soal-tes').set(auth(tB)).send(soalContoh());

    const resA = await request(app).get('/api/soal-tes').set(auth(tA));
    const resB = await request(app).get('/api/soal-tes').set(auth(tB));
    expect(resA.body.length).toBe(2);
    expect(resB.body.length).toBe(1);
  });

  test('✅ PUT /soal-tes/:id update soal', async () => {
    const { token } = await registerPerusahaan(app);
    const r = await request(app).post('/api/soal-tes').set(auth(token)).send(soalContoh());
    const res = await request(app)
      .put(`/api/soal-tes/${r.body._id}`)
      .set(auth(token))
      .send({ pertanyaan: 'Direvisi' });
    expect(res.status).toBe(200);
    expect(res.body.pertanyaan).toBe('Direvisi');
  });

  test('✅ DELETE /soal-tes/:id menghapus soal', async () => {
    const { token } = await registerPerusahaan(app);
    const r = await request(app).post('/api/soal-tes').set(auth(token)).send(soalContoh());
    const res = await request(app).delete(`/api/soal-tes/${r.body._id}`).set(auth(token));
    expect(res.status).toBe(200);
  });

  test('❌ PUT /soal-tes/:id milik perusahaan lain → 404', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    const r = await request(app).post('/api/soal-tes').set(auth(tA)).send(soalContoh());
    const res = await request(app)
      .put(`/api/soal-tes/${r.body._id}`)
      .set(auth(tB))
      .send({ pertanyaan: 'Hack' });
    expect(res.status).toBe(404);
  });

  test('❌ POST /soal-tes oleh pelamar → 403', async () => {
    const { token } = await registerPelamar(app);
    const res = await request(app).post('/api/soal-tes').set(auth(token)).send(soalContoh());
    expect(res.status).toBe(403);
  });
});
