import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../shared/services/api';
import KpiSummaryCards from '../components/KpiSummaryCards';
import SubmissionDetailModal from '../components/SubmissionDetailModal';
import {
  Eye,
  FileText,
  Filter,
  Github,
  Layers,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Users,
  Video,
  X,
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

const AdminSubmissionsPage = () => {
  const { registrations, setRegistrations, stats, loading, showToast } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeModalEntry, setActiveModalEntry] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

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
    <div className="space-y-6">
      <KpiSummaryCards stats={stats} registrations={registrations} />

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

      <SubmissionDetailModal
        activeModalEntry={activeModalEntry}
        onClose={() => setActiveModalEntry(null)}
        STATUS_OPTIONS={STATUS_OPTIONS}
        getStatusBadge={getStatusBadge}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminSubmissionsPage;
