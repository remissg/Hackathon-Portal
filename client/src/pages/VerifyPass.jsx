import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const VerifyPass = () => {
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId') || '';

  const { user, isAuthenticated } = useAuth();
  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'matrucareai@gmail.com';

  const [inputTicketId, setInputTicketId] = useState(ticketIdParam);
  const [activeTicketId, setActiveTicketId] = useState(ticketIdParam);

  const [loading, setLoading] = useState(!!ticketIdParam);
  const [passData, setPassData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');

  const fetchPass = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/hackathon/verify-pass/${id.trim()}`);
      if (res.data.success && res.data.verified) {
        setPassData(res.data.pass);
      } else {
        setError(res.data.message || 'Pass ID verification failed');
      }
    } catch (err) {
      console.error('[Verify Pass Error]:', err);
      setError(
        err.response?.data?.message ||
          'Invalid or unregistered Pass ID. This pass could not be authenticated against the MatruCare AI registry.'
      );
      setPassData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTicketId) {
      fetchPass(activeTicketId);
    }
  }, [activeTicketId]);

  const handleLookup = (e) => {
    e.preventDefault();
    if (inputTicketId.trim()) {
      setActiveTicketId(inputTicketId.trim());
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckInToggle = async (action = 'check-in') => {
    if (!passData?.ticketId) return;
    setCheckingIn(true);
    try {
      const res = await api.post('/hackathon/admin/check-in', {
        passId: passData.ticketId,
        action,
      });
      if (res.data.success) {
        setPassData((prev) => ({
          ...prev,
          isCheckedIn: res.data.isCheckedIn,
          checkedInAt: res.data.checkedInAt,
          checkedInBy: res.data.checkedInBy,
        }));
        setCheckInMsg(res.data.message);
        setTimeout(() => setCheckInMsg(''), 4500);
      }
    } catch (err) {
      console.error('[Check-In Error]:', err);
      alert(err.response?.data?.message || 'Failed to update check-in status');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-150 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Official Pass Registry &amp; Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Event Pass Verification
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            MatruCare AI National Innovation Hackathon 2026
          </p>
        </div>

        {/* Manual Lookup Form if no ID provided in URL */}
        {!activeTicketId && (
          <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
            <QrCode className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Verify Admission Pass</h2>
            <p className="text-sm text-slate-300 mb-6">
              Enter the 6-character Pass ID printed on the physical or digital pass (e.g. <span className="font-mono text-cyan-400 font-bold">MCAI-2026-F947</span>):
            </p>
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="e.g. MCAI-2026-F947"
                value={inputTicketId}
                onChange={(e) => setInputTicketId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Verify Pass
              </button>
            </form>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-12 text-center animate-pulse">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 font-medium">Validating pass against official registry...</p>
          </div>
        )}

        {/* Invalid Pass Alert */}
        {error && !loading && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-rose-200">Unverified or Invalid Pass</h2>
            <p className="text-sm text-rose-300 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setError('');
                  setActiveTicketId('');
                  setInputTicketId('');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition"
              >
                Try Another Pass ID
              </button>
            </div>
          </div>
        )}

        {/* Verified Pass Card */}
        {passData && !loading && (
          <div className="bg-[#0b132b]/95 border-2 border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            
            {/* Top Verification Seal Header */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-cyan-950/70 to-slate-900 border-b border-emerald-500/30 px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Official Registry Status
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-white">
                    VERIFIED &amp; AUTHENTIC
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {passData.isCheckedIn ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ✓ Admitted to Venue
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Valid for Check-In
                  </span>
                )}
              </div>
            </div>

            {/* Main Pass Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Pass ID Banner with Copy */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Admission Pass ID
                  </span>
                  <span className="font-mono text-cyan-400 font-extrabold text-xl tracking-wider">
                    {passData.ticketId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyId(passData.ticketId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Project & Track Details */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Project Title
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {passData.projectName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    {passData.domain}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Status: {passData.status}
                  </span>
                </div>
              </div>

              {/* Academic & College Background */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    College / Institute
                  </span>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate" title={passData.collegeName}>
                      {passData.collegeName}
                    </span>
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    Programme
                  </span>
                  <p className="text-sm font-bold text-white">
                    {passData.course} ({passData.branch}) • Year {passData.yearOfStudy}
                  </p>
                </div>
              </div>

              {/* Team Lead */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Team Leader
                  </span>
                  <p className="text-sm font-bold text-white">{passData.teamLeadName}</p>
                  <p className="text-xs text-slate-400">{passData.teamLeadEmail}</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-semibold">
                  Primary Submitter
                </span>
              </div>

              {/* Team Roster */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Registered Teammates ({passData.teamMembers?.length || 0})
                </span>
                <div className="space-y-2">
                  {passData.teamMembers?.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          m.status === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {m.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Check-In Control Box */}
              {isAdmin && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Event Gate Check-In Control
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      Admin Authorized
                    </span>
                  </div>

                  {checkInMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{checkInMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div>
                      <p className="text-xs text-slate-300">
                        Venue Status:{' '}
                        {passData.isCheckedIn ? (
                          <span className="text-emerald-400 font-bold">✓ Admitted to Venue</span>
                        ) : (
                          <span className="text-amber-400 font-bold">Awaiting Physical Check-In</span>
                        )}
                      </p>
                      {passData.isCheckedIn && passData.checkedInAt && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Checked-in on {new Date(passData.checkedInAt).toLocaleTimeString()} by {passData.checkedInBy || 'Admin'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!passData.isCheckedIn ? (
                        <button
                          type="button"
                          onClick={() => handleCheckInToggle('check-in')}
                          disabled={checkingIn}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                        >
                          <Check className="w-4 h-4" />
                          <span>{checkingIn ? 'Admitting...' : 'Admit & Check-In Team'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCheckInToggle('undo')}
                          disabled={checkingIn}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-semibold transition"
                        >
                          {checkingIn ? 'Updating...' : 'Undo Check-In'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Timestamp Seal */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>
                    Verified At: {new Date(passData.verifiedAt).toLocaleString()}
                  </span>
                </div>
                <span className="text-slate-500">
                  MatruCare AI Registry • Official Security Token
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm text-center transition"
                >
                  Return to Home
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20"
                >
                  Open Participant Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyPass;

