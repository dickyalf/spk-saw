import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Briefcase, Users, FileText, Sliders } from 'lucide-react';

export default function PerusahaanDashboard() {
  const [lowongan, setLowongan] = useState([]);
  const [soal, setSoal] = useState([]);

  useEffect(() => {
    api.get('/lowongan/saya/list').then((r) => setLowongan(r.data));
    api.get('/soal-tes').then((r) => setSoal(r.data));
  }, []);

  const stats = [
    { label: 'Total Lowongan', value: lowongan.length, icon: <Briefcase />, to: '/perusahaan/lowongan' },
    { label: 'Lowongan Aktif', value: lowongan.filter((l) => l.status === 'published').length, icon: <Briefcase />, to: '/perusahaan/lowongan' },
    { label: 'Bank Soal', value: soal.length, icon: <FileText />, to: '/perusahaan/soal-tes' },
    { label: 'Kriteria SAW', value: 4, icon: <Sliders />, to: '/perusahaan/kriteria' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Perusahaan</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.to} className="card hover:border-brand-500 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <div className="text-sm text-content-muted">{s.label}</div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Lowongan Terbaru</h2>
          <Link to="/perusahaan/lowongan/baru" className="btn-primary">
            + Buat Lowongan
          </Link>
        </div>
        <div className="space-y-2">
          {lowongan.slice(0, 5).map((l) => (
            <Link
              key={l._id}
              to={`/perusahaan/lowongan/${l._id}/pelamar`}
              className="flex justify-between items-center p-3 hover:bg-surface-subtle rounded-lg"
            >
              <div>
                <div className="font-medium">{l.judul}</div>
                <div className="text-xs text-content-muted">{l.posisi} · {l.lokasi}</div>
              </div>
              <span className="badge bg-surface-muted capitalize">{l.status}</span>
            </Link>
          ))}
          {lowongan.length === 0 && <div className="text-content-muted text-sm">Belum ada lowongan</div>}
        </div>
      </div>
    </div>
  );
}
