import React from "react";
import { ArrowLeft } from "lucide-react";

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = "Back",
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`self-start px-4 sm:px-6 py-2 sm:py-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 cursor-pointer ${className}`}
    >
      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
};
