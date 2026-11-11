import React from 'react';
import AccountSecurityModal from '../../shared/components/AccountSecurityModal';
import { ShieldCheck } from 'lucide-react';

const VolunteerSecurityPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Volunteer Role Security &amp; Access
            </h1>
            <p className="text-xs text-slate-400">
              Update your starting credential password or step down from gate volunteer duties.
            </p>
          </div>
        </div>
      </div>

      <AccountSecurityModal inline isOpen onClose={() => {}} />
    </div>
  );
};

export default VolunteerSecurityPage;

