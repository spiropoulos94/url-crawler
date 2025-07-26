import React, { useMemo } from "react";
import { URLTableMobile } from "./URLTableMobile";
import { PaginationControls } from "../PaginationControls";
import { URLTableHeader, URLTableDesktop } from "./";
import { Card, CardHeader, Heading } from "../../ui";
import type { URL } from "../../../types";

interface URLTableContainerProps {
  className?: string;
  urls: URL[];
  selectedIds: number[];
  isAllSelected: boolean;
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onNavigate: (id: number) => void;
  onBulkAction: (action: "stop" | "delete" | "recrawl") => void;
  bulkActionDisabled: boolean;
  
  // Pagination props
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPrevious: () => void;
  onNext: () => void;
  
  // Search and sort props
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onClearSort: () => void;
}

export const URLTableContainer: React.FC<URLTableContainerProps> = ({
  className = "",
  urls,
  selectedIds,
  isAllSelected,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onNavigate,
  onBulkAction,
  bulkActionDisabled,
  currentPage,
  totalPages,
  total,
  limit,
  onPrevious,
  onNext,
  searchValue,
  onSearchChange,
  sortBy,
  sortOrder,
  onSort,
  onClearSort,
}) => {
  // Memoize URLTableHeader props to prevent unnecessary re-renders
  const urlTableHeaderProps = useMemo(() => ({
    searchValue,
    onSearchChange,
    selectedCount: selectedIds.length,
    onBulkAction,
    bulkActionDisabled,
    sortBy,
    onClearSort,
  }), [
    searchValue,
    onSearchChange,
    selectedIds.length,
    onBulkAction,
    bulkActionDisabled,
    sortBy,
    onClearSort,
  ]);

  // Memoize URLTableDesktop props to prevent unnecessary re-renders
  const urlTableDesktopProps = useMemo(() => ({
    urls,
    selectedIds,
    onToggleSelection,
    onSelectAll,
    onClearSelection,
    onNavigate,
    sortBy,
    sortOrder,
    onSort,
    isAllSelected,
  }), [
    urls,
    selectedIds,
    onToggleSelection,
    onSelectAll,
    onClearSelection,
    onNavigate,
    sortBy,
    sortOrder,
    onSort,
    isAllSelected,
  ]);

  // Memoize URLTableMobile props to prevent unnecessary re-renders
  const urlTableMobileProps = useMemo(() => ({
    urls,
    selectedIds,
    onToggleSelection,
  }), [urls, selectedIds, onToggleSelection]);

  // Memoize PaginationControls props to prevent unnecessary re-renders
  const paginationControlsProps = useMemo(() => ({
    currentPage,
    totalPages,
    total,
    limit,
    onPrevious,
    onNext,
  }), [
    currentPage,
    totalPages,
    total,
    limit,
    onPrevious,
    onNext,
  ]);

  return (
    <Card className={className}>
      {/* Header with gradient */}
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
        <Heading
          level={2}
          className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6"
        >
          Website URLs
        </Heading>

        <URLTableHeader {...urlTableHeaderProps} />
      </CardHeader>

      {/* Desktop Table */}
      <URLTableDesktop {...urlTableDesktopProps} />

      {/* Mobile Table */}
      <URLTableMobile {...urlTableMobileProps} />

      {/* Pagination */}
      <PaginationControls {...paginationControlsProps} />
    </Card>
  );
};