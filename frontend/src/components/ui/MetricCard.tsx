import React from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "./Card";

export interface MetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  value: string | number;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  iconColor = "text-blue-600",
  title,
  value,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
