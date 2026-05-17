import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { MapPin, Briefcase, Search } from 'lucide-react';

export default function BrowseLowongan() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/lowongan', { params: { q } }).then((r) => setItems(r.data));
  }, [q]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Cari Lowongan</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          className="input pl-10"
          placeholder="Cari posisi, perusahaan..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((l) => (
          <Link
            to={`/pelamar/lowongan/${l._id}`}
            key={l._id}
            className="card hover:border-brand-500 transition"
          >
            <div className="text-sm text-slate-500">{l.perusahaan?.namaPerusahaan}</div>
            <div className="font-semibold">{l.judul}</div>
            <div className="text-xs text-slate-500 mt-1">{l.posisi}</div>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {l.tipeKerja}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {l.lokasi || '-'}
              </span>
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 py-8">
            Tidak ada lowongan yang cocok
          </div>
        )}
      </div>
    </div>
  );
}
