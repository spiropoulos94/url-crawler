import React from "react";
import { Card, CardContent, Heading } from "../ui";

export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  isEmpty = false,
  emptyMessage = "No data available",
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <Heading level={3} className="mb-4">
          {title}
        </Heading>
        {isEmpty ? (
          <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
