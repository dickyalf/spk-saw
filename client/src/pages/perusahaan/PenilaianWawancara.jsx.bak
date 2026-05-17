import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PenilaianWawancara() {
  const { lamaranId } = useParams();
  const [w, setW] = useState(null);
  const [form, setForm] = useState({
    mode: 'offline',
    tanggal: '',
    lokasi: '',
    linkMeeting: '',
    pewawancara: '',
    skorTeknis: '',
    skorKomunikasi: '',
    skorAttitude: '',
    skorMotivasi: '',
    catatan: '',
  });

  useEffect(() => {
    api.get(`/wawancara/${lamaranId}`).then((r) => {
      if (r.data) {
        setW(r.data);
        setForm((f) => ({
          ...f,
          ...r.data,
          tanggal: r.data.tanggal ? r.data.tanggal.slice(0, 16) : '',
        }));
      }
    });
  }, [lamaranId]);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const jadwalkan = async (e) => {
    e.preventDefault();
    await api.post(`/wawancara/${lamaranId}/jadwal`, {
      mode: form.mode,
      tanggal: form.tanggal,
      lokasi: form.lokasi,
      linkMeeting: form.linkMeeting,
      pewawancara: form.pewawancara,
    });
    toast.success('Jadwal dikirim ke pelamar');
  };

  const nilai = async () => {
    await api.put(`/wawancara/${lamaranId}/nilai`, {
      skorTeknis: Number(form.skorTeknis),
      skorKomunikasi: Number(form.skorKomunikasi),
      skorAttitude: Number(form.skorAttitude),
      skorMotivasi: Number(form.skorMotivasi),
      catatan: form.catatan,
    });
    toast.success('Nilai disimpan');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <form onSubmit={jadwalkan} className="card space-y-3">
        <h2 className="font-semibold">Jadwal Wawancara</h2>
        <div>
          <label className="label">Mode</label>
          <select className="input" value={form.mode} onChange={onChange('mode')}>
            <option value="offline">Offline (datang ke kantor)</option>
            <option value="online">Online (Zoom / Google Meet)</option>
          </select>
        </div>
        <div>
          <label className="label">Tanggal & Jam</label>
          <input type="datetime-local" className="input" value={form.tanggal} onChange={onChange('tanggal')} />
        </div>
        {form.mode === 'offline' ? (
          <div>
            <label className="label">Lokasi</label>
            <input className="input" value={form.lokasi || ''} onChange={onChange('lokasi')} placeholder="Alamat kantor / ruangan" />
          </div>
        ) : (
          <div>
            <label className="label">Link Meeting</label>
            <input className="input" value={form.linkMeeting || ''} onChange={onChange('linkMeeting')} placeholder="https://meet.google.com/..." />
          </div>
        )}
        <div>
          <label className="label">Pewawancara</label>
          <input className="input" value={form.pewawancara || ''} onChange={onChange('pewawancara')} />
        </div>
        <button className="btn-primary w-full">Kirim Undangan</button>
      </form>

      <div className="card space-y-3">
        <h2 className="font-semibold">Penilaian Wawancara (0-100)</h2>
        <div className="grid grid-cols-2 gap-3">
          <Score label="Teknis" value={form.skorTeknis} onChange={onChange('skorTeknis')} />
          <Score label="Komunikasi" value={form.skorKomunikasi} onChange={onChange('skorKomunikasi')} />
          <Score label="Attitude" value={form.skorAttitude} onChange={onChange('skorAttitude')} />
          <Score label="Motivasi" value={form.skorMotivasi} onChange={onChange('skorMotivasi')} />
        </div>
        <div>
          <label className="label">Catatan</label>
          <textarea rows={3} className="input" value={form.catatan} onChange={onChange('catatan')} />
        </div>
        <button onClick={nilai} className="btn-primary w-full">
          Simpan Nilai Wawancara
        </button>
      </div>
    </div>
  );
}

function Score({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="number" min="0" max="100" className="input" value={value} onChange={onChange} />
    </div>
  );
}
