import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "interactive";
  role?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  tabIndex?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  role,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  tabIndex,
}) => {
  const baseClasses = "bg-white rounded-lg border border-gray-200";
  const variants = {
    default: "shadow-sm",
    interactive:
      "shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      role={role}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = "",
  id 
}) => (
  <header
    id={id}
    className={`px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 ${className}`}
    role="banner"
  >
    {children}
  </header>
);

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = "",
  id 
}) => (
  <section
    id={id}
    className={`p-3 sm:p-4 ${className}`}
    role="region"
  >
    {children}
  </section>
);
