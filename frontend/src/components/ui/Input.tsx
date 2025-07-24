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
  const inputClasses = `w-full px-4 py-3 rounded-xl border bg-white focus:ring-4 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 ${
    Icon ? "pl-12" : ""
  } ${
    error
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-primary-400"
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
