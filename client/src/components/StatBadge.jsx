const statusColors = {
  menunggu: 'bg-slate-100 text-slate-700',
  administrasi: 'bg-blue-100 text-blue-700',
  tes: 'bg-indigo-100 text-indigo-700',
  wawancara: 'bg-purple-100 text-purple-700',
  ranking: 'bg-amber-100 text-amber-700',
  diterima: 'bg-emerald-100 text-emerald-700',
  ditolak: 'bg-red-100 text-red-700',
  belum: 'bg-slate-100 text-slate-700',
  sedang: 'bg-indigo-100 text-indigo-700',
  lolos: 'bg-emerald-100 text-emerald-700',
  tidak_lolos: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-700',
};

export default function StatBadge({ status }) {
  const cls = statusColors[status] || 'bg-slate-100 text-slate-700';
  return <span className={`badge ${cls} capitalize`}>{status?.replace(/_/g, ' ')}</span>;
}
