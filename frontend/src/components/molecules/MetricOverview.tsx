import React from "react";
import {
  Hash,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { MetricCard } from "../ui";

export interface MetricData {
  htmlVersion: string;
  totalLinks: number;
  brokenLinks: number;
  hasLoginForm: boolean;
}

export interface MetricOverviewProps {
  data: MetricData;
  className?: string;
}

export const MetricOverview: React.FC<MetricOverviewProps> = ({
  data,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      <MetricCard
        icon={Hash}
        iconColor="text-blue-600"
        title="HTML Version"
        value={data.htmlVersion}
      />
      <MetricCard
        icon={ExternalLink}
        iconColor="text-green-600"
        title="Total Links"
        value={data.totalLinks}
      />
      <MetricCard
        icon={AlertTriangle}
        iconColor={data.brokenLinks > 0 ? "text-red-600" : "text-gray-400"}
        title="Broken Links"
        value={data.brokenLinks}
      />
      <MetricCard
        icon={data.hasLoginForm ? CheckCircle : XCircle}
        iconColor={data.hasLoginForm ? "text-green-600" : "text-gray-400"}
        title="Login Form"
        value={data.hasLoginForm ? "Present" : "Not Found"}
      />
    </div>
  );
};
