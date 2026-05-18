import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useAuthStore } from '../store/authStore';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Check if this is a deep link for assigned complaint or resolution
  const urlParams = new URLSearchParams(location.search);
  const idParam = urlParams.get('id');
  const isPublicLink = idParam && (
    location.pathname.includes('assigned-complain') ||
    location.pathname.includes('complain-resolution')
  );

  // If not logged in and it's NOT a valid public deep-link, redirect to login
  if (!isAuthenticated && !isPublicLink) {
    return <Navigate to="/login" replace />;
  }

  // If not logged in but it IS a public deep-link, render clean full-screen wrapper
  if (!isAuthenticated && isPublicLink) {
    return (
      <div className="public-page-wrapper bg-[#fdf5e6] flex flex-col items-center justify-center min-h-screen px-3 py-4 sm:p-6 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-5 pointer-events-none" />
        <main className="w-full max-w-lg relative z-10 animate-reveal my-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-hidden h-full">
          <div className="max-w-full w-full h-full animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;