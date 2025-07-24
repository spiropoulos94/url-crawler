import React from "react";
import { type LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  className = "",
  ...props
}) => {
  const inputClasses = `w-full px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 text-sm ${
    Icon ? "pl-10" : ""
  } ${
    error
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-primary-400"
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};
