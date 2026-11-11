import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
