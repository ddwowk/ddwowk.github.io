
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-brand-primary border-t-transparent`}
      role="status"
      aria-label="Loading..."
    ></div>
  );
};

export default Spinner;
