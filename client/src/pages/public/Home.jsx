import { Link } from 'react-router-dom';
import { Briefcase, Users, Trophy, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-brand-700">SPK SAW</div>
        <div className="space-x-3">
          <Link to="/lowongan" className="text-slate-700 hover:text-brand-600">
            Lowongan
          </Link>
          <Link to="/login" className="btn-secondary">
            Masuk
          </Link>
          <Link to="/register/pelamar" className="btn-primary">
            Daftar
          </Link>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Sistem Pendukung Keputusan
          <br />
          <span className="text-brand-600">Seleksi Karyawan Baru</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Platform rekrutmen end-to-end dengan metode <b>Simple Additive Weighting (SAW)</b>{' '}
          untuk pengambilan keputusan yang objektif, transparan, dan berbasis data.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/register/pelamar" className="btn-primary">
            Saya Pelamar
          </Link>
          <Link to="/register/perusahaan" className="btn-secondary">
            Saya Perusahaan
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-6">
        {[
          { icon: <Briefcase className="text-brand-600" />, t: 'Kelola Lowongan', d: 'Buat, publikasi, dan kelola lowongan dengan mudah.' },
          { icon: <Users className="text-brand-600" />, t: 'Pelamar Terpusat', d: 'Semua data pelamar dalam satu dashboard.' },
          { icon: <Trophy className="text-brand-600" />, t: 'Ranking Otomatis', d: 'Pemeringkatan kandidat real-time dengan metode SAW.' },
          { icon: <ShieldCheck className="text-brand-600" />, t: 'Adil & Transparan', d: 'Kriteria & bobot terbuka, hasil dapat dipertanggungjawabkan.' },
        ].map((f, i) => (
          <div key={i} className="card text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
              {f.icon}
            </div>
            <div className="font-semibold mb-1">{f.t}</div>
            <div className="text-sm text-slate-500">{f.d}</div>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 mt-20 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SPK SAW — Tugas Akhir Dicky Al Fayed
      </footer>
    </div>
  );
}
