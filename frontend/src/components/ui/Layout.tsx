import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface FlexProps {
  children: React.ReactNode;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
  className?: string;
}

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export interface StackProps {
  children: React.ReactNode;
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={className}>{children}</div>;
};

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = "row",
  align = "start",
  justify = "start",
  gap = "none",
  wrap = false,
  className = "",
}) => {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  const gapClasses = {
    none: "",
    xs: "gap-0.5",
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
    xl: "gap-4",
  };

  const wrapClass = wrap ? "flex-wrap" : "";

  const combinedClassName =
    `flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${gapClasses[gap]} ${wrapClass} ${className}`.trim();

  return <div className={combinedClassName}>{children}</div>;
};

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = "none",
  className = "",
}) => {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    12: "grid-cols-12",
  };

  const gapClasses = {
    none: "",
    xs: "gap-0.5",
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
    xl: "gap-4",
  };

  const combinedClassName =
    `grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`.trim();

  return <div className={combinedClassName}>{children}</div>;
};

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = "md",
  className = "",
}) => {
  const spacingClasses = {
    none: "space-y-0",
    xs: "space-y-0.5",
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3",
    xl: "space-y-4",
  };

  const combinedClassName = `${spacingClasses[spacing]} ${className}`.trim();

  return <div className={combinedClassName}>{children}</div>;
};
