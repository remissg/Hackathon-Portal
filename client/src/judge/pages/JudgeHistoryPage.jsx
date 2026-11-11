import React, { useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Github,
  Search,
  Sliders,
  Star,
  Video,
  ClipboardCheck,
} from 'lucide-react';

const JudgeHistoryPage = () => {
  const { submissions, loading, handleOpenScoring } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');

  const reviewedSubmissions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return submissions.filter((item) => {
      if (!item.hasEvaluated) return false;
      if (!term) return true;
      return (
        item.projectName?.toLowerCase().includes(term) ||
        item.fullName?.toLowerCase().includes(term) ||
        item.domain?.toLowerCase().includes(term)
      );
    });
  }, [submissions, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-emerald-400" />
            <span>Completed Evaluations</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit your submitted rubric scores, written feedback, and update grades before freeze.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviewed projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading completed reviews...</div>
      ) : reviewedSubmissions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Completed Reviews Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You have not submitted any evaluations yet matching this filter. Head to your queue to score assigned projects.
          </p>
          <Link
            to="/judge"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
          >
            Go to Evaluation Queue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {reviewedSubmissions.map((project) => {
            const myReview = project.myReview || {};
            const ticketId = project.ticketId || `MCAI-2026-${project._id.slice(-4).toUpperCase()}`;

            return (
              <div
                key={project._id}
                className="bg-slate-900/70 border border-emerald-500/25 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-slate-400">{ticketId}</span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 break-words">
                        {project.projectName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {project.domain} • Team Lead: {project.fullName}
                      </p>
                    </div>
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-extrabold flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-400 text-emerald-400" />
                      <span>{myReview.totalScore || 0}/40</span>
                    </div>
                  </div>

                  {/* Breakdown Pills */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1">
                    {[
                      { label: 'Innov.', val: myReview.innovation },
                      { label: 'Tech', val: myReview.technicalExecution },
                      { label: 'Impact', val: myReview.healthcareImpact },
                      { label: 'Pitch', val: myReview.presentation },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className="px-1.5 sm:px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center"
                      >
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                          {p.label}
                        </span>
                        <span className="text-xs font-bold text-sky-300 font-mono">{p.val ?? 0}/10</span>
                      </div>
                    ))}
                  </div>

                  {myReview.recommendation && (
                    <div className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-xl">
                      <span className="text-slate-500">Verdict: </span>
                      <span className="font-semibold text-amber-300">{myReview.recommendation}</span>
                    </div>
                  )}

                  {myReview.feedback && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/50 break-words">
                      &ldquo;{myReview.feedback}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 sm:p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="GitHub Repository"
                      >
                        <Github className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </a>
                    )}
                    {project.pptLink && (
                      <a
                        href={project.pptLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 sm:p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-400 transition"
                        title="Pitch Deck"
                      >
                        <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </a>
                    )}
                    {project.demoVideoLink && (
                      <a
                        href={project.demoVideoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 sm:p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Video Demo"
                      >
                        <Video className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </a>
                    )}
                    {project.prototypeLink && (
                      <a
                        href={project.prototypeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 sm:p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 transition"
                        title="Live Prototype"
                      >
                        <ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenScoring(project)}
                    className="flex-1 sm:flex-initial justify-center min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Evaluation</span>
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

export default JudgeHistoryPage;

