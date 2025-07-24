import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  text,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-1.5 text-xs text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};

export const TableLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-3 p-3">
          <LoadingSkeleton className="h-3 w-3" />
          <LoadingSkeleton className="h-3 flex-1" />
          <LoadingSkeleton className="h-3 w-20" />
          <LoadingSkeleton className="h-3 w-14" />
          <LoadingSkeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
};
