import React from 'react';
import { Camera, Volume2, X, Zap } from 'lucide-react';

const QrCameraScanner = ({
  isOpen,
  scannerStarting,
  cameraError,
  canCheckIn,
  autoCheckIn,
  onToggleAutoCheckIn,
  onStop,
}) => {
  if (!isOpen) return null;

  return (
          <div className="bg-[#0b132b]/95 border-2 border-cyan-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl text-center space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2 text-left min-w-0">
                <Camera className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">Live Camera QR Scanner</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">Position the candidate QR code inside the frame to scan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onStop}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                title="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error if camera blocked */}
            {cameraError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {cameraError}
              </div>
            )}

            {/* HTML5 QR Code Video Target */}
            <div className="relative mx-auto w-full max-w-sm rounded-2xl overflow-hidden border-2 border-dashed border-cyan-500/40 bg-black min-h-[240px] sm:min-h-[280px] flex items-center justify-center shadow-inner">
              {scannerStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 z-10 text-xs text-cyan-400">
                  <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">Starting camera sensor...</span>
                </div>
              )}
              <div id="qr-camera-viewport" className="w-full"></div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Audio chime enabled on scan detection
              </span>

              {canCheckIn && (
                <label className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer bg-slate-900 px-3.5 py-2.5 sm:py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition">
                  <input
                    type="checkbox"
                    checked={autoCheckIn}
                    onChange={(e) => onToggleAutoCheckIn(e.target.checked)}
                    className="accent-cyan-500 rounded w-4 h-4"
                  />
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> Instant Check-In on Scan
                  </span>
                </label>
              )}
            </div>

            <button
              type="button"
              onClick={onStop}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel &amp; Close Camera
            </button>
          </div>
  );
};

export default QrCameraScanner;
