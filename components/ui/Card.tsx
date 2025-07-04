
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const cardClasses = `bg-brand-surface border border-brand-subtle/20 rounded-lg shadow-lg p-6 ${className}`;
  return <div className={cardClasses}>{children}</div>;
};

export default Card;
