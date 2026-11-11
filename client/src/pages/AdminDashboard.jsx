import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Sparkles,
  Users,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Award,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Eye,
  RefreshCw,
  Building,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FileText,
  Github,
  Video,
  UserCog,
  Star,
  ShieldCheck,
  Target,
  Plus,
  Edit3,
  BookOpen,
  Menu,
  LogOut,
  Globe,
  QrCode,
  LayoutDashboard,
  Trophy,
  ArrowRight,
  UserPlus,
  Power,
  Key,
  Lock,
  Unlock,
  Check,
  Copy,
  UserCheck,
  Shield,
  EyeOff,
  Mail,
} from 'lucide-react';
import AccountSecurityModal from '../components/AccountSecurityModal';

const STATUS_OPTIONS = ['Submitted', 'Under Review', 'Shortlisted', 'Finalist', 'Rejected'];

const DOMAIN_OPTIONS = [
  'All',
  'AI/ML',
  'Healthcare & MedTech',
  'Web Development',
  'Mobile App Development',
  'IoT & Embedded Systems',
  'Cyber Security',
  'Blockchain / Web3',
  'Cloud & DevOps',
  'Open Innovation',
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Tab Switcher ('submissions' | 'roles' | 'problems')
  const [activeTab, setActiveTab] = useState('submissions');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  // Staff Provisioning & Access Control State
  const [staffFilterTab, setStaffFilterTab] = useState('staff'); // 'staff' | 'candidates' | 'all'
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    fullName: '',
    email: '',
    role: 'evaluator',
    startingPassword: '',
    sendEmail: true,
  });
  const [showProvisionPassword, setShowProvisionPassword] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');
  const [provisionSuccessData, setProvisionSuccessData] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState(null);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Problem Statements & Hackathons State
  const [adminEvents, setAdminEvents] = useState([]);
  const [adminProblems, setAdminProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [problemForm, setProblemForm] = useState({
    eventId: '',
    psId: '',
    title: '',
    category: 'AI/ML',
    difficulty: 'Intermediate',
    description: '',
    expectedOutcomes: '',
    starterKitUrl: '',
  });
  const [savingProblem, setSavingProblem] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal
  const [activeModalEntry, setActiveModalEntry] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Fetch all registrations and stats
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allRes, statsRes] = await Promise.all([
        api.get('/hackathon/admin/all'),
        api.get('/hackathon/admin/stats'),
      ]);

      if (allRes.data.success) {
        setRegistrations(allRes.data.registrations || []);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats || null);
      }
    } catch (err) {
      console.error('[Admin Fetch Error]:', err);
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all registered users for role management
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/user/admin/all');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('[Fetch Users Error]:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Change user role handler
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRoleId(userId);
    try {
      const res = await api.patch(`/user/admin/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        showToast(res.data.message || 'User role updated successfully!');
      }
    } catch (err) {
      console.error('[Update Role Error]:', err);
      alert(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Generate strong starting password for staff
  const generateRandomPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const nums = '23456789';
    const syms = '@#$!';
    const all = upper + lower + nums + syms;
    let pwd =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      nums[Math.floor(Math.random() * nums.length)] +
      syms[Math.floor(Math.random() * syms.length)];
    for (let i = 0; i < 6; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    return pwd
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  };

  const handleOpenProvisionModal = (prefillUser = null) => {
    setProvisionError('');
    setProvisionSuccessData(null);
    setCopiedCreds(false);
    setShowProvisionPassword(true);
    setProvisionForm({
      fullName: prefillUser?.fullName || '',
      email: prefillUser?.email || '',
      role: prefillUser?.role && prefillUser.role !== 'user' ? prefillUser.role : 'evaluator',
      startingPassword: generateRandomPassword(),
      sendEmail: true,
    });
    setProvisionModalOpen(true);
  };

  const handleProvisionStaff = async (e) => {
    e.preventDefault();
    setProvisionError('');
    setProvisionSuccessData(null);

    if (!provisionForm.fullName.trim() || !provisionForm.email.trim()) {
      setProvisionError('Full name and official email address are required.');
      return;
    }
    if (!provisionForm.startingPassword || provisionForm.startingPassword.length < 6) {
      setProvisionError('Starting password must be at least 6 characters long.');
      return;
    }

    setProvisioning(true);
    try {
      const res = await api.post('/user/admin/provision-staff', {
        fullName: provisionForm.fullName.trim(),
        email: provisionForm.email.trim(),
        role: provisionForm.role,
        startingPassword: provisionForm.startingPassword,
        sendEmail: provisionForm.sendEmail,
      });

      if (res.data.success) {
        showToast(res.data.message || 'Staff role provisioned successfully!');
        setProvisionSuccessData({
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          role: res.data.user.role,
          startingPassword: provisionForm.startingPassword,
          emailDispatched: res.data.emailDispatched,
        });
        setStaffFilterTab('staff');
        fetchUsers();
      }
    } catch (err) {
      console.error('[Provision Staff Error]:', err);
      setProvisionError(err.response?.data?.message || 'Failed to provision staff role.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleToggleStaffActive = async (targetUser) => {
    const actionText = targetUser.isActive === false ? 'REACTIVATE' : 'DEACTIVATE';
    if (
      !window.confirm(
        `Are you sure you want to ${actionText} staff access for "${targetUser.fullName}" (${targetUser.email})?`
      )
    ) {
      return;
    }

    setTogglingActiveId(targetUser._id);
    try {
      const res = await api.patch(`/user/admin/${targetUser._id}/toggle-active`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isActive: res.data.user.isActive } : u
          )
        );
        showToast(res.data.message);
      }
    } catch (err) {
      console.error('[Toggle Staff Active Error]:', err);
      alert(err.response?.data?.message || 'Failed to toggle staff account status.');
    } finally {
      setTogglingActiveId(null);
    }
  };

  // Fetch events and problem statements for admin challenge management
  const fetchAdminProblems = async () => {
    setLoadingProblems(true);
    try {
      const [eventsRes, problemsRes] = await Promise.all([
        api.get('/events'),
        api.get('/events/problems/all'),
      ]);
      if (eventsRes.data.success) {
        setAdminEvents(eventsRes.data.events || []);
      }
      if (problemsRes.data.success) {
        setAdminProblems(problemsRes.data.problems || []);
      }
    } catch (err) {
      console.error('[Fetch Admin Problems Error]:', err);
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchAdminProblems();
  }, []);

  const handleOpenCreateProblemModal = () => {
    setEditingProblem(null);
    setProblemForm({
      eventId: adminEvents[0]?._id || '',
      psId: `MCAI-PS-${(adminProblems.length + 1).toString().padStart(2, '0')}`,
      title: '',
      category: 'AI/ML',
      difficulty: 'Intermediate',
      description: '',
      expectedOutcomes: '',
      starterKitUrl: '',
    });
    setProblemModalOpen(true);
  };

  const handleOpenEditProblemModal = (prob) => {
    setEditingProblem(prob);
    setProblemForm({
      eventId: prob.hackathonId || adminEvents[0]?._id || '',
      psId: prob.psId || '',
      title: prob.title || '',
      category: prob.category || 'AI/ML',
      difficulty: prob.difficulty || 'Intermediate',
      description: prob.description || '',
      expectedOutcomes: Array.isArray(prob.expectedOutcomes)
        ? prob.expectedOutcomes.join('\n')
        : prob.expectedOutcomes || '',
      starterKitUrl: prob.starterKitUrl || '',
    });
    setProblemModalOpen(true);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!problemForm.title || !problemForm.description) {
      alert('Please fill problem title and description');
      return;
    }

    setSavingProblem(true);
    try {
      const targetEventId = problemForm.eventId || adminEvents[0]?._id;
      if (!targetEventId) {
        alert('No active hackathon event found to attach problem statement.');
        return;
      }

      const payload = {
        psId: problemForm.psId,
        title: problemForm.title,
        category: problemForm.category,
        difficulty: problemForm.difficulty,
        description: problemForm.description,
        expectedOutcomes: problemForm.expectedOutcomes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        starterKitUrl: problemForm.starterKitUrl,
      };

      if (editingProblem) {
        await api.put(`/events/${targetEventId}/problems/${editingProblem._id}`, payload);
        showToast('Problem statement updated successfully!');
      } else {
        await api.post(`/events/${targetEventId}/problems`, payload);
        showToast('New problem statement published successfully!');
      }

      setProblemModalOpen(false);
      fetchAdminProblems();
    } catch (err) {
      console.error('[Save Problem Error]:', err);
      alert(err.response?.data?.message || 'Failed to save problem statement.');
    } finally {
      setSavingProblem(false);
    }
  };

  const handleDeleteProblem = async (eventId, problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem statement?')) return;
    try {
      await api.delete(`/events/${eventId}/problems/${problemId}`);
      showToast('Problem statement removed successfully');
      fetchAdminProblems();
    } catch (err) {
      console.error('[Delete Problem Error]:', err);
      alert(err.response?.data?.message || 'Failed to delete problem statement');
    }
  };

  // Show auto-dismiss notification
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  // Update status handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/hackathon/admin/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setRegistrations((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (activeModalEntry && activeModalEntry._id === id) {
          setActiveModalEntry((prev) => ({ ...prev, status: newStatus }));
        }
        showToast(`Status updated to "${newStatus}" successfully!`);
      }
    } catch (err) {
      console.error('[Status Change Error]:', err);
      showToast(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Delete registration handler
  const handleDelete = async (id, projectName) => {
    if (!window.confirm(`Are you sure you want to permanently delete registration for "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeletingId(id);
      const res = await api.delete(`/hackathon/${id}`);
      if (res.data.success) {
        setRegistrations((prev) => prev.filter((item) => item._id !== id));
        if (activeModalEntry && activeModalEntry._id === id) {
          setActiveModalEntry(null);
        }
        showToast(`Registration for "${projectName}" deleted.`);
      }
    } catch (err) {
      console.error('[Delete Error]:', err);
      showToast(err.response?.data?.message || 'Failed to delete registration.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      // Search term matching
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.fullName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.projectName?.toLowerCase().includes(term) ||
        item.collegeName?.toLowerCase().includes(term);

      // Domain matching
      const matchesDomain = selectedDomain === 'All' || item.domain === selectedDomain;

      // Status matching
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [registrations, searchTerm, selectedDomain, selectedStatus]);

  const staffCount = useMemo(
    () => users.filter((u) => u.role && u.role !== 'user').length,
    [users]
  );
  const candidatesCount = useMemo(
    () => users.filter((u) => !u.role || u.role === 'user').length,
    [users]
  );

  // Filter users by search term & active directory segment
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isStaff = u.role && u.role !== 'user';
      if (staffFilterTab === 'staff' && !isStaff) return false;
      if (staffFilterTab === 'candidates' && isStaff) return false;

      const term = userSearchTerm.toLowerCase().trim();
      return (
        !term ||
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    });
  }, [users, userSearchTerm, staffFilterTab]);

  // Export to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Submission Date',
      'Project Name',
      'Domain / Track',
      'Evaluation Status',
      'Team Lead Name',
      'Team Lead Email',
      'Mobile Number',
      'College Name',
      'Course',
      'Branch',
      'Year of Study',
      'Team Size',
      'Team Members Count',
      'Team Members Detail',
      'Venue Gate Check-In',
      'Check-In Timestamp',
      'Judge Avg Score (/40)',
      'Judge Reviews Count',
      'PPT Link',
      'Prototype Link',
      'Demo Video Link',
    ];

    const rows = registrations.map((r) => {
      const regId = `MCAI-2026-${r._id ? r._id.slice(-4).toUpperCase() : '0000'}`;
      const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'N/A';
      const membersText =
        Array.isArray(r.teamMembers) && r.teamMembers.length > 0
          ? r.teamMembers.map((m, idx) => `[M${idx + 2}: ${m.name} (${m.email})]`).join('; ')
          : 'None (Solo)';
      const checkInStatus = r.isCheckedIn ? 'Admitted' : 'Pending';
      const checkInTime = r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('en-IN') : 'N/A';
      const avgScore = r.averageScore ? r.averageScore : 'N/A';
      const reviewCount = r.evaluationCount || 0;

      return [
        `"${regId}"`,
        `"${date}"`,
        `"${(r.projectName || '').replace(/"/g, '""')}"`,
        `"${(r.domain || '').replace(/"/g, '""')}"`,
        `"${r.status || 'Submitted'}"`,
        `"${(r.fullName || '').replace(/"/g, '""')}"`,
        `"${r.email || ''}"`,
        `"${r.mobileNumber || ''}"`,
        `"${(r.collegeName || '').replace(/"/g, '""')}"`,
        `"${r.course || ''}"`,
        `"${r.branch || ''}"`,
        `"${r.yearOfStudy || ''}"`,
        r.teamSize || 1,
        Array.isArray(r.teamMembers) ? r.teamMembers.length : 0,
        `"${membersText.replace(/"/g, '""')}"`,
        `"${checkInStatus}"`,
        `"${checkInTime}"`,
        `"${avgScore}"`,
        reviewCount,
        `"${r.pptLink || ''}"`,
        `"${r.prototypeLink || ''}"`,
        `"${r.demoVideoLink || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HackSphere_Hackathon_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Shortlisted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Finalist':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 ${
          isCollapsed ? 'md:w-20' : 'md:w-72'
        } ${sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'}`}
      >
        {/* Sidebar Brand Header */}
        <div
          className={`border-b border-slate-800 flex items-center transition-all ${
            isCollapsed
              ? 'p-4 md:flex-col md:justify-center md:gap-3'
              : 'p-4 justify-between'
          }`}
        >
          <Link
            to="/admin"
            className="flex items-center gap-3 group"
            title="HackSphere Admin Console"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className={isCollapsed ? 'md:hidden' : 'block'}>
              <span className="text-base font-bold text-white tracking-tight block">
                Hack<span className="text-rose-400 font-extrabold">Sphere</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 inline-block">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-rose-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2 md:p-2.5 space-y-4' : 'p-4 space-y-6'}`}>
          {/* Section 1: Core Admin Management */}
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              Admin Governance
            </span>
            {isCollapsed && (
              <div className="hidden md:block h-px bg-slate-800/80 my-2 mx-2" />
            )}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('submissions');
                  setSidebarOpen(false);
                }}
                title={`Submissions (${registrations.length})`}
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                  activeTab === 'submissions'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <div className="relative flex items-center justify-center">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    {isCollapsed && registrations.length > 0 && (
                      <span className="hidden md:block absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-slate-900" />
                    )}
                  </div>
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Submissions</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCollapsed ? 'md:hidden' : 'block'
                  } ${
                    activeTab === 'submissions'
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {registrations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('problems');
                  fetchAdminProblems();
                  setSidebarOpen(false);
                }}
                title={`Problem Statements (${adminProblems.length})`}
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                  activeTab === 'problems'
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <div className="relative flex items-center justify-center">
                    <Target className="w-4 h-4 flex-shrink-0" />
                    {isCollapsed && adminProblems.length > 0 && (
                      <span className="hidden md:block absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-slate-900" />
                    )}
                  </div>
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Problem Statements</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCollapsed ? 'md:hidden' : 'block'
                  } ${
                    activeTab === 'problems'
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {adminProblems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('roles');
                  fetchUsers();
                  setSidebarOpen(false);
                }}
                title={`Access & Role RBAC (${users.length})`}
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                  activeTab === 'roles'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <div className="relative flex items-center justify-center">
                    <UserCog className="w-4 h-4 flex-shrink-0" />
                    {isCollapsed && users.length > 0 && (
                      <span className="hidden md:block absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-slate-900" />
                    )}
                  </div>
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Access &amp; Role RBAC</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCollapsed ? 'md:hidden' : 'block'
                  } ${
                    activeTab === 'roles'
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {users.length}
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Portals & Live Verification */}
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              Live Systems
            </span>
            {isCollapsed && (
              <div className="hidden md:block h-px bg-slate-800/80 my-2 mx-2" />
            )}
            <div className="space-y-1.5">
              <Link
                to="/leaderboard"
                target="_blank"
                rel="noreferrer"
                title="Live Leaderboard"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Live Leaderboard</span>
                </div>
                <ExternalLink
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>

              <Link
                to="/judge"
                title="Judge Scoring Portal"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <Award className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Judge Scoring Portal</span>
                </div>
                <ArrowRight
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>

              <Link
                to="/verify-pass"
                target="_blank"
                rel="noreferrer"
                title="Pass Verification Scanner"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <QrCode className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Pass Verification Scanner</span>
                </div>
                <ExternalLink
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>

              <Link
                to="/"
                title="Public Landing Page"
                className={`w-full flex items-center ${
                  isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group`}
              >
                <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                  <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className={isCollapsed ? 'md:hidden' : 'block'}>Public Landing Page</span>
                </div>
                <ArrowRight
                  className={`w-3 h-3 text-slate-500 group-hover:text-white ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer / Operator Profile & Logout */}
        <div className={`border-t border-slate-800 bg-slate-950/60 ${isCollapsed ? 'p-3 md:p-2.5' : 'p-4'}`}>
          <div
            className={`flex items-center ${
              isCollapsed ? 'md:justify-center md:gap-0 md:mb-2' : 'gap-3 mb-3'
            }`}
          >
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow flex-shrink-0 cursor-default"
              title={`${user?.fullName || 'Super Administrator'} (${user?.email || 'admin'})`}
            >
              {(user?.fullName || 'A').charAt(0)}
            </div>
            <div className={`overflow-hidden ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Super Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user?.email || 'matrucareai@gmail.com'}</p>
            </div>
          </div>
          <button
            onClick={() => setSecurityModalOpen(true)}
            title="Account Security & Password"
            className={`w-full flex items-center justify-center gap-2 py-2 mb-2 ${
              isCollapsed ? 'md:px-0' : 'px-3'
            } rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition`}
          >
            <Key className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
            <span className={isCollapsed ? 'md:hidden' : 'block'}>Security Settings</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Sign Out"
            className={`w-full flex items-center justify-center gap-2 py-2 ${
              isCollapsed ? 'md:px-0' : 'px-3'
            } rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-xs font-semibold transition`}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : 'block'}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div
        className={`${
          isCollapsed ? 'md:pl-20' : 'md:pl-72'
        } flex-1 min-w-0 max-w-full w-full flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile drawer toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse/expand rail toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-rose-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Admin Console</span>
                <span className="text-slate-600">/</span>
                <span className="text-[11px] font-bold text-rose-400 capitalize">
                  {activeTab === 'submissions' ? 'Project Submissions' : activeTab === 'problems' ? 'Problem Statements' : 'Access & Roles'}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {activeTab === 'submissions'
                  ? 'Candidate Submissions & Evaluation'
                  : activeTab === 'problems'
                  ? 'SIH Challenge Problem Statements'
                  : 'Role-Based Access Control (RBAC)'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {activeTab === 'submissions' && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}

            {activeTab === 'problems' && (
              <button
                onClick={handleOpenCreateProblemModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Challenge</span>
              </button>
            )}

            {activeTab === 'roles' && (
              <button
                onClick={() => handleOpenProvisionModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Provision Staff</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 min-w-0 max-w-full w-full">
          {/* Toast Notification */}
          {notification && (
            <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-sky-950/90 border border-sky-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in">
              <CheckCircle className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span className="text-sm font-medium">{notification}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submissions Tab KPI Cards */}
          {activeTab === 'submissions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Registrations */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-sky-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Submissions</span>
                  <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats?.totalRegistrations ?? registrations.length}
                  </span>
                  <span className="text-xs text-sky-400 font-medium">projects</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {stats?.soloCount || 0} Solo Innovators • {stats?.teamCount || 0} Teams
                </p>
              </div>

              {/* Card 2: Total Participants */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Innovators</span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats?.totalParticipants ?? registrations.reduce((acc, r) => acc + (r.teamSize || 1), 0)}
                  </span>
                  <span className="text-xs text-indigo-400 font-medium">candidates</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">Across dynamic 1–5 member teams</p>
              </div>

              {/* Card 3: Shortlisted / Finalists */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Shortlisted / Finalists</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {(stats?.statusCounts?.Shortlisted || 0) + (stats?.statusCounts?.Finalist || 0)}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">advanced</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {stats?.statusCounts?.Shortlisted || 0} Shortlisted • {stats?.statusCounts?.Finalist || 0} Finalists
                </p>
              </div>

              {/* Card 4: Under Review */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Under Review</span>
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats?.statusCounts?.['Under Review'] || 0}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">in evaluation</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {stats?.statusCounts?.Submitted || 0} pending initial review
                </p>
              </div>
            </div>
          )}

        {activeTab === 'submissions' ? (
          <>
            {/* Filter & Search Bar */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg w-full max-w-full">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by project name, candidate name, email, or college..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Domain Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Innovation Tracks' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full md:w-auto px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(searchTerm || selectedDomain !== 'All' || selectedStatus !== 'All') && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <span>Showing {filteredRegistrations.length} of {registrations.length} registrations</span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDomain('All');
                  setSelectedStatus('All');
                }}
                className="text-sky-400 hover:underline ml-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Submissions Data Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl w-full max-w-full">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Registered Submissions ({filteredRegistrations.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Displaying candidate records with live status controls
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-sm">Loading hackathon submissions from MongoDB Atlas...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <Layers className="w-12 h-12 text-slate-600" />
              <p className="text-base font-medium text-slate-300">No submissions found matching criteria</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms or filters above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-300 min-w-[950px]">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">ID / Date</th>
                    <th scope="col" className="px-5 py-3.5">Project & Track</th>
                    <th scope="col" className="px-5 py-3.5">Team Lead</th>
                    <th scope="col" className="px-5 py-3.5">Institution</th>
                    <th scope="col" className="px-5 py-3.5">Team Size</th>
                    <th scope="col" className="px-5 py-3.5">Links</th>
                    <th scope="col" className="px-5 py-3.5">Venue Gate</th>
                    <th scope="col" className="px-5 py-3.5">Judge Score</th>
                    <th scope="col" className="px-5 py-3.5">Evaluation Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRegistrations.map((entry) => {
                    const regId = `MCAI-2026-${entry._id ? entry._id.slice(-4).toUpperCase() : '0000'}`;
                    const formattedDate = entry.createdAt
                      ? new Date(entry.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : 'N/A';

                    return (
                      <tr key={entry._id} className="hover:bg-slate-800/30 transition-colors">
                        
                        {/* ID / Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-sky-400 block">{regId}</span>
                          <span className="text-[11px] text-slate-500">{formattedDate}</span>
                        </td>

                        {/* Project & Track */}
                        <td className="px-5 py-4">
                          <div className="max-w-xs">
                            <span className="font-bold text-white block truncate" title={entry.projectName}>
                              {entry.projectName}
                            </span>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-sky-300 border border-slate-700/60">
                              {entry.domain}
                            </span>
                          </div>
                        </td>

                        {/* Team Lead */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-200 block">{entry.fullName}</span>
                          <span className="text-xs text-slate-400 block">{entry.email}</span>
                          <span className="text-[11px] text-slate-500 block font-mono">{entry.mobileNumber}</span>
                        </td>

                        {/* Institution */}
                        <td className="px-5 py-4">
                          <div className="max-w-[200px]">
                            <span className="text-xs text-slate-300 block truncate" title={entry.collegeName}>
                              {entry.collegeName}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {entry.course} • {entry.branch} ({entry.yearOfStudy})
                            </span>
                          </div>
                        </td>

                        {/* Team Size */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {entry.teamSize > 1 ? (
                            <button
                              onClick={() => setActiveModalEntry(entry)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>{entry.teamSize} Members</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                              Solo
                            </span>
                          )}
                        </td>

                        {/* Project Links */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {entry.pptLink && (
                              <a
                                href={entry.pptLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Presentation (PPT)"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            {entry.prototypeLink && (
                              <a
                                href={entry.prototypeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Prototype / Code Repo"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-sky-400 hover:bg-slate-700 transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {entry.demoVideoLink && (
                              <a
                                href={entry.demoVideoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Demo Video"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                              >
                                <Video className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Venue Gate Check-In Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {entry.isCheckedIn ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 w-fit">
                                ✓ Admitted
                              </span>
                              {entry.checkedInAt && (
                                <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                  {new Date(entry.checkedInAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700 w-fit">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Judge Score */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {entry.averageScore > 0 ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {entry.averageScore} / 40
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {entry.evaluationCount || 1} {entry.evaluationCount === 1 ? 'review' : 'reviews'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono italic">Unscored</span>
                          )}
                        </td>

                        {/* Evaluation Status Dropdown */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <select
                            value={entry.status || 'Submitted'}
                            onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${getStatusBadge(
                              entry.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((statusOption) => (
                              <option key={statusOption} value={statusOption} className="bg-slate-900 text-white">
                                {statusOption}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveModalEntry(entry)}
                              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id, entry.projectName)}
                              disabled={isDeletingId === entry._id}
                              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    ) : activeTab === 'roles' ? (
      /* User Role Governance & Staff Provisioning Workspace */
      <div className="space-y-5">
        {/* Top Control Bar: Search, Segment Switcher, & Provision Button */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search accounts by full name or email address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {userSearchTerm && (
              <button
                onClick={() => setUserSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Sub-tab pills */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStaffFilterTab('staff')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  staffFilterTab === 'staff'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Directory ({staffCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStaffFilterTab('candidates')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  staffFilterTab === 'candidates'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Candidate Roster ({candidatesCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStaffFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  staffFilterTab === 'all'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Accounts ({users.length})
              </button>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center border border-slate-700 transition"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenProvisionModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Provision Staff Role</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        {staffFilterTab === 'staff' ? (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3.5 text-xs">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Event Staff Directory &amp; Role Authorization</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Staff members (Judges, Volunteers, Co-Admins) are provisioned directly with a designated role and starting password. Staff can change their password from their security settings, and administrators can deactivate or reactivate their access at any time without losing historical evaluations.
              </p>
            </div>
          </div>
        ) : staffFilterTab === 'candidates' ? (
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 flex items-start gap-3.5 text-xs">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Registered Candidate Innovators</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Candidates register themselves publicly and verify their accounts using a 6-digit email OTP. To elevate an applicant or official to staff, click <strong>&quot;Appoint as Staff&quot;</strong> to provision their staff role and starting password.
              </p>
            </div>
          </div>
        ) : null}

        {/* User Accounts Directory Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl w-full max-w-full">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCog className="w-4 h-4 text-indigo-400" />
              <span>
                {staffFilterTab === 'staff'
                  ? `Authorized Event Staff (${filteredUsers.length})`
                  : staffFilterTab === 'candidates'
                  ? `Candidate Innovators (${filteredUsers.length})`
                  : `All Registered Accounts (${filteredUsers.length})`}
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {staffFilterTab === 'staff'
                ? 'Active staff authorizations & deactivation controls'
                : 'Self-registered candidate accounts'}
            </span>
          </div>

          {loadingUsers ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm">Loading user directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <p className="text-sm font-semibold text-slate-300">No accounts found matching this view or search.</p>
              {staffFilterTab === 'staff' && (
                <button
                  type="button"
                  onClick={() => handleOpenProvisionModal()}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision First Staff Member</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-300 min-w-[750px]">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="px-5 py-3.5">Account Profile</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Access Status</th>
                    <th className="px-5 py-3.5">Authorization / Joined</th>
                    <th className="px-5 py-3.5 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isSuperAdminUser = u.email?.toLowerCase() === 'matrucareai@gmail.com';
                    const isStaff = u.role && u.role !== 'user';
                    const isActive = u.isActive !== false;
                    const isSelf = user?._id === u._id;

                    return (
                      <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Profile Info */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {(u.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{u.fullName}</span>
                              <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isSuperAdminUser ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 w-fit">
                              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Super Admin
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-fit">
                              <Shield className="w-3.5 h-3.5" /> Co-Admin
                            </span>
                          ) : u.role === 'evaluator' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 w-fit">
                              <Award className="w-3.5 h-3.5 text-amber-400" /> Judge / Evaluator
                            </span>
                          ) : u.role === 'volunteer' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                              <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Gate Volunteer
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 w-fit">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Candidate
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isStaff ? (
                            isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                Deactivated
                              </span>
                            )
                          ) : (
                            u.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" /> OTP Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                Pending OTP
                              </span>
                            )
                          )}
                        </td>

                        {/* Authorization / Joined Info */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                          {isStaff && u.provisionedAt ? (
                            <div>
                              <span className="text-slate-300 block font-medium">
                                {new Date(u.provisionedAt).toLocaleDateString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                By {u.provisionedBy || 'Admin'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-300 block">
                                {new Date(u.createdAt).toLocaleDateString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">
                                {u.collegeName || 'Self-Registered'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Governance Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          {isSuperAdminUser ? (
                            <span className="text-xs text-slate-500 italic font-mono">Protected Admin</span>
                          ) : isStaff ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick link to relevant portal */}
                              {u.role === 'evaluator' ? (
                                <Link
                                  to="/judge"
                                  target="_blank"
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition"
                                  title="Open Judge Portal"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              ) : u.role === 'volunteer' ? (
                                <Link
                                  to="/verify-pass"
                                  target="_blank"
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition"
                                  title="Open Pass Scanner"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              ) : null}

                              {/* Toggle Active / Deactivate */}
                              <button
                                type="button"
                                disabled={togglingActiveId === u._id || isSelf}
                                onClick={() => handleToggleStaffActive(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                  isSelf
                                    ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                    : isActive
                                    ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                                }`}
                                title={isSelf ? 'Cannot deactivate your active session' : undefined}
                              >
                                <Power className={`w-3.5 h-3.5 ${togglingActiveId === u._id ? 'animate-spin' : ''}`} />
                                <span>{isActive ? 'Deactivate' : 'Reactivate'}</span>
                              </button>
                            </div>
                          ) : (
                            /* Candidate row: Appoint as staff button */
                            <button
                              type="button"
                              onClick={() => handleOpenProvisionModal(u)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 flex items-center gap-1.5 ml-auto transition"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Appoint as Staff</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    ) : (
      /* Problem Statements & Challenges Management Workspace */
      <div className="space-y-6">
        {/* Workspace Action Header */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>National Innovation Challenges &amp; Problem Statements</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Publish and manage real-world challenges (SIH / National Model) for candidate teams to solve.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminProblems}
              disabled={loadingProblems}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Refresh Challenges"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProblems ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreateProblemModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Problem Statement</span>
            </button>
          </div>
        </div>

        {/* Problems List Grid */}
        {loadingProblems ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Loading published problem statements...</p>
          </div>
        ) : adminProblems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <Target className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Problem Statements Published Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Post New Problem Statement&quot; to publish your first challenge for candidate innovators.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {adminProblems.map((prob) => {
              const diffColor =
                prob.difficulty === 'Beginner'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : prob.difficulty === 'Advanced'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60';

              return (
                <div
                  key={prob._id || prob.psId}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                          {prob.psId}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                          {prob.category}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${diffColor}`}>
                        {prob.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">{prob.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {prob.description}
                    </p>

                    {prob.expectedOutcomes && prob.expectedOutcomes.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                          Key Expected Deliverables:
                        </span>
                        <ul className="space-y-1">
                          {prob.expectedOutcomes.slice(0, 2).map((o, idx) => (
                            <li key={idx} className="text-xs text-slate-300 truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                              <span className="truncate">{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">
                      Hackathon: {prob.hackathonTitle || 'HackSphere 2026'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProblemModal(prob)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProblem(prob.hackathonId, prob._id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/40 transition"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

        {/* Modal: Create or Edit Problem Statement */}
        {problemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setProblemModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>{editingProblem ? 'Edit Problem Statement' : 'Post New Problem Statement'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Set challenge ID, domain, difficulty, and expected outcomes for students.
              </p>

              <form onSubmit={handleSaveProblem} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Problem ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MCAI-PS-05"
                      value={problemForm.psId}
                      onChange={(e) => setProblemForm({ ...problemForm, psId: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={problemForm.difficulty}
                      onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Domain / Track
                  </label>
                  <select
                    value={problemForm.category}
                    onChange={(e) => setProblemForm({ ...problemForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="AI/ML">AI &amp; Machine Learning</option>
                    <option value="Healthcare Tech">Healthcare &amp; MedTech</option>
                    <option value="IoT &amp; Robotics">IoT &amp; Robotics</option>
                    <option value="Web Dev">Full Stack Web Development</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Blockchain &amp; Web3">Blockchain &amp; Web3</option>
                    <option value="Cloud &amp; DevOps">Cloud &amp; DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Challenge Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Concise, actionable challenge title..."
                    value={problemForm.title}
                    onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Detailed Challenge Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the context, user pain points, and core problem to solve..."
                    value={problemForm.description}
                    onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Expected Outcomes / Deliverables (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Trained ML model with AUC > 0.88&#10;Interactive clinician risk dashboard&#10;REST API inference endpoint"
                    value={problemForm.expectedOutcomes}
                    onChange={(e) => setProblemForm({ ...problemForm, expectedOutcomes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Starter Kit / Dataset Repository URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={problemForm.starterKitUrl}
                    onChange={(e) => setProblemForm({ ...problemForm, starterKitUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setProblemModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProblem}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50"
                  >
                    {savingProblem ? 'Saving...' : editingProblem ? 'Update Challenge' : 'Publish Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Full Submission Details */}
        {activeModalEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                    MCAI-2026-{activeModalEntry._id ? activeModalEntry._id.slice(-4).toUpperCase() : '0000'}
                  </span>
                  <h3 className="text-base font-bold text-white truncate max-w-sm">
                    {activeModalEntry.projectName}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalEntry(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Domain & Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Innovation Track</span>
                    <span className="text-sm font-semibold text-sky-400">{activeModalEntry.domain}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Venue Admission</span>
                    {activeModalEntry.isCheckedIn ? (
                      <span className="text-xs font-semibold text-emerald-400">
                        ✓ Admitted {activeModalEntry.checkedInAt ? `(${new Date(activeModalEntry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Pending Gate Check-In</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Current Status:</span>
                    <select
                      value={activeModalEntry.status || 'Submitted'}
                      onChange={(e) => handleStatusChange(activeModalEntry._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusBadge(
                        activeModalEntry.status
                      )}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Team Lead Profile */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Team Leader / Primary Contact
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Full Name</span>
                        <span className="text-sm font-medium text-white">{activeModalEntry.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Email Address</span>
                        <span className="text-sm font-medium text-white">{activeModalEntry.email}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Mobile Number</span>
                        <span className="text-sm font-mono text-white">{activeModalEntry.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Academic Year</span>
                        <span className="text-sm text-white">{activeModalEntry.yearOfStudy}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-500 block">Institution</span>
                      <span className="text-sm text-slate-300">{activeModalEntry.collegeName}</span>
                      <span className="text-xs text-slate-500 block">
                        {activeModalEntry.course} in {activeModalEntry.branch}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Team Members */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Dynamic Team Roster ({activeModalEntry.teamSize} Total)</span>
                    <span className="text-[11px] text-slate-500">
                      {activeModalEntry.teamSize === 1 ? 'Solo Entry' : `${activeModalEntry.teamSize - 1} Additional Members`}
                    </span>
                  </h4>
                  {Array.isArray(activeModalEntry.teamMembers) && activeModalEntry.teamMembers.length > 0 ? (
                    <div className="space-y-2">
                      {activeModalEntry.teamMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">
                              {idx + 2}
                            </span>
                            <div>
                              <span className="font-medium text-white block">{m.name}</span>
                              <span className="text-xs text-slate-400">{m.email}</span>
                            </div>
                          </div>
                          <span className="text-xs text-indigo-400 font-medium">Team Member</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs text-slate-400">
                      Solo Innovator — No additional team members registered.
                    </div>
                  )}
                </div>

                {/* Project Links */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Project Submission Deliverables
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeModalEntry.pptLink && (
                      <a
                        href={activeModalEntry.pptLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-semibold">Slide Deck (PPT)</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                      </a>
                    )}
                    {activeModalEntry.prototypeLink && (
                      <a
                        href={activeModalEntry.prototypeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-semibold">Repository</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
                      </a>
                    )}
                    {activeModalEntry.demoVideoLink ? (
                      <a
                        href={activeModalEntry.demoVideoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-semibold">Demo Video</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center p-3 rounded-xl bg-slate-950/30 border border-slate-800/40 text-xs text-slate-600">
                        No video provided
                      </div>
                    )}
                  </div>
                </div>

                {/* Official Judge Evaluations & Rubrics */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Judge Evaluations & Rubrics</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {activeModalEntry.averageScore > 0
                        ? `Avg Score: ${activeModalEntry.averageScore} / 40`
                        : 'No reviews submitted yet'}
                    </span>
                  </h4>

                  {Array.isArray(activeModalEntry.evaluations) && activeModalEntry.evaluations.length > 0 ? (
                    <div className="space-y-3">
                      {activeModalEntry.evaluations.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white">
                                {ev.evaluatorName || 'Judge'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({ev.evaluatorEmail})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                {ev.recommendation || 'Consideration'}
                              </span>
                              <span className="text-sm font-extrabold text-amber-400 font-mono">
                                {ev.totalScore} / 40
                              </span>
                            </div>
                          </div>

                          {/* 4 Pillars Breakdown */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                            <div>
                              <span className="text-slate-500 block">Innovation</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.innovation}/10</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Tech Execution</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.technicalExecution}/10</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Clinical Impact</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.healthcareImpact}/10</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Presentation</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.presentation}/10</span>
                            </div>
                          </div>

                          {ev.feedback && (
                            <p className="text-xs text-slate-300 italic bg-slate-900/40 p-2 rounded border border-slate-800/50">
                              "{ev.feedback}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs text-slate-500">
                      This submission has not been evaluated by any judges yet.
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(activeModalEntry._id, activeModalEntry.projectName)}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Registration</span>
                </button>
                <button
                  onClick={() => setActiveModalEntry(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal: Provision Event Staff Role */}
        {provisionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setProvisionModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Provision Event Staff Role</h3>
                  <p className="text-xs text-slate-400">
                    Issue authorized credentials with a starting password for Hackathon staff
                  </p>
                </div>
              </div>

              {provisionSuccessData ? (
                /* Provisioned Success Summary & 1-Click Copy */
                <div className="mt-5 space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-emerald-300 text-sm">
                        Staff Authorization Created &amp; Active!
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        <strong>{provisionSuccessData.fullName}</strong> can now sign in immediately at the HackSphere login portal.
                        {provisionSuccessData.emailDispatched
                          ? ' An onboarding email with these credentials has been sent via matrucareai@gmail.com.'
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                        Staff Credentials Ticket
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const txt = `HackSphere 2026 Staff Login\nName: ${provisionSuccessData.fullName}\nRole: ${provisionSuccessData.role}\nEmail: ${provisionSuccessData.email}\nStarting Password: ${provisionSuccessData.startingPassword}\nPortal: https://client-seven-gold-99.vercel.app/login`;
                          navigator.clipboard.writeText(txt);
                          setCopiedCreds(true);
                          setTimeout(() => setCopiedCreds(false), 2500);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1 transition"
                      >
                        {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCreds ? 'Copied!' : 'Copy Credentials'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400">Assigned Role:</span>
                      <span className="col-span-2 font-bold text-white uppercase tracking-wider">
                        {provisionSuccessData.role === 'evaluator'
                          ? 'Judge / Evaluator'
                          : provisionSuccessData.role === 'volunteer'
                          ? 'Gate Volunteer'
                          : 'Co-Admin'}
                      </span>

                      <span className="text-slate-400">Login Email:</span>
                      <span className="col-span-2 font-mono text-sky-400">{provisionSuccessData.email}</span>

                      <span className="text-slate-400">Starting Password:</span>
                      <span className="col-span-2 font-mono font-bold text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded w-fit border border-amber-800/40">
                        {provisionSuccessData.startingPassword}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    🔒 Staff members are encouraged to update this starting password anytime from their portal&apos;s Security Settings.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProvisionModal()}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      Provision Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvisionModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Provision Form */
                <form onSubmit={handleProvisionStaff} className="mt-5 space-y-4">
                  {provisionError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{provisionError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Staff Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ananya Sharma"
                      value={provisionForm.fullName}
                      onChange={(e) => setProvisionForm({ ...provisionForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Official Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="staff.member@institution.edu"
                        value={provisionForm.email}
                        onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Staff Role Selection Cards */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Select Staff Role Authorization <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'evaluator',
                          title: 'Judge / Evaluator',
                          desc: 'Score rubric & review decks',
                          icon: Award,
                          activeClass: 'border-amber-500 bg-amber-950/40 text-amber-300',
                          iconColor: 'text-amber-400',
                        },
                        {
                          id: 'volunteer',
                          title: 'Gate Volunteer',
                          desc: 'QR scan & admit attendees',
                          icon: QrCode,
                          activeClass: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
                          iconColor: 'text-emerald-400',
                        },
                        {
                          id: 'admin',
                          title: 'Co-Admin',
                          desc: 'Full event governance',
                          icon: Shield,
                          activeClass: 'border-rose-500 bg-rose-950/40 text-rose-300',
                          iconColor: 'text-rose-400',
                        },
                      ].map((roleOpt) => {
                        const IconComp = roleOpt.icon;
                        const isSelected = provisionForm.role === roleOpt.id;
                        return (
                          <button
                            key={roleOpt.id}
                            type="button"
                            onClick={() => setProvisionForm({ ...provisionForm, role: roleOpt.id })}
                            className={`p-3 rounded-xl border text-left transition ${
                              isSelected
                                ? roleOpt.activeClass + ' shadow-md'
                                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <IconComp className={`w-4 h-4 mb-1.5 ${isSelected ? roleOpt.iconColor : 'text-slate-500'}`} />
                            <span className="block text-xs font-bold leading-tight">{roleOpt.title}</span>
                            <span className="block text-[10px] opacity-75 mt-0.5 leading-snug">{roleOpt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Note: Candidates self-register and verify via OTP — only non-candidate staff roles are provisioned here.
                    </p>
                  </div>

                  {/* Starting Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Starting Password <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProvisionForm({ ...provisionForm, startingPassword: generateRandomPassword() })
                        }
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate Strong Password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showProvisionPassword ? 'text' : 'password'}
                        required
                        value={provisionForm.startingPassword}
                        onChange={(e) =>
                          setProvisionForm({ ...provisionForm, startingPassword: e.target.value })
                        }
                        placeholder="Min. 6 characters..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProvisionPassword(!showProvisionPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showProvisionPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Staff log in using this starting password and can update it anytime from Security Settings.
                    </p>
                  </div>

                  {/* Send Onboarding Email Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-indigo-500/30 transition">
                    <input
                      type="checkbox"
                      checked={provisionForm.sendEmail}
                      onChange={(e) => setProvisionForm({ ...provisionForm, sendEmail: e.target.checked })}
                      className="mt-0.5 accent-indigo-500 rounded"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      Dispatch onboarding email with login credentials &amp; direct portal URL from{' '}
                      <span className="font-mono text-indigo-300">matrucareai@gmail.com</span>
                    </span>
                  </label>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setProvisionModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={provisioning}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                      {provisioning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Provisioning Staff...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Authorize &amp; Provision Staff</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Admin Account Security Modal */}
        <AccountSecurityModal
          isOpen={securityModalOpen}
          onClose={() => setSecurityModalOpen(false)}
        />

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

