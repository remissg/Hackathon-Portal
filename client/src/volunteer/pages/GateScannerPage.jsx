import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/services/api';
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
  Camera,
  CameraOff,
  Zap,
  X,
  Volume2,
  Key,
} from 'lucide-react';
import AccountSecurityModal from '../../shared/components/AccountSecurityModal';
import QrCameraScanner from '../components/QrCameraScanner';
import PassAttendanceCard from '../components/PassAttendanceCard';

const GateScannerPage = () => {
  const outletCtx = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId') || '';
  const memberParam = searchParams.get('member') || searchParams.get('memberEmail') || '';

  const { user, isAuthenticated } = useAuth();
  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'matrucareai@gmail.com';
  const isVolunteer = user?.role === 'volunteer';
  const canCheckIn = isAdmin || isVolunteer;

  const [inputTicketId, setInputTicketId] = useState(ticketIdParam);
  const [activeTicketId, setActiveTicketId] = useState(ticketIdParam);
  const [targetedMemberEmail, setTargetedMemberEmail] = useState(memberParam);

  const [loading, setLoading] = useState(!!ticketIdParam);
  const [passData, setPassData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');

  // Live Camera Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerStarting, setScannerStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [autoCheckIn, setAutoCheckIn] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const scannerInstanceRef = useRef(null);

  // Audio Confirmation Chime on scan
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  };

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current
            .stop()
            .then(() => scannerInstanceRef.current.clear())
            .catch(() => {});
        } catch (_) {}
      }
    };
  }, []);

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (_) {}
      scannerInstanceRef.current = null;
    }
    setScannerOpen(false);
    setScannerStarting(false);
  };

  const handleScanSuccess = async (scannedId, memberEmail = '') => {
    playScanBeep();
    await stopScanner();
    setInputTicketId(scannedId);
    setActiveTicketId(scannedId);
    setTargetedMemberEmail(memberEmail);

    // If auto-admit on scan is enabled and user is gate staff, check in immediately!
    if (autoCheckIn && canCheckIn) {
      try {
        setCheckingIn(true);
        const action = memberEmail ? 'admit-member' : 'admit-all';
        const res = await api.post('/hackathon/admin/check-in', {
          passId: scannedId,
          action,
          memberEmail,
        });
        if (res.data.success) {
          setCheckInMsg(
            `⚡ Instant Gate Admission: ${res.data.message || scannedId}`
          );
          setTimeout(() => setCheckInMsg(''), 5000);
        }
      } catch (err) {
        console.error('[Auto Check-in Error]:', err);
      } finally {
        setCheckingIn(false);
      }
    }
  };

  const startScanner = async () => {
    setCameraError('');
    setScannerStarting(true);
    setScannerOpen(true);

    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode('qr-camera-viewport');
        scannerInstanceRef.current = qr;

        await qr.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.max(180, Math.floor(minEdge * 0.72));
              return { width: size, height: size };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            let extractedId = decodedText.trim();
            let scannedMember = '';
            if (extractedId.includes('ticketId=')) {
              try {
                const u = new URL(extractedId, window.location.origin);
                scannedMember = u.searchParams.get('member') || u.searchParams.get('memberEmail') || '';
                extractedId = u.searchParams.get('ticketId') || extractedId;
              } catch (_) {
                if (extractedId.includes('member=')) {
                  scannedMember = extractedId.split('member=')[1]?.split('&')[0] || '';
                }
                extractedId = extractedId.split('ticketId=')[1]?.split('&')[0] || extractedId;
              }
            } else if (extractedId.includes('/verify-pass/')) {
              extractedId = extractedId.split('/verify-pass/')[1]?.split('?')[0] || extractedId;
            }
            handleScanSuccess(extractedId, scannedMember);
          },
          () => {} // frame scan miss, silence
        );
      } catch (err) {
        console.error('[Camera Init Error]:', err);
        setCameraError(
          'Could not access camera. Please allow camera permissions in your browser or connect a webcam.'
        );
      } finally {
        setScannerStarting(false);
      }
    }, 200);
  };

  const fetchPass = async (id, memberEmail = targetedMemberEmail) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const query = memberEmail ? `?member=${encodeURIComponent(memberEmail)}` : '';
      const res = await api.get(`/hackathon/verify-pass/${id.trim()}${query}`);
      if (res.data.success && res.data.verified) {
        setPassData(res.data.pass);
      } else {
        setError(res.data.message || 'Pass ID verification failed');
      }
    } catch (err) {
      console.error('[Verify Pass Error]:', err);
      setError(
        err.response?.data?.message ||
          'Invalid or unregistered Pass ID. This pass could not be authenticated against the HackSphere registry.'
      );
      setPassData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTicketId) {
      fetchPass(activeTicketId, targetedMemberEmail);
    }
  }, [activeTicketId, targetedMemberEmail]);

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

  const handleCheckInToggle = async (action = 'admit-all', memberEmail = null) => {
    if (!passData?.ticketId) return;
    setCheckingIn(true);
    try {
      const res = await api.post('/hackathon/admin/check-in', {
        passId: passData.ticketId,
        action,
        memberEmail,
      });
      if (res.data.success) {
        setCheckInMsg(res.data.message);
        await fetchPass(passData.ticketId, targetedMemberEmail);
        setTimeout(() => setCheckInMsg(''), 5000);
      }
    } catch (err) {
      console.error('[Check-In Error]:', err);
      alert(err.response?.data?.message || 'Failed to update check-in status');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#070d19] text-slate-150 ${outletCtx.embeddedInVolunteerLayout ? 'pt-5 sm:pt-8' : 'pt-24 sm:pt-28'} pb-14 px-3.5 sm:px-6 lg:px-8`}>
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            Official Pass Registry &amp; Verification
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Event Pass Verification
          </h1>
          <p className="mt-1.5 sm:mt-2 text-slate-400 text-xs sm:text-base">
            HackSphere National Innovation Hackathon 2026
          </p>
        </div>

        {/* Global Live Scan Toast */}
        {checkInMsg && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-2xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{checkInMsg}</span>
          </div>
        )}


        {/* Camera Scanner Viewfinder Card */}
        <QrCameraScanner
          isOpen={scannerOpen}
          scannerStarting={scannerStarting}
          cameraError={cameraError}
          canCheckIn={canCheckIn}
          autoCheckIn={autoCheckIn}
          onToggleAutoCheckIn={setAutoCheckIn}
          onStop={stopScanner}
        />

        {/* Quick Scanner Action Bar */}
        {!scannerOpen && (
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={startScanner}
              className="w-full sm:w-auto justify-center min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center gap-2.5 shadow-lg shadow-cyan-500/25 transition active:scale-[0.99]"
            >
              <Camera className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Scan QR with Device Camera</span>
            </button>

            {activeTicketId && (
              <button
                type="button"
                onClick={() => {
                  setActiveTicketId('');
                  setInputTicketId('');
                  setPassData(null);
                  setError('');
                }}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
              >
                Clear / Manual Lookup
              </button>
            )}

            {isVolunteer && !isAdmin && (
              <button
                type="button"
                onClick={() => setSecurityModalOpen(true)}
                className="w-full sm:w-auto justify-center min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition flex items-center gap-2"
                title="Staff Account Security & Password"
              >
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Staff Security</span>
              </button>
            )}
          </div>
        )}

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
        <PassAttendanceCard
          passData={passData}
          isAdmin={isAdmin}
          canCheckIn={canCheckIn}
          checkingIn={checkingIn}
          checkInMsg={checkInMsg}
          copied={copied}
          onCopyId={handleCopyId}
          onCheckInToggle={handleCheckInToggle}
          onScanNext={() => {
            setPassData(null);
            startScanner();
          }}
        />

      </div>
      {/* Volunteer-Only Account Security Modal (blocked for Admin visitors) */}
      {isVolunteer && !isAdmin && (
        <AccountSecurityModal
          isOpen={securityModalOpen}
          onClose={() => setSecurityModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GateScannerPage;
