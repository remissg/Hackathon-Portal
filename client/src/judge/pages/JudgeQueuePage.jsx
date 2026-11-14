import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Github,
  RefreshCw,
  Search,
  Sliders,
  Star,
  Video,
} from 'lucide-react';

const TRACK_OPTIONS = [
  'All',
  'AI & Machine Learning in Healthcare',
  'Maternal & Neonatal IoT Monitoring',
  'Predictive Clinical Diagnostics',
  'Healthcare Analytics & EHR Integration',
  'Telemedicine & Remote Care Solutions',
];

const JudgeQueuePage = () => {
  const { submissions, loading, error, fetchSubmissions, handleOpenScoring } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.projectName?.toLowerCase().includes(term) ||
        item.fullName?.toLowerCase().includes(term) ||
        item.collegeName?.toLowerCase().includes(term);

      const matchesTrack = selectedTrack === 'All' || item.domain === selectedTrack;
      const matchesPending = !filterPendingOnly || !item.hasEvaluated;

      return matchesSearch && matchesTrack && matchesPending;
    });
  }, [submissions, searchTerm, selectedTrack, filterPendingOnly]);

  const evaluatedCount = submissions.filter((s) => s.hasEvaluated).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Evaluation Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review project deliverables and submit official 40-point rubric scores.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Queue</span>
        </button>
      </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Total
            </span>
            <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xl sm:text-3xl font-extrabold text-white">{submissions.length}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">projects</span>
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Scored
            </span>
            <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xl sm:text-3xl font-extrabold text-amber-400">{evaluatedCount}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">of {submissions.length}</span>
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Pending
            </span>
            <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xl sm:text-3xl font-extrabold text-cyan-400">
                {submissions.length - evaluatedCount}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">to review</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects, candidate, or college..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full sm:w-auto max-w-full min-w-0 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 truncate"
              >
                {TRACK_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`w-full sm:w-auto justify-center min-h-[40px] px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shrink-0 ${
                filterPendingOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {filterPendingOnly ? '✓ Showing Pending Only' : 'Show Pending Only'}
            </button>
          </div>
        </div>

        {/* Project Submissions Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm">Loading hackathon submissions for evaluation...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base font-semibold text-slate-200">No projects found matching criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your track filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSubmissions.map((project) => {
              const ticketId = project.ticketId || `MCAI-2026-${project._id.slice(-4).toUpperCase()}`;
              const myReview = project.myReview;

              return (
                <div
                  key={project._id}
                  className={`p-4 sm:p-5 rounded-2xl bg-slate-900/70 border transition-all flex flex-col justify-between space-y-4 hover:border-slate-700 ${
                    myReview ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Tag & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                        {ticketId}
                      </span>
                      {myReview ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Scored ({myReview.totalScore}/40)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Awaiting Score
                        </span>
                      )}
                    </div>

                    {/* Project Title & Track */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 sm:line-clamp-1">
                        {project.projectName}
                      </h3>
                      <span className="inline-block mt-1 text-[11px] text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/30 max-w-full truncate">
                        {project.domain}
                      </span>
                    </div>

                    {/* Team Lead & College */}
                    <div className="text-xs text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                      <p className="text-slate-200 font-medium truncate">Team Lead: {project.fullName}</p>
                      <p className="truncate text-[11px] text-slate-500">{project.collegeName}</p>
                      <p className="text-[11px] text-slate-500">
                        Team Size: {project.teamSize || 1} {project.teamSize === 1 ? 'member' : 'members'}
                      </p>
                    </div>

                    {/* Deliverables Action Links */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {project.pptLink && (
                        <a
                          href={project.pptLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1.5 rounded-lg hover:bg-amber-900/50 transition"
                        >
                          <FileText className="w-3 h-3" /> Slide Deck
                        </a>
                      )}
                      {project.prototypeLink && (
                        <a
                          href={project.prototypeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2.5 py-1.5 rounded-lg hover:bg-sky-900/50 transition"
                        >
                          <Github className="w-3 h-3" /> Prototype
                        </a>
                      )}
                      {project.demoVideoLink && (
                        <a
                          href={project.demoVideoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1.5 rounded-lg hover:bg-rose-900/50 transition"
                        >
                          <Video className="w-3 h-3" /> Demo
                        </a>
                      )}
                    </div>

                    {/* Nominations tags if evaluated */}
                    {Array.isArray(myReview?.nominations) && myReview.nominations.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {myReview.nominations.map((nom) => (
                          <span
                            key={nom}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30"
                          >
                            ★ {nom}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                      {project.averageScore > 0 ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <strong className="text-white">{project.averageScore}</strong>/40 ({project.evaluationCount} {project.evaluationCount === 1 ? 'review' : 'reviews'})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">No other reviews</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenScoring(project)}
                      className={`min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        myReview
                          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {myReview ? 'Edit Scores' : 'Grade Project'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default JudgeQueuePage;
