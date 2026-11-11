import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../shared/services/api';
import ProblemFormModal from '../components/ProblemFormModal';
import { Edit3, Plus, RefreshCw, Target, Trash2 } from 'lucide-react';

const AdminProblemsPage = () => {
  const { adminEvents, adminProblems, loadingProblems, fetchAdminProblems, showToast } =
    useOutletContext();

  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [problemForm, setProblemForm] = useState({
    eventId: '',
    psId: '',
    title: '',
    category: 'AI/ML',
    difficulty: 'Intermediate',
    description: '',
    expectedOutcomes: '',
    starterKitUrl: '',
  });
  const [savingProblem, setSavingProblem] = useState(false);

  const handleOpenCreateProblemModal = () => {
    setEditingProblem(null);
    setProblemForm({
      eventId: adminEvents[0]?._id || '',
      psId: `MCAI-PS-${(adminProblems.length + 1).toString().padStart(2, '0')}`,
      title: '',
      category: 'AI/ML',
      difficulty: 'Intermediate',
      description: '',
      expectedOutcomes: '',
      starterKitUrl: '',
    });
    setProblemModalOpen(true);
  };

  const handleOpenEditProblemModal = (prob) => {
    setEditingProblem(prob);
    setProblemForm({
      eventId: prob.hackathonId || adminEvents[0]?._id || '',
      psId: prob.psId || '',
      title: prob.title || '',
      category: prob.category || 'AI/ML',
      difficulty: prob.difficulty || 'Intermediate',
      description: prob.description || '',
      expectedOutcomes: Array.isArray(prob.expectedOutcomes)
        ? prob.expectedOutcomes.join('\n')
        : prob.expectedOutcomes || '',
      starterKitUrl: prob.starterKitUrl || '',
    });
    setProblemModalOpen(true);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!problemForm.title || !problemForm.description) {
      alert('Please fill problem title and description');
      return;
    }

    setSavingProblem(true);
    try {
      const targetEventId = problemForm.eventId || adminEvents[0]?._id;
      if (!targetEventId) {
        alert('No active hackathon event found to attach problem statement.');
        return;
      }

      const payload = {
        psId: problemForm.psId,
        title: problemForm.title,
        category: problemForm.category,
        difficulty: problemForm.difficulty,
        description: problemForm.description,
        expectedOutcomes: problemForm.expectedOutcomes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        starterKitUrl: problemForm.starterKitUrl,
      };

      if (editingProblem) {
        await api.put(`/events/${targetEventId}/problems/${editingProblem._id}`, payload);
        showToast('Problem statement updated successfully!');
      } else {
        await api.post(`/events/${targetEventId}/problems`, payload);
        showToast('New problem statement published successfully!');
      }

      setProblemModalOpen(false);
      fetchAdminProblems();
    } catch (err) {
      console.error('[Save Problem Error]:', err);
      alert(err.response?.data?.message || 'Failed to save problem statement.');
    } finally {
      setSavingProblem(false);
    }
  };

  const handleDeleteProblem = async (eventId, problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem statement?')) return;
    try {
      await api.delete(`/events/${eventId}/problems/${problemId}`);
      showToast('Problem statement removed successfully');
      fetchAdminProblems();
    } catch (err) {
      console.error('[Delete Problem Error]:', err);
      alert(err.response?.data?.message || 'Failed to delete problem statement');
    }
  };

  return (
    <div className="space-y-6">
        {/* Workspace Action Header */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>National Innovation Challenges &amp; Problem Statements</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Publish and manage real-world challenges (SIH / National Model) for candidate teams to solve.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminProblems}
              disabled={loadingProblems}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Refresh Challenges"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProblems ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreateProblemModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Problem Statement</span>
            </button>
          </div>
        </div>

        {/* Problems List Grid */}
        {loadingProblems ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Loading published problem statements...</p>
          </div>
        ) : adminProblems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <Target className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Problem Statements Published Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Post New Problem Statement&quot; to publish your first challenge for candidate innovators.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {adminProblems.map((prob) => {
              const diffColor =
                prob.difficulty === 'Beginner'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : prob.difficulty === 'Advanced'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60';

              return (
                <div
                  key={prob._id || prob.psId}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                          {prob.psId}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                          {prob.category}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${diffColor}`}>
                        {prob.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">{prob.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {prob.description}
                    </p>

                    {prob.expectedOutcomes && prob.expectedOutcomes.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                          Key Expected Deliverables:
                        </span>
                        <ul className="space-y-1">
                          {prob.expectedOutcomes.slice(0, 2).map((o, idx) => (
                            <li key={idx} className="text-xs text-slate-300 truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                              <span className="truncate">{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">
                      Hackathon: {prob.hackathonTitle || 'HackSphere 2026'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProblemModal(prob)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProblem(prob.hackathonId, prob._id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/40 transition"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <ProblemFormModal
        isOpen={problemModalOpen}
        onClose={() => setProblemModalOpen(false)}
        editingProblem={editingProblem}
        problemForm={problemForm}
        setProblemForm={setProblemForm}
        savingProblem={savingProblem}
        onSave={handleSaveProblem}
      />
    </div>
  );
};

export default AdminProblemsPage;
