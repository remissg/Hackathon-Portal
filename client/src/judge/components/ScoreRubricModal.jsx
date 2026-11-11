import React from 'react';
import { CheckCircle2, FileText, Github, Minus, Plus, RefreshCw, Video, X } from 'lucide-react';

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

const ScoreRubricModal = ({
  activeProject,
  scoringForm,
  onFormChange,
  onScoreChange,
  currentTotal,
  submittingScore,
  onClose,
  onSubmit,
}) => {
  if (!activeProject) return null;

  const stepScore = (field, delta) => {
    const curr = Number(scoringForm[field] || 5);
    const next = Math.min(10, Math.max(1, curr + delta));
    onScoreChange(field, next);
  };

  return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full sm:max-w-2xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3 shrink-0">
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
              
              {/* Deliverables Quick Access */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-slate-400 font-semibold">Project Deliverables:</span>
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

              {/* Rubric Criteria Sliders + Mobile Stepper Controls */}
              <div className="space-y-3.5 sm:space-y-4">
                {RUBRIC_CRITERIA.map((item) => {
                  const val = Number(scoringForm[item.field] || 5);
                  return (
                    <div
                      key={item.field}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
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
                    Grade: {((currentTotal / 40) * 100).toFixed(0)}% Overall Score
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{currentTotal}</span>
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
                  Qualitative Feedback &amp; Notes
                </label>
                <textarea
                  rows="3"
                  value={scoringForm.feedback}
                  onChange={(e) => onFormChange({ ...scoringForm, feedback: e.target.value })}
                  placeholder="Share feedback on technical strengths, UX design, model accuracy, or areas to improve..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Submit Official Evaluation
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
  );
};

export default ScoreRubricModal;
