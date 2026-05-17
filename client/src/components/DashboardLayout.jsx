import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Menu, X } from 'lucide-react';

export default function DashboardLayout({ menu, title }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <div className="text-lg font-bold text-brand-700">SPK SAW</div>
            <div className="text-xs text-slate-500">{title}</div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {m.icon}
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-5 py-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <NavLink
                to="/notifikasi"
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Notifikasi"
              >
                <Bell size={18} />
              </NavLink>
              <div className="text-sm">
                <div className="font-medium text-slate-700">{user?.email}</div>
                <div className="text-xs text-slate-500 uppercase">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
