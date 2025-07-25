import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Text, Flex } from "./";

export interface TableHeaderProps {
  children: React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  sortable = false,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = "",
}) => {
  const getSortIcon = () => {
    if (!sortable || !sortKey) return null;

    if (currentSortBy !== sortKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return currentSortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary-600" />
    );
  };

  const handleClick = () => {
    if (sortable && sortKey && onSort) {
      onSort(sortKey);
    }
  };

  const getSortAriaSort = () => {
    if (!sortable || !sortKey || currentSortBy !== sortKey) {
      return sortable ? 'none' : undefined;
    }
    return currentSortOrder === "asc" ? "ascending" : "descending";
  };

  return (
    <th
      className={`px-4 py-3 text-left ${
        sortable
          ? "cursor-pointer hover:bg-gray-200 transition-colors duration-200 "
          : ""
      } ${className}`}
      onClick={handleClick}
      role="columnheader"
      aria-sort={getSortAriaSort()}
      {...(sortable && { tabIndex: 0, "aria-label": `Sort by ${children}` })}
      {...(sortable && {
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        },
      })}
    >
      <Flex align="center" gap="sm">
        <Text
          variant="body"
          className="text-xs font-bold text-gray-700 uppercase tracking-wider"
        >
          {children}
        </Text>
        <span aria-hidden="true">{getSortIcon()}</span>
      </Flex>
    </th>
  );
};
