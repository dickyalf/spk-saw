/**
 * Helper functions untuk test:
 *   - mendaftarkan perusahaan/pelamar/admin
 *   - login dan mendapat token JWT
 *   - membuat lowongan, kriteria, soal tes, lamaran (skenario umum)
 *
 * Semua helper menerima `app` (supertest sudah dibungkus di pemanggil).
 */
const request = require('supertest');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

let counter = 0;
const uniq = () => ++counter + '_' + Date.now();

async function registerPerusahaan(app, override = {}) {
  const data = {
    email: `hr${uniq()}@test.com`,
    password: 'pass12345',
    namaPerusahaan: 'PT Test',
    industri: 'IT',
    kota: 'Surabaya',
    ...override,
  };
  const res = await request(app).post('/api/auth/register/perusahaan').send(data);
  return { res, body: res.body, token: res.body.token, user: res.body.user, perusahaan: res.body.perusahaan };
}

async function registerPelamar(app, override = {}) {
  const data = {
    email: `a${uniq()}@test.com`,
    password: 'pass12345',
    namaLengkap: 'Test Pelamar',
    ...override,
  };
  const res = await request(app).post('/api/auth/register/pelamar').send(data);
  return { res, body: res.body, token: res.body.token, user: res.body.user, pelamar: res.body.pelamar };
}

async function createAdmin() {
  const user = await User.create({
    email: `admin${uniq()}@test.com`,
    password: 'admin12345',
    role: 'admin',
  });
  return user;
}

async function loginAs(app, email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

// --- helper kompleks ---

async function buatLowonganLengkap(app, tokenPerusahaan) {
  const res = await request(app)
    .post('/api/lowongan')
    .set(auth(tokenPerusahaan))
    .send({
      judul: 'Backend Developer',
      posisi: 'Backend',
      lokasi: 'Surabaya',
      tipeKerja: 'fulltime',
      nilaiMinimumTes: 50,
    });
  // Publish supaya pelamar bisa lamar
  await request(app)
    .post(`/api/lowongan/${res.body._id}/publish`)
    .set(auth(tokenPerusahaan));
  return res.body;
}

async function isiCVPelamar(app, tokenPelamar, override = {}) {
  const res = await request(app)
    .put('/api/cv/manual')
    .set(auth(tokenPelamar))
    .send({
      pendidikan: [{ jenjang: 'S1', institusi: 'Univ A', tahunMasuk: 2018, tahunLulus: 2022 }],
      pengalaman: [{ perusahaan: 'PT B', posisi: 'Dev', tahunMulai: 2022, tahunSelesai: 2025 }],
      skills: [{ nama: 'JavaScript', level: 'advanced' }],
      ...override,
    });
  return res.body;
}

module.exports = {
  registerPerusahaan,
  registerPelamar,
  createAdmin,
  loginAs,
  auth,
  buatLowonganLengkap,
  isiCVPelamar,
};
