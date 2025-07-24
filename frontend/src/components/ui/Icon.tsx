import React from "react";
import { type LucideIcon } from "lucide-react";

export interface IconProps {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export interface IconContainerProps {
  children: React.ReactNode;
  variant?: "simple" | "rounded" | "circular";
  bg?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "gray"
    | "green"
    | "blue"
    | "red";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  return <IconComponent className={`${sizeClasses[size]} ${className}`} />;
};

export const IconContainer: React.FC<IconContainerProps> = ({
  children,
  variant = "rounded",
  bg = "gray",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    simple: "",
    rounded: "rounded-lg",
    circular: "rounded-full",
  };

  const bgClasses = {
    primary: "bg-primary-100",
    secondary: "bg-gray-100",
    success: "bg-green-100",
    warning: "bg-yellow-100",
    danger: "bg-red-100",
    gray: "bg-gray-100",
    green: "bg-green-100",
    blue: "bg-blue-100",
    red: "bg-red-100",
  };

  const sizeClasses = {
    xs: "p-1",
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
    xl: "p-3",
  };

  const combinedClassName =
    `${variantClasses[variant]} ${bgClasses[bg]} ${sizeClasses[size]} ${className}`.trim();

  return <div className={combinedClassName}>{children}</div>;
};
