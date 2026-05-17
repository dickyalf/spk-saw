import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import {
  LayoutDashboard,
  Briefcase,
  Sliders,
  FileText,
  Users,
  Trophy,
  BookOpen,
  User,
  Send,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

// Public
import Home from './pages/public/Home';
import DaftarLowongan from './pages/public/DaftarLowongan';
import DetailLowongan from './pages/public/DetailLowongan';

// Auth
import Login from './pages/auth/Login';
import RegisterPerusahaan from './pages/auth/RegisterPerusahaan';
import RegisterPelamar from './pages/auth/RegisterPelamar';

// Perusahaan
import PerusahaanDashboard from './pages/perusahaan/Dashboard';
import LowonganList from './pages/perusahaan/LowonganList';
import LowonganForm from './pages/perusahaan/LowonganForm';
import KriteriaBobot from './pages/perusahaan/KriteriaBobot';
import SoalTesList from './pages/perusahaan/SoalTesList';
import PelamarMasuk from './pages/perusahaan/PelamarMasuk';
import RankingSAW from './pages/perusahaan/RankingSAW';
import PenilaianWawancara from './pages/perusahaan/PenilaianWawancara';
import ProfilPerusahaan from './pages/perusahaan/ProfilPerusahaan';

// Pelamar
import PelamarDashboard from './pages/pelamar/Dashboard';
import ProfilCV from './pages/pelamar/ProfilCV';
import BrowseLowongan from './pages/pelamar/BrowseLowongan';
import DetailLowonganPelamar from './pages/pelamar/DetailLowongan';
import MyLamaran from './pages/pelamar/MyLamaran';
import DetailLamaran from './pages/pelamar/DetailLamaran';
import TesTulis from './pages/pelamar/TesTulis';

// Shared
import Notifikasi from './pages/Notifikasi';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminPerusahaan from './pages/admin/Perusahaan';
import AdminPelamar from './pages/admin/Pelamar';

const menuPerusahaan = [
  { to: '/perusahaan', end: true, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/perusahaan/lowongan', label: 'Lowongan', icon: <Briefcase size={18} /> },
  { to: '/perusahaan/kriteria', label: 'Kriteria & Bobot', icon: <Sliders size={18} /> },
  { to: '/perusahaan/soal-tes', label: 'Soal Tes', icon: <FileText size={18} /> },
  { to: '/perusahaan/profil', label: 'Profil', icon: <User size={18} /> },
];

const menuPelamar = [
  { to: '/pelamar', end: true, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/pelamar/profil', label: 'Profil & CV', icon: <User size={18} /> },
  { to: '/pelamar/lowongan', label: 'Cari Lowongan', icon: <Briefcase size={18} /> },
  { to: '/pelamar/lamaran', label: 'Lamaran Saya', icon: <Send size={18} /> },
];

const menuAdmin = [
  { to: '/admin', end: true, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/perusahaan', label: 'Perusahaan', icon: <Briefcase size={18} /> },
  { to: '/admin/pelamar', label: 'Pelamar', icon: <Users size={18} /> },
];

function RedirectByRole() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'perusahaan') return <Navigate to="/perusahaan" replace />;
  return <Navigate to="/pelamar" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/lowongan" element={<DaftarLowongan />} />
      <Route path="/lowongan/:id" element={<DetailLowongan />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/perusahaan" element={<RegisterPerusahaan />} />
      <Route path="/register/pelamar" element={<RegisterPelamar />} />

      {/* Redirect by role */}
      <Route path="/dashboard" element={<RedirectByRole />} />
      <Route path="/notifikasi" element={
        <ProtectedRoute>
          <DashboardLayout menu={[]} title="Notifikasi" />
        </ProtectedRoute>
      }>
        <Route index element={<Notifikasi />} />
      </Route>

      {/* Perusahaan */}
      <Route
        path="/perusahaan"
        element={
          <ProtectedRoute roles={['perusahaan']}>
            <DashboardLayout menu={menuPerusahaan} title="Perusahaan" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PerusahaanDashboard />} />
        <Route path="lowongan" element={<LowonganList />} />
        <Route path="lowongan/baru" element={<LowonganForm />} />
        <Route path="lowongan/:id/edit" element={<LowonganForm />} />
        <Route path="lowongan/:id/pelamar" element={<PelamarMasuk />} />
        <Route path="lowongan/:id/ranking" element={<RankingSAW />} />
        <Route path="lowongan/:lowonganId/wawancara/:lamaranId" element={<PenilaianWawancara />} />
        <Route path="kriteria" element={<KriteriaBobot />} />
        <Route path="soal-tes" element={<SoalTesList />} />
        <Route path="profil" element={<ProfilPerusahaan />} />
      </Route>

      {/* Pelamar */}
      <Route
        path="/pelamar"
        element={
          <ProtectedRoute roles={['pelamar']}>
            <DashboardLayout menu={menuPelamar} title="Pelamar" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PelamarDashboard />} />
        <Route path="profil" element={<ProfilCV />} />
        <Route path="lowongan" element={<BrowseLowongan />} />
        <Route path="lowongan/:id" element={<DetailLowonganPelamar />} />
        <Route path="lamaran" element={<MyLamaran />} />
        <Route path="lamaran/:id" element={<DetailLamaran />} />
        <Route path="lamaran/:id/tes" element={<TesTulis />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout menu={menuAdmin} title="Admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="perusahaan" element={<AdminPerusahaan />} />
        <Route path="pelamar" element={<AdminPelamar />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
