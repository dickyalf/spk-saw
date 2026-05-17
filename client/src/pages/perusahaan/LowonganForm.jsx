import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function LowonganForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState({
    judul: '',
    posisi: '',
    deskripsi: '',
    kualifikasi: '',
    tanggungJawab: '',
    lokasi: '',
    tipeKerja: 'fulltime',
    gajiMin: '',
    gajiMax: '',
    kuota: 1,
    batasPendaftaran: '',
    durasiTesMenit: 60,
    nilaiMinimumTes: 60,
  });
  const [soalAll, setSoalAll] = useState([]);
  const [soalDipilih, setSoalDipilih] = useState([]);

  useEffect(() => {
    api.get('/soal-tes').then((r) => setSoalAll(r.data));
    if (editing) {
      api.get(`/lowongan/${id}`).then((r) => {
        const d = r.data;
        setForm({
          ...d,
          batasPendaftaran: d.batasPendaftaran ? d.batasPendaftaran.slice(0, 10) : '',
        });
        setSoalDipilih(d.soalTes || []);
      });
    }
  }, [id]);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        gajiMin: Number(form.gajiMin) || 0,
        gajiMax: Number(form.gajiMax) || 0,
        kuota: Number(form.kuota) || 1,
        durasiTesMenit: Number(form.durasiTesMenit) || 60,
        nilaiMinimumTes: Number(form.nilaiMinimumTes) || 60,
      };
      let lowongan;
      if (editing) {
        const r = await api.put(`/lowongan/${id}`, payload);
        lowongan = r.data;
      } else {
        const r = await api.post('/lowongan', payload);
        lowongan = r.data;
        toast.success('Lowongan dibuat — kriteria default SAW otomatis ditambahkan');
      }
      // Update soal tes
      await api.put(`/lowongan/${lowongan._id}/soal`, { soalIds: soalDipilih });
      toast.success('Tersimpan');
      nav('/perusahaan/lowongan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const toggleSoal = (id) => {
    setSoalDipilih((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        {editing ? 'Edit Lowongan' : 'Buat Lowongan Baru'}
      </h1>
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2 space-y-4">
          <Row>
            <Field label="Judul Lowongan*" value={form.judul} onChange={onChange('judul')} required />
            <Field label="Posisi*" value={form.posisi} onChange={onChange('posisi')} required />
          </Row>
          <Field label="Deskripsi" textarea value={form.deskripsi} onChange={onChange('deskripsi')} />
          <Field label="Kualifikasi" textarea value={form.kualifikasi} onChange={onChange('kualifikasi')} />
          <Field label="Tanggung Jawab" textarea value={form.tanggungJawab} onChange={onChange('tanggungJawab')} />
          <Row>
            <Field label="Lokasi" value={form.lokasi} onChange={onChange('lokasi')} />
            <div>
              <label className="label">Tipe Kerja</label>
              <select className="input" value={form.tipeKerja} onChange={onChange('tipeKerja')}>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="kontrak">Kontrak</option>
                <option value="magang">Magang</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </Row>
          <Row>
            <Field label="Gaji Minimum" type="number" value={form.gajiMin} onChange={onChange('gajiMin')} />
            <Field label="Gaji Maksimum" type="number" value={form.gajiMax} onChange={onChange('gajiMax')} />
          </Row>
          <Row>
            <Field label="Kuota" type="number" value={form.kuota} onChange={onChange('kuota')} />
            <Field label="Batas Pendaftaran" type="date" value={form.batasPendaftaran} onChange={onChange('batasPendaftaran')} />
          </Row>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Konfigurasi Tes</h3>
            <Field label="Durasi Tes (menit)" type="number" value={form.durasiTesMenit} onChange={onChange('durasiTesMenit')} />
            <Field label="Nilai Minimum Lolos" type="number" value={form.nilaiMinimumTes} onChange={onChange('nilaiMinimumTes')} />
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Pilih Soal Tes</h3>
            {soalAll.length === 0 && (
              <div className="text-sm text-content-muted">
                Belum ada soal. Buat dulu di menu "Soal Tes".
              </div>
            )}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {soalAll.map((s) => (
                <label key={s._id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={soalDipilih.includes(s._id)}
                    onChange={() => toggleSoal(s._id)}
                  />
                  <span>{s.pertanyaan}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full">
            {editing ? 'Simpan Perubahan' : 'Buat Lowongan'}
          </button>
        </div>
      </form>
    </div>
  );
}

const Row = ({ children }) => <div className="grid sm:grid-cols-2 gap-4">{children}</div>;

function Field({ label, textarea, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? <textarea rows={3} className="input" {...props} /> : <input className="input" {...props} />}
    </div>
  );
}
