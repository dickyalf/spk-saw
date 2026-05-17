const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPelamar, registerPerusahaan, auth } = require('./setup/helpers');
const CV = require('../models/CV');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('CV — Upsert Manual', () => {
  test('✅ PUT /cv/manual saat belum ada CV → create', async () => {
    const { token } = await registerPelamar(app);
    const res = await request(app)
      .put('/api/cv/manual')
      .set(auth(token))
      .send({
        ringkasan: 'Lulusan baru',
        pendidikan: [{ jenjang: 'S1', institusi: 'UNAIR' }],
        skills: [{ nama: 'Python', level: 'intermediate' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.sumber).toBe('manual');
    expect(res.body.pendidikan).toHaveLength(1);
  });

  test('✅ PUT /cv/manual saat sudah ada → update (tidak duplikat)', async () => {
    const { token, pelamar } = await registerPelamar(app);
    await request(app).put('/api/cv/manual').set(auth(token)).send({ ringkasan: 'V1' });
    await request(app).put('/api/cv/manual').set(auth(token)).send({ ringkasan: 'V2' });
    // Hitung HANYA CV milik pelamar ini, supaya tidak bergantung pada DB cleanup global
    const count = await CV.countDocuments({ pelamar: pelamar._id });
    expect(count).toBe(1);
    const res = await request(app).get('/api/cv/me').set(auth(token));
    expect(res.body.ringkasan).toBe('V2');
  });

  test('❌ PUT /cv/manual oleh perusahaan → 403', async () => {
    const { token } = await registerPerusahaan(app);
    const res = await request(app).put('/api/cv/manual').set(auth(token)).send({});
    expect(res.status).toBe(403);
  });
});

describe('CV — Helper methods (model)', () => {
  test('skorPendidikan: ambil jenjang tertinggi', async () => {
    const cv = new CV({
      pelamar: '507f1f77bcf86cd799439011',
      pendidikan: [
        { jenjang: 'SMA/SMK' },
        { jenjang: 'S2' },
        { jenjang: 'S1' },
      ],
    });
    expect(cv.skorPendidikan()).toBe(6); // S2
  });

  test('skorPendidikan: 0 jika tidak ada pendidikan', async () => {
    const cv = new CV({ pelamar: '507f1f77bcf86cd799439011', pendidikan: [] });
    expect(cv.skorPendidikan()).toBe(0);
  });

  test('totalPengalamanTahun: jumlah semua periode', async () => {
    const cv = new CV({
      pelamar: '507f1f77bcf86cd799439011',
      pengalaman: [
        { tahunMulai: 2018, tahunSelesai: 2022 }, // 4
        { tahunMulai: 2022, tahunSelesai: 2024 }, // 2
      ],
    });
    expect(cv.totalPengalamanTahun()).toBe(6);
  });

  test('totalPengalamanTahun: tahunSelesai 0 = sampai sekarang', async () => {
    const tahunIni = new Date().getFullYear();
    const cv = new CV({
      pelamar: '507f1f77bcf86cd799439011',
      pengalaman: [{ tahunMulai: tahunIni - 3, tahunSelesai: 0 }],
    });
    expect(cv.totalPengalamanTahun()).toBe(3);
  });
});
