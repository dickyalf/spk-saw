import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function RegisterPerusahaan() {
  const { registerPerusahaan } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    namaPerusahaan: '',
    email: '',
    password: '',
    industri: '',
    nomorTelepon: '',
    alamat: '',
    kota: '',
    website: '',
  });
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await registerPerusahaan(form);
      toast.success('Registrasi berhasil');
      nav('/perusahaan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal registrasi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-2xl animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold">SPK SAW</span>
        </Link>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Daftar sebagai Perusahaan</h1>
              <p className="text-sm text-content-muted">Buka lowongan, kelola seleksi, dapatkan kandidat terbaik.</p>
            </div>
          </div>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <Field label="Nama Perusahaan*" value={form.namaPerusahaan} onChange={onChange('namaPerusahaan')} required />
            <Field label="Industri" value={form.industri} onChange={onChange('industri')} />
            <Field label="Email*" type="email" value={form.email} onChange={onChange('email')} required />
            <Field label="Password*" type="password" value={form.password} onChange={onChange('password')} required minLength={8} />
            <Field label="Telepon" value={form.nomorTelepon} onChange={onChange('nomorTelepon')} />
            <Field label="Kota" value={form.kota} onChange={onChange('kota')} />
            <Field label="Website" value={form.website} onChange={onChange('website')} className="md:col-span-2" />
            <Field label="Alamat" value={form.alamat} onChange={onChange('alamat')} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-between items-center mt-2">
              <Link to="/login" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                Sudah punya akun? Masuk
              </Link>
              <button className="btn-primary" disabled={busy}>
                {busy ? 'Memproses...' : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
