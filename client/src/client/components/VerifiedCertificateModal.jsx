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
} from 'lucide-react';

const VerifiedCertificateModal = ({ isOpen, onClose, entry, user, ticketId }) => {
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const isFinalist = entry.status === 'Finalist' || entry.status === 'Shortlisted';
  const certType = isFinalist ? 'Certificate of Merit & Finalist' : 'Certificate of Participation';
  const certId = `HS26-CERT-${entry._id?.toString().slice(-6).toUpperCase() || 'OFFICIAL'}`;
  const verificationUrl = `https://hacksphere-remissg.vercel.app/verify-pass?ticketId=${ticketId}`;

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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl relative my-auto print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Modal Top Action Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Official Verified Certificate</h3>
              <p className="text-[11px] text-slate-400">Cryptographically verifiable credential</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadPng}
              disabled={downloadingCert}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
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

        {/* Recipient Switcher (if team size > 1) */}
        {allAttendees.length > 1 && (
          <div className="mb-4 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 print:hidden">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Certificate Recipient:
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

        {/* CERTIFICATE CANVAS (PRINTABLE / EXPORTABLE) */}
        <div
          id="hackathon-certificate-canvas"
          className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 rounded-2xl border-2 border-amber-500/40 shadow-inner overflow-hidden print:border-4 print:border-black print:bg-white print:text-black print:p-8"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/80 pointer-events-none print:border-black" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/80 pointer-events-none print:border-black" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/80 pointer-events-none print:border-black" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/80 pointer-events-none print:border-black" />

          {/* Background watermark badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none print:opacity-10">
            <Award className="w-80 h-80 text-amber-300" />
          </div>

          {/* Certificate Header */}
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 print:border-black print:text-black">
              <Sparkles className="w-3.5 h-3.5" />
              MatruCare AI • National Innovation Programme
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white print:text-black font-serif">
              HackSphere 2026
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider print:text-gray-600 mt-1">
              National Hackathon &amp; Innovation Grand Prix
            </p>

            <div className="my-4 sm:my-6 inline-block">
              <span className="text-xs sm:text-sm uppercase tracking-widest text-amber-400 font-bold px-4 py-1.5 border-b-2 border-amber-400 block print:text-black print:border-black">
                {certType}
              </span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="text-center relative z-10 max-w-xl mx-auto my-4 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 print:text-gray-700 italic">
              This official credential certifies that
            </p>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 print:text-black underline decoration-amber-500/30 decoration-2 underline-offset-8">
              {currentRecipient.name}
            </h2>

            {currentRecipient.collegeName && (
              <p className="text-xs text-slate-400 print:text-gray-600 flex items-center justify-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400 print:text-black" />
                <span>{currentRecipient.collegeName}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-300 print:text-gray-800 leading-relaxed pt-2">
              has demonstrated outstanding technical competence, creativity, and collaboration as{' '}
              <strong>{currentRecipient.role}</strong> for project team{' '}
              <strong className="text-white print:text-black underline">"{entry.projectName}"</strong> in the{' '}
              <strong className="text-sky-400 print:text-black">{entry.domain}</strong> innovation track.
            </p>
          </div>

          {/* Verification Bar & Signatures Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800 print:border-black relative z-10 grid grid-cols-3 items-center gap-4">
            
            {/* Left: Signatory 1 */}
            <div className="text-left">
              <div className="font-serif italic text-sm text-amber-300 font-bold print:text-black">
                Dr. A. Sengupta
              </div>
              <p className="text-[10px] text-slate-400 print:text-gray-600 font-semibold uppercase">
                Chief Jury &amp; Evaluation Chair
              </p>
              <p className="text-[9px] text-slate-500 print:text-gray-500">HackSphere 2026</p>
            </div>

            {/* Center: QR & Verification Badge */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-1.5 bg-white rounded-lg shadow-md border border-slate-700 print:border-black">
                <QRCodeSVG
                  value={verificationUrl}
                  size={64}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-400 print:text-black mt-1.5 font-bold tracking-wider">
                ID: {certId}
              </span>
              <span className="text-[8px] text-emerald-400 print:text-black flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified Pass
              </span>
            </div>

            {/* Right: Signatory 2 */}
            <div className="text-right">
              <div className="font-serif italic text-sm text-amber-300 font-bold print:text-black">
                MatruCare AI Committee
              </div>
              <p className="text-[10px] text-slate-400 print:text-gray-600 font-semibold uppercase">
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
              <span>{copiedLink ? 'Link Copied!' : 'Copy Verification ID'}</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to LinkedIn</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Direct verify: hacksphere-remissg.vercel.app/verify-pass
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifiedCertificateModal;
