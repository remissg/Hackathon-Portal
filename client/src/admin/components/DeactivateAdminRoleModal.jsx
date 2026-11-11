import React, { useState } from 'react';
import api from '../../shared/services/api';
import { AlertTriangle, Power, ShieldAlert, X } from 'lucide-react';

const DeactivateAdminRoleModal = ({ isOpen, onClose, user, onLogout }) => {
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const isSuperAdmin = user.email?.trim().toLowerCase() === 'matrucareai@gmail.com';
  if (isSuperAdmin) return null;

  const handleDeactivateRole = async () => {
    setError('');
    try {
      setDeactivating(true);
      const res = await api.post('/user/deactivate-role');
      if (res.data.success) {
        if (onLogout) onLogout();
        window.location.href = '/login?deactivated=true';
      }
    } catch (err) {
      console.error('[Deactivate Co-Admin Role Error]:', err);
      setError(err.response?.data?.message || 'Failed to deactivate administrator role.');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Deactivate Co-Admin Role</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[220px]">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={deactivating}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Co-Administrator</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1.5">
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Immediate Access Revocation</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once deactivated, you will be signed out immediately and will no longer have access to the Admin Governance Console until reactivated by another active administrator.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={deactivating}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deactivating}
              onClick={handleDeactivateRole}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Power className="w-3.5 h-3.5" />
              <span>{deactivating ? 'Deactivating...' : 'Confirm Deactivate Role'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateAdminRoleModal;

