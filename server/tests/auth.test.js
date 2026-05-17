const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const { registerPerusahaan, registerPelamar, auth } = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

describe('Auth — Register Perusahaan', () => {
  test('✅ POST /auth/register/perusahaan dengan data valid → 200 + token', async () => {
    const { res } = await registerPerusahaan(app, {
      email: 'p1@x.com',
      namaPerusahaan: 'PT Alpha',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('perusahaan');
    expect(res.body.user.email).toBe('p1@x.com');
    expect(res.body.perusahaan.namaPerusahaan).toBe('PT Alpha');
  });

  test('❌ email tidak valid → 400', async () => {
    const res = await request(app).post('/api/auth/register/perusahaan').send({
      email: 'bukan-email',
      password: 'pass12345',
      namaPerusahaan: 'PT X',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('❌ password < 8 karakter → 400', async () => {
    const res = await request(app).post('/api/auth/register/perusahaan').send({
      email: 'p2@x.com',
      password: 'short',
      namaPerusahaan: 'PT X',
    });
    expect(res.status).toBe(400);
  });

  test('❌ namaPerusahaan kosong → 400', async () => {
    const res = await request(app).post('/api/auth/register/perusahaan').send({
      email: 'p3@x.com',
      password: 'pass12345',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/namaPerusahaan/i);
  });

  test('❌ email sudah terdaftar → 400', async () => {
    await registerPerusahaan(app, { email: 'dup@x.com' });
    const res = await request(app).post('/api/auth/register/perusahaan').send({
      email: 'dup@x.com',
      password: 'pass12345',
      namaPerusahaan: 'PT Y',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/sudah terdaftar/i);
  });
});

describe('Auth — Register Pelamar', () => {
  test('✅ POST /auth/register/pelamar dengan data valid → 200 + token', async () => {
    const { res } = await registerPelamar(app, {
      email: 'a1@x.com',
      namaLengkap: 'Andi',
    });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('pelamar');
    expect(res.body.pelamar.namaLengkap).toBe('Andi');
  });

  test('❌ namaLengkap kosong → 400', async () => {
    const res = await request(app).post('/api/auth/register/pelamar').send({
      email: 'a2@x.com',
      password: 'pass12345',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/namaLengkap/i);
  });
});

describe('Auth — Login', () => {
  test('✅ login dengan kredensial benar → 200 + token', async () => {
    await registerPerusahaan(app, { email: 'login@x.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@x.com', password: 'pass12345' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('❌ email tidak terdaftar → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'belum-ada@x.com', password: 'pass12345' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/tidak ditemukan/i);
  });

  test('❌ password salah → 401', async () => {
    await registerPerusahaan(app, { email: 'salah@x.com', password: 'benar12345' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'salah@x.com', password: 'salah-banget' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/salah/i);
  });

  test('❌ email/password tidak dikirim → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('Auth — Me / Protected route', () => {
  test('✅ GET /auth/me dengan token valid → 200 + user data', async () => {
    const { token } = await registerPelamar(app, { email: 'me@x.com', namaLengkap: 'Me' });
    const res = await request(app).get('/api/auth/me').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@x.com');
    expect(res.body.user.pelamar.namaLengkap).toBe('Me');
  });

  test('❌ tanpa header Authorization → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('❌ token tidak valid → 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ngawur');
    expect(res.status).toBe(401);
  });
});

describe('Auth — Change Password', () => {
  test('✅ ganti password dengan oldPassword benar → 200', async () => {
    const { token } = await registerPelamar(app, { email: 'cp@x.com' });
    const res = await request(app)
      .put('/api/auth/change-password')
      .set(auth(token))
      .send({ oldPassword: 'pass12345', newPassword: 'baru12345' });
    expect(res.status).toBe(200);
    // Login pakai password baru harus berhasil
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cp@x.com', password: 'baru12345' });
    expect(login.status).toBe(200);
  });

  test('❌ oldPassword salah → 400', async () => {
    const { token } = await registerPelamar(app, { email: 'cp2@x.com' });
    const res = await request(app)
      .put('/api/auth/change-password')
      .set(auth(token))
      .send({ oldPassword: 'salah-banget', newPassword: 'baru12345' });
    expect(res.status).toBe(400);
  });

  test('❌ password baru < 8 → 400', async () => {
    const { token } = await registerPelamar(app, { email: 'cp3@x.com' });
    const res = await request(app)
      .put('/api/auth/change-password')
      .set(auth(token))
      .send({ oldPassword: 'pass12345', newPassword: 'pndek' });
    expect(res.status).toBe(400);
  });
});
