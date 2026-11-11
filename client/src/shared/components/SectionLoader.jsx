import React from 'react';

/**
 * SectionLoader
 * Lightweight inline suspense fallback kept inside portal <Outlet /> containers
 * so persistent navigation chrome (sidebars, headers, navbars) stays steady
 * while a lazy-loaded child route chunk resolves.
 */
const SectionLoader = ({
  label = 'Loading section...',
  accentClass = 'border-t-sky-400',
}) => (
  <div className="min-h-[340px] w-full flex flex-col items-center justify-center p-8">
    <div
      className={`w-8 h-8 rounded-full border-2 border-slate-700/60 ${accentClass} animate-spin`}
    />
    <p className="mt-3 text-xs font-mono uppercase tracking-widest text-slate-400">
      {label}
    </p>
  </div>
);

export default SectionLoader;

