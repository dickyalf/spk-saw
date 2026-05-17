import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminPelamar() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/admin/pelamar').then((r) => setItems(r.data));
  }, []);

  const toggle = async (userId) => {
    await api.put(`/admin/user/${userId}/toggle`);
    api.get('/admin/pelamar').then((r) => setItems(r.data));
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Manajemen Pelamar</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Nama</th>
              <th>Email</th>
              <th>Kota</th>
              <th>Aktif?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="py-3 font-medium">{p.namaLengkap}</td>
                <td>{p.user?.email}</td>
                <td>{p.kota || '-'}</td>
                <td>
                  <span className={`badge ${p.user?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {p.user?.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="text-right">
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
