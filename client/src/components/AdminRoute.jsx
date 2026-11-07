import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, LayoutDashboard, Sparkles } from 'lucide-react';

/**
 * Route Middleware Guard: Restricts access strictly to authorized administrators
 * Prevents normal participants and unauthenticated visitors from accessing /admin
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check admin authorization
  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'matrucareai@gmail.com';

  // If normal user attempts to access /admin, display 403 Forbidden Access Guard
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800 mb-3 inline-block">
            403 • Access Restricted
          </span>

          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2 mb-3">
            Administrator Privileges Required
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            This console is reserved exclusively for the <strong className="text-white">MatruCare AI Hackathon Committee</strong> (<code className="text-rose-400 text-xs">matrucareai@gmail.com</code>). Regular participants cannot access, modify, or view other candidates' project applications.
          </p>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to My Dashboard</span>
            </Link>

            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In as Committee Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
