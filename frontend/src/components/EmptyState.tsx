import React from "react";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => {
  const headingId = React.useId();
  const descriptionId = React.useId();

  return (
    <div 
      className={`text-center py-8 px-4 ${className}`}
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <div 
        className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        role="img"
        aria-hidden="true"
      >
        <Icon className="w-6 h-6 text-gray-400" aria-hidden="true" />
      </div>

      <h3 id={headingId} className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p id={descriptionId} className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-describedby={descriptionId}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
