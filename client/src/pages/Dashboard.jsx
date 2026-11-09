import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
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
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadingPass, setDownloadingPass] = useState(false);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleDownloadPassPng = async () => {
    const passElement = document.getElementById('admission-pass-card');
    if (!passElement) return;
    try {
      setDownloadingPass(true);
      const dataUrl = await toPng(passElement, {
        cacheBust: true,
        backgroundColor: '#0b132b',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `MatruCareAI-Pass-${ticketId}.png`;
      link.href = dataUrl;
      link.click();
      setNotification('Pass image (PNG) downloaded successfully!');
    } catch (err) {
      console.error('[Download Pass PNG Error]:', err);
      alert('Could not generate pass image. You can use Print Pass / PDF instead.');
    } finally {
      setDownloadingPass(false);
    }
  };
  
  // Profile edit form state with multi-tab support
  const [profileTab, setProfileTab] = useState('academic'); // 'academic' | 'developer' | 'security'
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    mobileNumber: user?.mobileNumber || '',
    collegeName: user?.collegeName || '',
    course: user?.course || 'B.Tech',
    branch: user?.branch || 'CSE',
    yearOfStudy: user?.yearOfStudy || '3rd Year',
    headline: user?.headline || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

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
        navigate('/verify-pass', { replace: true });
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
    setProfileForm({
      fullName: user?.fullName || '',
      mobileNumber: user?.mobileNumber || '',
      collegeName: user?.collegeName || '',
      course: user?.course || 'B.Tech',
      branch: user?.branch || 'CSE',
      yearOfStudy: user?.yearOfStudy || '3rd Year',
      headline: user?.headline || '',
      githubUrl: user?.githubUrl || '',
      linkedinUrl: user?.linkedinUrl || '',
      portfolioUrl: user?.portfolioUrl || '',
      skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
      bio: user?.bio || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setProfileTab('academic');
    setProfileMessage('');
    setProfileSuccessMsg('');
    setEditProfileOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileSuccessMsg('');

    if (!profileForm.fullName.trim() || profileForm.fullName.trim().length < 3) {
      setProfileMessage('Full name must be at least 3 characters');
      setProfileTab('academic');
      return;
    }

    if (profileForm.mobileNumber && !/^[0-9]{10}$/.test(profileForm.mobileNumber.trim())) {
      setProfileMessage('Please enter a valid 10-digit mobile number');
      setProfileTab('academic');
      return;
    }

    if (profileForm.newPassword) {
      if (!profileForm.currentPassword) {
        setProfileMessage('Current password is required to change password');
        setProfileTab('security');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        setProfileMessage('New password must be at least 6 characters');
        setProfileTab('security');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileMessage('New passwords do not match');
        setProfileTab('security');
        return;
      }
    }

    try {
      setUpdatingProfile(true);
      const payload = {
        fullName: profileForm.fullName.trim(),
        mobileNumber: profileForm.mobileNumber.trim(),
        collegeName: profileForm.collegeName.trim(),
        course: profileForm.course.trim(),
        branch: profileForm.branch.trim(),
        yearOfStudy: profileForm.yearOfStudy.trim(),
        headline: profileForm.headline.trim(),
        githubUrl: profileForm.githubUrl.trim(),
        linkedinUrl: profileForm.linkedinUrl.trim(),
        portfolioUrl: profileForm.portfolioUrl.trim(),
        skills: profileForm.skills,
        bio: profileForm.bio.trim(),
      };

      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const res = await api.put('/user/update', payload);
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileSuccessMsg('Candidate profile updated successfully!');
        setTimeout(() => {
          setEditProfileOpen(false);
          setNotification('Candidate profile updated successfully!');
        }, 700);
      }
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const copyDetailsToClipboard = () => {
    if (!entry) return;
    const textToCopy = `Project: ${entry.projectName}\nTrack: ${entry.domain}\nTeam Size: ${entry.teamSize}\nLeader: ${entry.fullName} (${entry.email})\nPPT: ${entry.pptLink}\nPrototype: ${entry.prototypeLink}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrintPass = () => {
    window.print();
  };

  const ticketId = entry ? `MCAI-2026-${entry._id.slice(-6).toUpperCase()}` : '';
  const isLead =
    !entry ||
    entry.userId?.toString() === user?.id ||
    entry.email?.toLowerCase() === user?.email?.toLowerCase();

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
                  onClick={() => setPassModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Print Entry Pass</span>
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
                  <div className="p-4 bg-slate-950/80 border border-sky-800/60 rounded-2xl relative">
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-950 text-sky-400 border border-sky-800">
                      Team Leader
                    </span>
                    <p className="text-sm font-bold text-white">{entry.fullName}</p>
                    <p className="text-xs text-slate-400 mt-1">{entry.email}</p>
                  </div>

                  {/* Additional Members */}
                  {entry.teamMembers?.map((m, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative">
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
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer with Timestamp */}
            <div className="px-6 sm:px-8 py-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Submitted: {new Date(entry.createdAt).toLocaleDateString()}</span>
              <span>MatruCare AI • Full Stack Developer Track</span>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: Official Printable Registration Pass */}
      {passModalOpen && entry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative print:bg-white print:text-black print:border-none print:shadow-none">
            <button
              onClick={() => setPassModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Capturable Ticket Box */}
            <div id="admission-pass-card" className="p-4 sm:p-5 bg-slate-900 rounded-2xl print:bg-white print:p-0">
              {/* Ticket Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5 print:border-gray-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white print:bg-sky-600 shadow-md shadow-sky-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white print:text-black">MatruCare AI Hackathon 2026</h3>
                  <p className="text-xs text-sky-400 print:text-sky-700">Official Candidate Entry Pass</p>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 print:bg-gray-100 print:border-gray-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Pass / Ticket ID</span>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-sky-400 text-sm print:text-sky-800">{ticketId}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyId(ticketId)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors print:hidden"
                        title="Copy Pass ID"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {copiedId && <span className="text-[10px] text-emerald-400 print:hidden">Copied!</span>}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Track</span>
                    <p className="font-bold text-white print:text-black">{entry.domain}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Project Title</span>
                  <p className="text-sm font-bold text-white print:text-black">{entry.projectName}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Candidate (Ticket Holder)</span>
                    <p className="font-medium text-slate-200 print:text-gray-800 text-sm">
                      {user?.fullName || entry.fullName}
                    </p>
                    <p className="text-slate-400 print:text-gray-600 text-[11px] truncate">
                      {user?.email || entry.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user?.email?.toLowerCase() === entry.email?.toLowerCase()
                          ? 'bg-sky-950/80 text-sky-300 border border-sky-800/60'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                      }`}>
                        {user?.email?.toLowerCase() === entry.email?.toLowerCase() ? '★ Team Lead' : '👤 Team Member'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">College / Institute</span>
                    <p className="font-medium text-slate-200 print:text-gray-800 text-sm truncate" title={entry.collegeName}>
                      {entry.collegeName}
                    </p>
                    {user?.email?.toLowerCase() !== entry.email?.toLowerCase() && (
                      <div className="mt-1 text-[11px] text-slate-400">
                        <span>Team Lead: </span>
                        <span className="text-slate-200 font-medium">{entry.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Team Size &amp; Members</span>
                  <p className="font-medium text-slate-200 print:text-gray-800">
                    {entry.teamSize} Member(s): {entry.fullName} (Lead)
                    {entry.teamMembers?.map((m) => `, ${m.name}`)}
                  </p>
                </div>

                {/* Scannable Dynamic QR Code Box */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4 print:border-gray-300 print:bg-white">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-white print:text-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Live Verifiable QR Code
                    </span>
                    <p className="text-[10px] text-slate-400 print:text-gray-600 max-w-[210px] leading-relaxed">
                      Scan with any camera or open pass verifier to validate authenticity.
                    </p>
                    <Link
                      to={`/verify-pass?ticketId=${ticketId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-400 hover:underline inline-flex items-center gap-1 print:hidden pt-1"
                    >
                      Open Live Verifier Link <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>

                  <div className="bg-white p-2 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                    <QRCodeSVG
                      value={`https://client-seven-gold-99.vercel.app/verify-pass?ticketId=${ticketId}`}
                      size={86}
                      level="M"
                      includeMargin={false}
                    />
                    <span className="text-[8px] font-bold text-slate-800 tracking-wider mt-1 uppercase">
                      Scan Me
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-[11px] print:bg-emerald-50 print:text-emerald-900 print:border-emerald-200">
                  ✓ Verified &amp; Registered via OTP Auth • MatruCare AI Full Stack Track
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap justify-end gap-2.5 print:hidden">
              <button
                type="button"
                onClick={() => setPassModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadPassPng}
                disabled={downloadingPass}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPass ? 'Generating Image...' : 'Save Image (PNG)'}</span>
              </button>
              <button
                type="button"
                onClick={triggerPrintPass}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Comprehensive Candidate Profile Editor */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setEditProfileOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span>Update Candidate Profile</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage your academic credentials, developer showcase, skills, and account credentials.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setProfileTab('academic')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  profileTab === 'academic'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Academic &amp; Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab('developer')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  profileTab === 'developer'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Dev Showcase &amp; Skills</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab('security')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  profileTab === 'security'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </button>
            </div>

            {profileMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{profileMessage}</span>
              </div>
            )}

            {profileSuccessMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* TAB 1: ACADEMIC & CONTACT */}
              {profileTab === 'academic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Joydip Maiti"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Mobile / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={profileForm.mobileNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      College / University Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.collegeName}
                      onChange={(e) => setProfileForm({ ...profileForm, collegeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Calcutta Institute of Technology"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Degree / Course
                      </label>
                      <input
                        type="text"
                        value={profileForm.course}
                        onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. B.Tech, BCA, MCA"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Branch / Stream
                      </label>
                      <input
                        type="text"
                        value={profileForm.branch}
                        onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="e.g. CSE, IT, ECE"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Year of Study
                      </label>
                      <select
                        value={profileForm.yearOfStudy}
                        onChange={(e) => setProfileForm({ ...profileForm, yearOfStudy: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate / Alumni">Postgraduate / Alumni</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl text-sky-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>These academic details will automatically pre-fill your hackathon registrations!</span>
                  </div>
                </div>
              )}

              {/* TAB 2: DEV SHOWCASE & SKILLS */}
              {profileTab === 'developer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Full-Stack Web & AI Developer | Open Source Contributor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Technical Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="e.g. React, Node.js, Python, MongoDB, Docker, Tailwind"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={profileForm.githubUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                        <span>LinkedIn Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={profileForm.linkedinUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Portfolio / Website Link</span>
                    </label>
                    <input
                      type="url"
                      value={profileForm.portfolioUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="https://yourportfolio.dev"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Short Bio / About
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 resize-none"
                      placeholder="Tell hackathon organizers and teammates about what you like to build..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ACCOUNT SECURITY */}
              {profileTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Leave these fields blank if you do not wish to change your password.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="Min 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="Re-type new password"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                  Account: <span className="text-slate-300 font-mono">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 disabled:opacity-50 transition"
                  >
                    {updatingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Candidate Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
