import React from 'react';
import { Award, Clock, FileSpreadsheet, Users } from 'lucide-react';

const KpiSummaryCards = ({ stats, registrations }) => {
  return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Registrations */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-sky-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Submissions</span>
                  <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats?.totalRegistrations ?? registrations.length}
                  </span>
                  <span className="text-xs text-sky-400 font-medium">projects</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {stats?.soloCount || 0} Solo Innovators • {stats?.teamCount || 0} Teams
                </p>
              </div>

              {/* Card 2: Total Participants */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Innovators</span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats?.totalParticipants ?? registrations.reduce((acc, r) => acc + (r.teamSize || 1), 0)}
                  </span>
                  <span className="text-xs text-indigo-400 font-medium">candidates</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">Across dynamic 1–5 member teams</p>
              </div>

              {/* Card 3: Shortlisted / Finalists */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Shortlisted / Finalists</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {(stats?.statusCounts?.Shortlisted || 0) + (stats?.statusCounts?.Finalist || 0)}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">advanced</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {stats?.statusCounts?.Shortlisted || 0} Shortlisted • {stats?.statusCounts?.Finalist || 0} Finalists
                </p>
              </div>

              {/* Card 4: Under Review */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Under Review</span>
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats?.statusCounts?.['Under Review'] || 0}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">in evaluation</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {stats?.statusCounts?.Submitted || 0} pending initial review
                </p>
              </div>
            </div>
  );
};

export default KpiSummaryCards;
