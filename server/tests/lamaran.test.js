const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const {
  registerPerusahaan,
  registerPelamar,
  auth,
  buatLowonganLengkap,
  isiCVPelamar,
} = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('Lamaran — Pelamar melamar', () => {
  test('✅ POST /lamaran/:lowonganId setelah CV diisi → 201 + status menunggu', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);

    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);

    const res = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
    expect(res.status).toBe(201);
    expect(res.body.statusKeseluruhan).toBe('menunggu');
  });

  test('❌ Lamar tanpa isi CV → 400', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);

    const res = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/CV/i);
  });

  test('❌ Lamar lowongan yang status=draft → 400', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const r = await request(app).post('/api/lowongan').set(auth(tP)).send({ judul: 'X', posisi: 'Y' });
    // Tidak di-publish

    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);

    const res = await request(app).post(`/api/lamaran/${r.body._id}`).set(auth(tA)).send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/tidak tersedia/i);
  });

  test('❌ Tidak bisa melamar 2x lowongan yang sama → 400', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);

    await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
    const res2 = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
    expect(res2.status).toBe(400);
    expect(res2.body.message).toMatch(/sudah melamar/i);
  });
});

describe('Lamaran — Status update oleh perusahaan', () => {
  async function setupLamaran() {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);
    const r = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
    return { tP, tA, lowongan, lamaran: r.body };
  }

  test('✅ Update tahap administrasi → lolos → statusKeseluruhan menjadi tes', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .put(`/api/lamaran/${lamaran._id}/tahap/administrasi`)
      .set(auth(tP))
      .send({ status: 'lolos' });
    expect(res.status).toBe(200);
    expect(res.body.statusKeseluruhan).toBe('tes');
  });

  test('✅ Update tahap tidak_lolos di mana pun → statusKeseluruhan menjadi ditolak', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .put(`/api/lamaran/${lamaran._id}/tahap/administrasi`)
      .set(auth(tP))
      .send({ status: 'tidak_lolos', catatan: 'Tidak memenuhi syarat' });
    expect(res.status).toBe(200);
    expect(res.body.statusKeseluruhan).toBe('ditolak');
    expect(res.body.administrasi.catatan).toMatch(/tidak memenuhi/i);
  });

  test('❌ Update tahap dengan nama tidak valid → 400', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .put(`/api/lamaran/${lamaran._id}/tahap/aneh`)
      .set(auth(tP))
      .send({ status: 'lolos' });
    expect(res.status).toBe(400);
  });

  test('✅ Finalisasi → diterima → notifikasi terbuat', async () => {
    const { tP, tA, lamaran } = await setupLamaran();
    const res = await request(app)
      .put(`/api/lamaran/${lamaran._id}/finalisasi`)
      .set(auth(tP))
      .send({ keputusan: 'diterima' });
    expect(res.status).toBe(200);
    expect(res.body.statusKeseluruhan).toBe('diterima');

    // Cek notifikasi pelamar
    const notif = await request(app).get('/api/notifikasi').set(auth(tA));
    expect(notif.body.some((n) => /diterima/i.test(n.judul))).toBe(true);
  });

  test('❌ Finalisasi dengan keputusan tidak valid → 400', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .put(`/api/lamaran/${lamaran._id}/finalisasi`)
      .set(auth(tP))
      .send({ keputusan: 'apa-aja' });
    expect(res.status).toBe(400);
  });
});

describe('Lamaran — Pelamar lihat lamarannya', () => {
  test('✅ GET /lamaran/saya hanya lamaran milik pelamar login', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    const { token: tB } = await registerPelamar(app);
    await isiCVPelamar(app, tA);
    await isiCVPelamar(app, tB);
    await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
    await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tB)).send({});

    const resA = await request(app).get('/api/lamaran/saya').set(auth(tA));
    expect(resA.body.length).toBe(1);
  });
});
