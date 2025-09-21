import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { AnimatePresence, motion } from 'framer-motion';

const toTitleCase = (str: string) => str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const getPageTitle = (pathname: string): { title: string, breadcrumb: string } => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { title: "Dashboard", breadcrumb: "Dashboard / Overview" };
  }
  
  const mainPath = toTitleCase(segments[0]);
  
  if (segments.length === 1) {
    return { title: mainPath, breadcrumb: `${mainPath} / Overview` };
  }

  const subPath = toTitleCase(segments[1]);
  return { title: subPath, breadcrumb: `${mainPath} / ${subPath}` };
};

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { title, breadcrumb } = getPageTitle(location.pathname);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-white dark:bg-primary-900 text-gray-800 dark:text-gray-200 font-sans">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setMobileOpen={setIsMobileSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden bg-off-white dark:bg-primary-950">
        <Header title={title} breadcrumb={breadcrumb} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 sm:px-6 py-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;