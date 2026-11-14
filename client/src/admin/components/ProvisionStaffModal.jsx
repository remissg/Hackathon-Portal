import React from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  QrCode,
  RefreshCw,
  Shield,
  UserPlus,
  X,
} from 'lucide-react';

const ProvisionStaffModal = ({
  isOpen,
  onClose,
  provisionForm,
  setProvisionForm,
  provisionError,
  provisionSuccessData,
  provisioning,
  showProvisionPassword,
  setShowProvisionPassword,
  copiedCreds,
  setCopiedCreds,
  onGeneratePassword,
  onOpenProvisionModal,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
        
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => onClose()}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Provision Event Staff Role</h3>
                  <p className="text-xs text-slate-400">
                    Issue authorized credentials with a starting password for Hackathon staff
                  </p>
                </div>
              </div>

              {provisionSuccessData ? (
                /* Provisioned Success Summary & 1-Click Copy */
                <div className="mt-5 space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-emerald-300 text-sm">
                        Staff Authorization Created &amp; Active!
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        <strong>{provisionSuccessData.fullName}</strong> can now sign in immediately at the HackSphere login portal.
                        {provisionSuccessData.emailDispatched
                          ? ' An onboarding email with these credentials has been sent via matrucareai@gmail.com.'
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                        Staff Credentials Ticket
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const txt = `HackSphere 2026 Staff Login\nName: ${provisionSuccessData.fullName}\nRole: ${provisionSuccessData.role}\nEmail: ${provisionSuccessData.email}\nStarting Password: ${provisionSuccessData.startingPassword}\nPortal: https://hacksphere-remissg.vercel.app/login`;
                          navigator.clipboard.writeText(txt);
                          setCopiedCreds(true);
                          setTimeout(() => setCopiedCreds(false), 2500);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1 transition"
                      >
                        {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCreds ? 'Copied!' : 'Copy Credentials'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400">Assigned Role:</span>
                      <span className="col-span-2 font-bold text-white uppercase tracking-wider">
                        {provisionSuccessData.role === 'evaluator'
                          ? 'Judge / Evaluator'
                          : provisionSuccessData.role === 'volunteer'
                          ? 'Gate Volunteer'
                          : 'Co-Admin'}
                      </span>

                      <span className="text-slate-400">Login Email:</span>
                      <span className="col-span-2 font-mono text-sky-400">{provisionSuccessData.email}</span>

                      <span className="text-slate-400">Starting Password:</span>
                      <span className="col-span-2 font-mono font-bold text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded w-fit border border-amber-800/40">
                        {provisionSuccessData.startingPassword}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    🔒 Staff members are encouraged to update this starting password anytime from their portal&apos;s Security Settings.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenProvisionModal()}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      Provision Another
                    </button>
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Provision Form */
                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  {provisionError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{provisionError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Staff Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ananya Sharma"
                      value={provisionForm.fullName}
                      onChange={(e) => setProvisionForm({ ...provisionForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Official Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="staff.member@institution.edu"
                        value={provisionForm.email}
                        onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Staff Role Selection Cards */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Select Staff Role Authorization <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'evaluator',
                          title: 'Judge / Evaluator',
                          desc: 'Score rubric & review decks',
                          icon: Award,
                          activeClass: 'border-amber-500 bg-amber-950/40 text-amber-300',
                          iconColor: 'text-amber-400',
                        },
                        {
                          id: 'volunteer',
                          title: 'Gate Volunteer',
                          desc: 'QR scan & admit attendees',
                          icon: QrCode,
                          activeClass: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
                          iconColor: 'text-emerald-400',
                        },
                        {
                          id: 'admin',
                          title: 'Co-Admin',
                          desc: 'Full event governance',
                          icon: Shield,
                          activeClass: 'border-rose-500 bg-rose-950/40 text-rose-300',
                          iconColor: 'text-rose-400',
                        },
                      ].map((roleOpt) => {
                        const IconComp = roleOpt.icon;
                        const isSelected = provisionForm.role === roleOpt.id;
                        return (
                          <button
                            key={roleOpt.id}
                            type="button"
                            onClick={() => setProvisionForm({ ...provisionForm, role: roleOpt.id })}
                            className={`p-3 rounded-xl border text-left transition ${
                              isSelected
                                ? roleOpt.activeClass + ' shadow-md'
                                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <IconComp className={`w-4 h-4 mb-1.5 ${isSelected ? roleOpt.iconColor : 'text-slate-500'}`} />
                            <span className="block text-xs font-bold leading-tight">{roleOpt.title}</span>
                            <span className="block text-[10px] opacity-75 mt-0.5 leading-snug">{roleOpt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Note: Candidates self-register and verify via OTP — only non-candidate staff roles are provisioned here.
                    </p>
                  </div>

                  {/* Starting Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Starting Password <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProvisionForm({ ...provisionForm, startingPassword: onGeneratePassword() })
                        }
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate Strong Password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showProvisionPassword ? 'text' : 'password'}
                        required
                        value={provisionForm.startingPassword}
                        onChange={(e) =>
                          setProvisionForm({ ...provisionForm, startingPassword: e.target.value })
                        }
                        placeholder="Min. 6 characters..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProvisionPassword(!showProvisionPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showProvisionPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Staff log in using this starting password and can update it anytime from Security Settings.
                    </p>
                  </div>

                  {/* Send Onboarding Email Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-indigo-500/30 transition">
                    <input
                      type="checkbox"
                      checked={provisionForm.sendEmail}
                      onChange={(e) => setProvisionForm({ ...provisionForm, sendEmail: e.target.checked })}
                      className="mt-0.5 accent-indigo-500 rounded"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      Dispatch onboarding email with login credentials &amp; direct portal URL from{' '}
                      <span className="font-mono text-indigo-300">matrucareai@gmail.com</span>
                    </span>
                  </label>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={provisioning}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                      {provisioning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Provisioning Staff...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Authorize &amp; Provision Staff</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
  );
};

export default ProvisionStaffModal;
