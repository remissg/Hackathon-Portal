import React from 'react';
import AccountSecurityModal from '../../shared/components/AccountSecurityModal';
import { ShieldCheck } from 'lucide-react';

const JudgeSecurityPage = () => {
  return (
    <div className="space-y-6 py-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Judge Role Security &amp; Access
            </h1>
            <p className="text-xs text-slate-400">
              Update your starting credential password or step down from evaluator duties.
            </p>
          </div>
        </div>
      </div>

      <AccountSecurityModal inline isOpen onClose={() => {}} />
    </div>
  );
};

export default JudgeSecurityPage;
