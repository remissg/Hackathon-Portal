import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  ShieldAlert,
  ChevronDown,
  Layers,
  Bell,
  CheckCheck,
  Trash2,
  Ticket,
  QrCode,
  ShieldCheck,
  Award,
  Trophy,
  Target,
} from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'matrucareai@gmail.com';
  const isJudge = user?.role === 'evaluator' || isAdmin;
  const isVolunteer = user?.role === 'volunteer';

  // Notification Center State (persisted per user)
  const userStorageKey = `mcai_notifs_${user?.email || 'guest'}`;
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: '1',
        title: '🎉 Admission Pass Ready',
        message: 'Your official QR-code admission pass is ready to view and scan on your dashboard.',
        time: 'Just now',
        read: false,
        link: '/dashboard',
      },
      {
        id: '2',
        title: '🛡️ Pass Scanner Live',
        message: 'Point any phone camera at your pass QR code to test instant pass verification.',
        time: '5m ago',
        read: false,
        link: '/verify-pass',
      },
      {
        id: '3',
        title: '✉️ Deliverability Optimized',
        message: 'All hackathon invitations & milestone emails are configured with direct inbox delivery.',
        time: '1h ago',
        read: true,
        link: '/dashboard',
      },
    ];
  });

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications, userStorageKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-sky-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">
                MatruCare <span className="text-sky-400">AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
                Hackathon Portal
              </span>
            </div>
          </Link>

          {/* Streamlined Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-sky-400 bg-sky-950/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Home
            </Link>
            <Link
              to="/problems"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/problems') ? 'text-sky-400 bg-sky-950/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-sky-400" />
              Challenges
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/leaderboard') ? 'text-amber-400 bg-amber-950/40 font-bold' : 'text-amber-300/90 hover:text-amber-300 hover:bg-slate-800/40'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Leaderboard
            </Link>
            <a
              href="/#highlights"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              Tracks
            </a>
            <a
              href="/#timeline"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              Prizes
            </a>
            <Link
              to="/contact"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-sky-400 bg-sky-950/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                
                {/* Role-Specific Primary Dashboard Link */}
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive('/admin')
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </Link>
                ) : isJudge ? (
                  <Link
                    to="/judge"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive('/judge')
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Judge Workspace</span>
                  </Link>
                ) : isVolunteer ? (
                  <Link
                    to="/verify-pass"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive('/verify-pass')
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Gate Scanner</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Real-Time Notification Bell Center */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-sm shadow-cyan-500/50">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Floating Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-3 z-50 animate-fade-in divide-y divide-slate-800/80">
                      <div className="px-4 pb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark read
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/40 py-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-500">
                            No notifications at this time
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              to={n.link}
                              onClick={() => {
                                setNotifications((prev) =>
                                  prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                                );
                                setNotifDropdownOpen(false);
                              }}
                              className={`block px-4 py-3 transition hover:bg-slate-800/60 ${
                                !n.read ? 'bg-cyan-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                                <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                            </Link>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="px-4 pt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">MatruCare AI Live Alerts</span>
                          <button
                            type="button"
                            onClick={clearAllNotifications}
                            className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" /> Clear
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modern User Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {(user?.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[110px] truncate">{user?.fullName || 'User'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-fade-in divide-y divide-slate-800/80">
                      
                      {/* User Header Info */}
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
                          {isAdmin ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Admin
                            </span>
                          ) : user?.role === 'evaluator' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Award className="w-3 h-3" /> Judge
                            </span>
                          ) : user?.role === 'volunteer' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <QrCode className="w-3 h-3" /> Volunteer
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              Innovator
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
                      </div>

                      {/* Dropdown Action Links */}
                      <div className="py-1.5 px-2 space-y-0.5">
                        {isAdmin ? (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                              <span>Admin Console</span>
                            </Link>
                            <Link
                              to="/judge"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 hover:text-white hover:bg-amber-950/30 transition-colors"
                            >
                              <Award className="w-4 h-4 text-amber-400" />
                              <span>Judge Portal</span>
                            </Link>
                            <Link
                              to="/verify-pass"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-950/30 transition-colors"
                            >
                              <QrCode className="w-4 h-4 text-emerald-400" />
                              <span>Pass Scanner</span>
                            </Link>
                          </>
                        ) : isJudge ? (
                          <>
                            <Link
                              to="/judge"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-950/30 transition-colors"
                            >
                              <Award className="w-4 h-4 text-amber-400" />
                              <span>Judge Scoring Rubric</span>
                            </Link>
                            <Link
                              to="/verify-pass"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-950/30 transition-colors"
                            >
                              <QrCode className="w-4 h-4 text-emerald-400" />
                              <span>Gate Pass Scanner</span>
                            </Link>
                          </>
                        ) : isVolunteer ? (
                          <Link
                            to="/verify-pass"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-950/30 transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span>Gate Pass Scanner</span>
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/70 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-sky-400" />
                              <span>Participant Dashboard</span>
                            </Link>
                            <Link
                              to="/register-hackathon"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/70 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4 text-indigo-400" />
                              <span>Register Project</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout Link */}
                      <div className="pt-1.5 px-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sm shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-sky-400 hover:text-sky-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <Target className="w-4 h-4 text-sky-400" />
            Challenges &amp; Problem Statements
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Live Leaderboard
          </Link>
          <a
            href="/#highlights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Event Tracks
          </a>
          <a
            href="/#timeline"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Timeline & Prizes
          </a>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            FAQ
          </a>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>Signed in as: <strong className="text-white">{user?.fullName}</strong></span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Admin
                    </span>
                  )}
                </div>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white shadow-sm"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Console
                  </Link>
                ) : isJudge ? (
                  <Link
                    to="/judge"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-slate-950 font-bold"
                  >
                    <Award className="w-4 h-4" />
                    Judge Scoring Workspace
                  </Link>
                ) : isVolunteer ? (
                  <Link
                    to="/verify-pass"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white font-bold"
                  >
                    <QrCode className="w-4 h-4" />
                    Gate Pass Scanner
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Candidate Dashboard
                    </Link>
                    <Link
                      to="/register-hackathon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 border border-slate-800 text-slate-200"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Register Project
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800 text-xs font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm"
                >
                  Sign Up & Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
