import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import {
  Award,
  Check,
  Download,
  ExternalLink,
  GraduationCap,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Sun,
  Moon,
  Lock,
  Unlock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const VerifiedCertificateModal = ({ isOpen, onClose, entry, user, ticketId }) => {
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLightMode, setIsLightMode] = useState(true); // Light Ivory is standard & default
  const [previewUnlocked, setPreviewUnlocked] = useState(false);

  // Allow switching certificate recipient between Team Lead and registered Teammates
  const allAttendees = [];
  if (entry) {
    allAttendees.push({
      name: entry.fullName,
      email: entry.email,
      role: 'Team Lead',
      collegeName: entry.collegeName || user?.collegeName,
    });
    if (Array.isArray(entry.teamMembers)) {
      entry.teamMembers.forEach((m) => {
        if (m && m.name) {
          allAttendees.push({
            name: m.name,
            email: m.email,
            role: 'Team Member',
            collegeName: m.collegeName || entry.collegeName,
          });
        }
      });
    }
  }

  const [selectedRecipient, setSelectedRecipient] = useState(allAttendees[0] || null);

  if (!isOpen || !entry) return null;

  const currentRecipient = selectedRecipient || {
    name: entry.fullName,
    role: 'Team Lead',
    collegeName: entry.collegeName,
  };

  // Determine Program Conclusion & Certificate Gating
  // Certificates are officially unlocked after program ends (Dec 28, 2026), or if project is awarded Finalist/Winner/Completed
  const isAwardedMilestone =
    entry.status === 'Finalist' ||
    entry.status === 'Winner' ||
    entry.status === 'Completed' ||
    entry.status === 'Shortlisted';

  // For testing and post-hackathon access, allow preview or when awarded
  const isAccessUnlocked = isAwardedMilestone || previewUnlocked;

  // Distinguish between Certificate of Winning/Merit vs Participation
  const isWinningOrMerit =
    entry.status === 'Finalist' ||
    entry.status === 'Winner' ||
    entry.status === 'Shortlisted';

  const certType = isWinningOrMerit
    ? 'Certificate of Merit & Winning Finalist'
    : 'Certificate of Official Participation';

  const certBadgeTitle = isWinningOrMerit
    ? 'CERTIFICATE OF MERIT & WINNING'
    : 'CERTIFICATE OF PARTICIPATION';

  const certId = `HS26-CERT-${entry._id?.toString().slice(-6).toUpperCase() || 'OFFICIAL'}`;

  // Dedicated public certificate verification URL (separate from pass check-in)
  const verificationUrl = `https://hacksphere-remissg.vercel.app/verify-certificate?certId=${certId}&ticketId=${ticketId}&name=${encodeURIComponent(
    currentRecipient.name
  )}&project=${encodeURIComponent(entry.projectName)}&track=${encodeURIComponent(
    entry.domain
  )}&tier=${isWinningOrMerit ? 'merit' : 'participation'}`;

  const triggerPrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    const certElem = document.getElementById('hackathon-certificate-canvas');
    if (!certElem) return;
    try {
      setDownloadingCert(true);
      const dataUrl = await toPng(certElem, {
        cacheBust: true,
        pixelRatio: 3,
        style: {
          margin: '0',
          boxShadow: 'none',
        },
      });
      const link = document.createElement('a');
      link.download = `HackSphere-Certificate-${currentRecipient.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export certificate:', err);
      window.print();
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `Proud to share my ${certType} at HackSphere National Innovation Hackathon 2026 for our project "${entry.projectName}" in track "${entry.domain}". Verified Certificate ID: ${certId}`
    );
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      'https://hacksphere-remissg.vercel.app'
    )}&summary=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(`${verificationUrl} (Certificate ID: ${certId})`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-5xl w-full shadow-2xl relative my-auto print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Modal Top Action Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 print:hidden flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isWinningOrMerit ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{certType}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isWinningOrMerit
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                }`}>
                  {isWinningOrMerit ? 'Winner / Merit Tier' : 'Participation Tier'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                A4 Landscape Rectangle • Cryptographically Verifiable Credential
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Theme Switcher Toggle (Light Ivory vs Midnight Dark) */}
            <button
              type="button"
              onClick={() => setIsLightMode(!isLightMode)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              title="Toggle Certificate Style (Light Parchment vs Dark Theme)"
            >
              {isLightMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Dark Style</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden md:inline">Light Ivory</span>
                </>
              )}
            </button>

            <button
              onClick={triggerPrint}
              disabled={!isAccessUnlocked}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
              title="Print Certificate (Always prints in Light version)"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={downloadingCert || !isAccessUnlocked}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{downloadingCert ? 'Exporting...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gated Access Release Notice (if program is ongoing) */}
        {!isAccessUnlocked ? (
          <div className="mb-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Certificates Unlock Following Grand Finale (Dec 28, 2026)</p>
                <p className="text-amber-300/80 mt-0.5">
                  Official Participation &amp; Winning Merit certificates are issued once all judging rounds and final ceremony conclude.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewUnlocked(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Preview Certificate Watermark</span>
            </button>
          </div>
        ) : (
          previewUnlocked && !isAwardedMilestone && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-sky-950/50 border border-sky-800/60 text-xs text-sky-300 flex items-center justify-between print:hidden">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Certificate Preview Mode (Official credential releases upon program conclusion)</span>
              </span>
              <button
                onClick={() => setPreviewUnlocked(false)}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Exit Preview
              </button>
            </div>
          )
        )}

        {/* Recipient Switcher (if team size > 1) */}
        {allAttendees.length > 1 && (
          <div className="mb-4 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 print:hidden">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Recipient:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {allAttendees.map((att, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedRecipient(att)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    currentRecipient.name === att.name
                      ? 'bg-sky-500 text-white font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {att.name} ({att.role === 'Team Lead' ? 'Lead' : 'Member'})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CERTIFICATE CANVAS: LANDSCAPE RECTANGLE (A4 HORIZONTAL PROPORTIONS) */}
        {/* ============================================================== */}
        <div
          id="hackathon-certificate-canvas"
          className={`relative w-full rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden transition-colors ${
            isLightMode
              ? 'bg-[#fcfbf7] text-slate-900 border-4 border-amber-600/60'
              : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-2 border-amber-500/40 shadow-inner'
          } print:border-4 print:border-black print:bg-white print:text-black print:p-8`}
          style={{ minHeight: '520px' }}
        >
          {/* Inner Classical Guilloche / Geometric Hairline Frame */}
          <div
            className={`absolute inset-3 sm:inset-4 border pointer-events-none rounded-xl ${
              isLightMode ? 'border-amber-700/30' : 'border-amber-400/20'
            } print:border-black`}
          />
          <div
            className={`absolute inset-5 sm:inset-6 border pointer-events-none rounded-lg ${
              isLightMode ? 'border-amber-600/20' : 'border-amber-300/10'
            } print:border-black`}
          />

          {/* Corner Classical Ornaments */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-amber-600 pointer-events-none print:border-black" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-amber-600 pointer-events-none print:border-black" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-amber-600 pointer-events-none print:border-black" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-amber-600 pointer-events-none print:border-black" />

          {/* Subtle Watermark Crest in Center Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none print:opacity-10">
            <Award className="w-96 h-96 text-amber-700" />
          </div>

          {/* Header Citation Section */}
          <div className="text-center relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/30 text-amber-800 text-[10px] sm:text-xs font-bold tracking-widest uppercase print:border-black print:text-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              MatruCare AI • National Innovation Programme
            </div>

            <h1
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight font-serif ${
                isLightMode ? 'text-slate-900' : 'text-white'
              } print:text-black`}
            >
              HackSphere 2026
            </h1>

            <p
              className={`text-xs sm:text-sm font-medium uppercase tracking-widest ${
                isLightMode ? 'text-amber-800' : 'text-slate-400'
              } print:text-gray-700`}
            >
              National Hackathon &amp; Innovation Grand Prix
            </p>

            {/* Certificate Distinction Ribbon Banner */}
            <div className="pt-2 pb-1 inline-block">
              <div
                className={`px-5 py-1.5 rounded-full border text-xs sm:text-sm font-serif font-bold uppercase tracking-widest shadow-sm ${
                  isWinningOrMerit
                    ? isLightMode
                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isLightMode
                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                } print:border-black print:bg-white print:text-black`}
              >
                {certBadgeTitle}
              </div>
            </div>
          </div>

          {/* Certificate Main Body */}
          <div className="text-center relative z-10 max-w-2xl mx-auto my-4 space-y-2">
            <p
              className={`text-xs sm:text-sm italic font-serif ${
                isLightMode ? 'text-slate-600' : 'text-slate-300'
              } print:text-gray-700`}
            >
              This official credential of achievement is proudly conferred upon
            </p>

            {/* Candidate Name in Bold Classical Serif */}
            <h2
              className={`text-2xl sm:text-4xl font-extrabold font-serif tracking-tight underline decoration-amber-500/40 decoration-2 underline-offset-8 ${
                isLightMode ? 'text-slate-950' : 'text-amber-300'
              } print:text-black`}
            >
              {currentRecipient.name}
            </h2>

            {currentRecipient.collegeName && (
              <p
                className={`text-xs flex items-center justify-center gap-1.5 pt-1 ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                } print:text-gray-600`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-600 print:text-black" />
                <span>{currentRecipient.collegeName}</span>
              </p>
            )}

            {/* Citation Statement */}
            <p
              className={`text-xs sm:text-sm leading-relaxed pt-2 px-4 ${
                isLightMode ? 'text-slate-700' : 'text-slate-300'
              } print:text-gray-800`}
            >
              for demonstrating exceptional technological competence, creativity, and leadership as{' '}
              <strong>{currentRecipient.role}</strong> of project team{' '}
              <strong className={isLightMode ? 'text-slate-900 font-bold underline' : 'text-white underline'}>
                "{entry.projectName}"
              </strong>{' '}
              in the{' '}
              <strong className={isLightMode ? 'text-amber-800 font-bold' : 'text-sky-400'}>
                {entry.domain}
              </strong>{' '}
              innovation track{isWinningOrMerit ? ', recognized with highest honors as a National Finalist & Winner' : ''}.
            </p>
          </div>

          {/* Footer Grid: Signatories & Verification QR */}
          <div
            className={`mt-6 sm:mt-8 pt-4 border-t relative z-10 grid grid-cols-3 items-end gap-4 ${
              isLightMode ? 'border-amber-800/20' : 'border-slate-800'
            } print:border-black`}
          >
            {/* Left Signatory: Chief Jury */}
            <div className="text-left">
              <div
                className={`font-serif italic text-sm sm:text-base font-bold ${
                  isLightMode ? 'text-slate-900' : 'text-amber-300'
                } print:text-black`}
              >
                Dr. A. Sengupta
              </div>
              <p
                className={`text-[10px] sm:text-[11px] font-semibold uppercase ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                } print:text-gray-600`}
              >
                Chief Jury &amp; Evaluation Chair
              </p>
              <p className="text-[9px] text-slate-500 print:text-gray-500">HackSphere 2026 Jury Board</p>
            </div>

            {/* Center: Dedicated Certificate Verification QR & Credential ID */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-1.5 bg-white rounded-lg shadow border border-slate-300 print:border-black">
                <QRCodeSVG
                  value={verificationUrl}
                  size={64}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <span
                className={`text-[9px] font-mono mt-1 font-bold tracking-wider ${
                  isLightMode ? 'text-slate-800' : 'text-slate-300'
                } print:text-black`}
              >
                ID: {certId}
              </span>

              {/* Distinct Certificate Credential Badge (NOT "Verified Pass") */}
              <span className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5 print:text-black">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Verified Credential</span>
              </span>
            </div>

            {/* Right Signatory: MatruCare AI Director */}
            <div className="text-right">
              <div
                className={`font-serif italic text-sm sm:text-base font-bold ${
                  isLightMode ? 'text-slate-900' : 'text-amber-300'
                } print:text-black`}
              >
                MatruCare AI Committee
              </div>
              <p
                className={`text-[10px] sm:text-[11px] font-semibold uppercase ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                } print:text-gray-600`}
              >
                Director of Programmes
              </p>
              <p className="text-[9px] text-slate-500 print:text-gray-500">Official Seal Authorized</p>
            </div>
          </div>
        </div>

        {/* Bottom Social Share & Copy Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyVerification}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
              <span>{copiedLink ? 'Verification URL Copied!' : 'Copy Verification Link'}</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              disabled={!isAccessUnlocked}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to LinkedIn</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Verify route: /verify-certificate?certId={certId}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifiedCertificateModal;
