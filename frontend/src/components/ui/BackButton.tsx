import React from "react";
import { ArrowLeft } from "lucide-react";

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: "default" | "floating";
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = "Back",
  variant = "default",
  className = "",
}) => {
  if (variant === "floating") {
    return (
      <button
        onClick={onClick}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center cursor-pointer ${className}`}
        aria-label={label}
        title={label}
      >
        <ArrowLeft className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`self-start px-3 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 cursor-pointer ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </button>
  );
};
