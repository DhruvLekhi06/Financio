import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { Logo, GridIcon, SalesIcon, PurchasesIcon, ReportsIcon, BrainCircuitIcon, BankingIcon, ChevronDownIcon, SettingsIcon, SunIcon, MoonIcon, TaxIcon, XIcon } from '../Icons';

interface ColoredIconProps {
  children: ReactNode;
  color: string;
}
const ColoredIcon: React.FC<ColoredIconProps> = ({ children, color }) => (
  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
    {children}
  </div>
);

const navItems = [
  { key: 'dashboard', path: '/', name: 'Dashboard', icon: GridIcon, color: 'bg-secondary-200' },
  { 
    key: 'sales', 
    name: 'Sales', 
    icon: SalesIcon,
    color: 'bg-icon-teal', 
    subItems: [
      { name: 'Customers', path: '/sales/customers' }, 
      { name: 'Sales Orders', path: '/sales/orders' },
      { name: 'Invoices', path: '/sales/invoices' },
      { name: 'Recurring Invoices', path: '/sales/recurring-invoices' }, 
      { name: 'Payments Receivable', path: '/sales/payments' },
    ]
  },
  {
    key: 'purchases',
    name: 'Purchases',
    icon: PurchasesIcon,
    color: 'bg-icon-blue',
    subItems: [
        { name: 'Vendors', path: '/purchases/vendors' },
        { name: 'Expenses', path: '/purchases/expenses' }, 
        { name: 'Recurring Expenses', path: '/purchases/recurring-expenses' },
        { name: 'Purchase Orders', path: '/purchases/orders' },
        { name: 'Bills', path: '/purchases/bills' },
        { name: 'Recurring Bills', path: '/purchases/recurring-bills' },
        { name: 'Payments Made', path: '/purchases/payments' },
    ]
  },
  { key: 'reports', path: '/reports', name: 'Reports', icon: ReportsIcon, color: 'bg-icon-pink' },
  { key: 'banking', path: '/banking', name: 'Banking', icon: BankingIcon, color: 'bg-icon-indigo' },
  { key: 'ai_assistant', path: '/chat', name: 'AI Assistant', icon: BrainCircuitIcon, color: 'bg-icon-purple' },
  { key: 'tax', path: '/tax-estimation', name: 'Tax Estimation', icon: TaxIcon, color: 'bg-icon-orange' }, 
];

const textAnimation = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2, delay: 0.1 }
};

interface SidebarProps {
    isMobileOpen: boolean;
    setMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setMobileOpen }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const leaveTimeout = useRef<number | null>(null);
    
    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobileOpen) {
            setMobileOpen(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        const isExpanded = !isCollapsed || isMobileOpen;
        if (isExpanded) {
            const activeParent = navItems.find(item => 
                item.subItems?.some(sub => location.pathname.startsWith(sub.path))
            );
            if (activeParent) {
                setOpenMenu(activeParent.key);
            }
        }
    }, [location.pathname, isCollapsed, isMobileOpen]);

    const handleMenuToggle = (key: string) => {
        setOpenMenu(openMenu === key ? null : key);
    };

    const handleMouseEnter = () => {
        if (window.innerWidth < 768) return;
        if (leaveTimeout.current) {
            clearTimeout(leaveTimeout.current);
            leaveTimeout.current = null;
        }
        setIsCollapsed(false);
    };

    const handleMouseLeave = () => {
        if (window.innerWidth < 768) return;
        leaveTimeout.current = window.setTimeout(() => {
            setIsCollapsed(true);
            setOpenMenu(null);
        }, 300);
    };
    
    const isExpanded = !isCollapsed || isMobileOpen;

  return (
    <>
        <AnimatePresence>
            {isMobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </AnimatePresence>
        <motion.aside
            className="flex-shrink-0 bg-white dark:bg-primary-900 flex flex-col h-full z-40 fixed md:relative"
            initial={false}
            animate={window.innerWidth < 768 ? { x: isMobileOpen ? 0 : '-100%' } : { width: isCollapsed ? '5rem' : '16rem' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
        <div className="overflow-hidden h-full flex flex-col">
            <div className="h-20 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center overflow-hidden">
                    <Logo className="h-8 w-8 text-primary-800 dark:text-white shrink-0" />
                    <AnimatePresence>
                    {isExpanded && (
                        <motion.span 
                            {...textAnimation}
                            className="ml-3 text-2xl font-plex font-bold text-gray-800 dark:text-white whitespace-nowrap"
                        >
                            FinancioAI
                        </motion.span>
                    )}
                    </AnimatePresence>
                </div>
                <button className="md:hidden p-1" onClick={() => setMobileOpen(false)}>
                    <XIcon className="w-6 h-6 text-gray-500" />
                </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const isParentActive = !!item.subItems?.some(sub => location.pathname.startsWith(sub.path));

                    return (
                    <div key={item.key}>
                        {item.subItems ? (
                        <>
                            <button
                            onClick={() => handleMenuToggle(item.key)}
                            className={`w-full flex items-center py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                !isExpanded ? 'justify-center' : 'justify-between px-4'
                            } ${
                                isParentActive
                                ? 'bg-gray-100 dark:bg-primary-800 text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-800/60'
                            }`}
                            >
                            <div className="flex items-center overflow-hidden">
                                <ColoredIcon color={item.color}><item.icon className="w-5 h-5 text-gray-800 dark:text-white"/></ColoredIcon>
                                <AnimatePresence>
                                {isExpanded && (
                                    <motion.span {...textAnimation} className="ml-3 whitespace-nowrap">{item.name}</motion.span>
                                )}
                                </AnimatePresence>
                            </div>
                            <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                        {...textAnimation}
                                        animate={{ ...textAnimation.animate, rotate: openMenu === item.key ? 180 : 0 }}
                                    >
                                    <ChevronDownIcon className="w-4 h-4" />
                                </motion.span>
                            )}
                            </AnimatePresence>
                            </button>
                            <AnimatePresence>
                            {isExpanded && openMenu === item.key && (
                                <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="pl-10 ml-2.5 border-l border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                <div className="py-2 space-y-1">
                                    {item.subItems.map(subItem => (
                                    <NavLink
                                        key={subItem.path}
                                        to={subItem.path}
                                        className={({ isActive }) =>
                                        `block px-4 py-1.5 text-sm rounded-md transition-colors duration-200 whitespace-nowrap ${
                                            isActive
                                            ? 'font-semibold text-primary-700 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                                        }`
                                        }
                                    >
                                        {subItem.name}
                                    </NavLink>
                                    ))}
                                </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </>
                        ) : (
                        <NavLink
                            to={item.path!}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                            `flex items-center py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                !isExpanded ? 'justify-center' : 'px-4'
                            } ${
                                isActive
                                ? 'bg-gray-100 dark:bg-primary-800 text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-800/60'
                            }`
                            }
                        >
                            <div className="flex items-center overflow-hidden">
                                <ColoredIcon color={item.color}><item.icon className="w-5 h-5 text-gray-800 dark:text-white"/></ColoredIcon>
                                <AnimatePresence>
                                {isExpanded && (
                                <motion.span {...textAnimation} className="ml-3 whitespace-nowrap">{item.name}</motion.span>
                                )}
                                </AnimatePresence>
                            </div>
                        </NavLink>
                        )}
                    </div>
                    )
                })}
            </nav>
            <div className={`mt-auto shrink-0 px-4 py-4 flex items-center transition-all duration-200 ${!isExpanded ? 'flex-col-reverse gap-y-2 justify-center' : 'flex-row gap-x-2'}`}>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center p-2.5 rounded-lg transition-colors duration-200 w-full ${
                            !isExpanded ? 'justify-center' : ''
                        } ${
                        isActive
                            ? 'bg-gray-100 dark:bg-primary-800 text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-800/60'
                        }`
                    }
                >
                    <SettingsIcon className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                    {isExpanded && (
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                            exit={{ opacity: 0, x: -10 }}
                            className="whitespace-nowrap font-medium text-sm ml-3"
                        >
                            Settings
                        </motion.span>
                    )}
                    </AnimatePresence>
                </NavLink>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="flex items-center justify-center p-2.5 rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-800/60 shrink-0"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
                </motion.button>
            </div>
        </div>
        </motion.aside>
    </>
  );
};

export default Sidebar;