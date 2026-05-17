import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { MapPin, Briefcase, Calendar, Sparkles } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function DetailLowongan() {
  const { id } = useParams();
  const [l, setL] = useState(null);

  useEffect(() => {
    api.get(`/lowongan/${id}`).then((r) => setL(r.data));
  }, [id]);

  if (!l) return <div className="min-h-screen bg-surface-subtle flex items-center justify-center text-content-muted">Memuat...</div>;

  return (
    <div className="min-h-screen bg-surface-subtle">
      <nav className="bg-surface border-b border-surface-border sticky top-0 z-10 backdrop-blur-sm bg-surface/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold">SPK SAW</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn-primary">Masuk untuk Melamar</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="card mb-4">
          <div className="text-xs text-content-subtle uppercase tracking-wider mb-1">{l.perusahaan?.namaPerusahaan}</div>
          <h1 className="text-3xl font-bold mb-2">{l.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-content-muted">
            <span className="flex items-center gap-1.5"><Briefcase size={14} /> {l.posisi}</span>
            <span className="flex items-center gap-1.5">·</span>
            <span className="flex items-center gap-1.5 capitalize">{l.tipeKerja}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {l.lokasi}</span>
            {l.batasPendaftaran && (
              <><span>·</span><span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(l.batasPendaftaran).toLocaleDateString('id-ID')}</span></>
            )}
          </div>
        </div>

        <div className="card space-y-5">
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
      <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-content-muted">{title}</h3>
      <p className="text-content leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
