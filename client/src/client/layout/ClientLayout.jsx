import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionLoader from '../../shared/components/SectionLoader';

const HIDE_FOOTER_ROUTES = [
  '/dashboard',
  '/register-hackathon',
  '/verify-pass',
];

const ClientLayout = () => {
  const location = useLocation();
  const shouldHideFooter = HIDE_FOOTER_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <Navbar />
      <main className="flex-grow pt-16">
        <Suspense fallback={<SectionLoader label="Loading page..." accentClass="border-t-sky-400" />}>
          <Outlet />
        </Suspense>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default ClientLayout;

