import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Download, Award, RefreshCw } from 'lucide-react';

export default function RankingSAW() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const hitung = () => {
    setLoading(true);
    api
      .get(`/ranking/${id}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Gagal'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    hitung();
  }, [id]);

  const finalisasi = async (lamaranId, keputusan) => {
    await api.put(`/lamaran/${lamaranId}/finalisasi`, { keputusan });
    toast.success(`Pelamar ${keputusan === 'diterima' ? 'diterima' : 'ditolak'}`);
    hitung();
  };

  const downloadPdf = async () => {
    const res = await api.get(`/laporan/lowongan/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  };

  if (!data) return <div>Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Ranking SAW</h1>
          <div className="text-sm text-content-muted">
            {data.lowongan.judul} — {data.lowongan.posisi}
          </div>
        </div>
        <div className="space-x-2">
          <button onClick={hitung} disabled={loading} className="btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Hitung Ulang
          </button>
          <button onClick={downloadPdf} className="btn-primary">
            <Download size={16} /> Unduh PDF
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Kriteria & Bobot</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-content-muted border-b">
              <th className="py-2">Kode</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Tipe</th>
              <th>Bobot</th>
            </tr>
          </thead>
          <tbody>
            {data.kriteria.map((k) => (
              <tr key={k._id} className="border-b last:border-0">
                <td className="py-2 font-mono">{k.kode}</td>
                <td>{k.nama}</td>
                <td className="capitalize">{k.kategori}</td>
                <td className="capitalize">{k.tipe}</td>
                <td>{k.bobot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Hasil Pemeringkatan</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-content-muted border-b">
              <th className="py-2 w-12">#</th>
              <th>Nama</th>
              {data.kriteria.map((k) => (
                <th key={k._id} className="text-center">
                  {k.kode}
                </th>
              ))}
              <th className="text-right">Skor SAW</th>
              <th className="text-right">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.hasil.map((h) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="py-3">
                  {h.ranking === 1 ? (
                    <span className="text-amber-500 inline-flex items-center gap-1">
                      <Award size={16} /> 1
                    </span>
                  ) : (
                    h.ranking
                  )}
                </td>
                <td>
                  <div className="font-medium">{h.nama}</div>
                  <div className="text-xs text-content-muted">{h.email}</div>
                </td>
                {h.nilai.map((v, i) => (
                  <td key={i} className="text-center">
                    {v}
                  </td>
                ))}
                <td className="text-right font-bold">{h.skor.toFixed(4)}</td>
                <td className="text-right capitalize text-xs">{h.statusKeseluruhan}</td>
                <td className="text-right">
                  <button
                    onClick={() => finalisasi(h.lamaranId, 'diterima')}
                    className="btn-success py-1 px-2 text-xs"
                  >
                    Terima
                  </button>
                  <button
                    onClick={() => finalisasi(h.lamaranId, 'ditolak')}
                    className="btn-danger py-1 px-2 text-xs ml-1"
                  >
                    Tolak
                  </button>
                </td>
              </tr>
            ))}
            {data.hasil.length === 0 && (
              <tr>
                <td colSpan={4 + data.kriteria.length} className="py-8 text-center text-content-muted">
                  Belum ada pelamar untuk diperingkatkan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
