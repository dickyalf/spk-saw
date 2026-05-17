import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Check } from 'lucide-react';

export default function Notifikasi() {
  const [items, setItems] = useState([]);

  const load = () => api.get('/notifikasi').then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const bacaSemua = async () => {
    await api.put('/notifikasi/baca-semua');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Notifikasi</h1>
        <button onClick={bacaSemua} className="btn-secondary">
          <Check size={16} /> Tandai semua dibaca
        </button>
      </div>
      <div className="space-y-2">
        {items.map((n) => (
          <Link
            key={n._id}
            to={n.link || '#'}
            className={`card flex items-start gap-3 ${
              !n.dibaca ? 'border-brand-500 bg-brand-50/40' : ''
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                n.tipe === 'sukses'
                  ? 'bg-emerald-500'
                  : n.tipe === 'gagal'
                  ? 'bg-red-500'
                  : n.tipe === 'peringatan'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
            />
            <div className="flex-1">
              <div className="font-medium">{n.judul}</div>
              <div className="text-sm text-content-muted">{n.pesan}</div>
              <div className="text-xs text-content-subtle mt-1">
                {new Date(n.createdAt).toLocaleString('id-ID')}
              </div>
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="text-center text-content-muted py-8">Belum ada notifikasi.</div>
        )}
      </div>
    </div>
  );
}
