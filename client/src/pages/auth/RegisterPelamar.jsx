import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPelamar() {
  const { registerPelamar } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    namaLengkap: '',
    email: '',
    password: '',
    nik: '',
    tanggalLahir: '',
    jenisKelamin: '',
    nomorTelepon: '',
    kota: '',
    alamat: '',
  });
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await registerPelamar(form);
      toast.success('Registrasi berhasil! Silakan lengkapi CV Anda.');
      nav('/pelamar/profil');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal registrasi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="card w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-1">Daftar Pelamar</h2>
        <p className="text-sm text-slate-500 mb-6">
          Buat akun untuk melamar lowongan dan memantau status seleksi Anda.
        </p>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <Field label="Nama Lengkap*" value={form.namaLengkap} onChange={onChange('namaLengkap')} required className="md:col-span-2" />
          <Field label="Email*" type="email" value={form.email} onChange={onChange('email')} required />
          <Field label="Password*" type="password" value={form.password} onChange={onChange('password')} required minLength={8} />
          <Field label="NIK" value={form.nik} onChange={onChange('nik')} />
          <Field label="Tanggal Lahir" type="date" value={form.tanggalLahir} onChange={onChange('tanggalLahir')} />
          <div>
            <label className="label">Jenis Kelamin</label>
            <select className="input" value={form.jenisKelamin} onChange={onChange('jenisKelamin')}>
              <option value="">-</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <Field label="Telepon" value={form.nomorTelepon} onChange={onChange('nomorTelepon')} />
          <Field label="Kota" value={form.kota} onChange={onChange('kota')} className="md:col-span-2" />
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
