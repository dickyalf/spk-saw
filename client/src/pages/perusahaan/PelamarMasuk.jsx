import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatBadge from '../../components/StatBadge';

export default function PelamarMasuk() {
  const { id } = useParams();
  const [items, setItems] = useState([]);

  const load = () => api.get(`/lamaran/lowongan/${id}`).then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, [id]);

  const ubahTahap = async (lamaranId, tahap, status) => {
    await api.put(`/lamaran/${lamaranId}/tahap/${tahap}`, { status });
    toast.success('Status diperbarui');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Pelamar Masuk</h1>
        <Link to={`/perusahaan/lowongan/${id}/ranking`} className="btn-primary">
          Hitung Ranking SAW
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Pelamar</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Administrasi</th>
              <th>Tes</th>
              <th>Wawancara</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id} className="border-b last:border-0">
                <td className="py-3">
                  <div className="font-medium">{l.pelamar?.namaLengkap}</div>
                  <div className="text-xs text-slate-500">{l.pelamar?.user?.email}</div>
                </td>
                <td>{new Date(l.createdAt).toLocaleDateString('id-ID')}</td>
                <td><StatBadge status={l.statusKeseluruhan} /></td>
                <td>
                  <select
                    className="input py-1 text-xs"
                    value={l.administrasi?.status || 'belum'}
                    onChange={(e) => ubahTahap(l._id, 'administrasi', e.target.value)}
                  >
                    <option value="belum">Belum</option>
                    <option value="lolos">Lolos</option>
                    <option value="tidak_lolos">Tidak Lolos</option>
                  </select>
                </td>
                <td>
                  <div className="text-xs">
                    Nilai: <b>{l.tes?.nilai ?? '-'}</b>
                  </div>
                  <StatBadge status={l.tes?.status || 'belum'} />
                </td>
                <td>
                  <Link
                    to={`/perusahaan/lowongan/${id}/wawancara/${l._id}`}
                    className="btn-secondary py-1 px-2 text-xs"
                  >
                    Atur / Nilai
                  </Link>
                  {l.wawancara?.nilai != null && (
                    <div className="text-xs mt-1">Skor: <b>{l.wawancara.nilai}</b></div>
                  )}
                </td>
                <td className="text-right">
                  <div className="text-xs">SAW: <b>{l.skorSAW?.toFixed(4) ?? '-'}</b></div>
                  {l.rankingSAW && <div className="text-xs">Rank: #{l.rankingSAW}</div>}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">Belum ada pelamar</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
