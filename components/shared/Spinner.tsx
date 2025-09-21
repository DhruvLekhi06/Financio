
import React from 'react';

const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-current ${className}`}></div>
  );
};

export default Spinner;
