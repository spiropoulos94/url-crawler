import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export interface AlertProps {
  type: "success" | "error" | "info";
  message: string;
  className?: string;
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
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center space-x-2.5 p-3 border rounded-lg ${config.colors} ${className}`}
    >
      <div className={`p-0.5 rounded-full ${config.iconBg}`}>
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
