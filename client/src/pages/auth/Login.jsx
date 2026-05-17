import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Berhasil masuk');
      if (user.role === 'admin') nav('/admin');
      else if (user.role === 'perusahaan') nav('/perusahaan');
      else nav('/pelamar');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal masuk');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-brand-700">SPK SAW</div>
          <div className="text-sm text-slate-500">Masuk ke akun Anda</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500 mt-4 space-y-1">
          <div>
            Belum punya akun?{' '}
            <Link to="/register/pelamar" className="text-brand-600">
              Daftar Pelamar
            </Link>{' '}
            ·{' '}
            <Link to="/register/perusahaan" className="text-brand-600">
              Daftar Perusahaan
            </Link>
          </div>
          <div>
            <Link to="/" className="text-slate-400">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
