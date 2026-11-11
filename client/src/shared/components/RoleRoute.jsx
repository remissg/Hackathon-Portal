import React from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Sparkles, Lock } from 'lucide-react';

const ROLE_META = {
  admin: { label: 'Administrator', fallbackPath: '/admin' },
  evaluator: { label: 'Judge / Evaluator', fallbackPath: '/judge' },
  volunteer: { label: 'Gate Volunteer', fallbackPath: '/volunteer' },
  user: { label: 'Candidate', fallbackPath: '/dashboard' },
};

/**
 * RoleRoute Guard
 * Restricts nested portal routes to specific authorized roles.
 */
const RoleRoute = ({ allowedRoles = ['admin'], portalName = 'Restricted Portal', children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Sparkles className="w-5 h-5 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400 tracking-wider uppercase">
          Verifying Clearance...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = user?.role || 'user';
  if (!allowedRoles.includes(currentRole)) {
    const roleMeta = ROLE_META[currentRole] || ROLE_META.user;
    const requiredLabels = allowedRoles.map((r) => ROLE_META[r]?.label || r).join(' or ');

    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">403 Forbidden</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            Access to <span className="text-slate-200 font-semibold">{portalName}</span> requires{' '}
            <span className="text-rose-400 font-semibold">{requiredLabels}</span> clearance.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1.5 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Signed in as</span>
              <span className="text-slate-200 font-mono truncate max-w-[200px]">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Role</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                {roleMeta.label}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={roleMeta.fallbackPath}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <Lock className="w-4 h-4" /> Go to My Workspace
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Public Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
