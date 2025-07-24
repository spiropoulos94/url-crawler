import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../molecules";

export interface LinkData {
  name: string;
  value: number;
  color: string;
}

export interface HeadingData {
  level: string;
  count: number;
}

export interface URLChartsSectionProps {
  linkData: LinkData[];
  headingData: HeadingData[];
  className?: string;
}

export const URLChartsSection: React.FC<URLChartsSectionProps> = ({
  linkData,
  headingData,
  className = "",
}) => {
  return (
    <div
      className={`space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 ${className}`}
    >
      {/* Links Distribution */}
      <ChartCard
        title="Links Distribution"
        isEmpty={linkData.length === 0}
        emptyMessage="No link data available"
      >
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <PieChart>
            <Pie
              data={linkData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {linkData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Heading Distribution */}
      <ChartCard
        title="Heading Distribution"
        isEmpty={headingData.length === 0}
        emptyMessage="No heading data available"
      >
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart
            data={headingData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
