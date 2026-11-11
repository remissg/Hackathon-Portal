import React from 'react';
import AccountSecurityModal from '../../shared/components/AccountSecurityModal';
import { ShieldAlert } from 'lucide-react';

const AdminSecurityPage = () => {
  return (
    <div className="space-y-6 py-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Administrator Security &amp; Access Controls
            </h2>
            <p className="text-xs text-slate-400">
              Manage your active credentials or review Co-Admin role status.
            </p>
          </div>
        </div>
      </div>

      <AccountSecurityModal inline isOpen onClose={() => {}} />
    </div>
  );
};

export default AdminSecurityPage;
