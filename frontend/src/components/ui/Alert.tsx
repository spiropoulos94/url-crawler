import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export interface AlertProps {
  type: "success" | "error" | "info";
  message: string;
  className?: string;
  "aria-live"?: "polite" | "assertive";
  role?: "alert" | "status";
}

const alertConfig = {
  success: {
    colors: "bg-green-50 border-green-200 text-green-700",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: CheckCircle,
  },
  error: {
    colors: "bg-red-50 border-red-200 text-red-700",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    icon: AlertCircle,
  },
  info: {
    colors: "bg-blue-50 border-blue-200 text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: Info,
  },
};

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  className = "",
  "aria-live": ariaLive,
  role,
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;
  
  // Default accessibility attributes based on alert type
  const getDefaultRole = () => {
    if (role) return role;
    return type === "error" ? "alert" : "status";
  };
  
  const getDefaultAriaLive = () => {
    if (ariaLive) return ariaLive;
    return type === "error" ? "assertive" : "polite";
  };

  return (
    <div
      className={`flex items-center space-x-2.5 p-3 border rounded-lg ${config.colors} ${className}`}
      role={getDefaultRole()}
      aria-live={getDefaultAriaLive()}
    >
      <div className={`p-0.5 rounded-full ${config.iconBg}`}>
        <Icon className={`h-4 w-4 ${config.iconColor}`} aria-hidden="true" />
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
