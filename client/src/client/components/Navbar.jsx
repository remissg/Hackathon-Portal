import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
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
  Key,
} from 'lucide-react';
import AccountSecurityModal from '../../shared/components/AccountSecurityModal';
import NotificationBell from '../../shared/components/NotificationBell';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'matrucareai@gmail.com';
  const isJudge = user?.role === 'evaluator' || isAdmin;
  const isVolunteer = user?.role === 'volunteer';

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
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
                Hack<span className="text-sky-400 font-extrabold">Sphere</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
                Innovation Portal
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
              to="/faq"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/faq') ? 'text-sky-400 bg-sky-950/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              FAQ
            </Link>
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
                    to="/volunteer"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      (isActive('/volunteer') || isActive('/verify-pass'))
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

                {/* Real-Time Database Connected Notification Bell Center */}
                <NotificationBell />

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
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090e1a] border border-slate-700 shadow-2xl shadow-black ring-1 ring-slate-700/80 py-2 z-[100] animate-fade-in divide-y divide-slate-800"
                      style={{ backgroundColor: '#090e1a', opacity: 1 }}
                    >
                      
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
                              to="/volunteer"
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
                              to="/volunteer"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-950/30 transition-colors"
                            >
                              <QrCode className="w-4 h-4 text-emerald-400" />
                              <span>Gate Pass Scanner</span>
                            </Link>
                          </>
                        ) : isVolunteer ? (
                          <Link
                            to="/volunteer"
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

                      {/* Security Settings & Logout Links */}
                      <div className="pt-1.5 px-2 border-t border-slate-800/80 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setSecurityModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                        >
                          <Key className="w-4 h-4 text-sky-400" />
                          <span>Security &amp; Password</span>
                        </button>
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

          {/* Mobile Controls (Notification Bell & Hamburger) */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell align="right" />}
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
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            FAQ
          </Link>
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
                    to="/volunteer"
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
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSecurityModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <Key className="w-4 h-4 text-sky-400" />
                  Security &amp; Password
                </button>
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
      {/* Account & Security Modal */}
      <AccountSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
