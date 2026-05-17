import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Briefcase, Building2, Send, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/statistik').then((r) => setStats(r.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat icon={<ShieldCheck />} label="Total User" value={stats.totalUser} />
        <Stat icon={<Building2 />} label="Perusahaan" value={stats.totalPerusahaan} />
        <Stat icon={<Users />} label="Pelamar" value={stats.totalPelamar} />
        <Stat icon={<Briefcase />} label="Lowongan" value={stats.totalLowongan} />
        <Stat icon={<Send />} label="Lamaran" value={stats.totalLamaran} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold">{value ?? '-'}</div>
      </div>
    </div>
  );
}
