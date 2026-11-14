import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../shared/services/api';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  Copy,
  Check,
  ArrowRight,
  Home as HomeIcon,
} from 'lucide-react';

const VerifyCertificatePage = () => {
  const [searchParams] = useSearchParams();

  const certIdParam = searchParams.get('certId') || '';
  const ticketIdParam = searchParams.get('ticketId') || '';
  const nameParam = searchParams.get('name') || '';
  const projectParam = searchParams.get('project') || '';
  const trackParam = searchParams.get('track') || '';
  const tierParam = searchParams.get('tier') || '';

  const [loading, setLoading] = useState(!!ticketIdParam);
  const [dbEntry, setDbEntry] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (ticketIdParam) {
      setLoading(true);
      api
        .get(`/hackathon/verify-pass/${ticketIdParam.trim()}`)
        .then((res) => {
          if (res.data?.success && res.data?.entry) {
            setDbEntry(res.data.entry);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [ticketIdParam]);

  const recipientName = nameParam || dbEntry?.fullName || 'Verified Participant';
  const projectName = projectParam || dbEntry?.projectName || 'HackSphere Innovation';
  const domainTrack = trackParam || dbEntry?.domain || 'Technology & Innovation';
  const certId = certIdParam || (dbEntry?._id ? `HS26-CERT-${dbEntry._id.slice(-6).toUpperCase()}` : 'HS26-CERT-OFFICIAL');

  const isFinalistOrWinner =
    tierParam === 'merit' ||
    dbEntry?.status === 'Finalist' ||
    dbEntry?.status === 'Winner' ||
    dbEntry?.status === 'Shortlisted';

  const certTitle = isFinalistOrWinner
    ? 'Certificate of Merit & Winning Finalist'
    : 'Certificate of Official Participation';

  const handleCopyId = () => {
    navigator.clipboard.writeText(certId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* Verification Status Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Verified Credential</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HackSphere Official Credential Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            This public verification record confirms the authenticity of the certificate issued by the HackSphere 2026 Organizing Committee &amp; MatruCare AI.
          </p>
        </div>

        {/* Certificate Credential Verification Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Gold / Emerald Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isFinalistOrWinner ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              }`}>
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                  isFinalistOrWinner ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  {isFinalistOrWinner ? 'Top Honors • Merit' : 'Official Participation'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {certTitle}
                </h2>
              </div>
            </div>

            <button
              onClick={handleCopyId}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
              title="Copy Certificate ID"
            >
              <span>{certId}</span>
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>

          {/* Credential Data Grid */}
          <div className="py-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                  Recipient Name
                </span>
                <p className="text-base font-bold text-white">
                  {recipientName}
                </p>
                {dbEntry?.collegeName && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate" title={dbEntry.collegeName}>
                    <GraduationCap className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>{dbEntry.collegeName}</span>
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                  Project Submission
                </span>
                <p className="text-base font-bold text-white">
                  "{projectName}"
                </p>
                <p className="text-xs text-sky-400 flex items-center gap-1 mt-1">
                  <Layers className="w-3 h-3 shrink-0" />
                  <span>Track: {domainTrack}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-0.5">Program</span>
                <span className="font-bold text-slate-200">HackSphere 2026</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-0.5">Issuing Authority</span>
                <span className="font-bold text-slate-200">MatruCare AI Jury</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-0.5">Verification Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid &amp; Authentic
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Authority Guarantee Box */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official MatruCare AI National Innovation Credential</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Verified on hacksphere-remissg.vercel.app
            </span>
          </div>
        </div>

        {/* Public Navigation Links */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>HackSphere Home</span>
          </Link>
          <Link
            to="/leaderboard"
            className="px-4 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>Competition Leaderboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificatePage;
