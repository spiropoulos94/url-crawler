import React from 'react';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'body' | 'caption' | 'subtitle';
  children: React.ReactNode;
  className?: string;
}

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ 
  level = 2, 
  children, 
  className = '' 
}) => {
  const baseClasses = 'font-bold text-gray-900';
  const levelClasses = {
    1: 'text-3xl sm:text-4xl',
    2: 'text-xl sm:text-2xl',
    3: 'text-lg sm:text-xl',
    4: 'text-base sm:text-lg',
    5: 'text-sm sm:text-base',
    6: 'text-xs sm:text-sm',
  };

  const combinedClassName = `${baseClasses} ${levelClasses[level]} ${className}`;

  switch (level) {
    case 1:
      return <h1 className={combinedClassName}>{children}</h1>;
    case 2:
      return <h2 className={combinedClassName}>{children}</h2>;
    case 3:
      return <h3 className={combinedClassName}>{children}</h3>;
    case 4:
      return <h4 className={combinedClassName}>{children}</h4>;
    case 5:
      return <h5 className={combinedClassName}>{children}</h5>;
    case 6:
      return <h6 className={combinedClassName}>{children}</h6>;
    default:
      return <h2 className={combinedClassName}>{children}</h2>;
  }
};

export const Text: React.FC<TextProps> = ({ 
  variant = 'body', 
  children, 
  className = '',
  ...props
}) => {
  const variants = {
    body: 'text-sm sm:text-base text-gray-600',
    caption: 'text-xs sm:text-sm text-gray-500',
    subtitle: 'text-base sm:text-lg text-gray-700 font-medium',
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

export const Label: React.FC<LabelProps> = ({ 
  children, 
  htmlFor, 
  className = '' 
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-bold text-gray-700 mb-2 ${className}`}
    >
      {children}
    </label>
  );
};