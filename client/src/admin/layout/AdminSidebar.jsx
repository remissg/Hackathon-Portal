import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import DeactivateAdminRoleModal from '../components/DeactivateAdminRoleModal';
import {
  ArrowRight,
  Award,
  ExternalLink,
  FileText,
  Globe,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Power,
  QrCode,
  ShieldAlert,
  Target,
  Trophy,
  UserCog,
  X,
} from 'lucide-react';

const AdminSidebar = ({
  isCollapsed,
  toggleCollapse,
  sidebarOpen,
  setSidebarOpen,
  counts,
  user,
  onLogout,
}) => {
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const isSuperAdmin =
    user?.email?.trim().toLowerCase() === 'matrucareai@gmail.com';
  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 ${
          isCollapsed ? 'md:w-20' : 'md:w-72'
        } ${sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'}`}
      >
        {/* Sidebar Brand Header */}
        <div
          className={`border-b border-slate-800 flex items-center transition-all ${
            isCollapsed
              ? 'p-4 md:flex-col md:justify-center md:gap-3'
              : 'p-4 justify-between'
          }`}
        >
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 group"
            title="HackSphere Admin Console"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className={isCollapsed ? 'md:hidden' : 'block'}>
              <span className="text-base font-bold text-white tracking-tight block">
                Hack<span className="text-rose-400 font-extrabold">Sphere</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 inline-block">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-rose-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2 md:p-2.5 space-y-4' : 'p-4 space-y-6'}`}>
          {/* Section 1: Core Admin Management */}
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              Admin Governance
            </span>
            {isCollapsed && <div className="hidden md:block h-px bg-slate-800/80 my-2 mx-2" />}

            <div className="space-y-1.5">
              <NavLink
                to="/admin"
                end
                onClick={() => setSidebarOpen(false)}
                title={`Submissions (${counts.registrations})`}
                className={({ isActive }) =>
                  `w-full flex items-center ${
                    isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                  } py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                      <div className="relative flex items-center justify-center">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        {isCollapsed && counts.registrations > 0 && (
                          <span className="hidden md:block absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-slate-900" />
                        )}
                      </div>
                      <span className={isCollapsed ? 'md:hidden' : 'block'}>Submissions</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCollapsed ? 'md:hidden' : 'block'
                      } ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {counts.registrations}
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/problems"
                onClick={() => setSidebarOpen(false)}
                title={`Problem Statements (${counts.problems})`}
                className={({ isActive }) =>
                  `w-full flex items-center ${
                    isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                  } py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                      <div className="relative flex items-center justify-center">
                        <Target className="w-4 h-4 flex-shrink-0" />
                        {isCollapsed && counts.problems > 0 && (
                          <span className="hidden md:block absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-slate-900" />
                        )}
                      </div>
                      <span className={isCollapsed ? 'md:hidden' : 'block'}>Problem Statements</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCollapsed ? 'md:hidden' : 'block'
                      } ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {counts.problems}
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/roles"
                onClick={() => setSidebarOpen(false)}
                title={`Access & Role RBAC (${counts.users})`}
                className={({ isActive }) =>
                  `w-full flex items-center ${
                    isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                  } py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                      <div className="relative flex items-center justify-center">
                        <UserCog className="w-4 h-4 flex-shrink-0" />
                        {isCollapsed && counts.users > 0 && (
                          <span className="hidden md:block absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-slate-900" />
                        )}
                      </div>
                      <span className={isCollapsed ? 'md:hidden' : 'block'}>Access &amp; Role RBAC</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCollapsed ? 'md:hidden' : 'block'
                      } ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {counts.users}
                    </span>
                  </>
                )}
              </NavLink>
            </div>
          </div>

          {/* Section 2: Portals & Live Verification */}
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              Live Systems
            </span>
            {isCollapsed && <div className="hidden md:block h-px bg-slate-800/80 my-2 mx-2" />}
            <div className="space-y-1.5">
              <Link
                to="/leaderboard"
                target="_blank"
                rel="noreferrer"
                title="Live Leaderboard"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Live Leaderboard</span>
                </div>
                <ExternalLink
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>

              <Link
                to="/judge"
                title="Judge Scoring Portal"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <Award className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Judge Scoring Portal</span>
                </div>
                <ArrowRight
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>

              <Link
                to="/volunteer"
                title="Gate Volunteer Portal"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <QrCode className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Gate Volunteer Portal</span>
                </div>
                <ArrowRight
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>

              <Link
                to="/"
                title="Public Landing Page"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Public Landing Page</span>
                </div>
                <ArrowRight
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer / Operator Profile & Logout */}
        <div className={`border-t border-slate-800 bg-slate-950/60 ${isCollapsed ? 'p-3 md:p-2.5' : 'p-4'}`}>
          <div
            className={`flex items-center ${
              isCollapsed ? 'md:justify-center md:gap-0 md:mb-2' : 'gap-3 mb-3'
            }`}
          >
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow flex-shrink-0 cursor-default"
              title={`${user?.fullName || 'Super Administrator'} (${user?.email || 'admin'})`}
            >
              {(user?.fullName || 'A').charAt(0)}
            </div>
            <div className={`overflow-hidden ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Super Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user?.email || 'matrucareai@gmail.com'}</p>
            </div>
          </div>

          <div className="space-y-2">
            {user && !isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setDeactivateModalOpen(true);
                }}
                title="Deactivate My Co-Admin Role"
                className={`w-full flex items-center justify-center gap-2 py-2 ${
                  isCollapsed ? 'md:px-0' : 'px-3'
                } rounded-xl bg-amber-950/30 hover:bg-rose-950/50 text-amber-300 hover:text-rose-300 border border-amber-800/40 hover:border-rose-800/60 text-xs font-semibold transition`}
              >
                <Power className="w-3.5 h-3.5 flex-shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : 'block'}>Deactivate Role</span>
              </button>
            )}

            <button
              onClick={onLogout}
              title="Sign Out"
              className={`w-full flex items-center justify-center gap-2 py-2 ${
                isCollapsed ? 'md:px-0' : 'px-3'
              } rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-xs font-semibold transition`}
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : 'block'}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <DeactivateAdminRoleModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </>
  );
};

export default AdminSidebar;

