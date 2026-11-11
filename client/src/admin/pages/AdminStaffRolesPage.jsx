import React, { useState, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../../shared/services/api';
import { useAuth } from '../../shared/context/AuthContext';
import ProvisionStaffModal from '../components/ProvisionStaffModal';
import {
  Award,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Power,
  QrCode,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  X,
} from 'lucide-react';

const AdminStaffRolesPage = () => {
  const { user: currentUser } = useAuth();
  const { users, setUsers, loadingUsers, fetchUsers, showToast } = useOutletContext();

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [staffFilterTab, setStaffFilterTab] = useState('staff');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [togglingActiveId, setTogglingActiveId] = useState(null);

  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    fullName: '',
    email: '',
    role: 'evaluator',
    startingPassword: '',
    sendEmail: true,
  });
  const [showProvisionPassword, setShowProvisionPassword] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');
  const [provisionSuccessData, setProvisionSuccessData] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const generateRandomPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const nums = '23456789';
    const syms = '@#$!';
    const all = upper + lower + nums + syms;
    let pwd =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      nums[Math.floor(Math.random() * nums.length)] +
      syms[Math.floor(Math.random() * syms.length)];
    for (let i = 0; i < 6; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    return pwd
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  };

  const handleOpenProvisionModal = (prefillUser = null) => {
    setProvisionError('');
    setProvisionSuccessData(null);
    setCopiedCreds(false);
    setShowProvisionPassword(true);
    setProvisionForm({
      fullName: prefillUser?.fullName || '',
      email: prefillUser?.email || '',
      role: prefillUser?.role && prefillUser.role !== 'user' ? prefillUser.role : 'evaluator',
      startingPassword: generateRandomPassword(),
      sendEmail: true,
    });
    setProvisionModalOpen(true);
  };

  const handleProvisionStaff = async (e) => {
    e.preventDefault();
    setProvisionError('');
    setProvisionSuccessData(null);

    if (!provisionForm.fullName.trim() || !provisionForm.email.trim()) {
      setProvisionError('Full name and official email address are required.');
      return;
    }
    if (!provisionForm.startingPassword || provisionForm.startingPassword.length < 6) {
      setProvisionError('Starting password must be at least 6 characters long.');
      return;
    }

    setProvisioning(true);
    try {
      const res = await api.post('/user/admin/provision-staff', {
        fullName: provisionForm.fullName.trim(),
        email: provisionForm.email.trim(),
        role: provisionForm.role,
        startingPassword: provisionForm.startingPassword,
        sendEmail: provisionForm.sendEmail,
      });

      if (res.data.success) {
        showToast(res.data.message || 'Staff role provisioned successfully!');
        setProvisionSuccessData({
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          role: res.data.user.role,
          startingPassword: provisionForm.startingPassword,
          emailDispatched: res.data.emailDispatched,
        });
        setStaffFilterTab('staff');
        fetchUsers();
      }
    } catch (err) {
      console.error('[Provision Staff Error]:', err);
      setProvisionError(err.response?.data?.message || 'Failed to provision staff role.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleToggleStaffActive = async (targetUser) => {
    const actionText = targetUser.isActive === false ? 'REACTIVATE' : 'DEACTIVATE';
    if (
      !window.confirm(
        `Are you sure you want to ${actionText} staff access for "${targetUser.fullName}" (${targetUser.email})?`
      )
    ) {
      return;
    }

    setTogglingActiveId(targetUser._id);
    try {
      const res = await api.patch(`/user/admin/${targetUser._id}/toggle-active`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isActive: res.data.user.isActive } : u
          )
        );
        showToast(res.data.message);
      }
    } catch (err) {
      console.error('[Toggle Staff Active Error]:', err);
      alert(err.response?.data?.message || 'Failed to toggle staff account status.');
    } finally {
      setTogglingActiveId(null);
    }
  };

  const handleDeleteUserAccount = async (targetUser) => {
    if (
      !window.confirm(
        `Permanently remove account for "${targetUser.fullName}" (${targetUser.email})? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingUserId(targetUser._id);
    try {
      const res = await api.delete(`/user/admin/${targetUser._id}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
        showToast(res.data.message || `Account "${targetUser.email}" removed.`);
      }
    } catch (err) {
      console.error('[Delete Account Error]:', err);
      alert(err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const staffCount = useMemo(
    () => users.filter((u) => u.role && u.role !== 'user').length,
    [users]
  );
  const candidatesCount = useMemo(
    () => users.filter((u) => !u.role || u.role === 'user').length,
    [users]
  );

  // Filter users by search term & active directory segment
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isStaff = u.role && u.role !== 'user';
      if (staffFilterTab === 'staff' && !isStaff) return false;
      if (staffFilterTab === 'candidates' && isStaff) return false;

      const term = userSearchTerm.toLowerCase().trim();
      return (
        !term ||
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    });
  }, [users, userSearchTerm, staffFilterTab]);

  return (
    <div className="space-y-5">
        {/* Top Control Bar: Search, Segment Switcher, & Provision Button */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search accounts by full name or email address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {userSearchTerm && (
              <button
                onClick={() => setUserSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Sub-tab pills */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStaffFilterTab('staff')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  staffFilterTab === 'staff'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Directory ({staffCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStaffFilterTab('candidates')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  staffFilterTab === 'candidates'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Candidate Roster ({candidatesCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStaffFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  staffFilterTab === 'all'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Accounts ({users.length})
              </button>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center border border-slate-700 transition"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenProvisionModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Provision Staff Role</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        {staffFilterTab === 'staff' ? (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3.5 text-xs">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Event Staff Directory &amp; Role Authorization</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Staff members (Judges, Volunteers, Co-Admins) are provisioned directly with a designated role and starting password. Staff can change their password from their security settings, and administrators can deactivate or reactivate their access at any time without losing historical evaluations.
              </p>
            </div>
          </div>
        ) : staffFilterTab === 'candidates' ? (
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 flex items-start gap-3.5 text-xs">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Registered Candidate Innovators</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Candidates register themselves publicly and verify their accounts using a 6-digit email OTP. Competing candidate accounts remain strictly separated from event staff. Unlinked or inactive test candidate accounts can be permanently removed below.
              </p>
            </div>
          </div>
        ) : null}

        {/* User Accounts Directory Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl w-full max-w-full">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCog className="w-4 h-4 text-indigo-400" />
              <span>
                {staffFilterTab === 'staff'
                  ? `Authorized Event Staff (${filteredUsers.length})`
                  : staffFilterTab === 'candidates'
                  ? `Candidate Innovators (${filteredUsers.length})`
                  : `All Registered Accounts (${filteredUsers.length})`}
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {staffFilterTab === 'staff'
                ? 'Active staff authorizations & deactivation controls'
                : 'Self-registered candidate accounts'}
            </span>
          </div>

          {loadingUsers ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm">Loading user directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <p className="text-sm font-semibold text-slate-300">No accounts found matching this view or search.</p>
              {staffFilterTab === 'staff' && (
                <button
                  type="button"
                  onClick={() => handleOpenProvisionModal()}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision First Staff Member</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-300 min-w-[750px]">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="px-5 py-3.5">Account Profile</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Access Status</th>
                    <th className="px-5 py-3.5">Authorization / Joined</th>
                    <th className="px-5 py-3.5 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isSuperAdminUser = u.email?.toLowerCase() === 'matrucareai@gmail.com';
                    const isStaff = u.role && u.role !== 'user';
                    const isActive = u.isActive !== false;
                    const isSelf =
                      currentUser?._id === u._id ||
                      currentUser?.id === u._id ||
                      currentUser?.email?.toLowerCase() === u.email?.toLowerCase();

                    return (
                      <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Profile Info */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {(u.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{u.fullName}</span>
                              <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isSuperAdminUser ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 w-fit">
                              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Super Admin
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-fit">
                              <Shield className="w-3.5 h-3.5" /> Co-Admin
                            </span>
                          ) : u.role === 'evaluator' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 w-fit">
                              <Award className="w-3.5 h-3.5 text-amber-400" /> Judge / Evaluator
                            </span>
                          ) : u.role === 'volunteer' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                              <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Gate Volunteer
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 w-fit">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Candidate
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isStaff ? (
                            isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                Deactivated
                              </span>
                            )
                          ) : (
                            u.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" /> OTP Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                Pending OTP
                              </span>
                            )
                          )}
                        </td>

                        {/* Authorization / Joined Info */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                          {isStaff && u.provisionedAt ? (
                            <div>
                              <span className="text-slate-300 block font-medium">
                                {new Date(u.provisionedAt).toLocaleDateString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                By {u.provisionedBy || 'Admin'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-300 block">
                                {new Date(u.createdAt).toLocaleDateString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">
                                {u.collegeName || 'Self-Registered'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Governance Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          {isSuperAdminUser ? (
                            <span className="text-xs text-slate-500 italic font-mono">Protected Admin</span>
                          ) : isStaff ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick link to relevant portal */}
                              {u.role === 'evaluator' ? (
                                <Link
                                  to="/judge"
                                  target="_blank"
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition"
                                  title="Open Judge Portal"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              ) : u.role === 'volunteer' ? (
                                <Link
                                  to="/volunteer"
                                  target="_blank"
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition"
                                  title="Open Pass Scanner"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              ) : null}

                              {/* Toggle Active / Deactivate */}
                              <button
                                type="button"
                                disabled={togglingActiveId === u._id || isSelf}
                                onClick={() => handleToggleStaffActive(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                  isSelf
                                    ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                    : isActive
                                    ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                                }`}
                                title={isSelf ? 'Cannot deactivate your active session' : undefined}
                              >
                                <Power className={`w-3.5 h-3.5 ${togglingActiveId === u._id ? 'animate-spin' : ''}`} />
                                <span>{isActive ? 'Deactivate' : 'Reactivate'}</span>
                              </button>
                            </div>
                          ) : (
                            /* Candidate row: Strictly isolated from staff appointment; allow safe account cleanup */
                            <button
                              type="button"
                              disabled={deletingUserId === u._id}
                              onClick={() => handleDeleteUserAccount(u)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 flex items-center gap-1.5 ml-auto transition disabled:opacity-50"
                              title="Remove unlinked or test candidate account"
                            >
                              <Trash2 className={`w-3.5 h-3.5 ${deletingUserId === u._id ? 'animate-pulse' : ''}`} />
                              <span>{deletingUserId === u._id ? 'Removing...' : 'Remove Account'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      <ProvisionStaffModal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        provisionForm={provisionForm}
        setProvisionForm={setProvisionForm}
        provisionError={provisionError}
        provisionSuccessData={provisionSuccessData}
        provisioning={provisioning}
        showProvisionPassword={showProvisionPassword}
        setShowProvisionPassword={setShowProvisionPassword}
        copiedCreds={copiedCreds}
        setCopiedCreds={setCopiedCreds}
        onGeneratePassword={generateRandomPassword}
        onOpenProvisionModal={handleOpenProvisionModal}
        onSubmit={handleProvisionStaff}
      />
    </div>
  );
};

export default AdminStaffRolesPage;
