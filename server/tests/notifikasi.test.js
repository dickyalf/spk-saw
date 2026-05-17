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

describe('Notifikasi — Auto-generated saat event', () => {
  test('✅ Pelamar lamar → notifikasi "Lamaran berhasil dikirim"', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);
    await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});

    const notif = await request(app).get('/api/notifikasi').set(auth(tA));
    expect(notif.body.some((n) => /berhasil dikirim/i.test(n.judul))).toBe(true);
  });
});

describe('Notifikasi — Read', () => {
  test('✅ PUT /notifikasi/:id/baca → dibaca menjadi true', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);
    await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});

    const list = await request(app).get('/api/notifikasi').set(auth(tA));
    const id = list.body[0]._id;
    const res = await request(app).put(`/api/notifikasi/${id}/baca`).set(auth(tA));
    expect(res.body.dibaca).toBe(true);
  });

  test('✅ PUT /notifikasi/baca-semua → semua jadi dibaca', async () => {
    const { token: tP } = await registerPerusahaan(app);
    const lowongan = await buatLowonganLengkap(app, tP);
    const { token: tA } = await registerPelamar(app);
    await isiCVPelamar(app, tA);
    await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});

    await request(app).put('/api/notifikasi/baca-semua').set(auth(tA));
    const after = await request(app).get('/api/notifikasi').set(auth(tA));
    expect(after.body.every((n) => n.dibaca)).toBe(true);
  });

  test('❌ List notifikasi tanpa token → 401', async () => {
    const res = await request(app).get('/api/notifikasi');
    expect(res.status).toBe(401);
  });
});
