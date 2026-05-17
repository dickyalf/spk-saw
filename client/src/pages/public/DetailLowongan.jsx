import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function DetailLowongan() {
  const { id } = useParams();
  const [l, setL] = useState(null);

  useEffect(() => {
    api.get(`/lowongan/${id}`).then((r) => setL(r.data));
  }, [id]);

  if (!l) return <div className="p-10 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-700">
            SPK SAW
          </Link>
          <div className="space-x-2">
            <Link to="/login" className="btn-primary">
              Masuk untuk Melamar
            </Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-sm text-slate-500">{l.perusahaan?.namaPerusahaan}</div>
        <h1 className="text-2xl font-bold mb-2">{l.judul}</h1>
        <div className="flex gap-3 text-sm text-slate-600 mb-6">
          <span>{l.posisi}</span>
          <span>·</span>
          <span>{l.tipeKerja}</span>
          <span>·</span>
          <span>{l.lokasi}</span>
        </div>
        <div className="card space-y-4">
          <Section title="Deskripsi" content={l.deskripsi} />
          <Section title="Kualifikasi" content={l.kualifikasi} />
          <Section title="Tanggung Jawab" content={l.tanggungJawab} />
          {(l.gajiMin || l.gajiMax) && (
            <Section
              title="Range Gaji"
              content={`Rp ${(l.gajiMin || 0).toLocaleString('id-ID')} - Rp ${(l.gajiMax || 0).toLocaleString('id-ID')}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }) {
  if (!content) return null;
  return (
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-slate-600 whitespace-pre-line">{content}</p>
    </div>
  );
}
