import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/services/api';
import ScoreRubricModal from '../components/ScoreRubricModal';
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Key,
  Layers,
  LogOut,
  Trophy,
  Globe2,
  Sparkles,
} from 'lucide-react';

const JudgeLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

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
      setError(err.response?.data?.message || 'Failed to fetch hackathon submissions for evaluation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
        setSuccessToast(
          `Score for "${activeProject.projectName}" recorded successfully (${currentTotal}/40)!`
        );
        setTimeout(() => setSuccessToast(''), 4500);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const completedCount = submissions.filter((s) => s.hasEvaluated).length;
  const pendingCount = submissions.length - completedCount;

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      {/* Sticky Judge Portal Top Shell */}
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Portal Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/judge" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Award className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-white tracking-tight block leading-none">
                  Hack<span className="text-amber-400">Sphere</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Judge Portal
                </span>
              </div>
            </Link>

            {/* Primary Judge Sub-Navigation */}
            <nav className="flex items-center gap-1 ml-2 sm:ml-6 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              <NavLink
                to="/judge"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Queue</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20 font-bold">
                  {pendingCount}
                </span>
              </NavLink>

              <NavLink
                to="/judge/completed"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Completed</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20 font-bold">
                  {completedCount}
                </span>
              </NavLink>

              <NavLink
                to="/judge/security"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Security</span>
              </NavLink>
            </nav>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/leaderboard"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Public Site</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 text-xs font-semibold transition"
              >
                Admin Console
              </Link>
            )}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold">
                {user?.fullName?.charAt(0).toUpperCase() || 'J'}
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                {user?.fullName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Judge Workspace Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <Outlet
          context={{
            submissions,
            loading,
            error,
            fetchSubmissions,
            handleOpenScoring,
          }}
        />
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>HackSphere 2026 Official Judge Evaluation Panel</span>
      </footer>

      {/* Shared Scoring Rubric Modal */}
      <ScoreRubricModal
        activeProject={activeProject}
        scoringForm={scoringForm}
        onFormChange={setScoringForm}
        onScoreChange={handleScoreChange}
        currentTotal={currentTotal}
        submittingScore={submittingScore}
        onClose={() => setActiveProject(null)}
        onSubmit={handleSubmitEvaluation}
      />
    </div>
  );
};

export default JudgeLayout;
