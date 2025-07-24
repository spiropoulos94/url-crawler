import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface AlertProps {
  type: "success" | "error";
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
