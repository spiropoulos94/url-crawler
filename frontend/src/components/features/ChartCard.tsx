import React from "react";
import { Card, CardContent, Heading } from "../ui";

export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <Heading level={3} className="mb-4">
          {title}
        </Heading>
        {children}
      </CardContent>
    </Card>
  );
};
