import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { LogoutIcon, BellIcon, DownloadIcon, SearchIcon, MenuIcon } from '../Icons';
import SearchDropdown from './SearchDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import ImportDataModal from './ImportDataModal';
import Button from '../shared/Button';


interface HeaderProps {
  title: string;
  breadcrumb: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumb, onMenuClick }) => {
  const { user, logout } = useAuth();
  const { invoices, budgets, paymentsReceived } = useData();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const hasNotifications = useMemo(() => {
    const today = new Date();
    const overdueInvoices = invoices.some(i => i.status === 'Overdue' || (new Date(i.date) < today && i.status === 'Sent'));
    const budgetWarning = budgets.some(b => b.budget > 0 && (b.spent / b.budget) > 0.9);
    // Simple check for any payments
    const newPayments = paymentsReceived.length > 0;

    return overdueInvoices || budgetWarning || newPayments;
  }, [invoices, budgets, paymentsReceived]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="h-20 flex-shrink-0 bg-transparent flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button className="md:hidden p-1 -ml-1 text-gray-500 dark:text-gray-400" onClick={onMenuClick}>
            <MenuIcon className="w-6 h-6" />
        </button>
        <div>
            <h1 className="text-xl md:text-2xl font-plex font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{breadcrumb}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden md:block" ref={searchRef}>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <input 
                type="text"
                placeholder="Search (e.g. 'invoice', 'acme')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-primary-800 border border-gray-200 dark:border-primary-700 rounded-lg text-sm focus:ring-2 focus:ring-secondary-500 focus:outline-none transition-all"
            />
            <AnimatePresence>
                {isSearchFocused && searchQuery && (
                    <SearchDropdown query={searchQuery} onClose={() => setIsSearchFocused(false)} />
                )}
            </AnimatePresence>
        </div>
        <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-700 text-gray-500 dark:text-gray-400 relative"
            >
              <BellIcon className="w-6 h-6" />
              {hasNotifications && <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500" />}
            </button>
             <AnimatePresence>
                {isNotificationsOpen && <NotificationsDropdown onClose={() => setIsNotificationsOpen(false)} />}
            </AnimatePresence>
        </div>

        <Button
          onClick={() => setIsImportModalOpen(true)}
          variant="secondary"
          className="px-2 sm:px-4"
        >
            <DownloadIcon className="w-4 h-4 sm:mr-2"/>
            <span className="hidden sm:inline">Import</span>
        </Button>
        
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <img
              src={`https://i.pravatar.cc/150?u=${user?.uid || 'admin'}`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
          </button>
          <AnimatePresence>
          {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-primary-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-primary-700 z-50"
              >
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.companyName || 'Company'}</p>
                </div>
                 <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-700"
                >
                  <LogoutIcon className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
    <ImportDataModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </>
  );
};

export default Header;