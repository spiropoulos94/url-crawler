import React from "react";
import { type LucideIcon } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "gradient";
  isLoading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  icon: Icon,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5";

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
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
};
