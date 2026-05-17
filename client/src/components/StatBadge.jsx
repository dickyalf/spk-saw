/**
 * Map status string → class badge yang sesuai semantik.
 * Dark mode otomatis via Tailwind class.
 */
const statusToClass = {
  // Status lamaran
  menunggu: 'badge-neutral',
  administrasi: 'badge-info',
  tes: 'badge-info',
  wawancara: 'badge-purple',
  ranking: 'badge-warn',
  diterima: 'badge-success',
  ditolak: 'badge-danger',

  // Status tahap
  belum: 'badge-neutral',
  sedang: 'badge-info',
  lolos: 'badge-success',
  tidak_lolos: 'badge-danger',

  // Verifikasi & status lowongan
  pending: 'badge-warn',
  verified: 'badge-success',
  rejected: 'badge-danger',
  draft: 'badge-neutral',
  published: 'badge-success',
  closed: 'badge-neutral',
};

export default function StatBadge({ status }) {
  if (!status) return null;
  const cls = statusToClass[status] || 'badge-neutral';
  return <span className={`${cls} capitalize`}>{status.replace(/_/g, ' ')}</span>;
}
