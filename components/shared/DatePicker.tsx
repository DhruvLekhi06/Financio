import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentDate, setCurrentDate] = useState(value ? new Date(value + 'T00:00:00') : new Date());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
    const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate]);
    const monthName = useMemo(() => currentDate.toLocaleString('default', { month: 'long' }), [currentDate]);
    const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        onChange(newDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left input-style focus:ring-secondary-500 focus:border-secondary-500"
            >
                <span className="truncate">{value ? new Date(value + 'T00:00:00').toLocaleDateString() : 'Select date'}</span>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-primary-800 shadow-lg rounded-md border border-gray-200 dark:border-primary-700"
                    >
                        <div className="p-3">
                            <div className="flex justify-between items-center mb-2">
                                <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-primary-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                                <div className="font-semibold">{monthName} {year}</div>
                                <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-primary-700"><ChevronRightIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 my-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleDateSelect(day)}
                                            className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors ${
                                                isSelected
                                                    ? 'bg-secondary-500 text-white font-bold'
                                                    : 'hover:bg-gray-100 dark:hover:bg-primary-700'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
