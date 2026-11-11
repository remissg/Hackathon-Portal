import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Lock,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';

const REQUIRED_PHRASE = 'PERMANENTLY REMOVE';
const MIN_REASON_LENGTH = 10;

const RestrictedRemoveCandidateModal = ({
  targetUser,
  onClose,
  onConfirm,
  removing,
  error,
}) => {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    setConfirmEmail('');
    setConfirmationPhrase('');
    setReason('');
  }, [targetUser?._id]);

  if (!targetUser) return null;

  const expectedEmail = (targetUser.email || '').trim().toLowerCase();
  const isEmailMatch = expectedEmail.length > 0 && confirmEmail.trim().toLowerCase() === expectedEmail;
  const isPhraseMatch = confirmationPhrase.trim() === REQUIRED_PHRASE;
  const trimmedReasonLen = reason.trim().length;
  const isReasonValid = trimmedReasonLen >= MIN_REASON_LENGTH;
  const canSubmit = isEmailMatch && isPhraseMatch && isReasonValid && !removing;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm({
      confirmEmail: confirmEmail.trim(),
      confirmationPhrase: confirmationPhrase.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-rose-900/60 shadow-2xl shadow-rose-950/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950/30 border-b border-rose-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {targetUser.isVerified
                  ? 'Super Admin Restricted Purge'
                  : 'Restricted Account Removal'}
              </h3>
              <p className="text-xs text-rose-300/80">
                3-factor audit confirmation required for irreversible deletion
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={removing}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Candidate Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{targetUser.fullName}</p>
              <p className="text-xs font-mono text-slate-400 truncate mt-0.5">{targetUser.email}</p>
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${
                targetUser.isVerified
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
              }`}
            >
              {targetUser.isVerified ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>OTP Verified</span>
                </>
              ) : (
                <span>Pending OTP</span>
              )}
            </span>
          </div>

          {/* High-Severity Safeguard Warning */}
          <div className="p-3.5 rounded-xl bg-rose-950/25 border border-rose-800/40 flex items-start gap-3 text-xs text-rose-200/90 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                This permanently erases the account, its login credentials, and any pending OTP records. This action is audit-logged and cannot be undone.
              </p>
              {targetUser.isVerified && (
                <p className="font-semibold text-amber-300">
                  Privilege Warning: Removing an OTP-verified candidate is restricted strictly to the Super Admin account.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Factor 1: Exact Email Match */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                1. Type candidate email to confirm
              </label>
              {isEmailMatch && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Matched
                </span>
              )}
            </div>
            <input
              type="email"
              required
              autoComplete="off"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={targetUser.email}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-white font-mono placeholder-slate-600"
            />
          </div>

          {/* Factor 2: Explicit Confirmation Phrase */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                2. Type <span className="font-mono text-rose-300">{REQUIRED_PHRASE}</span>
              </label>
              {isPhraseMatch && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                </span>
              )}
            </div>
            <input
              type="text"
              required
              autoComplete="off"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder={REQUIRED_PHRASE}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-white font-mono placeholder-slate-600"
            />
          </div>

          {/* Factor 3: Audit Reason */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                3. Mandatory Audit Reason
              </label>
              <span
                className={`font-mono ${
                  isReasonValid ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {trimmedReasonLen}/{MIN_REASON_LENGTH} min
              </span>
            </div>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Duplicate unverified test registration confirmed with participant"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-white placeholder-slate-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={removing}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-rose-900/30 disabled:shadow-none"
            >
              <Trash2 className={`w-3.5 h-3.5 ${removing ? 'animate-pulse' : ''}`} />
              <span>{removing ? 'Purging Account...' : 'Execute Permanent Removal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestrictedRemoveCandidateModal;

