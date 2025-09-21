import React from 'react';
import type { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Fix: Use HTMLMotionProps<'button'> to correctly type the props for a motion.button element.
// This includes all standard button attributes (like onClick, type, className) as well as motion props,
// resolving numerous TypeScript errors across the application.
// FIX: Add optional size prop to allow for different button sizes.
interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'light';
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  // FIX: Moved padding and font-size to sizeClasses to handle different button sizes.
  const baseClasses = "rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-primary-900 transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-2";

  const variantClasses = {
    primary: 'bg-primary-800 hover:bg-primary-900 text-white focus:ring-primary-500 shadow-lg shadow-primary-500/10 dark:shadow-black/30',
    secondary: 'bg-transparent text-secondary-700 border border-secondary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:border-secondary-500 dark:hover:bg-secondary-900/40 focus:ring-secondary-500',
    ghost: 'bg-transparent text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 focus:ring-primary-500',
    light: 'bg-white text-gray-800 hover:bg-gray-200 focus:ring-secondary-500 shadow-sm'
  };

  // FIX: Added size classes to control padding and text size.
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      // FIX: Apply size class to the button.
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;