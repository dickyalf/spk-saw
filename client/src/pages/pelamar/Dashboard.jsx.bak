import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Send, FileText, Briefcase } from 'lucide-react';
import StatBadge from '../../components/StatBadge';

export default function PelamarDashboard() {
  const [lamaran, setLamaran] = useState([]);
  const [cv, setCV] = useState(null);

  useEffect(() => {
    api.get('/lamaran/saya').then((r) => setLamaran(r.data));
    api.get('/cv/me').then((r) => setCV(r.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Halo, selamat datang!</h1>

      {!cv && (
        <div className="card border-amber-300 bg-amber-50">
          <div className="font-semibold text-amber-700">⚠️ CV Anda belum lengkap</div>
          <p className="text-sm text-amber-700 mt-1">
            Lengkapi CV Anda dulu sebelum melamar pekerjaan.
          </p>
          <Link to="/pelamar/profil" className="btn-primary mt-3 inline-flex">
            Lengkapi CV
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={<Send />} label="Total Lamaran" value={lamaran.length} to="/pelamar/lamaran" />
        <Stat icon={<FileText />} label="Sedang Proses" value={lamaran.filter((l) => !['diterima', 'ditolak'].includes(l.statusKeseluruhan)).length} to="/pelamar/lamaran" />
        <Stat icon={<Briefcase />} label="Cari Lowongan" value="→" to="/pelamar/lowongan" />
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Lamaran Terbaru</h3>
        <div className="space-y-2">
          {lamaran.slice(0, 5).map((l) => (
            <Link
              key={l._id}
              to={`/pelamar/lamaran/${l._id}`}
              className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg"
            >
              <div>
                <div className="font-medium">{l.lowongan?.judul}</div>
                <div className="text-xs text-slate-500">{l.lowongan?.posisi}</div>
              </div>
              <StatBadge status={l.statusKeseluruhan} />
            </Link>
          ))}
          {lamaran.length === 0 && (
            <div className="text-slate-500 text-sm">Belum ada lamaran</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, to }) {
  return (
    <Link to={to} className="card flex items-center gap-3 hover:border-brand-500">
      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </Link>
  );
}
