import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../shared/services/api';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  ExternalLink,
  Github,
  Video,
  FileText,
  Users,
  GraduationCap,
  Sparkles,
  TrendingUp,
  X,
  ChevronRight,
  ShieldCheck,
  Target,
  ArrowUpDown,
  Flame,
} from 'lucide-react';

const TRACKS = [
  'All',
  'AI/ML',
  'Healthcare Tech',
  'IoT & Robotics',
  'Web Dev',
  'Cyber Security',
  'Blockchain & Web3',
  'Cloud & DevOps',
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalProjects: 0, evaluatedProjects: 0, topScore: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTrack, sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTrack !== 'All') params.append('domain', selectedTrack);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get(`/hackathon/leaderboard?${params.toString()}`);
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('[Leaderboard Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeaderboard();
  };

  // Top 3 projects for podium display
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>HackSphere National Hackathon 2026 • Live Grand Finale Standings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Innovation <span className="bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real-time ranked showcase of hackathon solutions scored across Innovation, Technical Execution, Healthcare Impact, and Presentation by expert evaluators.
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-sky-950 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Teams</span>
              <p className="text-xl font-bold text-white">{stats.totalProjects || leaderboard.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Evaluated</span>
              <p className="text-xl font-bold text-white">{stats.evaluatedProjects} Teams</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Top Score</span>
              <p className="text-xl font-bold text-amber-300">
                {stats.topScore ? `${stats.topScore.toFixed(1)} / 40` : 'Pending'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Prize Pool</span>
              <p className="text-xl font-bold text-purple-300">₹5,00,000</p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium (Visible when >= 3 submissions exist) */}
        {!loading && leaderboard.length >= 3 && (
          <div className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-xs uppercase tracking-widest font-bold text-amber-400">
                ★ Hall of Innovation • Top Ranked Contenders ★
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
              {/* Rank 2 (Silver) */}
              {top2 && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative hover:border-slate-500 transition-all group">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg border-2 border-white">
                    2
                  </div>
                  <div className="text-center pt-2 space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      🥈 Silver Finalist
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                      {top2.projectName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{top2.collegeName}</p>
                    <div className="pt-2">
                      <span className="text-2xl font-black text-slate-200">
                        {top2.averageScore ? top2.averageScore.toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-slate-500"> / 40</span>
                    </div>
                    <button
                      onClick={() => setSelectedProject(top2)}
                      className="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      View Deliverables
                    </button>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {top1 && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-7 shadow-2xl relative scale-105 hover:border-amber-400 transition-all group">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-base flex items-center justify-center shadow-xl border-2 border-amber-300">
                    👑
                  </div>
                  <div className="text-center pt-3 space-y-2.5">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      🥇 Gold Champion
                    </span>
                    <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                      {top1.projectName}
                    </h3>
                    <p className="text-xs text-slate-300 truncate">{top1.collegeName}</p>
                    <div className="pt-2">
                      <span className="text-3xl font-black text-amber-300">
                        {top1.averageScore ? top1.averageScore.toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-slate-400"> / 40</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {top1.evaluationCount} Judge Review(s)
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProject(top1)}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
                    >
                      View Winning Pitch &amp; Code
                    </button>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3 && (
                <div className="order-3 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-800/60 rounded-3xl p-6 shadow-xl relative hover:border-amber-700 transition-all group">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-lg border-2 border-amber-500">
                    3
                  </div>
                  <div className="text-center pt-2 space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                      🥉 Bronze Finalist
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {top3.projectName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{top3.collegeName}</p>
                    <div className="pt-2">
                      <span className="text-2xl font-black text-amber-400">
                        {top3.averageScore ? top3.averageScore.toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-slate-500"> / 40</span>
                    </div>
                    <button
                      onClick={() => setSelectedProject(top3)}
                      className="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      View Deliverables
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters & Search Control Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search project title, college, or lead..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </form>

            {/* Sort & Action controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="score">Highest Score</option>
                  <option value="newest">Newest Submissions</option>
                  <option value="alpha">Project Name (A-Z)</option>
                </select>
              </div>

              <Link
                to="/register-hackathon"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-md shadow-sky-500/20 shrink-0"
              >
                Submit Project →
              </Link>
            </div>
          </div>

          {/* Track Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Tracks:
            </span>
            {TRACKS.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedTrack === track
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table / Feed */}
        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Aggregating live standings and scores...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Projects Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No submissions match your active search or track filter. Be the first team to submit and claim the #1 rank!
            </p>
            <Link
              to="/register-hackathon"
              className="inline-block px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20"
            >
              Register Now
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Project Title &amp; Innovation Track</th>
                    <th className="py-4 px-6">Team &amp; College</th>
                    <th className="py-4 px-6 text-center">Judge Score</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {leaderboard.map((item, index) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isTop1 ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-4 px-6 text-center">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-md">
                              🥉
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-slate-400 text-sm">
                              #{item.rank}
                            </span>
                          )}
                        </td>

                        {/* Project Name & Domain */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="font-bold text-white hover:text-sky-400 cursor-pointer block text-base" onClick={() => setSelectedProject(item)}>
                              {item.projectName}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800/60">
                                {item.domain}
                              </span>
                              {item.ticketId && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  {item.ticketId}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Team Lead & College */}
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-slate-200 text-xs">
                              {item.teamLead}{' '}
                              {item.teamSize > 1 && (
                                <span className="text-[10px] text-slate-400">
                                  (+{item.teamSize - 1} members)
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[220px]" title={item.collegeName}>
                              {item.collegeName}
                            </p>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-6 text-center">
                          {item.evaluationCount > 0 ? (
                            <div className="space-y-1">
                              <span className="font-mono font-black text-base text-emerald-400">
                                {item.averageScore.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-slate-500"> / 40</span>
                              <div className="w-24 bg-slate-800 h-1.5 rounded-full mx-auto overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${(item.averageScore / 40) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Under Evaluation</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              item.status === 'Finalist'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : item.status === 'Shortlisted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedProject(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Deliverable Inspector Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800/60">
                  {selectedProject.domain}
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">{selectedProject.projectName}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted by {selectedProject.teamLead} • {selectedProject.collegeName}
                </p>
              </div>

              {/* Scorecard Strip */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Leaderboard Rank</span>
                  <p className="text-xl font-black text-amber-400">#{selectedProject.rank}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Evaluator Score</span>
                  <p className="text-xl font-black text-emerald-400">
                    {selectedProject.averageScore ? `${selectedProject.averageScore.toFixed(1)} / 40` : 'Evaluating'}
                  </p>
                </div>
              </div>

              {/* Team Roster */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Team Composition ({selectedProject.teamSize} Member(s))
                </span>
                <p className="text-xs text-slate-200">
                  ★ Lead: <strong className="text-white">{selectedProject.teamLead}</strong>
                  {selectedProject.teamMembers?.length > 0 && (
                    <span> • Teammates: {selectedProject.teamMembers.join(', ')}</span>
                  )}
                </p>
              </div>

              {/* Links & Submissions */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Project Deliverables
                </span>
                
                <a
                  href={selectedProject.pptLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-slate-200">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold">Presentation Deck (PPT)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
                </a>

                <a
                  href={selectedProject.prototypeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-slate-200">
                    <Github className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold">Code Repository / Prototype</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
                </a>

                {selectedProject.demoVideoLink && (
                  <a
                    href={selectedProject.demoVideoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition group"
                  >
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <Video className="w-4 h-4 text-rose-400" />
                      <span className="font-semibold">Demo Video Walkthrough</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                  </a>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

