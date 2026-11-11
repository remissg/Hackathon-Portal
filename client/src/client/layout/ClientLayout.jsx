import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionLoader from '../../shared/components/SectionLoader';

const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <Navbar />
      <main className="flex-grow pt-16">
        <Suspense fallback={<SectionLoader label="Loading page..." accentClass="border-t-sky-400" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;

