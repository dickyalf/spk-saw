import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function DetailLowonganPelamar() {
  const { id } = useParams();
  const nav = useNavigate();
  const [l, setL] = useState(null);
  const [surat, setSurat] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/lowongan/${id}`).then((r) => setL(r.data));
  }, [id]);

  const lamar = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/lamaran/${id}`, { suratLamaran: surat });
      toast.success('Lamaran terkirim!');
      nav(`/pelamar/lamaran/${r.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim lamaran');
    } finally {
      setBusy(false);
    }
  };

  if (!l) return <div>Memuat...</div>;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="card">
        <div className="text-sm text-slate-500">{l.perusahaan?.namaPerusahaan}</div>
        <h1 className="text-2xl font-bold mb-2">{l.judul}</h1>
        <div className="flex gap-3 text-sm text-slate-600 mb-4">
          <span>{l.posisi}</span> · <span>{l.tipeKerja}</span> · <span>{l.lokasi}</span>
        </div>
        {l.deskripsi && <Section title="Deskripsi" content={l.deskripsi} />}
        {l.kualifikasi && <Section title="Kualifikasi" content={l.kualifikasi} />}
        {l.tanggungJawab && <Section title="Tanggung Jawab" content={l.tanggungJawab} />}
        {(l.gajiMin || l.gajiMax) && (
          <Section
            title="Gaji"
            content={`Rp ${(l.gajiMin || 0).toLocaleString('id-ID')} - Rp ${(l.gajiMax || 0).toLocaleString('id-ID')}`}
          />
        )}
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold">Surat Lamaran</h3>
        <textarea
          rows={5}
          className="input"
          placeholder="Tulis surat lamaran singkat..."
          value={surat}
          onChange={(e) => setSurat(e.target.value)}
        />
        <button onClick={lamar} className="btn-primary w-full" disabled={busy}>
          {busy ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
        <p className="text-xs text-slate-500">
          Lamaran Anda akan dikirim beserta CV yang sudah Anda isi di profil.
        </p>
      </div>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-slate-600 whitespace-pre-line">{content}</p>
    </div>
  );
}
