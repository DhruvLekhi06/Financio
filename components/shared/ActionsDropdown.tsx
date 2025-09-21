import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotsHorizontalIcon, EditIcon, TrashIcon, DownloadIcon } from '../Icons';

interface ActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  onDownload?: () => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ onEdit, onDelete, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        <DotsHorizontalIcon className="w-5 h-5 text-gray-500" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
          >
            <ul className="py-1">
              <li>
                <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <EditIcon className="w-4 h-4" /> Edit
                </button>
              </li>
              {onDownload && (
                <li>
                  <button onClick={() => { onDownload(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <DownloadIcon className="w-4 h-4" /> Download
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <TrashIcon className="w-4 h-4" /> Delete
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionsDropdown;