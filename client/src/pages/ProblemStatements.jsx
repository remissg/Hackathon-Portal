import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Target,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code2,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
  FolderGit2,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'AI/ML',
  'Healthcare Tech',
  'IoT & Robotics',
  'Web Dev',
  'Cyber Security',
  'Blockchain & Web3',
  'Cloud & DevOps',
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const ProblemStatements = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, [selectedCategory, selectedDifficulty]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/events/problems/all?${params.toString()}`);
      if (res.data.success) {
        setProblems(res.data.problems || []);
      }
    } catch (err) {
      console.error('[Problems Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const handleSelectProblemForRegistration = (ps) => {
    navigate(
      `/register-hackathon?psId=${encodeURIComponent(ps.psId)}&track=${encodeURIComponent(
        ps.category
      )}&title=${encodeURIComponent(ps.title)}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold shadow-inner">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Smart India &amp; National Challenge Model • Official Problem Statements</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Challenge <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Problem Statements</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Browse published real-world problem statements across maternal telemetry, AI diagnosis, and rural digital health. Select a challenge, assemble your team, and build your prototype.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search problem title, PS ID, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </form>

            {/* Difficulty selector */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
                Difficulty:
              </span>
              <div className="flex items-center gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedDifficulty === d
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Domains:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Statements Grid */}
        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Loading curated problem statements...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
            <Target className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Problem Statements Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No problem statements match your active filters. Try resetting the domain filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problems.map((ps) => {
              const diffColor =
                ps.difficulty === 'Beginner'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : ps.difficulty === 'Advanced'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60';

              return (
                <div
                  key={ps._id || ps.psId}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div className="space-y-3.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800/60">
                          {ps.psId}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                          {ps.category}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${diffColor}`}>
                        {ps.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {ps.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {ps.description}
                    </p>

                    {/* Expected Outcomes (bullet preview) */}
                    {ps.expectedOutcomes && ps.expectedOutcomes.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Expected Key Outcomes:
                        </span>
                        <ul className="space-y-1">
                          {ps.expectedOutcomes.slice(0, 2).map((outcome, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="truncate">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions & Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProblem(ps)}
                      className="text-xs font-semibold text-slate-400 hover:text-sky-400 transition flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Read Full Brief
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectProblemForRegistration(ps)}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition group-hover:scale-[1.02]"
                    >
                      <span>Choose Challenge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Problem Statement Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800/60 text-xs">
                    {selectedProblem.psId}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-850 text-slate-300">
                    {selectedProblem.category}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Level: {selectedProblem.difficulty}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{selectedProblem.title}</h2>
                <p className="text-xs text-sky-400 mt-1">
                  Event: {selectedProblem.hackathonTitle || 'HackSphere National Hackathon 2026'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Detailed Challenge Description
                </span>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {selectedProblem.description}
                </p>
              </div>

              {selectedProblem.expectedOutcomes && selectedProblem.expectedOutcomes.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Expected Deliverables
                  </span>
                  <div className="space-y-2">
                    {selectedProblem.expectedOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProblem.starterKitUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Starter Kit &amp; Datasets
                  </span>
                  <a
                    href={selectedProblem.starterKitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-600 transition text-xs text-purple-300"
                  >
                    <span className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4" /> Reference Repo / Starter Dataset
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProblem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ps = selectedProblem;
                    setSelectedProblem(null);
                    handleSelectProblemForRegistration(ps);
                  }}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <span>Register With This Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemStatements;

