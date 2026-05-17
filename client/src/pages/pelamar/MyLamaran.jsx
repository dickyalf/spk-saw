import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatBadge from '../../components/StatBadge';

export default function MyLamaran() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/lamaran/saya').then((r) => setItems(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Lamaran Saya</h1>
      <div className="space-y-2">
        {items.map((l) => (
          <Link
            key={l._id}
            to={`/pelamar/lamaran/${l._id}`}
            className="card flex justify-between items-center hover:border-brand-500"
          >
            <div>
              <div className="font-medium">{l.lowongan?.judul}</div>
              <div className="text-xs text-slate-500">
                {l.lowongan?.posisi} · Dilamar {new Date(l.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
            <StatBadge status={l.statusKeseluruhan} />
          </Link>
        ))}
        {items.length === 0 && (
          <div className="text-center text-slate-500 py-8">Belum ada lamaran</div>
        )}
      </div>
    </div>
  );
}
