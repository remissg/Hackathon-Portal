import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  X,
  FileText,
  Github,
  Video,
} from 'lucide-react';

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
  const { user } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

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
        `"${r.pptLink || ''}"`,
        `"${r.prototypeLink || ''}"`,
        `"${r.demoVideoLink || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MatruCare_AI_Hackathon_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-24 right-6 z-50 flex items-center gap-3 bg-sky-950/90 border border-sky-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in">
            <CheckCircle className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                MatruCare AI Admin Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Operator: {user?.email || 'matrucareai@gmail.com'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hackathon Evaluation & Candidate Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review project proposals, inspect dynamic team rosters, change evaluation stages, and export candidate data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Registrations */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Submissions</span>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.totalRegistrations ?? registrations.length}
              </span>
              <span className="text-xs text-slate-400">projects</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.soloCount || 0} Solo Innovators • {stats?.teamCount || 0} Teams
            </p>
          </div>

          {/* Card 2: Total Participants */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Innovators</span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.totalParticipants ?? registrations.reduce((acc, r) => acc + (r.teamSize || 1), 0)}
              </span>
              <span className="text-xs text-slate-400">candidates</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Across dynamic 1–5 member teams</p>
          </div>

          {/* Card 3: Shortlisted / Finalists */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shortlisted / Finalists</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {(stats?.statusCounts?.Shortlisted || 0) + (stats?.statusCounts?.Finalist || 0)}
              </span>
              <span className="text-xs text-emerald-400 font-medium">advanced</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.statusCounts?.Shortlisted || 0} Shortlisted • {stats?.statusCounts?.Finalist || 0} Finalists
            </p>
          </div>

          {/* Card 4: Under Review */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Under Review</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.statusCounts?.['Under Review'] || 0}
              </span>
              <span className="text-xs text-amber-400 font-medium">in evaluation</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.statusCounts?.Submitted || 0} pending initial review
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
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
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">ID / Date</th>
                    <th scope="col" className="px-5 py-3.5">Project & Track</th>
                    <th scope="col" className="px-5 py-3.5">Team Lead</th>
                    <th scope="col" className="px-5 py-3.5">Institution</th>
                    <th scope="col" className="px-5 py-3.5">Team Size</th>
                    <th scope="col" className="px-5 py-3.5">Links</th>
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

      </div>
    </div>
  );
};

export default AdminDashboard;
