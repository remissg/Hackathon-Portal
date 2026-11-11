import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  X,
  Lock,
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Power,
  Award,
  QrCode,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

const AccountSecurityModal = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'role'
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Deactivation state
  const [confirmDeactivateStep, setConfirmDeactivateStep] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  if (!isOpen || !user) return null;

  const isStaffRole = user.role && user.role !== 'user';
  const isSuperAdmin = user.email?.toLowerCase() === 'matrucareai@gmail.com';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please provide your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setLoadingPassword(true);
      const res = await api.put('/user/update', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess('Password changed successfully! Keep your new credentials safe.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (res.data.user) updateUser(res.data.user);
        setTimeout(() => {
          setPasswordSuccess('');
        }, 5000);
      }
    } catch (err) {
      console.error('[Change Password Error]:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeactivateMyRole = async () => {
    setDeactivateError('');
    try {
      setDeactivating(true);
      const res = await api.post('/user/deactivate-role');
      if (res.data.success) {
        logout();
        window.location.href = '/login?deactivated=true';
      }
    } catch (err) {
      console.error('[Deactivate Role Error]:', err);
      setDeactivateError(err.response?.data?.message || 'Failed to deactivate role');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Account &amp; Security Settings</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'password'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          {isStaffRole && (
            <button
              type="button"
              onClick={() => setActiveTab('role')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'role'
                  ? 'border-rose-400 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>Role &amp; Deactivation</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'password' ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Update your account password. If you were recently provisioned with a starting password by an
                administrator, please change it now.
              </p>

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Current / Starting Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50 transition"
                >
                  {loadingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          ) : (
            /* Role & Deactivation Workspace */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Staff Authorization
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.role === 'evaluator' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" /> Official Evaluator / Judge
                      </span>
                    ) : user.role === 'volunteer' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-400" /> Gate Volunteer Staff
                      </span>
                    ) : user.role === 'admin' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400" /> Co-Administrator
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </span>
                </div>
              </div>

              {deactivateError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{deactivateError}</span>
                </div>
              )}

              {isSuperAdmin ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  🛡️ <strong>Super Admin Protected:</strong> The primary administrator account (<span className="text-white font-mono">matrucareai@gmail.com</span>) is the root authority and cannot be deactivated.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                    <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Role Deactivation Notice</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      If you have completed your judging rounds or shift at the venue, you may deactivate your
                      staff role. Once deactivated, you will be signed out and unable to access staff workspaces
                      until an event administrator reactivates your account.
                    </p>
                  </div>

                  {!confirmDeactivateStep ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeactivateStep(true)}
                      className="w-full py-2.5 rounded-xl border border-rose-800/80 hover:bg-rose-950/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Deactivate My Staff Role</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 space-y-3">
                      <p className="text-xs font-bold text-white text-center">
                        Are you sure you want to deactivate your staff account?
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setConfirmDeactivateStep(false)}
                          disabled={deactivating}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeactivateMyRole}
                          disabled={deactivating}
                          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-2"
                        >
                          {deactivating ? 'Deactivating...' : 'Confirm Deactivate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSecurityModal;
