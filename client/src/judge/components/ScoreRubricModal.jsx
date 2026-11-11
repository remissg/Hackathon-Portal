import React from 'react';
import { CheckCircle2, FileText, Github, RefreshCw, Video, X } from 'lucide-react';

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

  return (
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
                onClick={() => onClose()}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-6">
              
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
                    onChange={(e) => onScoreChange('innovation', e.target.value)}
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
                    onChange={(e) => onScoreChange('technicalExecution', e.target.value)}
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
                    onChange={(e) => onScoreChange('healthcareImpact', e.target.value)}
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
                    onChange={(e) => onScoreChange('presentation', e.target.value)}
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
                  onChange={(e) => onFormChange({ ...scoringForm, recommendation: e.target.value })}
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
                  onChange={(e) => onFormChange({ ...scoringForm, feedback: e.target.value })}
                  placeholder="Share feedback on technical strengths, UX design, model accuracy, or areas to improve..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
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
  );
};

export default ScoreRubricModal;
