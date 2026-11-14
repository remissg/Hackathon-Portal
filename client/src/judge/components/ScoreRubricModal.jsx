import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Github,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Star,
  Video,
  Volume2,
  X,
  ArrowRight,
} from 'lucide-react';

const RUBRIC_CRITERIA = [
  {
    field: 'innovation',
    title: '1. Innovation & Novelty',
    subtitle: 'Originality of approach, unique value proposition in healthcare',
    colorClass: 'text-amber-400',
    accentClass: 'accent-amber-500',
  },
  {
    field: 'technicalExecution',
    title: '2. Technical Execution & Architecture',
    subtitle: 'Code quality, system stability, AI/ML implementation rigor',
    colorClass: 'text-sky-400',
    accentClass: 'accent-sky-500',
  },
  {
    field: 'healthcareImpact',
    title: '3. Healthcare Impact & Feasibility',
    subtitle: 'Clinical relevance, scalability in real hospital/patient settings',
    colorClass: 'text-emerald-400',
    accentClass: 'accent-emerald-500',
  },
  {
    field: 'presentation',
    title: '4. Pitch & Presentation Quality',
    subtitle: 'Clarity of slide deck, live demo execution, problem explanation',
    colorClass: 'text-indigo-400',
    accentClass: 'accent-indigo-500',
  },
];

const NOMINATION_OPTIONS = [
  { id: 'National Finalist', label: '🌟 National Finalist', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
  { id: 'Best AI Tech', label: '🤖 Best AI / ML Tech', color: 'border-purple-500/40 text-purple-300 bg-purple-500/10' },
  { id: 'Best UI/UX', label: '🎨 Best UI / UX Design', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
  { id: 'Healthcare Impact', label: '🏥 Highest Clinical Impact', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
];

const ScoreRubricModal = ({
  activeProject,
  scoringForm,
  onFormChange,
  onScoreChange,
  currentTotal,
  submittingScore,
  onClose,
  onSubmit,
  onScoreNext,
  remainingPendingCount = 0,
}) => {
  // Built-in Pitch Stopwatch State
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 mins default
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('pitch'); // 'pitch' (180s), 'qa' (120s), 'wrap' (60s)
  const timerIntervalRef = useRef(null);

  // Audio Confirmation Beep when time expires
  const playTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const selectTimerPreset = (mode, secs) => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerSeconds(secs);
  };

  // LocalStorage Draft Persistence
  useEffect(() => {
    if (!activeProject?._id) return;
    const draftKey = `hs_judge_draft_${activeProject._id}`;
    if (!activeProject.myReview) {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            onFormChange((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (_) {}
    }
  }, [activeProject?._id]);

  useEffect(() => {
    if (!activeProject?._id) return;
    const draftKey = `hs_judge_draft_${activeProject._id}`;
    try {
      localStorage.setItem(draftKey, JSON.stringify(scoringForm));
    } catch (_) {}
  }, [scoringForm, activeProject?._id]);

  if (!activeProject) return null;

  const stepScore = (field, delta) => {
    const curr = Number(scoringForm[field] || 5);
    const next = Math.min(10, Math.max(1, curr + delta));
    onScoreChange(field, next);
  };

  const applyPreset = (score) => {
    onFormChange({
      ...scoringForm,
      innovation: score,
      technicalExecution: score,
      healthcareImpact: score,
      presentation: score,
    });
  };

  const toggleNomination = (id) => {
    const current = Array.isArray(scoringForm.nominations) ? scoringForm.nominations : [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onFormChange({ ...scoringForm, nominations: next });
  };

  const getBenchmarkLabel = (val) => {
    if (val <= 4) return { text: 'Concept / Partial Demo', color: 'text-slate-400' };
    if (val <= 6) return { text: 'Functional Baseline MVP', color: 'text-sky-400' };
    if (val <= 8) return { text: 'Solid Architecture & Impact', color: 'text-emerald-400' };
    return { text: 'Breakthrough / Production Rigor', color: 'text-amber-400 font-bold' };
  };

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full sm:max-w-3xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Official Scoring Rubric (40 Points Max)
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white truncate">
              {activeProject.projectName}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            aria-label="Close scoring modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          
          {/* Integrated Live Pitch & Q&A Stopwatch */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                timerSeconds === 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Pitch &amp; Q&amp;A Stopwatch
                </span>
                <span className={`text-xl font-mono font-black ${
                  timerSeconds === 0 ? 'text-rose-400 animate-pulse' : timerSeconds < 30 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Presets and Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => selectTimerPreset('pitch', 180)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    timerMode === 'pitch' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3m Pitch
                </button>
                <button
                  type="button"
                  onClick={() => selectTimerPreset('qa', 120)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    timerMode === 'qa' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2m Q&amp;A
                </button>
                <button
                  type="button"
                  onClick={() => selectTimerPreset('wrap', 60)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    timerMode === 'wrap' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1m Wrap
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                  timerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                }`}
                title={timerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(timerMode === 'pitch' ? 180 : timerMode === 'qa' ? 120 : 60);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Deliverables Quick Access */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <span className="text-slate-400 font-semibold">Deliverables:</span>
            <div className="flex flex-wrap items-center gap-3">
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
                  className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Github className="w-3.5 h-3.5" /> Repository
                </a>
              )}
              {activeProject.demoVideoLink && (
                <a
                  href={activeProject.demoVideoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Video className="w-3.5 h-3.5" /> Demo Video
                </a>
              )}
            </div>
          </div>

          {/* Quick Calibration Baseline Presets */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Quick Calibration Presets:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyPreset(9)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
              >
                ★ Top Contender (36/40)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              >
                Solid MVP (28/40)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(5)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Early Prototype (20/40)
              </button>
            </div>
          </div>

          {/* Rubric Criteria Sliders + Dynamic Benchmarks */}
          <div className="space-y-3.5 sm:space-y-4">
            {RUBRIC_CRITERIA.map((item) => {
              const val = Number(scoringForm[item.field] || 5);
              const benchmark = getBenchmarkLabel(val);

              return (
                <div
                  key={item.field}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <span className={`text-[11px] ${benchmark.color} hidden sm:inline`}>
                          • {benchmark.text}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => stepScore(item.field, -1)}
                        disabled={val <= 1}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition"
                        aria-label={`Decrease ${item.title}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-sm sm:text-base font-extrabold ${item.colorClass} font-mono min-w-[54px] text-center`}>
                        {val} / 10
                      </span>
                      <button
                        type="button"
                        onClick={() => stepScore(item.field, 1)}
                        disabled={val >= 10}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition"
                        aria-label={`Increase ${item.title}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={val}
                    onChange={(e) => onScoreChange(item.field, e.target.value)}
                    className={`w-full h-2.5 ${item.accentClass} cursor-pointer`}
                  />
                  <div className="flex sm:hidden justify-end">
                    <span className={`text-[10px] ${benchmark.color}`}>{benchmark.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Score Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950/60 to-slate-950/60 border border-amber-500/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Calculated Total Score
              </span>
              <span className="text-xs text-slate-400">
                Grade: {((currentTotal / 40) * 100).toFixed(0)}% Overall Evaluation
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{currentTotal}</span>
              <span className="text-sm text-slate-500 font-bold"> / 40</span>
            </div>
          </div>

          {/* Special Category Award Nominations */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Special Award Nominations (Optional):
            </span>
            <div className="flex flex-wrap gap-2">
              {NOMINATION_OPTIONS.map((nom) => {
                const isSelected = Array.isArray(scoringForm.nominations) && scoringForm.nominations.includes(nom.id);
                return (
                  <button
                    key={nom.id}
                    type="button"
                    onClick={() => toggleNomination(nom.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                      isSelected
                        ? nom.color
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{nom.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommendation Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Judge Recommendation
            </label>
            <select
              value={scoringForm.recommendation}
              onChange={(e) => onFormChange({ ...scoringForm, recommendation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
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
              Qualitative Feedback &amp; Notes (Autosaved)
            </label>
            <textarea
              rows="3"
              value={scoringForm.feedback}
              onChange={(e) => onFormChange({ ...scoringForm, feedback: e.target.value })}
              placeholder="Share constructive feedback on technical strengths, UX design, model accuracy, or areas to improve..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Action Buttons with Save & Score Next Unreviewed */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 flex-col sm:flex-row">
              {onScoreNext && remainingPendingCount > 1 && (
                <button
                  type="button"
                  onClick={onScoreNext}
                  disabled={submittingScore}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Save this score and advance to the next unreviewed project in queue"
                >
                  <span>Save &amp; Score Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                disabled={submittingScore}
                className="w-full sm:w-auto min-h-[44px] justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                {submittingScore ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting Score...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Submit Evaluation
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ScoreRubricModal;
