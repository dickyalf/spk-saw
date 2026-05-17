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

async function setupLamaran() {
  const { token: tP } = await registerPerusahaan(app);
  const lowongan = await buatLowonganLengkap(app, tP);
  const { token: tA } = await registerPelamar(app);
  await isiCVPelamar(app, tA);
  const r = await request(app).post(`/api/lamaran/${lowongan._id}`).set(auth(tA)).send({});
  return { tP, tA, lamaran: r.body };
}

describe('Wawancara — Jadwalkan', () => {
  test('✅ POST /wawancara/:id/jadwal MODE ONLINE → 200 + simpan link', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .post(`/api/wawancara/${lamaran._id}/jadwal`)
      .set(auth(tP))
      .send({
        mode: 'online',
        tanggal: new Date(Date.now() + 86400e3),
        linkMeeting: 'https://meet.google.com/abc-defg-hij',
        pewawancara: 'Pak Budi',
      });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('online');
    expect(res.body.linkMeeting).toMatch(/meet\.google\.com/);
  });

  test('✅ POST jadwal MODE OFFLINE → simpan lokasi', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .post(`/api/wawancara/${lamaran._id}/jadwal`)
      .set(auth(tP))
      .send({
        mode: 'offline',
        tanggal: new Date(Date.now() + 86400e3),
        lokasi: 'Kantor Jakarta Lt. 5',
      });
    expect(res.status).toBe(200);
    expect(res.body.lokasi).toMatch(/kantor jakarta/i);
  });

  test('✅ Jadwal kirim notifikasi ke pelamar', async () => {
    const { tP, tA, lamaran } = await setupLamaran();
    await request(app).post(`/api/wawancara/${lamaran._id}/jadwal`).set(auth(tP)).send({
      mode: 'offline',
      tanggal: new Date(Date.now() + 86400e3),
      lokasi: 'X',
    });
    const notif = await request(app).get('/api/notifikasi').set(auth(tA));
    expect(notif.body.some((n) => /wawancara/i.test(n.judul))).toBe(true);
  });

  test('❌ Pelamar tidak boleh menjadwalkan wawancaranya sendiri → 403', async () => {
    const { tA, lamaran } = await setupLamaran();
    const res = await request(app)
      .post(`/api/wawancara/${lamaran._id}/jadwal`)
      .set(auth(tA))
      .send({ mode: 'online' });
    expect(res.status).toBe(403);
  });
});

describe('Wawancara — Input Nilai', () => {
  test('✅ PUT /wawancara/:id/nilai → skorAkhir = rata-rata 4 aspek', async () => {
    const { tP, lamaran } = await setupLamaran();
    // Jadwalkan dulu
    await request(app).post(`/api/wawancara/${lamaran._id}/jadwal`).set(auth(tP)).send({
      mode: 'online',
      tanggal: new Date(Date.now() + 86400e3),
    });
    const res = await request(app)
      .put(`/api/wawancara/${lamaran._id}/nilai`)
      .set(auth(tP))
      .send({
        skorTeknis: 80,
        skorKomunikasi: 90,
        skorAttitude: 85,
        skorMotivasi: 75,
        catatan: 'Bagus',
      });
    expect(res.status).toBe(200);
    expect(res.body.wawancara.skorAkhir).toBeCloseTo((80 + 90 + 85 + 75) / 4, 2);
    // Sinkron ke lamaran
    expect(res.body.lamaran.wawancara.nilai).toBeCloseTo(82.5, 2);
    expect(res.body.lamaran.statusKeseluruhan).toBe('ranking');
  });

  test('❌ Input nilai tanpa pernah dijadwalkan dulu → 404', async () => {
    const { tP, lamaran } = await setupLamaran();
    const res = await request(app)
      .put(`/api/wawancara/${lamaran._id}/nilai`)
      .set(auth(tP))
      .send({ skorTeknis: 80 });
    expect(res.status).toBe(404);
  });
});
