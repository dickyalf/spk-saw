import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { MapPin, Briefcase, Search, Sparkles } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function DaftarLowongan() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/lowongan', { params: { q } }).then((r) => setItems(r.data));
  }, [q]);

  return (
    <div className="min-h-screen bg-surface-subtle">
      <nav className="bg-surface border-b border-surface-border sticky top-0 z-10 backdrop-blur-sm bg-surface/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold">SPK SAW</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn-primary">Masuk</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Temukan Pekerjaan Impian</h1>
        <p className="text-content-muted mb-6">Jelajahi lowongan dari perusahaan terbaik.</p>
        <div className="relative mb-8">
          <Search className="absolute left-3 top-2.5 text-content-subtle" size={18} />
          <input
            className="input pl-10 py-2.5"
            placeholder="Cari posisi, perusahaan, kota..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((l) => (
            <Link to={`/lowongan/${l._id}`} key={l._id} className="card-hover group">
              <div className="text-xs text-content-subtle uppercase tracking-wider mb-1">{l.perusahaan?.namaPerusahaan}</div>
              <div className="text-lg font-semibold mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{l.judul}</div>
              <div className="text-sm text-content-muted mb-3">{l.posisi}</div>
              <div className="flex items-center gap-3 text-xs text-content-muted">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} /> {l.tipeKerja}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {l.lokasi || '-'}
                </span>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-content-muted py-12">
              Belum ada lowongan tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
