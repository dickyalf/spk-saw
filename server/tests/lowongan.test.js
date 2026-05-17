const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPerusahaan, registerPelamar, auth } = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('Lowongan — Create (Perusahaan)', () => {
  test('✅ POST /lowongan oleh perusahaan → 201 + auto-generate 4 kriteria SAW default', async () => {
    const { token } = await registerPerusahaan(app);
    const res = await request(app)
      .post('/api/lowongan')
      .set(auth(token))
      .send({ judul: 'Frontend Dev', posisi: 'Frontend', lokasi: 'Jakarta' });

    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.judul).toBe('Frontend Dev');
    expect(res.body.status).toBe('draft');

    // Cek 4 kriteria default ter-generate
    const kr = await request(app)
      .get(`/api/kriteria?lowonganId=${res.body._id}`)
      .set(auth(token));
    expect(kr.status).toBe(200);
    expect(kr.body).toHaveLength(4);
    const kategori = kr.body.map((k) => k.kategori).sort();
    expect(kategori).toEqual(['pendidikan', 'pengalaman', 'tes', 'wawancara']);
  });

  test('❌ POST /lowongan tanpa token → 401', async () => {
    const res = await request(app).post('/api/lowongan').send({ judul: 'X', posisi: 'Y' });
    expect(res.status).toBe(401);
  });

  test('❌ POST /lowongan oleh pelamar → 403', async () => {
    const { token } = await registerPelamar(app);
    const res = await request(app)
      .post('/api/lowongan')
      .set(auth(token))
      .send({ judul: 'X', posisi: 'Y' });
    expect(res.status).toBe(403);
  });
});

describe('Lowongan — List & Detail', () => {
  test('✅ GET /lowongan (publik) hanya tampil yg status=published', async () => {
    const { token } = await registerPerusahaan(app);
    // Buat 2 lowongan: 1 draft, 1 published
    const l1 = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'Draft Job', posisi: 'A' });
    const l2 = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'Live Job', posisi: 'B' });
    await request(app).post(`/api/lowongan/${l2.body._id}/publish`).set(auth(token));

    const res = await request(app).get('/api/lowongan'); // tanpa auth = public
    expect(res.status).toBe(200);
    const judul = res.body.map((x) => x.judul);
    expect(judul).toContain('Live Job');
    expect(judul).not.toContain('Draft Job');
  });

  test('✅ GET /lowongan?q=keyword filter berfungsi', async () => {
    const { token } = await registerPerusahaan(app);
    const a = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'Backend Senior', posisi: 'BE' });
    const b = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'Frontend Junior', posisi: 'FE' });
    await request(app).post(`/api/lowongan/${a.body._id}/publish`).set(auth(token));
    await request(app).post(`/api/lowongan/${b.body._id}/publish`).set(auth(token));

    const res = await request(app).get('/api/lowongan?q=backend');
    expect(res.status).toBe(200);
    expect(res.body.some((x) => /backend/i.test(x.judul))).toBe(true);
    expect(res.body.some((x) => /frontend/i.test(x.judul))).toBe(false);
  });

  test('✅ GET /lowongan/saya/list hanya berisi lowongan milik perusahaan login', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    await request(app).post('/api/lowongan').set(auth(tA)).send({ judul: 'A1', posisi: 'A' });
    await request(app).post('/api/lowongan').set(auth(tA)).send({ judul: 'A2', posisi: 'A' });
    await request(app).post('/api/lowongan').set(auth(tB)).send({ judul: 'B1', posisi: 'B' });

    const resA = await request(app).get('/api/lowongan/saya/list').set(auth(tA));
    expect(resA.body).toHaveLength(2);
    const resB = await request(app).get('/api/lowongan/saya/list').set(auth(tB));
    expect(resB.body).toHaveLength(1);
  });

  test('❌ GET /lowongan/:id dengan id tidak ada → 404', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/lowongan/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe('Lowongan — Update / Publish / Close / Delete', () => {
  test('✅ PUT /lowongan/:id oleh pemilik → 200', async () => {
    const { token } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'Old', posisi: 'X' });
    const res = await request(app)
      .put(`/api/lowongan/${r.body._id}`)
      .set(auth(token))
      .send({ judul: 'New', posisi: 'X' });
    expect(res.status).toBe(200);
    expect(res.body.judul).toBe('New');
  });

  test('❌ PUT /lowongan/:id oleh perusahaan lain → 404', async () => {
    const { token: tA } = await registerPerusahaan(app);
    const { token: tB } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(tA)).send({ judul: 'A', posisi: 'X' });
    const res = await request(app)
      .put(`/api/lowongan/${r.body._id}`)
      .set(auth(tB))
      .send({ judul: 'Hack' });
    expect(res.status).toBe(404);
  });

  test('✅ POST /lowongan/:id/publish → status menjadi published', async () => {
    const { token } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'X', posisi: 'Y' });
    const res = await request(app).post(`/api/lowongan/${r.body._id}/publish`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('published');
  });

  test('✅ POST /lowongan/:id/close → status menjadi closed', async () => {
    const { token } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'X', posisi: 'Y' });
    await request(app).post(`/api/lowongan/${r.body._id}/publish`).set(auth(token));
    const res = await request(app).post(`/api/lowongan/${r.body._id}/close`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });

  test('✅ DELETE /lowongan/:id sekaligus hapus kriteria-nya', async () => {
    const { token } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(token)).send({ judul: 'X', posisi: 'Y' });
    const id = r.body._id;
    const res = await request(app).delete(`/api/lowongan/${id}`).set(auth(token));
    expect(res.status).toBe(200);

    // Cek lowongan benar-benar hilang
    const after = await request(app).get(`/api/lowongan/${id}`);
    expect(after.status).toBe(404);

    // Kriteria juga harus hilang
    const Kriteria = require('../models/Kriteria');
    const count = await Kriteria.countDocuments({ lowongan: id });
    expect(count).toBe(0);
  });
});
