import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

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
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ornament */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-md animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold">SPK SAW</span>
        </Link>

        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Selamat datang kembali</h1>
            <p className="text-sm text-content-muted mt-1">Masuk untuk melanjutkan</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="anda@email.com"
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
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Memproses...' : (<>Masuk <ArrowRight size={16} /></>)}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-surface-border text-center text-sm text-content-muted">
            Belum punya akun?{' '}
            <Link to="/register/pelamar" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Daftar Pelamar
            </Link>{' '}
            ·{' '}
            <Link to="/register/perusahaan" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Perusahaan
            </Link>
          </div>
        </div>

        <Link to="/" className="block text-center text-sm text-content-subtle hover:text-content mt-6 transition-colors">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
