import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../shared/services/api';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  KeyRound,
  Lock,
  QrCode,
  RefreshCw,
  ScrollText,
  Search,
  ShieldAlert,
  Target,
  UserCog,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Activity', icon: ScrollText },
  { id: 'rbac', label: 'RBAC & Staff', icon: UserCog },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'evaluation', label: 'Judges', icon: Award },
  { id: 'gate', label: 'Gate Check-In', icon: QrCode },
  { id: 'problems', label: 'Problems', icon: Target },
  { id: 'auth', label: 'Auth', icon: KeyRound },
];

const SEVERITY_BADGES = {
  critical: 'bg-rose-950/60 text-rose-300 border-rose-700/60',
  warning: 'bg-amber-950/60 text-amber-300 border-amber-700/60',
  info: 'bg-sky-950/50 text-sky-300 border-sky-700/50',
};

const ROLE_BADGES = {
  super_admin: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  admin: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  evaluator: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  volunteer: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  user: 'bg-slate-800 text-slate-300 border-slate-700',
  system: 'bg-slate-900 text-slate-400 border-slate-800',
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Co-Admin',
  evaluator: 'Judge',
  volunteer: 'Volunteer',
  user: 'Candidate',
  system: 'System',
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

const formatChangesPill = (changes) => {
  if (!changes || typeof changes !== 'object') return null;
  if (changes.from !== undefined && changes.to !== undefined) {
    return `${changes.from} → ${changes.to}`;
  }
  if (changes.totalScore !== undefined) {
    return `Score: ${changes.totalScore}/40 • ${changes.recommendation || ''}`.trim();
  }
  if (changes.gateAction !== undefined) {
    return `${changes.gateAction} (${changes.admittedMembers ?? 0}/${changes.totalMembers ?? 0} inside)`;
  }
  if (changes.role && changes.fromActive !== undefined) {
    return `${changes.role}: ${changes.fromActive ? 'Active' : 'Disabled'} → ${changes.toActive ? 'Active' : 'Disabled'}`;
  }
  if (changes.role) {
    return `Role: ${changes.role}`;
  }
  if (changes.decision) {
    return `Invite: ${changes.decision}`;
  }
  return null;
};

const AdminAuditLogsPage = () => {
  const { auditRefreshTick = 0 } = useOutletContext() || {};

  const [logs, setLogs] = useState([]);
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 35, total: 0, totalPages: 1 });
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalOverall, setTotalOverall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        category,
        severity,
        page: String(page),
        limit: '35',
      });
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      const res = await api.get(`/audit-logs?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination || { page: 1, limit: 35, total: 0, totalPages: 1 });
        setCategoryCounts(res.data.categoryCounts || {});
        setTotalOverall(res.data.totalOverall || 0);
      }
    } catch (err) {
      console.error('[Fetch Audit Logs Error]:', err);
      setError(err.response?.data?.message || 'Failed to load immutable activity logs.');
    } finally {
      setLoading(false);
    }
  }, [category, severity, debouncedSearch, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, auditRefreshTick]);

  return (
    <div className="space-y-6">
      {/* Append-Only Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 text-xs">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Immutable System Activity &amp; Audit Trail</h4>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Every state-changing action across Admin RBAC, Submissions, Gate Check-Ins, Judge Evaluations, and Problem Statements is permanently logged with actor identity and timestamp. Logs are read-only and cannot be modified.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="self-start sm:self-center shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Sync Logs</span>
        </button>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.id === 'all' ? totalOverall : categoryCounts[tab.id] || 0;
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCategory(tab.id);
                setPage(1);
              }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
                active
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  active ? 'bg-sky-500/30 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Severity Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search actor name/email, action, project, or audit reason..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info Only</option>
            <option value="warning">Warnings</option>
            <option value="critical">Critical Actions</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Timeline Table / Cards */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-sky-400" />
            <p className="text-sm">Loading activity ledger...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <ScrollText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No audit records match your current filter</p>
            <p className="text-xs text-slate-500">
              Actions performed from now on across Admin, Judge, Gate, and Auth endpoints will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3.5">When</th>
                    <th className="px-5 py-3.5">Actor (Who)</th>
                    <th className="px-5 py-3.5">Action &amp; Details (What)</th>
                    <th className="px-5 py-3.5">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {logs.map((log) => {
                    const roleKey = log.actor?.role || 'system';
                    const changePill = formatChangesPill(log.changes);
                    return (
                      <tr key={log._id} className="hover:bg-slate-800/30 transition align-top">
                        <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{formatRelativeTime(log.createdAt)}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{log.actor?.name || 'System'}</div>
                          <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                            {log.actor?.email || 'system'}
                          </div>
                          <span
                            className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ROLE_BADGES[roleKey] || ROLE_BADGES.user
                            }`}
                          >
                            {ROLE_LABELS[roleKey] || roleKey}
                          </span>
                        </td>

                        <td className="px-5 py-4 max-w-md space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                                SEVERITY_BADGES[log.severity] || SEVERITY_BADGES.info
                              }`}
                            >
                              {log.action}
                            </span>
                            {changePill && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                                {changePill}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 leading-relaxed">{log.summary}</p>
                          {log.reason && (
                            <p className="text-[11px] text-amber-300/90 bg-amber-950/25 border border-amber-800/40 px-2.5 py-1.5 rounded-lg">
                              <strong>Audit Reason:</strong> {log.reason}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {log.target?.label ? (
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                                {log.target.type || 'Entity'}
                              </span>
                              <span className="text-slate-200 font-medium break-words">
                                {log.target.label}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800">
              {logs.map((log) => {
                const roleKey = log.actor?.role || 'system';
                const changePill = formatChangesPill(log.changes);
                return (
                  <div key={log._id} className="p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                          SEVERITY_BADGES[log.severity] || SEVERITY_BADGES.info
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">{log.summary}</p>

                    {changePill && (
                      <div className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                        {changePill}
                      </div>
                    )}

                    {log.reason && (
                      <p className="text-[11px] text-amber-300/90 bg-amber-950/25 border border-amber-800/40 px-2.5 py-1.5 rounded-lg">
                        <strong>Reason:</strong> {log.reason}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-white">{log.actor?.name || 'System'}</span>{' '}
                        <span className="text-slate-500 font-mono">({log.actor?.email || 'system'})</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ROLE_BADGES[roleKey] || ROLE_BADGES.user
                        }`}
                      >
                        {ROLE_LABELS[roleKey] || roleKey}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Showing page <strong className="text-white">{pagination.page}</strong> of{' '}
              <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} matching logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold flex items-center gap-1 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;

