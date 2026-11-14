import React, { useState, useEffect } from 'react';
import api from '../../shared/services/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_TIMELINE_PRESETS = [
  {
    phase: 'Phase 01',
    title: 'Registration & Initial Project Submission',
    date: 'November 06 – November 25, 2026',
    desc: 'Sign up on the portal, verify via OTP, assemble your team (1-5 members), pick your track, and submit project outline, PPT slide deck, and repository links.',
    status: 'Active',
    completed: false,
  },
  {
    phase: 'Phase 02',
    title: 'Artifact Refinement & Technical Screening',
    date: 'November 26 – December 10, 2026',
    desc: 'Candidates polish repository commits, update live demo endpoints, and undergo preliminary code hygiene, security, and architecture screening.',
    status: 'Upcoming',
    completed: false,
  },
  {
    phase: 'Phase 03',
    title: 'Shortlisting & Mentorship Pitch Dry-Runs',
    date: 'December 11 – December 20, 2026',
    desc: 'Top shortlisted teams receive 1-on-1 industry mentor feedback, refine pitch decks, and participate in mock Q&A rehearsals.',
    status: 'Upcoming',
    completed: false,
  },
  {
    phase: 'Phase 04',
    title: 'Grand Finale, Live Jury Pitch & Awards',
    date: 'December 28, 2026',
    desc: '6-minute live pitch (3m pitch + 2m Q&A + 1m scoring) in the Judge Arena; announcement of winners, internship offers, and certificate releases.',
    status: 'Upcoming',
    completed: false,
  },
];

const AdminTimelineModal = ({ isOpen, onClose, event, onUpdated, showToast }) => {
  const [phases, setPhases] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event?.timeline && Array.isArray(event.timeline) && event.timeline.length > 0) {
      setPhases(JSON.parse(JSON.stringify(event.timeline)));
    } else {
      setPhases(JSON.parse(JSON.stringify(DEFAULT_TIMELINE_PRESETS)));
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleFieldChange = (idx, field, value) => {
    setPhases((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSetActive = (targetIdx) => {
    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx === targetIdx) {
          return { ...p, status: 'Active', completed: false };
        } else if (idx < targetIdx) {
          return { ...p, status: 'Completed', completed: true };
        } else {
          return { ...p, status: 'Upcoming', completed: false };
        }
      })
    );
  };

  const handleAddPhase = () => {
    const nextNum = phases.length + 1;
    const padded = nextNum.toString().padStart(2, '0');
    setPhases((prev) => [
      ...prev,
      {
        phase: `Phase ${padded}`,
        title: 'New Milestone Phase',
        date: 'Date Range TBD',
        desc: 'Phase milestones, guidelines, and candidate actions.',
        status: 'Upcoming',
        completed: false,
      },
    ]);
  };

  const handleRemovePhase = (idx) => {
    if (phases.length <= 1) {
      alert('You must have at least one timeline phase.');
      return;
    }
    setPhases((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all phases to the standard 4-Phase HackSphere schedule?')) {
      setPhases(JSON.parse(JSON.stringify(DEFAULT_TIMELINE_PRESETS)));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    for (let i = 0; i < phases.length; i++) {
      if (!phases[i].title.trim() || !phases[i].date.trim() || !phases[i].desc.trim()) {
        setError(`Please fill in all details for ${phases[i].phase}`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.put(`/events/${event._id}/timeline`, { timeline: phases });
      if (res.data.success) {
        showToast('Hackathon timeline and phase milestones updated successfully!');
        if (onUpdated) onUpdated(res.data.timeline);
        onClose();
      }
    } catch (err) {
      console.error('[Timeline Save Error]:', err);
      setError(err.response?.data?.message || 'Failed to save timeline changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Hackathon Timeline &amp; Milestone Manager
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure competition phases, dates, and active milestone for{' '}
                <strong className="text-slate-200">{event.title}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Guidance Alert */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Real-Time Landing Page Synchronization:</p>
              <p className="text-slate-400 leading-relaxed">
                Changes saved here will automatically reflect on the public landing page timeline and candidate dashboard. Marking a phase as <strong>Active</strong> sets the current milestone indicator.
              </p>
            </div>
          </div>

          {/* Phases List */}
          <div className="space-y-4">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  phase.status === 'Active'
                    ? 'bg-slate-900 border-sky-500/50 shadow-lg shadow-sky-950/30'
                    : phase.status === 'Completed'
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={phase.phase}
                      onChange={(e) => handleFieldChange(idx, 'phase', e.target.value)}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-sky-400 w-28 focus:outline-none focus:border-sky-500"
                    />
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        phase.status === 'Active'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1'
                          : phase.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {phase.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
                      {phase.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {phase.status !== 'Active' && (
                      <button
                        type="button"
                        onClick={() => handleSetActive(idx)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold transition"
                      >
                        Set as Active
                      </button>
                    )}
                    <select
                      value={phase.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        handleFieldChange(idx, 'status', newStatus);
                        handleFieldChange(idx, 'completed', newStatus === 'Completed');
                      }}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemovePhase(idx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Remove Phase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phase Title
                    </label>
                    <input
                      type="text"
                      value={phase.title}
                      onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Registration & Project Submission"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Date Range String
                    </label>
                    <input
                      type="text"
                      value={phase.date}
                      onChange={(e) => handleFieldChange(idx, 'date', e.target.value)}
                      placeholder="e.g. November 06 – November 25, 2026"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Description &amp; Milestones
                  </label>
                  <textarea
                    rows={2}
                    value={phase.desc}
                    onChange={(e) => handleFieldChange(idx, 'desc', e.target.value)}
                    placeholder="Candidate actions, guidelines, and expected milestone outcomes..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddPhase}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Add Another Phase</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Standard 4 Phases</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Timeline...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Timeline Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTimelineModal;
