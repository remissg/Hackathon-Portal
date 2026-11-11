import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

const PassAttendanceCard = ({
  passData,
  isAdmin,
  canCheckIn,
  checkingIn,
  checkInMsg,
  copied,
  onCopyId,
  onCheckInToggle,
  onScanNext,
}) => {
  if (!passData) return null;

  return (
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
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
                  Attendance: <strong className="text-cyan-400">{passData.admittedMembers || (passData.isCheckedIn ? 1 : 0)}</strong> / {passData.totalMembers || (1 + (passData.teamMembers?.length || 0))} Present
                </span>
                {passData.admittedMembers === passData.totalMembers && passData.totalMembers > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ✓ Full Team Inside
                  </span>
                ) : passData.admittedMembers > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Partial Attendance
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Valid for Gate Entry
                  </span>
                )}
              </div>
            </div>

            {/* Main Pass Content */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* Targeted Late Member Banner (if scanned via personal member pass) */}
              {passData.targetedMember && (
                <div className="p-4 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        Late Arrival Member Pass Scanned
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{passData.targetedMember.name}</h3>
                      <p className="text-xs text-slate-300 font-mono">
                        {passData.targetedMember.email} • {passData.targetedMember.isLeader ? 'Team Leader' : 'Team Member'}
                      </p>
                    </div>
                  </div>
                  {canCheckIn && (
                    <button
                      type="button"
                      onClick={() => onCheckInToggle('admit-member', passData.targetedMember.email)}
                      disabled={checkingIn}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shrink-0 ${
                        passData.targetedMember.isCheckedIn
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black'
                      }`}
                    >
                      {passData.targetedMember.isCheckedIn ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Admitted to Venue</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Admit This Member</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              
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
                  onClick={() => onCopyId(passData.ticketId)}
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

              {/* Team Lead Card with Individual Check-In */}
              <div className={`p-4 rounded-xl border transition ${
                passData.leaderIsCheckedIn
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    {(passData.teamLeadName || 'L').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Team Leader</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400">Primary Submitter</span>
                    </div>
                    <p className="text-sm font-bold text-white">{passData.teamLeadName}</p>
                    <p className="text-xs text-slate-400">{passData.teamLeadEmail}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="font-medium">{passData.collegeName}</span>
                    </div>
                    {passData.leaderIsCheckedIn && passData.leaderCheckedInAt && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        ✓ Admitted at {new Date(passData.leaderCheckedInAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {canCheckIn && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {passData.leaderIsCheckedIn ? (
                      <button
                        type="button"
                        onClick={() => onCheckInToggle('toggle-leader')}
                        disabled={checkingIn}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition"
                      >
                        Undo Entry
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCheckInToggle('toggle-leader')}
                        disabled={checkingIn}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Admit Leader</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Team Roster with Individual Member Controls */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Teammates Roster ({passData.teamMembers?.length || 0})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Verify physical college ID for each attendee
                  </span>
                </div>

                {(!passData.teamMembers || passData.teamMembers.length === 0) ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                    Solo Innovator entry (no additional teammates).
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {passData.teamMembers.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-sm transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          m.isCheckedIn
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-900/50 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{m.name}</p>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  m.status === 'Accepted'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                                }`}
                              >
                                {m.status || 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{m.email}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mt-0.5">
                              <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="font-medium">{m.collegeName || passData.collegeName}</span>
                            </div>
                            {m.isCheckedIn && m.checkedInAt && (
                              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                ✓ Admitted at {new Date(m.checkedInAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {canCheckIn && (
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {m.isCheckedIn ? (
                              <button
                                type="button"
                                onClick={() => onCheckInToggle('toggle-member', m.email)}
                                disabled={checkingIn}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition"
                              >
                                Undo Entry
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onCheckInToggle('toggle-member', m.email)}
                                disabled={checkingIn}
                                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Admit Member</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gate Volunteer & Admin Master Check-In Control Box */}
              {canCheckIn && (
                <div className="p-5 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-cyan-400" />
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">
                          Venue Gate Master Controls
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Admit whole group at once or individual attendees
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800 font-bold uppercase">
                      {isAdmin ? 'Admin Console' : 'Gate Volunteer'}
                    </span>
                  </div>

                  {checkInMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{checkInMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onCheckInToggle('admit-all')}
                      disabled={checkingIn}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Admit All Present Members (1-Click)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCheckInToggle('undo-all')}
                      disabled={checkingIn}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      Reset All Gate Entries
                    </button>
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
                  HackSphere Registry • Official Security Token
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onScanNext();
                  }}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Scan Next Pass
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/"
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-sm text-center transition"
                >
                  Return to Home
                </Link>
              </div>

            </div>
          </div>
  );
};

export default PassAttendanceCard;
