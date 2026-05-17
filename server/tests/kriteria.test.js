const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPerusahaan, registerPelamar, auth, buatLowonganLengkap } = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('Kriteria — List', () => {
  test('✅ GET /kriteria?lowonganId=... mengembalikan kriteria default', async () => {
    const { token } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, token);
    const res = await request(app)
      .get(`/api/kriteria?lowonganId=${lowongan._id}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    const total = res.body.reduce((s, k) => s + k.bobot, 0);
    expect(total).toBeCloseTo(1.0, 2);
  });

  test('❌ GET /kriteria tanpa token → 401', async () => {
    const res = await request(app).get('/api/kriteria');
    expect(res.status).toBe(401);
  });

  test('❌ GET /kriteria oleh pelamar → 403', async () => {
    const { token } = await registerPelamar(app);
    const res = await request(app).get('/api/kriteria').set(auth(token));
    expect(res.status).toBe(403);
  });
});

describe('Kriteria — Create', () => {
  test('✅ POST /kriteria menambah kriteria custom', async () => {
    const { token } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, token);
    const res = await request(app)
      .post('/api/kriteria')
      .set(auth(token))
      .send({
        lowongan: lowongan._id,
        kode: 'C5',
        nama: 'Skill Komunikasi',
        bobot: 0.1,
        tipe: 'benefit',
        kategori: 'custom',
      });
    expect(res.status).toBe(201);
    expect(res.body.kode).toBe('C5');
  });
});

describe('Kriteria — Update & Delete', () => {
  test('✅ PUT /kriteria/:id update bobot oleh pemilik', async () => {
    const { token } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, token);
    const list = await request(app)
      .get(`/api/kriteria?lowonganId=${lowongan._id}`)
      .set(auth(token));
    const id = list.body[0]._id;

    const res = await request(app)
      .put(`/api/kriteria/${id}`)
      .set(auth(token))
      .send({ bobot: 0.5, tipe: 'cost' });
    expect(res.status).toBe(200);
    expect(res.body.bobot).toBe(0.5);
    expect(res.body.tipe).toBe('cost');
  });

  test('❌ PUT /kriteria/:id milik perusahaan lain → 404', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tA);
    const list = await request(app).get(`/api/kriteria?lowonganId=${lowongan._id}`).set(auth(tA));
    const id = list.body[0]._id;

    const res = await request(app).put(`/api/kriteria/${id}`).set(auth(tB)).send({ bobot: 0.99 });
    expect(res.status).toBe(404);
  });

  test('✅ DELETE /kriteria/:id menghapus kriteria', async () => {
    const { token } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, token);
    const list = await request(app).get(`/api/kriteria?lowonganId=${lowongan._id}`).set(auth(token));
    const id = list.body[0]._id;

    const res = await request(app).delete(`/api/kriteria/${id}`).set(auth(token));
    expect(res.status).toBe(200);
    const after = await request(app).get(`/api/kriteria?lowonganId=${lowongan._id}`).set(auth(token));
    expect(after.body.length).toBe(3);
  });
});

describe('Kriteria — Batch update bobot', () => {
  test('✅ PUT /kriteria/bobot-batch update sekaligus', async () => {
    const { token } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, token);
    const list = await request(app).get(`/api/kriteria?lowonganId=${lowongan._id}`).set(auth(token));
    const items = list.body.map((k) => ({ id: k._id, bobot: 0.25 }));

    const res = await request(app)
      .put('/api/kriteria/bobot-batch')
      .set(auth(token))
      .send({ items });
    expect(res.status).toBe(200);
    expect(res.body.every((k) => k.bobot === 0.25)).toBe(true);
  });
});
