import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '../Icons';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder = "Select...", className = '', buttonClassName = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(option => option.value === value);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left bg-white dark:bg-primary-700 border border-gray-300 dark:border-primary-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 text-gray-900 dark:text-gray-200 ${buttonClassName}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">{selectedOption?.label || placeholder}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-primary-800 shadow-lg rounded-md border border-gray-200 dark:border-primary-700 max-h-60 overflow-auto focus:outline-none"
                        role="listbox"
                    >
                        {options.map(option => (
                            <li
                                key={option.value}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-700 ${value === option.value ? 'font-semibold bg-gray-50 dark:bg-primary-700/50 text-secondary-700 dark:text-secondary-300' : 'text-gray-800 dark:text-gray-200'}`}
                                onClick={() => handleSelect(option.value)}
                                role="option"
                                aria-selected={value === option.value}
                            >
                                {option.label}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;