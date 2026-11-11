import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import {
  QrCode,
  Key,
  LogOut,
  Globe2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const VolunteerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-slate-100">
      {/* Sticky Volunteer Gate Top Shell */}
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Portal Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/volunteer" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
                <QrCode className="w-4 h-4 font-bold" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-white tracking-tight block leading-none">
                  Hack<span className="text-cyan-400">Sphere</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Gate Volunteer
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 ml-2 sm:ml-6 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              <NavLink
                to="/volunteer"
                end
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Gate Scanner</span>
              </NavLink>

              <NavLink
                to="/volunteer/security"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <Key className="w-3.5 h-3.5" />
                <span>Security</span>
              </NavLink>
            </nav>
          </div>

          {/* Right Quick Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Public Site</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 text-xs font-semibold transition"
              >
                Admin Console
              </Link>
            )}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                {user?.fullName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet context={{ embeddedInVolunteerLayout: true }} />
      </main>

      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>HackSphere 2026 Gate Admission &amp; Pass Verification Unit</span>
      </footer>
    </div>
  );
};

export default VolunteerLayout;
