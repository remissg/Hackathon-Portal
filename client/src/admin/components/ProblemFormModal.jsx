import React from 'react';
import { Target, X } from 'lucide-react';

const ProblemFormModal = ({
  isOpen,
  onClose,
  editingProblem,
  problemForm,
  setProblemForm,
  savingProblem,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
        
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => onClose()}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>{editingProblem ? 'Edit Problem Statement' : 'Post New Problem Statement'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Set challenge ID, domain, difficulty, and expected outcomes for students.
              </p>

              <form onSubmit={onSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Problem ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MCAI-PS-05"
                      value={problemForm.psId}
                      onChange={(e) => setProblemForm({ ...problemForm, psId: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={problemForm.difficulty}
                      onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Domain / Track
                  </label>
                  <select
                    value={problemForm.category}
                    onChange={(e) => setProblemForm({ ...problemForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="AI/ML">AI &amp; Machine Learning</option>
                    <option value="Healthcare Tech">Healthcare &amp; MedTech</option>
                    <option value="IoT &amp; Robotics">IoT &amp; Robotics</option>
                    <option value="Web Dev">Full Stack Web Development</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Blockchain &amp; Web3">Blockchain &amp; Web3</option>
                    <option value="Cloud &amp; DevOps">Cloud &amp; DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Challenge Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Concise, actionable challenge title..."
                    value={problemForm.title}
                    onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Detailed Challenge Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the context, user pain points, and core problem to solve..."
                    value={problemForm.description}
                    onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Expected Outcomes / Deliverables (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Trained ML model with AUC > 0.88&#10;Interactive clinician risk dashboard&#10;REST API inference endpoint"
                    value={problemForm.expectedOutcomes}
                    onChange={(e) => setProblemForm({ ...problemForm, expectedOutcomes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Starter Kit / Dataset Repository URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={problemForm.starterKitUrl}
                    onChange={(e) => setProblemForm({ ...problemForm, starterKitUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProblem}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50"
                  >
                    {savingProblem ? 'Saving...' : editingProblem ? 'Update Challenge' : 'Publish Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
  );
};

export default ProblemFormModal;
