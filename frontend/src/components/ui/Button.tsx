import React from "react";
import { type LucideIcon } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "gradient";
  isLoading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  children?: React.ReactNode;
  "aria-label"?: string;
  "aria-describedby"?: string;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  icon: Icon,
  fullWidth = false,
  disabled,
  className = "",
  children,
  loadingText = "Loading...",
  ...props
}) => {
  const hasOnlyIcon = Icon && !children;
  const isDisabled = disabled || isLoading;
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer px-3 py-1.5 text-sm";

  const variants = {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
    success:
      "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    gradient:
      "bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
  };

  const widthClasses = fullWidth ? "w-full" : "";
  const finalClassName =
    `${baseClasses} ${variants[variant]} ${widthClasses} ${className}`.trim();

  return (
    <button
      className={finalClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      {...(hasOnlyIcon && !props["aria-label"] ? { "aria-label": "Button" } : {})}
      {...props}
    >
      {isLoading ? (
        <>
          <div 
            className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {children && <>{children}</>}
        </>
      )}
    </button>
  );
};
