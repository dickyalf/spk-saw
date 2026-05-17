import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';

export default function TesTulis() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [jawaban, setJawaban] = useState({});
  const [sisaWaktu, setSisaWaktu] = useState(0);

  useEffect(() => {
    api
      .get(`/tes/${id}/soal`)
      .then((r) => {
        setData(r.data);
        setSisaWaktu((r.data.lowongan.durasiTesMenit || 60) * 60);
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Gagal memuat tes');
        nav(`/pelamar/lamaran/${id}`);
      });
  }, [id]);

  useEffect(() => {
    if (sisaWaktu <= 0) return;
    const t = setInterval(() => setSisaWaktu((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [sisaWaktu]);

  useEffect(() => {
    if (sisaWaktu === 0 && data) submit();
    // eslint-disable-next-line
  }, [sisaWaktu]);

  const submit = async () => {
    const payload = data.soal.map((s) => ({
      soalId: s._id,
      pilihanIndex: jawaban[s._id]?.pilihanIndex,
      teksJawaban: jawaban[s._id]?.teksJawaban,
    }));
    try {
      const r = await api.post(`/tes/${id}/submit`, { jawaban: payload });
      toast.success(
        `Tes selesai. Nilai: ${r.data.nilai}/100 (${r.data.lolos ? 'LOLOS' : 'TIDAK LOLOS'})`,
        { duration: 6000 }
      );
      nav(`/pelamar/lamaran/${id}`);
    } catch (err) {
      toast.error('Gagal submit');
    }
  };

  if (!data) return <div>Memuat tes...</div>;

  const mm = String(Math.floor(sisaWaktu / 60)).padStart(2, '0');
  const ss = String(sisaWaktu % 60).padStart(2, '0');

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="card flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold">Tes Tulis — {data.lowongan.judul}</h1>
        <div className={`flex items-center gap-1 font-mono ${sisaWaktu < 60 ? 'text-red-600' : ''}`}>
          <Clock size={16} /> {mm}:{ss}
        </div>
      </div>

      {data.soal.map((s, i) => (
        <div key={s._id} className="card">
          <div className="text-xs text-slate-400 mb-1">Soal {i + 1} · {s.kategori}</div>
          <div className="font-medium mb-3">{s.pertanyaan}</div>
          {s.jenis === 'pilihan_ganda' ? (
            <div className="space-y-2">
              {s.pilihan.map((p, j) => (
                <label key={j} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name={s._id}
                    checked={jawaban[s._id]?.pilihanIndex === j}
                    onChange={() => setJawaban({ ...jawaban, [s._id]: { pilihanIndex: j } })}
                  />
                  <span>
                    {String.fromCharCode(65 + j)}. {p.teks}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={4}
              className="input"
              value={jawaban[s._id]?.teksJawaban || ''}
              onChange={(e) =>
                setJawaban({ ...jawaban, [s._id]: { teksJawaban: e.target.value } })
              }
            />
          )}
        </div>
      ))}

      <button onClick={submit} className="btn-primary w-full">
        Kumpulkan Jawaban
      </button>
    </div>
  );
}
