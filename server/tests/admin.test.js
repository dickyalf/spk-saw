const request = require('supertest');
const { buildApp, ensureMongoConnected } = require('./setup/testApp');
const {
  registerPerusahaan,
  registerPelamar,
  createAdmin,
  loginAs,
  auth,
} = require('./setup/helpers');

let app;
beforeAll(async () => {
  await ensureMongoConnected();
  app = buildApp();
});

async function getAdminToken() {
  const admin = await createAdmin();
  return loginAs(app, admin.email, 'admin12345');
}

describe('Admin — Statistik', () => {
  test('✅ GET /admin/statistik mengembalikan semua hitungan', async () => {
    const tAdmin = await getAdminToken();
    await registerPerusahaan(app);
    await registerPelamar(app);
    await registerPelamar(app);

    const res = await request(app).get('/api/admin/statistik').set(auth(tAdmin));
    expect(res.status).toBe(200);
    expect(res.body.totalPerusahaan).toBeGreaterThanOrEqual(1);
    expect(res.body.totalPelamar).toBeGreaterThanOrEqual(2);
    expect(res.body.totalUser).toBeGreaterThanOrEqual(4); // 1 admin + 1 p + 2 a
  });

  test('❌ Statistik tanpa role admin → 403', async () => {
    const { token } = await registerPerusahaan(app);
    const res = await request(app).get('/api/admin/statistik').set(auth(token));
    expect(res.status).toBe(403);
  });
});

describe('Admin — Verifikasi Perusahaan', () => {
  test('✅ PUT /admin/perusahaan/:id/verifikasi mengubah status', async () => {
    const tAdmin = await getAdminToken();
    const { perusahaan } = await registerPerusahaan(app);

    const res = await request(app)
      .put(`/api/admin/perusahaan/${perusahaan._id}/verifikasi`)
      .set(auth(tAdmin))
      .send({ statusVerifikasi: 'verified' });
    expect(res.status).toBe(200);
    expect(res.body.statusVerifikasi).toBe('verified');
  });
});

describe('Admin — Toggle User', () => {
  test('✅ PUT /admin/user/:id/toggle membalik isActive', async () => {
    const tAdmin = await getAdminToken();
    const { user } = await registerPerusahaan(app);

    const off = await request(app).put(`/api/admin/user/${user.id}/toggle`).set(auth(tAdmin));
    expect(off.status).toBe(200);
    expect(off.body.isActive).toBe(false);

    const on = await request(app).put(`/api/admin/user/${user.id}/toggle`).set(auth(tAdmin));
    expect(on.body.isActive).toBe(true);
  });

  test('❌ User yang sudah dinonaktifkan tidak bisa login → 403', async () => {
    const tAdmin = await getAdminToken();
    const { user } = await registerPerusahaan(app, { email: 'block@x.com' });
    await request(app).put(`/api/admin/user/${user.id}/toggle`).set(auth(tAdmin));
    const res = await request(app).post('/api/auth/login').send({ email: 'block@x.com', password: 'pass12345' });
    expect(res.status).toBe(403);
  });
});
