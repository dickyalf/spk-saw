import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Plus, Trash2, Sparkles } from 'lucide-react';

const JENJANG = ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
const LEVEL = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function ProfilCV() {
  const [profil, setProfil] = useState({});
  const [cv, setCV] = useState({
    ringkasan: '',
    pendidikan: [],
    pengalaman: [],
    skills: [],
    sertifikat: [],
    bahasa: [],
  });
  const [uploading, setUploading] = useState(false);

  const loadAll = async () => {
    const [p, c] = await Promise.all([api.get('/pelamar/profil'), api.get('/cv/me')]);
    setProfil(p.data || {});
    if (c.data) {
      setCV({
        ringkasan: c.data.ringkasan || '',
        pendidikan: c.data.pendidikan || [],
        pengalaman: c.data.pengalaman || [],
        skills: c.data.skills || [],
        sertifikat: c.data.sertifikat || [],
        bahasa: c.data.bahasa || [],
        _id: c.data._id,
        fileAsli: c.data.fileAsli,
        sumber: c.data.sumber,
      });
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const simpanProfil = async () => {
    await api.put('/pelamar/profil', profil);
    toast.success('Profil disimpan');
  };

  const simpanCV = async () => {
    await api.put('/cv/manual', cv);
    toast.success('CV disimpan');
    loadAll();
  };

  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('cv', file);
    try {
      const r = await api.post('/cv/upload', fd);
      toast.success('CV berhasil di-parsing dengan AI');
      setCV({
        ringkasan: r.data.cv.ringkasan,
        pendidikan: r.data.cv.pendidikan,
        pengalaman: r.data.cv.pengalaman,
        skills: r.data.cv.skills,
        sertifikat: r.data.cv.sertifikat || [],
        bahasa: r.data.cv.bahasa || [],
        sumber: r.data.cv.sumber,
        _id: r.data.cv._id,
        fileAsli: r.data.cv.fileAsli,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold">Profil & CV</h1>

      <div className="card space-y-3">
        <h3 className="font-semibold">Data Diri</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Nama Lengkap" value={profil.namaLengkap} onChange={(v) => setProfil({ ...profil, namaLengkap: v })} />
          <F label="NIK" value={profil.nik} onChange={(v) => setProfil({ ...profil, nik: v })} />
          <F label="Telepon" value={profil.nomorTelepon} onChange={(v) => setProfil({ ...profil, nomorTelepon: v })} />
          <F label="Kota" value={profil.kota} onChange={(v) => setProfil({ ...profil, kota: v })} />
        </div>
        <button onClick={simpanProfil} className="btn-primary">
          Simpan Profil
        </button>
      </div>

      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">CV</h3>
            <p className="text-sm text-slate-500">
              Upload CV (PDF) untuk auto-parsing dengan AI, atau isi manual di bawah.
            </p>
            {cv.sumber && (
              <span className="badge bg-brand-100 text-brand-700 mt-1">
                <Sparkles size={12} className="mr-1" /> Sumber: {cv.sumber}
              </span>
            )}
          </div>
          <label className="btn-primary cursor-pointer">
            <Upload size={16} />
            {uploading ? 'Memproses...' : 'Upload CV (PDF)'}
            <input type="file" accept=".pdf,.doc,.docx" onChange={onUpload} className="hidden" />
          </label>
        </div>

        <div>
          <label className="label">Ringkasan</label>
          <textarea
            rows={3}
            className="input"
            value={cv.ringkasan}
            onChange={(e) => setCV({ ...cv, ringkasan: e.target.value })}
          />
        </div>

        {/* Pendidikan */}
        <Section
          title="Pendidikan"
          items={cv.pendidikan}
          onAdd={() =>
            setCV({
              ...cv,
              pendidikan: [...cv.pendidikan, { jenjang: 'S1', institusi: '', jurusan: '' }],
            })
          }
          onRemove={(i) =>
            setCV({ ...cv, pendidikan: cv.pendidikan.filter((_, j) => j !== i) })
          }
          render={(p, i) => (
            <div className="grid sm:grid-cols-5 gap-2">
              <select
                className="input"
                value={p.jenjang}
                onChange={(e) => upd(cv, setCV, 'pendidikan', i, 'jenjang', e.target.value)}
              >
                {JENJANG.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
              <input className="input" placeholder="Institusi" value={p.institusi || ''} onChange={(e) => upd(cv, setCV, 'pendidikan', i, 'institusi', e.target.value)} />
              <input className="input" placeholder="Jurusan" value={p.jurusan || ''} onChange={(e) => upd(cv, setCV, 'pendidikan', i, 'jurusan', e.target.value)} />
              <input type="number" className="input" placeholder="Th Masuk" value={p.tahunMasuk || ''} onChange={(e) => upd(cv, setCV, 'pendidikan', i, 'tahunMasuk', Number(e.target.value))} />
              <input type="number" className="input" placeholder="Th Lulus" value={p.tahunLulus || ''} onChange={(e) => upd(cv, setCV, 'pendidikan', i, 'tahunLulus', Number(e.target.value))} />
            </div>
          )}
        />

        {/* Pengalaman */}
        <Section
          title="Pengalaman Kerja"
          items={cv.pengalaman}
          onAdd={() =>
            setCV({ ...cv, pengalaman: [...cv.pengalaman, { perusahaan: '', posisi: '' }] })
          }
          onRemove={(i) =>
            setCV({ ...cv, pengalaman: cv.pengalaman.filter((_, j) => j !== i) })
          }
          render={(p, i) => (
            <div className="space-y-2">
              <div className="grid sm:grid-cols-4 gap-2">
                <input className="input" placeholder="Perusahaan" value={p.perusahaan || ''} onChange={(e) => upd(cv, setCV, 'pengalaman', i, 'perusahaan', e.target.value)} />
                <input className="input" placeholder="Posisi" value={p.posisi || ''} onChange={(e) => upd(cv, setCV, 'pengalaman', i, 'posisi', e.target.value)} />
                <input type="number" className="input" placeholder="Th Mulai" value={p.tahunMulai || ''} onChange={(e) => upd(cv, setCV, 'pengalaman', i, 'tahunMulai', Number(e.target.value))} />
                <input type="number" className="input" placeholder="Th Selesai (0 = kini)" value={p.tahunSelesai || ''} onChange={(e) => upd(cv, setCV, 'pengalaman', i, 'tahunSelesai', Number(e.target.value))} />
              </div>
              <textarea
                rows={2}
                className="input"
                placeholder="Deskripsi singkat"
                value={p.deskripsi || ''}
                onChange={(e) => upd(cv, setCV, 'pengalaman', i, 'deskripsi', e.target.value)}
              />
            </div>
          )}
        />

        {/* Skills */}
        <Section
          title="Skills"
          items={cv.skills}
          onAdd={() => setCV({ ...cv, skills: [...cv.skills, { nama: '', level: 'intermediate' }] })}
          onRemove={(i) => setCV({ ...cv, skills: cv.skills.filter((_, j) => j !== i) })}
          render={(s, i) => (
            <div className="grid sm:grid-cols-2 gap-2">
              <input className="input" placeholder="Nama skill" value={s.nama || ''} onChange={(e) => upd(cv, setCV, 'skills', i, 'nama', e.target.value)} />
              <select className="input" value={s.level} onChange={(e) => upd(cv, setCV, 'skills', i, 'level', e.target.value)}>
                {LEVEL.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}
        />

        <button onClick={simpanCV} className="btn-primary w-full">
          Simpan CV
        </button>
      </div>
    </div>
  );
}

function upd(cv, setCV, key, i, field, value) {
  const next = [...cv[key]];
  next[i] = { ...next[i], [field]: value };
  setCV({ ...cv, [key]: next });
}

function Section({ title, items, render, onAdd, onRemove }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{title}</h4>
        <button onClick={onAdd} className="btn-secondary py-1 px-2 text-xs">
          <Plus size={14} /> Tambah
        </button>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3 relative">
            {render(it, i)}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-400">Belum ada data</div>}
      </div>
    </div>
  );
}

function F({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
