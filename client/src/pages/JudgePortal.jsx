import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  FileText,
  Video,
  Star,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  X,
  AlertCircle,
  RefreshCw,
  Sliders,
  TrendingUp,
} from 'lucide-react';

const TRACK_OPTIONS = [
  'All',
  'AI & Machine Learning in Healthcare',
  'Maternal & Neonatal IoT Monitoring',
  'Predictive Clinical Diagnostics',
  'Healthcare Analytics & EHR Integration',
  'Telemedicine & Remote Care Solutions',
];

const JudgePortal = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isJudge =
    user?.role === 'evaluator' ||
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'matrucareai@gmail.com';

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  // Active Scoring Modal State
  const [activeProject, setActiveProject] = useState(null);
  const [scoringForm, setScoringForm] = useState({
    innovation: 7,
    technicalExecution: 7,
    healthcareImpact: 7,
    presentation: 7,
    recommendation: 'Recommended for Shortlist',
    feedback: '',
  });
  const [submittingScore, setSubmittingScore] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/hackathon/evaluator/submissions');
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      console.error('[Fetch Evaluator Submissions Error]:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch hackathon submissions for evaluation.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isJudge) {
      fetchSubmissions();
    }
  }, [isAuthenticated, isJudge]);

  // Open scoring modal for a project
  const handleOpenScoring = (project) => {
    setActiveProject(project);
    if (project.myReview) {
      setScoringForm({
        innovation: project.myReview.innovation || 7,
        technicalExecution: project.myReview.technicalExecution || 7,
        healthcareImpact: project.myReview.healthcareImpact || 7,
        presentation: project.myReview.presentation || 7,
        recommendation: project.myReview.recommendation || 'Recommended for Shortlist',
        feedback: project.myReview.feedback || '',
      });
    } else {
      setScoringForm({
        innovation: 7,
        technicalExecution: 7,
        healthcareImpact: 7,
        presentation: 7,
        recommendation: 'Recommended for Shortlist',
        feedback: '',
      });
    }
  };

  const handleScoreChange = (field, val) => {
    setScoringForm((prev) => ({
      ...prev,
      [field]: Number(val),
    }));
  };

  const currentTotal =
    Number(scoringForm.innovation) +
    Number(scoringForm.technicalExecution) +
    Number(scoringForm.healthcareImpact) +
    Number(scoringForm.presentation);

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!activeProject?._id) return;

    setSubmittingScore(true);
    try {
      const res = await api.post(`/hackathon/${activeProject._id}/evaluate`, scoringForm);
      if (res.data.success) {
        setSuccessToast(`Score for "${activeProject.projectName}" recorded successfully (${currentTotal}/40)!`);
        setTimeout(() => setSuccessToast(''), 4500);

        // Update local state
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === activeProject._id
              ? {
                  ...sub,
                  hasEvaluated: true,
                  myReview: res.data.evaluation,
                  averageScore: res.data.averageScore,
                  evaluationCount: res.data.evaluationCount,
                }
              : sub
          )
        );
        setActiveProject(null);
      }
    } catch (err) {
      console.error('[Submit Evaluation Error]:', err);
      alert(err.response?.data?.message || 'Failed to submit evaluation score.');
    } finally {
      setSubmittingScore(false);
    }
  };

  // Filtered submissions
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

  if (!isJudge) {
    return (
      <div className="min-h-screen bg-[#070d19] text-slate-100 pt-32 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Evaluator Access Required</h2>
          <p className="text-sm text-slate-400">
            This workspace is reserved for official MatruCare AI Hackathon Judges and Technical Evaluators.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition"
            >
              Return to Participant Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Official Judge Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {user?.fullName} ({user?.role === 'admin' ? 'Super Admin / Judge' : 'Evaluator'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Project Evaluation & Scoring Rubric
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Review candidate pitch decks, inspect GitHub repositories, test live prototypes, and submit formal scores across the standard 4-pillar evaluation rubric.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0">
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in shadow-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Total Submissions
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{submissions.length}</span>
              <span className="text-xs text-slate-500">projects registered</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Evaluated By You
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400">{evaluatedCount}</span>
              <span className="text-xs text-slate-500">of {submissions.length} completed</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Pending Review
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-400">
                {submissions.length - evaluatedCount}
              </span>
              <span className="text-xs text-slate-500">awaiting your score</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by title, candidate name, or college..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
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
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubmissions.map((project) => {
              const ticketId = project.ticketId || `MCAI-2026-${project._id.slice(-4).toUpperCase()}`;
              const myReview = project.myReview;

              return (
                <div
                  key={project._id}
                  className={`p-5 rounded-2xl bg-slate-900/70 border transition-all flex flex-col justify-between space-y-4 hover:border-slate-700 ${
                    myReview ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Tag & Status */}
                    <div className="flex items-center justify-between gap-2">
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
                      <h3 className="text-lg font-bold text-white line-clamp-1">{project.projectName}</h3>
                      <span className="inline-block mt-1 text-[11px] text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/30">
                        {project.domain}
                      </span>
                    </div>

                    {/* Team Lead & College */}
                    <div className="text-xs text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                      <p className="text-slate-200 font-medium">Team Lead: {project.fullName}</p>
                      <p className="truncate text-[11px] text-slate-500">{project.collegeName}</p>
                      <p className="text-[11px] text-slate-500">
                        Team Size: {project.teamSize || 1} {project.teamSize === 1 ? 'member' : 'members'}
                      </p>
                    </div>

                    {/* Deliverables Action Links */}
                    <div className="pt-2 flex items-center gap-2">
                      {project.pptLink && (
                        <a
                          href={project.pptLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg hover:bg-amber-900/50 transition"
                        >
                          <FileText className="w-3 h-3" /> Slide Deck
                        </a>
                      )}
                      {project.prototypeLink && (
                        <a
                          href={project.prototypeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2.5 py-1 rounded-lg hover:bg-sky-900/50 transition"
                        >
                          <Github className="w-3 h-3" /> Prototype
                        </a>
                      )}
                      {project.demoVideoLink && (
                        <a
                          href={project.demoVideoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-lg hover:bg-rose-900/50 transition"
                        >
                          <Video className="w-3 h-3" /> Demo
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
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

      {/* Interactive Scoring Modal Drawer */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Official Scoring Rubric (40 Points Max)
                </span>
                <h3 className="text-lg font-bold text-white truncate max-w-md">
                  {activeProject.projectName}
                </h3>
              </div>
              <button
                onClick={() => setActiveProject(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitEvaluation} className="p-6 overflow-y-auto space-y-6">
              
              {/* Deliverables Quick Access */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Project Deliverables:</span>
                <div className="flex items-center gap-2">
                  {activeProject.pptLink && (
                    <a
                      href={activeProject.pptLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" /> Slide Deck (PPT)
                    </a>
                  )}
                  {activeProject.prototypeLink && (
                    <a
                      href={activeProject.prototypeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1 font-semibold ml-2"
                    >
                      <Github className="w-3.5 h-3.5" /> Repository
                    </a>
                  )}
                  {activeProject.demoVideoLink && (
                    <a
                      href={activeProject.demoVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-400 hover:underline flex items-center gap-1 font-semibold ml-2"
                    >
                      <Video className="w-3.5 h-3.5" /> Demo Video
                    </a>
                  )}
                </div>
              </div>

              {/* Rubric Criteria Sliders */}
              <div className="space-y-4">
                
                {/* 1. Innovation */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">1. Innovation & Novelty</h4>
                      <p className="text-xs text-slate-400">Originality of approach, unique value proposition in healthcare</p>
                    </div>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      {scoringForm.innovation} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scoringForm.innovation}
                    onChange={(e) => handleScoreChange('innovation', e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* 2. Technical Execution */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">2. Technical Execution & Architecture</h4>
                      <p className="text-xs text-slate-400">Code quality, system stability, AI/ML implementation rigor</p>
                    </div>
                    <span className="text-base font-extrabold text-sky-400 font-mono">
                      {scoringForm.technicalExecution} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scoringForm.technicalExecution}
                    onChange={(e) => handleScoreChange('technicalExecution', e.target.value)}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* 3. Healthcare Impact */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">3. Healthcare Impact & Feasibility</h4>
                      <p className="text-xs text-slate-400">Clinical relevance, scalability in real hospital/patient settings</p>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {scoringForm.healthcareImpact} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scoringForm.healthcareImpact}
                    onChange={(e) => handleScoreChange('healthcareImpact', e.target.value)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* 4. Presentation */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">4. Pitch & Presentation Quality</h4>
                      <p className="text-xs text-slate-400">Clarity of slide deck, live demo execution, problem explanation</p>
                    </div>
                    <span className="text-base font-extrabold text-indigo-400 font-mono">
                      {scoringForm.presentation} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scoringForm.presentation}
                    onChange={(e) => handleScoreChange('presentation', e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

              </div>

              {/* Total Score Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950/60 to-slate-950/60 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                    Calculated Total Score
                  </span>
                  <span className="text-xs text-slate-400">
                    Grade: {((currentTotal / 40) * 100).toFixed(0)}% Overall Score
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-amber-400 font-mono">{currentTotal}</span>
                  <span className="text-sm text-slate-500 font-bold"> / 40</span>
                </div>
              </div>

              {/* Recommendation Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Judge Recommendation
                </label>
                <select
                  value={scoringForm.recommendation}
                  onChange={(e) => setScoringForm({ ...scoringForm, recommendation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Consideration">Consideration (Standard Submission)</option>
                  <option value="Needs Revision">Needs Revision (Technical gaps)</option>
                  <option value="Recommended for Shortlist">Recommended for Shortlist</option>
                  <option value="Top Contender">Top Contender (Potential Winner)</option>
                </select>
              </div>

              {/* Qualitative Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Qualitative Feedback & Notes
                </label>
                <textarea
                  rows="3"
                  value={scoringForm.feedback}
                  onChange={(e) => setScoringForm({ ...scoringForm, feedback: e.target.value })}
                  placeholder="Share feedback on technical strengths, UX design, model accuracy, or areas to improve..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingScore}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  {submittingScore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting Score...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Submit Official Evaluation
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JudgePortal;

