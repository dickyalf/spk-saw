import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatBadge from '../../components/StatBadge';

export default function AdminPerusahaan() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/admin/perusahaan').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const verifikasi = async (id, status) => {
    await api.put(`/admin/perusahaan/${id}/verifikasi`, { statusVerifikasi: status });
    toast.success(`Diset: ${status}`);
    load();
  };

  const toggle = async (userId) => {
    await api.put(`/admin/user/${userId}/toggle`);
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Manajemen Perusahaan</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Perusahaan</th>
              <th>Email</th>
              <th>Verifikasi</th>
              <th>Aktif?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="py-3">
                  <div className="font-medium">{p.namaPerusahaan}</div>
                  <div className="text-xs text-slate-500">{p.industri}</div>
                </td>
                <td>{p.user?.email}</td>
                <td><StatBadge status={p.statusVerifikasi} /></td>
                <td>
                  <span className={`badge ${p.user?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {p.user?.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="text-right space-x-1">
                  {p.statusVerifikasi !== 'verified' && (
                    <button onClick={() => verifikasi(p._id, 'verified')} className="btn-success py-1 px-2 text-xs">
                      Verifikasi
                    </button>
                  )}
                  {p.statusVerifikasi !== 'rejected' && (
                    <button onClick={() => verifikasi(p._id, 'rejected')} className="btn-danger py-1 px-2 text-xs">
                      Tolak
                    </button>
                  )}
                  <button onClick={() => toggle(p.user._id)} className="btn-secondary py-1 px-2 text-xs">
                    {p.user?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
