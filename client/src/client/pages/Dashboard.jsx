import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/services/api';
import LanyardBadgeModal from '../components/LanyardBadgeModal';
import CandidateProfileModal from '../components/CandidateProfileModal';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  FileCode,
  Link as LinkIcon,
  Video,
  Users,
  Edit3,
  Trash2,
  PlusCircle,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Clock,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  X,
  UserCheck,
  Award,
  QrCode,
  Download,
  Github,
  Linkedin,
  Globe,
  Lock,
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJustRegistered = searchParams.get('registered') === 'true';

  const [entry, setEntry] = useState(null);
  const [isLeadRole, setIsLeadRole] = useState(true);
  const [memberStatus, setMemberStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedPassAttendee, setSelectedPassAttendee] = useState(null); // null = Team Lead
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const [notification, setNotification] = useState(
    isJustRegistered ? 'Congratulations! Your hackathon registration has been confirmed and emailed.' : ''
  );

  // Enforce RBAC Role Guard: Non-users (admin, evaluator, volunteer) must not view candidate participant dashboard
  useEffect(() => {
    if (user && user.role && user.role !== 'user') {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'evaluator') {
        navigate('/judge', { replace: true });
      } else if (user.role === 'volunteer') {
        navigate('/volunteer', { replace: true });
      }
    }
  }, [user, navigate]);

  const fetchMyEntry = async () => {
    if (user && user.role && user.role !== 'user') {
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/hackathon/my-entry');
      if (res.data.success) {
        setEntry(res.data.entry);
        setIsLeadRole(res.data.isTeamLead);
        setMemberStatus(res.data.memberStatus);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load hackathon submission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role === 'user') {
      fetchMyEntry();
    }
    if (searchParams.get('already_registered') === 'true') {
      setNotification('You already have an active hackathon registration. You can edit or manage your submission below.');
    }
  }, [searchParams, user]);

  const handleEdit = () => {
    navigate('/register-hackathon', { state: { editEntry: entry } });
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/hackathon/${entry._id}`);
      if (res.data.success) {
        setEntry(null);
        setDeleteModalOpen(false);
        setNotification('Your registration entry has been withdrawn successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete registration entry');
    } finally {
      setDeleting(false);
    }
  };


  const handleOpenEditProfile = () => {
    setEditProfileOpen(true);
  };

  const copyDetailsToClipboard = () => {
    if (!entry) return;
    const textToCopy = `Project: ${entry.projectName}\nTrack: ${entry.domain}\nTeam Size: ${entry.teamSize}\nLeader: ${entry.fullName} (${entry.email})\nPPT: ${entry.pptLink}\nPrototype: ${entry.prototypeLink}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const ticketId = entry ? (entry.ticketId || `HS-2026-${entry._id.slice(-6).toUpperCase()}`) : '';
  const isLead =
    !entry ||
    entry.userId?.toString() === user?.id ||
    entry.email?.toLowerCase() === user?.email?.toLowerCase();

  const handleOpenPassModal = (initialAttendee = null) => {
    if (initialAttendee) {
      setSelectedPassAttendee(initialAttendee);
    } else if (!isLeadRole && entry?.teamMembers) {
      const currentMember = entry.teamMembers.find(
        (m) => m.email?.toLowerCase() === user?.email?.toLowerCase()
      );
      setSelectedPassAttendee(currentMember || null);
    } else {
      setSelectedPassAttendee(null);
    }
    setPassModalOpen(true);
  };

  // If a non-user role opens /dashboard, do not show candidate UI
  if (user && user.role && user.role !== 'user') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Redirecting to your authorized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner Alert if just registered or updated */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification('')}
              className="text-xs text-emerald-400 hover:text-white font-medium ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pending Teammate Invitation Action Banner */}
        {entry && !isLeadRole && memberStatus === 'Pending' && (
          <div className="p-5 rounded-2xl bg-cyan-950/60 border border-cyan-800 text-cyan-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-cyan-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-base">You have a Pending Team Invitation!</p>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {entry.fullName} invited you to join Team "{entry.projectName}". Accept to activate your official admission pass.
                </p>
              </div>
            </div>
            <Link
              to={`/team-invite?passId=${entry.ticketId || ticketId}&email=${encodeURIComponent(user?.email || '')}`}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm whitespace-nowrap transition shadow-lg shadow-cyan-500/20"
            >
              Review &amp; Accept Invitation →
            </Link>
          </div>
        )}

        {/* User Profile Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg shadow-sky-500/20 shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{user?.fullName}</h1>
                  {user?.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Candidate
                    </span>
                  )}
                  {user?.role && user?.role !== 'user' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 border border-indigo-800 text-indigo-300 capitalize">
                      {user.role}
                    </span>
                  )}
                </div>

                {user?.headline ? (
                  <p className="text-sm font-medium text-sky-400">{user.headline}</p>
                ) : (
                  <p className="text-xs text-slate-500 italic">Add your headline, college, and skills to stand out</p>
                )}

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {user?.email}
                  </span>
                  {user?.mobileNumber && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      +91 {user.mobileNumber}
                    </span>
                  )}
                  {(user?.collegeName || user?.branch) && (
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                      {[user.collegeName, user.course, user.branch, user.yearOfStudy].filter(Boolean).join(' • ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions & Links */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenEditProfile}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
              >
                <Edit3 className="w-4 h-4 text-sky-400" />
                <span>Edit Profile</span>
              </button>

              {!entry && !loading && (
                <Link
                  to="/register-hackathon"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Project</span>
                </Link>
              )}
              {entry && (
                <button
                  onClick={() => handleOpenPassModal()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Entry Pass &amp; Badge</span>
                </button>
              )}
            </div>
          </div>

          {/* Social Links & Skills Row */}
          {((user?.skills && user.skills.length > 0) || user?.githubUrl || user?.linkedinUrl || user?.portfolioUrl || user?.bio) && (
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Skills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {user?.skills && user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-800/90 text-sky-300 border border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Developer Links */}
              <div className="flex items-center gap-3">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl.startsWith('http') ? user.githubUrl : `https://${user.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl.startsWith('http') ? user.linkedinUrl : `https://${user.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-800 transition"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-500" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {user?.portfolioUrl && (
                  <a
                    href={user.portfolioUrl.startsWith('http') ? user.portfolioUrl : `https://${user.portfolioUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-800 transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submission Details Section */}
        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading your hackathon submission status...</p>
          </div>
        ) : !entry ? (
          /* UNREGISTERED STATE */
          <div className="bg-slate-900/80 border border-dashed border-slate-800 rounded-3xl p-10 md:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-800/80 text-sky-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Hackathon Submission Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              You haven't submitted your hackathon project entry yet. Select your track, register your team (1-5 members), and upload your presentation & prototype.
            </p>
            <Link
              to="/register-hackathon"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Register for Hackathon</span>
            </Link>
          </div>
        ) : (
          /* REGISTERED SUBMISSION CARD */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Card Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800">
                    {entry.domain}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: {entry.status}
                  </span>
                  {!isLead && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Team Member
                    </span>
                  )}
                  <button
                    onClick={() => handleCopyId(ticketId)}
                    className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer group"
                    title="Click to copy registration ID"
                  >
                    <span>ID: {ticketId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-sky-300" />
                    )}
                    {copiedId && <span className="text-[10px] text-emerald-400 font-sans font-semibold">Copied!</span>}
                  </button>
                </div>
                <h2 className="text-2xl font-extrabold text-white">{entry.projectName}</h2>
              </div>

              {/* Action Buttons: Copy / Edit / Withdraw */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
                <button
                  onClick={copyDetailsToClipboard}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                  title="Copy details"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
                <button
                  onClick={() => handleOpenPassModal()}
                  className="px-3.5 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900/90 text-sky-300 text-xs font-semibold flex items-center gap-1.5 border border-sky-800/80 transition-colors"
                  title="View & Download Official Entry Badge"
                >
                  <QrCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Entry Badge</span>
                </button>
                {isLead ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/80 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    Lead: {entry.fullName}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Submission Progress Stepper */}
            <div className="px-6 sm:px-8 py-6 bg-slate-950/60 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-4">
                Evaluation Stage Progress
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-emerald-900/60">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">1. Submitted</p>
                    <p className="text-[10px] text-emerald-400">Verified & Confirmed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-sky-900/60 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">2. Technical Review</p>
                    <p className="text-[10px] text-sky-400">Under Review</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">3. Mentorship</p>
                    <p className="text-[10px] text-slate-500">Dec 11 – 20</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">4. Grand Finale</p>
                    <p className="text-[10px] text-slate-500">Dec 28, 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Grid 1: Academic & Contact Profile */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Academic & Contact Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">College</span>
                    <p className="text-sm font-semibold text-white mt-1 truncate" title={entry.collegeName}>
                      {entry.collegeName}
                    </p>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Course & Branch</span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {entry.course} ({entry.branch})
                    </p>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Year of Study</span>
                    <p className="text-sm font-semibold text-white mt-1">{entry.yearOfStudy}</p>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Indian Mobile</span>
                    <p className="text-sm font-semibold text-white mt-1">+91 {entry.mobileNumber}</p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Project Submission Deliverables */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Deliverables & Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href={entry.pptLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-950/70 border border-slate-800 hover:border-sky-600 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-950 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Presentation PPT</span>
                        <span className="text-[11px] text-slate-500">Google Drive / OneDrive</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                  </a>

                  <a
                    href={entry.prototypeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-950/70 border border-slate-800 hover:border-sky-600 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Prototype / Code</span>
                        <span className="text-[11px] text-slate-500">GitHub / Figma / Live</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </a>

                  {entry.demoVideoLink ? (
                    <a
                      href={entry.demoVideoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-950/70 border border-slate-800 hover:border-sky-600 rounded-2xl group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-950 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Demo Video</span>
                          <span className="text-[11px] text-slate-500">YouTube / Drive</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
                    </a>
                  ) : (
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center gap-3 text-slate-500 text-xs">
                      <Video className="w-4 h-4" />
                      <span>No demo video link provided</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 3: Team Roster */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Team Members ({entry.teamSize} {entry.teamSize === 1 ? 'Solo Participant' : 'Members'})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Lead Member */}
                  <div className="p-4 bg-slate-950/80 border border-sky-800/60 rounded-2xl relative flex flex-col justify-between">
                    <div>
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-950 text-sky-400 border border-sky-800">
                        Team Leader
                      </span>
                      <p className="text-sm font-bold text-white">{entry.fullName}</p>
                      <p className="text-xs text-slate-400 mt-1">{entry.email}</p>
                      <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 truncate" title={entry.collegeName}>
                        <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{entry.collegeName}</span>
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Master Pass</span>
                      <button
                        type="button"
                        onClick={() => handleOpenPassModal(null)}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>View Badge</span>
                      </button>
                    </div>
                  </div>

                  {/* Additional Members */}
                  {entry.teamMembers?.map((m, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative flex flex-col justify-between">
                      <div>
                        <span
                          className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'Accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : m.status === 'Declined'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {m.status || 'Pending'}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Member #{idx + 2}
                        </span>
                        <p className="text-sm font-bold text-white">{m.name}</p>
                        <p className="text-xs text-slate-400 mt-1 truncate">{m.email}</p>
                        <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 truncate" title={m.collegeName || entry.collegeName}>
                          <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{m.collegeName || entry.collegeName}</span>
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Attendee Pass</span>
                        <button
                          type="button"
                          onClick={() => handleOpenPassModal(m)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>View Badge</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer with Timestamp */}
            <div className="px-6 sm:px-8 py-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Submitted: {new Date(entry.createdAt).toLocaleDateString()}</span>
              <span>HackSphere • National Innovation Arena</span>
            </div>

          </div>
        )}

      </div>


      {/* MODAL 1: Official Printable Registration Pass & Lanyard Badge */}
      <LanyardBadgeModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        entry={entry}
        user={user}
        ticketId={ticketId}
        selectedPassAttendee={selectedPassAttendee}
        setSelectedPassAttendee={setSelectedPassAttendee}
        onDownloaded={(msg) => setNotification(msg)}
      />

      {/* MODAL 2: Comprehensive Candidate Profile Editor */}
      <CandidateProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        updateUser={updateUser}
        onSaved={(msg) => setNotification(msg)}
      />

      {/* MODAL 3: Delete / Withdraw Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Withdraw Registration?</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Are you sure you want to withdraw your hackathon project submission? This action will remove your project from the competition database.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

