import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const baseClasses = 'bg-white rounded-2xl border border-gray-200';
  const variants = {
    default: 'shadow-card',
    interactive: 'shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer',
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);