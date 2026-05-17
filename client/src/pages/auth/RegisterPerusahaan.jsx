import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="card w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-1">Daftar Perusahaan</h2>
        <p className="text-sm text-slate-500 mb-6">
          Buat akun untuk membuka lowongan dan mengelola seleksi kandidat.
        </p>
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
            <Link to="/login" className="text-sm text-brand-600">
              Sudah punya akun? Masuk
            </Link>
            <button className="btn-primary" disabled={busy}>
              {busy ? 'Memproses...' : 'Daftar'}
            </button>
          </div>
        </form>
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
