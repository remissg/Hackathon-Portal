import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../shared/services/api';
import { useAuth } from '../../shared/context/AuthContext';
import AdminSidebar from './AdminSidebar';
import SectionLoader from '../../shared/components/SectionLoader';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [adminEvents, setAdminEvents] = useState([]);
  const [adminProblems, setAdminProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [auditRefreshTick, setAuditRefreshTick] = useState(0);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4500);
  };

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

    // Warm up Admin child route chunks so sidebar switches happen immediately
    Promise.all([
      import('../pages/AdminSubmissionsPage'),
      import('../pages/AdminProblemsPage'),
      import('../pages/AdminStaffRolesPage'),
      import('../pages/AdminAuditLogsPage'),
    ]).catch(() => {});
  }, []);

  const handleExportCSV = () => {
    if (!registrations.length) {
      alert('No registrations available to export.');
      return;
    }

    const headers = [
      'Reg ID',
      'Date Registered',
      'Lead Name',
      'Email',
      'Mobile',
      'College Name',
      'Course',
      'Branch',
      'Year',
      'Project Title',
      'Domain / Track',
      'Team Size',
      'Members',
      'Gate Check-In Status',
      'Check-In Timestamp',
      'Avg Judge Score',
      'Reviews Count',
      'PPT Link',
      'Prototype / GitHub',
      'Status',
    ];

    const rows = registrations.map((r) => {
      const regId = `MCAI-2026-${r._id ? r._id.slice(-4).toUpperCase() : '0000'}`;
      const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'N/A';
      const membersText =
        r.teamMembers && r.teamMembers.length > 0
          ? r.teamMembers.map((m) => `${m.name} (${m.email})`).join('; ')
          : 'Solo';
      const checkInStatus = r.isCheckedIn ? 'Admitted' : 'Pending';
      const checkInTime = r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('en-IN') : 'N/A';
      const avgScore = r.averageScore ? r.averageScore : 'N/A';
      const reviewCount = r.evaluationCount || 0;

      return [
        regId,
        date,
        `"${(r.fullName || '').replace(/"/g, '""')}"`,
        r.email || '',
        r.mobileNumber || '',
        `"${(r.collegeName || '').replace(/"/g, '""')}"`,
        r.course || '',
        r.branch || '',
        r.yearOfStudy || '',
        `"${(r.projectName || '').replace(/"/g, '""')}"`,
        `"${(r.domain || '').replace(/"/g, '""')}"`,
        r.teamSize || 1,
        `"${membersText.replace(/"/g, '""')}"`,
        checkInStatus,
        `"${checkInTime}"`,
        avgScore,
        reviewCount,
        r.pptLink || '',
        r.prototypeLink || r.githubLink || '',
        r.status || 'Submitted',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `HackSphere_Hackathon_Registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshActive = () => {
    if (location.pathname.includes('/admin/problems')) {
      fetchAdminProblems();
    } else if (location.pathname.includes('/admin/roles')) {
      fetchUsers();
    } else if (location.pathname.includes('/admin/logs')) {
      setAuditRefreshTick((prev) => prev + 1);
    } else {
      fetchData();
    }
  };

  const getHeaderMeta = () => {
    if (location.pathname.includes('/admin/problems')) {
      return {
        crumb: 'Problem Statements',
        title: 'SIH Challenge Problem Statements',
        isSubmissions: false,
      };
    }
    if (location.pathname.includes('/admin/roles')) {
      return {
        crumb: 'Access & Roles',
        title: 'Role-Based Access Control (RBAC)',
        isSubmissions: false,
      };
    }
    if (location.pathname.includes('/admin/logs')) {
      return {
        crumb: 'Activity Logs',
        title: 'System Audit Trail & Accountability',
        isSubmissions: false,
      };
    }
    return {
      crumb: 'Project Submissions',
      title: 'Candidate Submissions & Evaluation',
      isSubmissions: true,
    };
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full max-w-full min-w-0 overflow-x-hidden">
      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        counts={{
          registrations: registrations.length,
          problems: adminProblems.length,
          users: users.length,
        }}
        user={user}
        onLogout={() => {
          logout();
          navigate('/');
        }}
      />

      {/* MAIN CONTENT WORKSPACE */}
      <div
        className={`${
          isCollapsed ? 'md:pl-20' : 'md:pl-72'
        } flex-1 min-w-0 max-w-full w-full flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

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
                <span className="text-[11px] font-bold text-rose-400">{headerMeta.crumb}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {headerMeta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefreshActive}
              disabled={loading || loadingUsers || loadingProblems}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
              title="Refresh Current View"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading || loadingUsers || loadingProblems ? 'animate-spin text-sky-400' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {headerMeta.isSubmissions && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 min-w-0 max-w-full w-full">
          {notification && (
            <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-sky-950/90 border border-sky-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in">
              <CheckCircle className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span className="text-sm font-medium">{notification}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <Suspense fallback={<SectionLoader label="Loading admin section..." accentClass="border-t-rose-400" />}>
            <Outlet
              context={{
                registrations,
                setRegistrations,
                stats,
                loading,
                fetchData,
                users,
                setUsers,
                loadingUsers,
                fetchUsers,
                adminEvents,
                adminProblems,
                loadingProblems,
                fetchAdminProblems,
                auditRefreshTick,
                showToast,
              }}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

