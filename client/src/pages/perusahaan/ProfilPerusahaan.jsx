import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProfilPerusahaan() {
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/perusahaan/profil').then((r) => setForm(r.data || {}));
  }, []);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const simpan = async (e) => {
    e.preventDefault();
    await api.put('/perusahaan/profil', form);
    toast.success('Profil disimpan');
  };

  const uploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    const r = await api.post('/perusahaan/logo', fd);
    setForm(r.data);
    toast.success('Logo diperbarui');
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-4">Profil Perusahaan</h1>
      <form onSubmit={simpan} className="card space-y-3">
        {form.logo && <img src={form.logo} alt="logo" className="w-24 h-24 object-cover rounded" />}
        <div>
          <label className="label">Upload Logo</label>
          <input type="file" accept="image/*" onChange={uploadLogo} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nama Perusahaan" value={form.namaPerusahaan || ''} onChange={onChange('namaPerusahaan')} />
          <Field label="Industri" value={form.industri || ''} onChange={onChange('industri')} />
          <Field label="Telepon" value={form.nomorTelepon || ''} onChange={onChange('nomorTelepon')} />
          <Field label="Kota" value={form.kota || ''} onChange={onChange('kota')} />
          <Field label="Website" value={form.website || ''} onChange={onChange('website')} className="sm:col-span-2" />
          <Field label="Alamat" value={form.alamat || ''} onChange={onChange('alamat')} className="sm:col-span-2" />
        </div>
        <div>
          <label className="label">Deskripsi Perusahaan</label>
          <textarea rows={4} className="input" value={form.deskripsi || ''} onChange={onChange('deskripsi')} />
        </div>
        <button className="btn-primary">Simpan</button>
      </form>
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
