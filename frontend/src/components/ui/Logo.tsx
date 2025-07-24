import React from "react";
import { Globe } from "lucide-react";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5 sm:h-6 sm:w-6",
    lg: "h-8 w-8",
  };

  const containerSizes = {
    sm: "p-1",
    md: "p-1 sm:p-1.5",
    lg: "p-2",
  };

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 ${className}`}>
      <div
        className={`${containerSizes[size]} bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg shadow-lg`}
      >
        <Globe className={`${sizes[size]} text-white`} />
      </div>
      {showText && (
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent truncate">
            Sykell Web Crawler
          </h1>
          <p className="text-xs text-gray-600 hidden sm:block">
            Advanced Website Analysis Tool
          </p>
        </div>
      )}
    </div>
  );
};
