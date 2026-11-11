import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/services/api';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const isJustVerified = searchParams.get('verified') === 'true';
  const isExpired = searchParams.get('expired') === 'true';
  const isDeactivated = searchParams.get('deactivated') === 'true';
  const emailParam = searchParams.get('email') || '';
  const redirectParam = searchParams.get('redirect') || '';

  // Auth mode: 'login' | 'forgot-email' | 'forgot-reset'
  const [mode, setMode] = useState('login');

  const [formData, setFormData] = useState({
    email: emailParam,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password + OTP Reset State
  const [resetEmail, setResetEmail] = useState(emailParam);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = redirectParam || location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const openForgotPassword = () => {
    setError('');
    setSuccessMsg('');
    setResetEmail(formData.email.trim());
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setMode('forgot-email');
  };

  const backToLogin = (keepSuccess = false) => {
    setError('');
    if (!keepSuccess) setSuccessMsg('');
    setMode('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData.email.trim().toLowerCase(), formData.password);
      if (res.success) {
        // Role-based destination routing
        const userRole = res.user?.role;
        let defaultPath = '/dashboard';
        if (userRole === 'admin') defaultPath = '/admin';
        else if (userRole === 'evaluator') defaultPath = '/judge';
        else if (userRole === 'volunteer') defaultPath = '/volunteer';
        else defaultPath = '/dashboard';

        // Only redirect to 'from' if it was explicitly non-dashboard or matches role
        const destination = from && from !== '/dashboard' ? from : defaultPath;
        navigate(destination, { replace: true });
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.isVerified === false) {
        setError(
          <span>
            Account not verified.{' '}
            <Link
              to={`/verify-otp?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`}
              className="underline text-sky-400 font-semibold"
            >
              Click here to verify your OTP
            </Link>
          </span>
        );
      } else {
        setError(
          err.response?.data?.message || 'Invalid credentials. Please verify your email and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid registered email address');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email: targetEmail });
      if (res.data.success) {
        setResetEmail(targetEmail);
        setMode('forgot-reset');
        setResendCooldown(60);
        setSuccessMsg(
          res.data.message ||
            `A 6-digit reset OTP has been sent to ${targetEmail}. Please check your inbox or spam folder.`
        );
      }
    } catch (err) {
      console.error('[Forgot Password Error]:', err);
      setError(
        err.response?.data?.message || 'Unable to send reset OTP. Please double check your email.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = resetOtp.replace(/\D/g, '').trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP from your email');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        email: resetEmail.trim().toLowerCase(),
        otp: cleanOtp,
        newPassword,
        confirmPassword: confirmNewPassword,
      });

      if (res.data.success) {
        setFormData({
          email: resetEmail.trim().toLowerCase(),
          password: '',
        });
        setResetOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMsg(
          res.data.message || 'Password updated successfully! Sign in with your new password.'
        );
        backToLogin(true);
      }
    } catch (err) {
      console.error('[Reset Password Error]:', err);
      setError(
        err.response?.data?.message || 'Failed to verify OTP and reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            {mode === 'login' ? (
              <Sparkles className="w-6 h-6 text-sky-200" />
            ) : (
              <KeyRound className="w-6 h-6 text-sky-200" />
            )}
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          {mode === 'login'
            ? 'Participant Sign In'
            : mode === 'forgot-email'
            ? 'Reset Password'
            : 'Verify OTP & Reset'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 px-4">
          {mode === 'login'
            ? 'Access your hackathon dashboard and portal workspace'
            : mode === 'forgot-email'
            ? 'Receive a 6-digit verification code on your registered email'
            : `Enter the 6-digit OTP sent to ${resetEmail}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl py-8 px-6 sm:px-10 shadow-2xl">
          {mode === 'login' && isJustVerified && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Email verified! You can now log in to your account.</span>
            </div>
          )}

          {mode === 'login' && isExpired && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {mode === 'login' && isDeactivated && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>
                Your role access has been deactivated. Contact the HackSphere admin if access is
                required.
              </span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* MODE 1: STANDARD SIGN IN */}
          {mode === 'login' && (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={openForgotPassword}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-400">
                  Don&apos;t have an account yet?{' '}
                  <Link to="/signup" className="text-sky-400 hover:text-sky-300 font-medium">
                    Create one now
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* MODE 2: FORGOT PASSWORD — REQUEST OTP */}
          {mode === 'forgot-email' && (
            <form onSubmit={handleRequestResetOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  We will send a 6-digit one-time verification code valid for 10 minutes to reset
                  your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit Reset OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => backToLogin(false)}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD — VERIFY OTP & SET NEW PASSWORD */}
          {mode === 'forgot-reset' && (
            <form onSubmit={handleResetPasswordWithOtp} className="space-y-4">
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-mono text-sky-400 truncate max-w-[200px]">{resetEmail}</span>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setMode('forgot-email');
                  }}
                  className="text-slate-400 hover:text-white underline font-medium"
                >
                  Change email
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    6-Digit Email OTP
                  </label>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={() => handleRequestResetOtp()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={resetOtp}
                  onChange={(e) => {
                    setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (error) setError('');
                  }}
                  placeholder="• • • • • •"
                  className="w-full py-3 px-4 bg-slate-950 border border-slate-700/80 rounded-xl text-center text-white font-mono text-xl font-bold tracking-[0.45em] placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying &amp; Updating...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP &amp; Change Password</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => backToLogin(false)}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
