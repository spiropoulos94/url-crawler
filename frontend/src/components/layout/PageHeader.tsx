import React from "react";
import { Globe } from "lucide-react";
import { BackButton } from "../ui";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = "Back to Dashboard",
  className = "",
}) => {
  return (
    <>
      {/* Regular back button for larger screens */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 ${className}`}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <div className="flex items-center space-x-2 mt-1">
              <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">{subtitle}</span>
            </div>
          )}
        </div>
        <div className="hidden sm:block">
          <BackButton onClick={onBack} label={backLabel} />
        </div>
      </div>

      {/* Floating back button for smaller screens */}
      <div className="sm:hidden">
        <BackButton onClick={onBack} label={backLabel} variant="floating" />
      </div>
    </>
  );
};
