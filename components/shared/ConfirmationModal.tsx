import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children, 
    confirmText,
    confirmButtonText = 'Confirm',
    confirmButtonVariant = 'primary'
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);
  
  const isConfirmed = !confirmText || inputValue === confirmText;

  const dangerButtonClasses = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg shadow-red-500/10 dark:shadow-black/30';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
              {confirmText && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Please type <strong className="text-gray-900 dark:text-white">{confirmText}</strong> to confirm.
                    </label>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="mt-1 block w-full input-style"
                    />
                </div>
              )}
            </div>
             <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={onConfirm} 
                    disabled={!isConfirmed}
                    className={confirmButtonVariant === 'danger' ? dangerButtonClasses : ''}
                >
                    {confirmButtonText}
                </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
