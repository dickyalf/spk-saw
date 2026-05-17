import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Menu, X, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function DashboardLayout({ menu, title }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-subtle flex">
      {/* Overlay mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-surface-border
                    transform transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">SPK SAW</div>
              <div className="text-[10px] uppercase tracking-wider text-content-subtle">{title}</div>
            </div>
          </Link>
          <button className="lg:hidden text-content-muted" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              {m.icon}
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* User card di bawah */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-surface-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <div className="text-[10px] uppercase tracking-wider text-content-subtle">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-content-muted hover:text-red-500 transition-colors"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="bg-surface/80 border-b border-surface-border sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center justify-between px-5 py-3">
            <button
              className="lg:hidden text-content-muted hover:text-content"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NavLink
                to="/notifikasi"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-content-muted hover:text-content hover:bg-surface-muted transition-colors"
                title="Notifikasi"
              >
                <Bell size={18} />
              </NavLink>
            </div>
          </div>
        </header>
        <main className="p-5 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
