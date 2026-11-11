import React from 'react';
import { Award, ExternalLink, FileText, Github, Trash2, Video, X } from 'lucide-react';

const SubmissionDetailModal = ({
  activeModalEntry,
  onClose,
  STATUS_OPTIONS,
  getStatusBadge,
  onStatusChange,
  onDelete,
}) => {
  if (!activeModalEntry) return null;

  return (
        
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                    MCAI-2026-{activeModalEntry._id ? activeModalEntry._id.slice(-4).toUpperCase() : '0000'}
                  </span>
                  <h3 className="text-base font-bold text-white truncate max-w-sm">
                    {activeModalEntry.projectName}
                  </h3>
                </div>
                <button
                  onClick={() => onClose()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Domain & Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Innovation Track</span>
                    <span className="text-sm font-semibold text-sky-400">{activeModalEntry.domain}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Venue Admission</span>
                    {activeModalEntry.isCheckedIn ? (
                      <span className="text-xs font-semibold text-emerald-400">
                        ✓ Admitted {activeModalEntry.checkedInAt ? `(${new Date(activeModalEntry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Pending Gate Check-In</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Current Status:</span>
                    <select
                      value={activeModalEntry.status || 'Submitted'}
                      onChange={(e) => onStatusChange(activeModalEntry._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusBadge(
                        activeModalEntry.status
                      )}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Team Lead Profile */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Team Leader / Primary Contact
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Full Name</span>
                        <span className="text-sm font-medium text-white">{activeModalEntry.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Email Address</span>
                        <span className="text-sm font-medium text-white">{activeModalEntry.email}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Mobile Number</span>
                        <span className="text-sm font-mono text-white">{activeModalEntry.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Academic Year</span>
                        <span className="text-sm text-white">{activeModalEntry.yearOfStudy}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-500 block">Institution</span>
                      <span className="text-sm text-slate-300">{activeModalEntry.collegeName}</span>
                      <span className="text-xs text-slate-500 block">
                        {activeModalEntry.course} in {activeModalEntry.branch}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Team Members */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Dynamic Team Roster ({activeModalEntry.teamSize} Total)</span>
                    <span className="text-[11px] text-slate-500">
                      {activeModalEntry.teamSize === 1 ? 'Solo Entry' : `${activeModalEntry.teamSize - 1} Additional Members`}
                    </span>
                  </h4>
                  {Array.isArray(activeModalEntry.teamMembers) && activeModalEntry.teamMembers.length > 0 ? (
                    <div className="space-y-2">
                      {activeModalEntry.teamMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">
                              {idx + 2}
                            </span>
                            <div>
                              <span className="font-medium text-white block">{m.name}</span>
                              <span className="text-xs text-slate-400">{m.email}</span>
                            </div>
                          </div>
                          <span className="text-xs text-indigo-400 font-medium">Team Member</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs text-slate-400">
                      Solo Innovator — No additional team members registered.
                    </div>
                  )}
                </div>

                {/* Project Links */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Project Submission Deliverables
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeModalEntry.pptLink && (
                      <a
                        href={activeModalEntry.pptLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-semibold">Slide Deck (PPT)</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                      </a>
                    )}
                    {activeModalEntry.prototypeLink && (
                      <a
                        href={activeModalEntry.prototypeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-semibold">Repository</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
                      </a>
                    )}
                    {activeModalEntry.demoVideoLink ? (
                      <a
                        href={activeModalEntry.demoVideoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-semibold">Demo Video</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center p-3 rounded-xl bg-slate-950/30 border border-slate-800/40 text-xs text-slate-600">
                        No video provided
                      </div>
                    )}
                  </div>
                </div>

                {/* Official Judge Evaluations & Rubrics */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Judge Evaluations & Rubrics</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {activeModalEntry.averageScore > 0
                        ? `Avg Score: ${activeModalEntry.averageScore} / 40`
                        : 'No reviews submitted yet'}
                    </span>
                  </h4>

                  {Array.isArray(activeModalEntry.evaluations) && activeModalEntry.evaluations.length > 0 ? (
                    <div className="space-y-3">
                      {activeModalEntry.evaluations.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white">
                                {ev.evaluatorName || 'Judge'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({ev.evaluatorEmail})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                {ev.recommendation || 'Consideration'}
                              </span>
                              <span className="text-sm font-extrabold text-amber-400 font-mono">
                                {ev.totalScore} / 40
                              </span>
                            </div>
                          </div>

                          {/* 4 Pillars Breakdown */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                            <div>
                              <span className="text-slate-500 block">Innovation</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.innovation}/10</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Tech Execution</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.technicalExecution}/10</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Clinical Impact</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.healthcareImpact}/10</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Presentation</span>
                              <span className="text-slate-200 font-bold font-mono">{ev.presentation}/10</span>
                            </div>
                          </div>

                          {ev.feedback && (
                            <p className="text-xs text-slate-300 italic bg-slate-900/40 p-2 rounded border border-slate-800/50">
                              "{ev.feedback}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs text-slate-500">
                      This submission has not been evaluated by any judges yet.
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <button
                  onClick={() => onDelete(activeModalEntry._id, activeModalEntry.projectName)}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Registration</span>
                </button>
                <button
                  onClick={() => onClose()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
  );
};

export default SubmissionDetailModal;
