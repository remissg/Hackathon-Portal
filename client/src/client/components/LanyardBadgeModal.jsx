import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  Printer,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const LanyardBadgeModal = ({
  isOpen,
  onClose,
  entry,
  user,
  ticketId,
  selectedPassAttendee,
  setSelectedPassAttendee,
  onDownloaded,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [downloadingPass, setDownloadingPass] = useState(false);

  if (!isOpen || !entry) return null;

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const triggerPrintPass = () => {
    window.print();
  };

  const handleDownloadPassPng = async () => {
    const passElement = document.getElementById('admission-pass-card');
    if (!passElement) return;
    try {
      setDownloadingPass(true);
      const dataUrl = await toPng(passElement, {
        cacheBust: true,
        pixelRatio: 3,
        style: {
          margin: '0',
          boxShadow: 'none',
          transform: 'none',
        },
        filter: (node) => {
          if (node?.getAttribute && node.getAttribute('data-hide-export') === 'true') {
            return false;
          }
          return true;
        },
      });
      const attendeeName = selectedPassAttendee
        ? selectedPassAttendee.name.replace(/\s+/g, '_')
        : entry?.fullName
        ? entry.fullName.replace(/\s+/g, '_')
        : 'Lead';
      const link = document.createElement('a');
      link.download = `HackSphere-Badge-${ticketId}-${attendeeName}.png`;
      link.href = dataUrl;
      link.click();
      onDownloaded?.('Official Lanyard Badge (PNG) downloaded successfully!');
    } catch (err) {
      console.error('[Download Pass PNG Error]:', err);
      alert('Could not generate badge image. You can use Print Pass / PDF instead.');
    } finally {
      setDownloadingPass(false);
    }
  };

        const isLeadAttendee = !selectedPassAttendee;
        const currentAttendeeName = isLeadAttendee
          ? (entry.fullName || user?.fullName || 'Team Lead')
          : selectedPassAttendee.name;
        const currentAttendeeEmail = isLeadAttendee
          ? (entry.email || user?.email || '')
          : selectedPassAttendee.email;
        const currentAttendeeCollege = isLeadAttendee
          ? (entry.collegeName || user?.collegeName || 'Verified Institute')
          : (selectedPassAttendee?.collegeName ||
             (selectedPassAttendee?.email?.toLowerCase() === user?.email?.toLowerCase() ? user?.collegeName : '') ||
             entry.collegeName ||
             'Verified Institute');
        const currentAttendeeRoleBadge = isLeadAttendee
          ? '★ Team Leader • Master Pass'
          : '⚡ Innovation Hacker';
        const currentAttendeeIndex = isLeadAttendee
          ? 0
          : ((entry.teamMembers?.findIndex((m) => m.email?.toLowerCase() === selectedPassAttendee.email?.toLowerCase()) ?? -1) + 1);
        const currentAttendeeIdSuffix = isLeadAttendee
          ? 'LEAD'
          : (currentAttendeeIndex > 0 ? `M${currentAttendeeIndex}` : 'MEMBER');
        const currentAttendeeIsCheckedIn = isLeadAttendee
          ? !!entry.leaderIsCheckedIn
          : !!selectedPassAttendee.isCheckedIn;
        const activeQrUrl = isLeadAttendee
          ? `https://hacksphere-remissg.vercel.app/verify-pass?ticketId=${ticketId}`
          : `https://hacksphere-remissg.vercel.app/verify-pass?ticketId=${ticketId}&member=${encodeURIComponent(currentAttendeeEmail)}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative my-auto print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
              
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 print:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Official Conference Badge</h3>
                    <p className="text-[11px] text-slate-400">Gate Entry &amp; Lanyard Credential</p>
                  </div>
                </div>
                <button
                  onClick={() => onClose()}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Attendee Switcher (for Multi-Member Teams) */}
              {entry.teamMembers && entry.teamMembers.length > 0 && (
                <div className="mb-3.5 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 print:hidden">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Badge ({entry.teamSize} Candidates)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      {isLeadAttendee ? 'Team Master Pass' : 'Individual Badge'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => setSelectedPassAttendee(null)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                        isLeadAttendee
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-300'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>👑 {entry.fullName} (Lead)</span>
                    </button>
                    {entry.teamMembers.map((m, idx) => {
                      const isSelected = selectedPassAttendee?.email?.toLowerCase() === m.email?.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPassAttendee(m)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-300'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                          }`}
                        >
                          <span>⚡ {m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BADGE DISPLAY WRAPPER WITH CLEAN CAPTURE BOUNDARIES */}
              <div className="flex justify-center relative my-1 print:my-0">
                {/* Ambient glow in modal (excluded from PNG capture) */}
                <div className="absolute inset-0 max-w-[360px] mx-auto bg-gradient-to-b from-cyan-500/20 via-indigo-500/20 to-purple-600/20 blur-xl rounded-[28px] pointer-events-none print:hidden"></div>

                {/* THE AUTHENTIC LANYARD BADGE (CAPTURED EXACTLY AT 360px WITH NO SHADOW CLIPPING) */}
                <div
                  id="admission-pass-card"
                  style={{
                    width: '360px',
                    maxWidth: '100%',
                    backgroundColor: '#070a14',
                    backgroundImage: 'radial-gradient(ellipse at 50% 0%, #151b3b 0%, #070a14 75%)',
                    boxSizing: 'border-box',
                  }}
                  className="relative rounded-[24px] border-2 border-indigo-500/50 p-5 text-white overflow-hidden shadow-none print:bg-white print:text-black print:border-gray-400 print:shadow-none"
                >
                  {/* Metallic Lanyard Clamp Hardware & Punch Cutout */}
                  <div className="flex flex-col items-center mb-2.5">
                    <div className="w-20 h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-t-sm opacity-90 flex items-center justify-between px-2 mb-0.5 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-500"></div>
                    </div>
                    <div className="w-14 h-2.5 bg-slate-950 border border-slate-700 rounded-full shadow-inner flex items-center justify-center">
                      <div className="w-8 h-0.5 bg-black rounded-full"></div>
                    </div>
                  </div>

                  {/* Holographic Security Foil Bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-sky-300 via-indigo-500 via-purple-500 to-pink-500 rounded-full mb-3 shadow-[0_0_8px_rgba(99,102,241,0.5)] print:bg-gray-400"></div>

                  {/* Badge Header: Event & Track */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 print:bg-black">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black tracking-wider uppercase text-white print:text-black font-mono">
                          HackSphere 2026
                        </h3>
                        <p className="text-[9px] text-cyan-400 print:text-cyan-800 font-bold uppercase tracking-widest">
                          National Finale • Entry Pass
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-950/90 text-indigo-300 border border-indigo-700/60 print:bg-gray-100 print:text-black print:border-gray-300 shrink-0">
                      {entry.domain || 'Innovation'}
                    </span>
                  </div>

                  {/* Candidate Persona Card */}
                  <div className="flex flex-col items-center text-center p-3.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 mb-3 relative overflow-hidden print:bg-gray-50 print:border-gray-200">
                    <Award className="absolute -right-3 -bottom-3 w-20 h-20 text-slate-800/20 pointer-events-none print:hidden" />

                    {/* Candidate Monogram Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 mb-2 ring-1 ring-cyan-400/40 print:bg-slate-800">
                      <div className="w-full h-full rounded-[14px] bg-slate-950/90 flex items-center justify-center text-white text-2xl font-black">
                        {currentAttendeeName?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Persona Role Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${
                        isLeadAttendee
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 print:bg-amber-100 print:text-amber-900 print:border-amber-300'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 print:bg-cyan-100 print:text-cyan-900 print:border-cyan-300'
                      }`}
                    >
                      {currentAttendeeRoleBadge}
                    </span>

                    {/* Candidate Name & Email */}
                    <h4 className="text-lg font-black text-white print:text-black tracking-tight leading-snug">
                      {currentAttendeeName}
                    </h4>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 font-mono mt-0.5">
                      {currentAttendeeEmail}
                    </p>

                    {/* Individual Candidate College & Project Title */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 w-full flex flex-col gap-1 text-[11px] print:border-gray-300">
                      {/* Dynamic Individual College Badge */}
                      <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-cyan-300 print:bg-white print:border-gray-300 print:text-black">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400 print:text-cyan-700 shrink-0" />
                        <span className="truncate max-w-[240px] font-bold text-xs" title={currentAttendeeCollege}>
                          {currentAttendeeCollege}
                        </span>
                      </div>

                      {/* Project Tag */}
                      <div className="text-slate-400 print:text-gray-600 text-[10px] truncate">
                        <span className="text-slate-500 print:text-gray-500 uppercase font-bold">Project: </span>
                        <span className="text-slate-200 print:text-black font-semibold">{entry.projectName}</span>
                      </div>
                    </div>
                  </div>

                  {/* High-Contrast Live Scannable QR Code */}
                  <div className="p-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl flex flex-col items-center text-center mb-3 print:bg-white print:border-gray-300">
                    <div className="bg-white p-2.5 rounded-2xl shadow-xl ring-2 ring-white/10 mb-2">
                      <QRCodeSVG
                        value={activeQrUrl}
                        size={116}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-300 print:text-cyan-800 tracking-wider">
                        {ticketId} • {currentAttendeeIdSuffix}
                      </span>
                      {/* Copy button is marked with data-hide-export so it won't appear in the downloaded PNG */}
                      <button
                        type="button"
                        data-hide-export="true"
                        onClick={() => handleCopyId(ticketId)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors print:hidden"
                        title="Copy Pass ID"
                      >
                        {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 print:text-gray-600 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 print:text-emerald-700 shrink-0" />
                      <span>Scan at Gate for Instant Admission</span>
                    </div>

                    {/* Gate Admission Status */}
                    {currentAttendeeIsCheckedIn ? (
                      <div className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 text-[10px] font-bold flex items-center gap-1 print:bg-emerald-100 print:text-emerald-900">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Admitted at Gate</span>
                      </div>
                    ) : (
                      <div className="mt-2 px-2 py-0.5 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-300 text-[10px] font-semibold print:bg-gray-100 print:text-gray-800">
                        Ready for Gate Scan
                      </div>
                    )}
                  </div>

                  {/* Security Watermark & Timestamp Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono tracking-wider print:border-gray-300 print:text-gray-500">
                    <span className="truncate">RSA-256 SIGNED • GATE BADGE</span>
                    <span>HACKSPHERE 2026</span>
                  </div>
                </div>
              </div>

              {/* Live Link Info */}
              <div className="mt-3 text-center print:hidden">
                <Link
                  to={`/verify-pass?ticketId=${ticketId}${!isLeadAttendee ? `&member=${encodeURIComponent(currentAttendeeEmail)}` : ''}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Test Gate Verifier Screen</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Modal Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap justify-end gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPassPng}
                  disabled={downloadingPass}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingPass ? 'Generating...' : 'Save Badge (PNG)'}</span>
                </button>
                <button
                  type="button"
                  onClick={triggerPrintPass}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Badge / PDF</span>
                </button>
              </div>

            </div>
          </div>
        );
};

export default LanyardBadgeModal;
