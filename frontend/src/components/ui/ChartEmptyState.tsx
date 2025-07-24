import React from "react";
import { type LucideIcon } from "lucide-react";

export interface ChartEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="mb-4">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-xs text-gray-500 max-w-sm">{description}</p>
      )}
    </div>
  );
};
