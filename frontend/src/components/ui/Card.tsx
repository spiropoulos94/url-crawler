import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const baseClasses = "bg-white rounded-lg border border-gray-200";
  const variants = {
    default: "shadow-sm",
    interactive:
      "shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 ${className}`}
  >
    {children}
  </div>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-3 sm:p-4 ${className}`}>{children}</div>
);
