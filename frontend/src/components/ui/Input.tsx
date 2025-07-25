import React from "react";
import { type LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  const inputClasses = `w-full px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 text-sm ${
    Icon ? "pl-10" : ""
  } ${
    error
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-primary-400"
  } ${className}`;

  const ariaDescribedBy = [errorId, helperTextId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
        )}
        <input 
          id={inputId}
          className={inputClasses} 
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
          {...props} 
        />
      </div>
      {helperText && (
        <p 
          id={helperTextId}
          className="mt-1.5 text-xs text-gray-600"
        >
          {helperText}
        </p>
      )}
      {error && (
        <p 
          id={errorId}
          className="mt-1.5 text-xs text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};
