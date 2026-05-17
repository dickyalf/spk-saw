import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import StatBadge from '../../components/StatBadge';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function DetailLamaran() {
  const { id } = useParams();
  const [lamaran, setLamaran] = useState(null);
  const [wawancara, setWawancara] = useState(null);

  useEffect(() => {
    api.get(`/lamaran/saya/${id}`).then((r) => setLamaran(r.data));
    api.get(`/wawancara/${id}`).then((r) => setWawancara(r.data)).catch(() => {});
  }, [id]);

  if (!lamaran) return <div>Memuat...</div>;

  const tahapan = [
    { key: 'administrasi', label: 'Seleksi Administrasi' },
    { key: 'tes', label: 'Tes Tulis' },
    { key: 'wawancara', label: 'Wawancara' },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <div className="card">
        <div className="text-sm text-content-muted">{lamaran.lowongan?.perusahaan?.namaPerusahaan}</div>
        <h1 className="text-2xl font-bold">{lamaran.lowongan?.judul}</h1>
        <div className="mt-2"><StatBadge status={lamaran.statusKeseluruhan} /></div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Progress Seleksi</h3>
        <div className="space-y-3">
          {tahapan.map((t) => {
            const tahap = lamaran[t.key] || {};
            const Icon =
              tahap.status === 'lolos'
                ? CheckCircle2
                : tahap.status === 'tidak_lolos'
                ? XCircle
                : Clock;
            const color =
              tahap.status === 'lolos'
                ? 'text-emerald-600'
                : tahap.status === 'tidak_lolos'
                ? 'text-red-600'
                : 'text-content-subtle';
            return (
              <div key={t.key} className="flex items-start gap-3">
                <Icon className={color} />
                <div className="flex-1">
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-content-muted">
                    <StatBadge status={tahap.status || 'belum'} />
                    {tahap.nilai != null && <span className="ml-2">Nilai: <b>{tahap.nilai}</b></span>}
                  </div>
                  {tahap.catatan && (
                    <div className="text-sm text-content-muted mt-1">{tahap.catatan}</div>
                  )}
                </div>
                {t.key === 'tes' && lamaran.statusKeseluruhan === 'tes' && (
                  <Link to={`/pelamar/lamaran/${id}/tes`} className="btn-primary">
                    Kerjakan Tes <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {wawancara && (
        <div className="card">
          <h3 className="font-semibold mb-2">Info Wawancara</h3>
          <div className="text-sm space-y-1">
            <div>Mode: <b className="capitalize">{wawancara.mode}</b></div>
            {wawancara.tanggal && (
              <div>Tanggal: <b>{new Date(wawancara.tanggal).toLocaleString('id-ID')}</b></div>
            )}
            {wawancara.mode === 'offline' && wawancara.lokasi && (
              <div>Lokasi: <b>{wawancara.lokasi}</b></div>
            )}
            {wawancara.mode === 'online' && wawancara.linkMeeting && (
              <div>
                Link:{' '}
                <a href={wawancara.linkMeeting} target="_blank" rel="noreferrer" className="text-brand-600 underline">
                  {wawancara.linkMeeting}
                </a>
              </div>
            )}
            {wawancara.pewawancara && <div>Pewawancara: <b>{wawancara.pewawancara}</b></div>}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-2">CV yang Dikirim</h3>
        <div className="text-sm space-y-1">
          {lamaran.cvSnapshot?.ringkasan && <p>{lamaran.cvSnapshot.ringkasan}</p>}
          {lamaran.cvSnapshot?.pendidikan?.length > 0 && (
            <div>
              <b>Pendidikan:</b>{' '}
              {lamaran.cvSnapshot.pendidikan
                .map((p) => `${p.jenjang} ${p.jurusan || ''}`.trim())
                .join(', ')}
            </div>
          )}
          {lamaran.cvSnapshot?.skills?.length > 0 && (
            <div>
              <b>Skills:</b>{' '}
              {lamaran.cvSnapshot.skills.map((s) => s.nama).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
