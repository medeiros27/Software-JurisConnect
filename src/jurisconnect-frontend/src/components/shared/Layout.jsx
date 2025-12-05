import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar - Hidden on Mobile */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <Header />
        {/* Main Content - Added padding bottom for mobile nav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 w-full">
          <Outlet />
        </main>

        {/* Bottom Nav - Visible only on Mobile */}
        <BottomNav />
      </div>
    </div>
  );
}
