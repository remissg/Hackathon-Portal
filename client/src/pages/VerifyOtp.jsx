import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, KeyRound, AlertCircle, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react';

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const redirectParam = searchParams.get('redirect') || '';
  const initialOtp = searchParams.get('otp') || '';
  const [email, setEmail] = useState(emailParam);
  const [fallbackOtp, setFallbackOtp] = useState(initialOtp);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds

  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // 10-minute countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please go back to signup.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, otpCode);
      if (res.success) {
        setSuccess('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '';
          const emailQuery = email ? `&email=${encodeURIComponent(email)}` : '';
          navigate(`/login?verified=true${emailQuery}${redirectQuery}`);
        }, 1500);
      } else {
        setError(res.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please provide your email address to resend OTP');
      return;
    }
    try {
      setResending(true);
      setError('');
      setSuccess('');
      const res = await resendOtp(email);
      if (res.success) {
        if (res.otp) {
          setFallbackOtp(res.otp);
        }
        setSuccess('A new 6-digit verification code has been sent to your email.');
        setCountdown(600); // reset 10-minute timer
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.message || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <KeyRound className="w-6 h-6 text-sky-200" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter the 6-digit code sent by <strong className="text-sky-400">MatruCare AI</strong> to
        </p>
        <p className="text-center text-sm font-semibold text-slate-200 mt-0.5">
          {email || 'your registered email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl py-8 px-6 sm:px-10 shadow-2xl">
          
          {/* Cloud Platform Fallback Box (Railway Free Tier blocks SMTP ports 465/587) */}
          {fallbackOtp && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-sky-950/40 to-indigo-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2.5 animate-fade-in shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Cloud Demo OTP Code
                </span>
                <span className="font-mono text-sm font-black text-white bg-slate-900/90 px-2.5 py-0.5 rounded border border-amber-500/40 tracking-wider">
                  {fallbackOtp}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Railway's free tier policy drops outbound SMTP ports (465/587). Your generated 6-digit verification code is ready to use below:
              </p>
              <button
                type="button"
                onClick={() => {
                  setOtpDigits(fallbackOtp.split(''));
                  inputRefs.current[5]?.focus();
                }}
                className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition flex items-center justify-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" /> 1-Click Auto-Fill Code ({fallbackOtp})
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* If email wasn't passed in URL, allow user to input it */}
            {!emailParam && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 text-center">
                6-Digit Security Code
              </label>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-slate-950 border border-slate-700/80 rounded-xl text-sky-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <span>Code expires in:</span>
                <span className={`font-mono font-bold ${countdown < 60 ? 'text-rose-400' : 'text-sky-400'}`}>
                  {formatTime(countdown)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || countdown > 540} // Allow resend after 1 min or if needed
                className="text-sky-400 hover:text-sky-300 disabled:text-slate-600 disabled:cursor-not-allowed font-medium inline-flex items-center gap-1"
              >
                <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Need to change your email?{' '}
              <Link to="/signup" className="text-sky-400 hover:text-sky-300 font-medium">
                Back to Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

