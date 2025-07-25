import React from "react";

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg";
  truncate?: boolean;
  title?: string;
  onClick?: () => void;
  role?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = "",
  maxWidth,
  truncate = false,
  title,
  onClick,
  role,
}) => {
  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const cellClasses = [
    "px-4 py-3",
    maxWidth ? maxWidthClasses[maxWidth] : "",
    truncate ? "truncate" : "",
    onClick ? "cursor-pointer" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <td className={cellClasses} title={title} onClick={onClick} role={role}>
      {truncate ? <div className="truncate">{children}</div> : children}
    </td>
  );
};
