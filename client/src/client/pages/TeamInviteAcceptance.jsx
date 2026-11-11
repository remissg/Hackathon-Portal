import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/services/api';
import {
  Users,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Layers,
  GraduationCap,
  Ticket,
  Check,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';

const TeamInviteAcceptance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const passIdParam = searchParams.get('passId') || '';
  const emailParam = searchParams.get('email') || '';

  const [inputPassId, setInputPassId] = useState(passIdParam);
  const [activePassId, setActivePassId] = useState(passIdParam);

  const [loading, setLoading] = useState(!!passIdParam);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch invitation details
  const fetchInvite = async (pid) => {
    if (!pid) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/hackathon/invite/${pid.trim()}`);
      if (res.data.success) {
        setInvite(res.data.invite);
      } else {
        setError(res.data.message || 'Invitation not found');
      }
    } catch (err) {
      console.error('[Fetch Invite Error]:', err);
      setError(
        err.response?.data?.message ||
          'Unable to find a team matching this Pass ID. Please check the ID in your invitation email.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePassId) {
      fetchInvite(activePassId);
    }
  }, [activePassId]);

  // Handle Manual Pass Lookup
  const handleLookup = (e) => {
    e.preventDefault();
    if (inputPassId.trim()) {
      setActivePassId(inputPassId.trim());
    }
  };

  // Respond to invitation (Accept or Decline)
  const handleResponse = async (action) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/hackathon/respond-invite', {
        passId: invite.ticketId || activePassId,
        action,
      });

      if (res.data.success) {
        setActionSuccess(res.data.message);
        // Refresh invite details
        fetchInvite(activePassId);
      }
    } catch (err) {
      console.error('[Respond Invite Error]:', err);
      setError(err.response?.data?.message || 'Failed to update invitation status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current user is an accepted member
  const currentUserEmail = user?.email?.toLowerCase().trim() || '';
  const myMemberEntry = invite?.teamMembers?.find(
    (m) => m.email?.toLowerCase().trim() === currentUserEmail
  );
  const isAccepted = myMemberEntry?.status === 'Accepted';
  const isDeclined = myMemberEntry?.status === 'Declined';
  const isPending = myMemberEntry?.status === 'Pending';
  const isEmailMismatch =
    isAuthenticated &&
    emailParam &&
    currentUserEmail !== emailParam.toLowerCase().trim() &&
    !myMemberEntry;

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-150 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Users className="w-4 h-4" />
            Hackathon Teammate Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Team Invitation &amp; Pass Claim
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            HackSphere National Innovation Hackathon 2026
          </p>
        </div>

        {/* Manual Lookup if no Pass ID in URL */}
        {!activePassId && (
          <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
            <Ticket className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Claim Your Team Spot</h2>
            <p className="text-sm text-slate-300 mb-6">
              Enter the Pass ID from the invitation email sent by your team lead (e.g. <span className="font-mono text-cyan-400">MCAI-2026-F947</span>):
            </p>
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="e.g. MCAI-2026-F947"
                value={inputPassId}
                onChange={(e) => setInputPassId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Find Team
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-12 text-center animate-pulse">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 font-medium">Fetching team details...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="text-sm">
              <p className="font-semibold text-rose-200">Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-200">Status Updated</p>
              <p>{actionSuccess}</p>
            </div>
          </div>
        )}

        {/* Invitation Card */}
        {invite && !loading && (
          <div className="bg-[#0b132b]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Top Badge Banner */}
            <div className="bg-gradient-to-r from-cyan-950/60 via-blue-950/60 to-slate-900 border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Official Team Pass ID</span>
                <span className="font-mono text-cyan-400 font-bold text-lg tracking-wider">{invite.ticketId}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-900/40 text-cyan-300 border border-cyan-700/40">
                <Sparkles className="w-3.5 h-3.5" />
                {invite.domain}
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Team "{invite.projectName}"
                </h2>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  {invite.collegeName}
                </p>
              </div>

              {/* Team Lead Info Box */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-0.5">Team Lead</span>
                  <p className="text-white font-semibold text-sm">{invite.teamLeadName}</p>
                  <p className="text-slate-400 text-xs">{invite.teamLeadEmail}</p>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-semibold">
                  Lead &amp; Submitter
                </div>
              </div>

              {/* Team Roster */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Registered Teammates ({invite.teamMembers?.length || 0})
                </h3>
                <div className="space-y-2">
                  {invite.teamMembers?.map((m, idx) => {
                    const isMe = m.email?.toLowerCase().trim() === currentUserEmail;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border text-sm transition ${
                          isMe
                            ? 'bg-cyan-950/30 border-cyan-800/60 shadow-sm'
                            : 'bg-slate-900/40 border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                            #{idx + 1}
                          </div>
                          <div>
                            <span className="font-medium text-white block">
                              {m.name} {isMe && <span className="text-xs text-cyan-400 font-bold">(You)</span>}
                            </span>
                            <span className="text-xs text-slate-400">{m.email}</span>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            m.status === 'Accepted'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : m.status === 'Declined'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {m.status || 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Section Depending on Auth & Member State */}
              <div className="pt-4 border-t border-slate-800/80">
                {/* 1. NOT LOGGED IN */}
                {!isAuthenticated && (
                  <div className="bg-slate-900/90 rounded-xl p-5 border border-cyan-800/40 text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-base">
                      <UserPlus className="w-5 h-5" />
                      Create Account or Log In to Claim Your Pass
                    </div>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      You've been added to this team. Please sign up or log in using your invited email address
                      {emailParam && <span className="font-bold text-cyan-300"> ({emailParam})</span>} to confirm your spot.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <Link
                        to={`/signup?email=${encodeURIComponent(emailParam)}&redirect=${encodeURIComponent(
                          `/team-invite?passId=${invite.ticketId}&email=${emailParam}`
                        )}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create Account to Accept
                      </Link>
                      <Link
                        to={`/login?email=${encodeURIComponent(emailParam)}&redirect=${encodeURIComponent(
                          `/team-invite?passId=${invite.ticketId}&email=${emailParam}`
                        )}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
                      >
                        <LogIn className="w-4 h-4" />
                        Log In
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. LOGGED IN - Already Accepted */}
                {isAuthenticated && isAccepted && (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-6 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="text-lg font-bold text-emerald-200">
                      You are an Official Confirmed Member!
                    </h3>
                    <p className="text-sm text-slate-300">
                      Your participation in Team "{invite.projectName}" is confirmed. Your Admission Pass and live evaluation updates are available on your dashboard.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
                      >
                        Go to My Dashboard &amp; View Pass
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* 3. LOGGED IN - Pending Acceptance */}
                {isAuthenticated && isPending && (
                  <div className="bg-slate-900/90 rounded-xl p-6 border border-slate-700 text-center space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Confirm Your Participation
                      </h3>
                      <p className="text-sm text-slate-300">
                        {invite.teamLeadName} has invited you to join Team "{invite.projectName}". Would you like to accept?
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleResponse('accept')}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20"
                      >
                        <Check className="w-4 h-4" />
                        {submitting ? 'Confirming...' : 'Accept Invitation & Claim Pass'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResponse('decline')}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 text-slate-300 font-medium text-sm transition"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. LOGGED IN - Declined */}
                {isAuthenticated && isDeclined && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center space-y-3">
                    <p className="text-slate-400 text-sm">
                      You previously declined this invitation. If this was a mistake, you can accept below:
                    </p>
                    <button
                      type="button"
                      onClick={() => handleResponse('accept')}
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition"
                    >
                      <Check className="w-4 h-4" />
                      Re-Accept Invitation
                    </button>
                  </div>
                )}

                {/* 5. LOGGED IN - Email Mismatch */}
                {isEmailMismatch && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs sm:text-sm">
                    <p className="font-semibold text-amber-200 mb-1">Signed in as a different user</p>
                    <p>
                      You are currently signed in as <span className="font-mono text-white">{currentUserEmail}</span>, but this invitation was sent to <span className="font-mono text-white">{emailParam}</span>. Please log out and sign in with the invited email address to accept.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamInviteAcceptance;

