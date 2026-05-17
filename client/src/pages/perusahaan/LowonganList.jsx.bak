import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatBadge from '../../components/StatBadge';
import { Plus, Edit, Eye, Trash2, Send, Lock, Trophy } from 'lucide-react';

export default function LowonganList() {
  const [items, setItems] = useState([]);

  const load = () => api.get('/lowongan/saya/list').then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const publish = async (id) => {
    await api.post(`/lowongan/${id}/publish`);
    toast.success('Lowongan dipublikasikan');
    load();
  };
  const close = async (id) => {
    await api.post(`/lowongan/${id}/close`);
    toast.success('Lowongan ditutup');
    load();
  };
  const remove = async (id) => {
    if (!confirm('Hapus lowongan ini?')) return;
    await api.delete(`/lowongan/${id}`);
    toast.success('Dihapus');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Kelola Lowongan</h1>
        <Link to="/perusahaan/lowongan/baru" className="btn-primary">
          <Plus size={16} /> Buat Lowongan
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Judul</th>
              <th>Posisi</th>
              <th>Lokasi</th>
              <th>Tipe</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id} className="border-b last:border-0">
                <td className="py-3 font-medium">{l.judul}</td>
                <td>{l.posisi}</td>
                <td>{l.lokasi || '-'}</td>
                <td className="capitalize">{l.tipeKerja}</td>
                <td><StatBadge status={l.status} /></td>
                <td className="text-right space-x-1">
                  <Link to={`/perusahaan/lowongan/${l._id}/pelamar`} className="btn-secondary py-1 px-2" title="Pelamar">
                    <Eye size={14} />
                  </Link>
                  <Link to={`/perusahaan/lowongan/${l._id}/ranking`} className="btn-secondary py-1 px-2" title="Ranking SAW">
                    <Trophy size={14} />
                  </Link>
                  <Link to={`/perusahaan/lowongan/${l._id}/edit`} className="btn-secondary py-1 px-2" title="Edit">
                    <Edit size={14} />
                  </Link>
                  {l.status === 'draft' && (
                    <button onClick={() => publish(l._id)} className="btn-success py-1 px-2" title="Publish">
                      <Send size={14} />
                    </button>
                  )}
                  {l.status === 'published' && (
                    <button onClick={() => close(l._id)} className="btn-secondary py-1 px-2" title="Tutup">
                      <Lock size={14} />
                    </button>
                  )}
                  <button onClick={() => remove(l._id)} className="btn-danger py-1 px-2" title="Hapus">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Belum ada lowongan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
