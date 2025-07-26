import React, { useMemo, useCallback } from "react";
import { useURLTableState } from "../../../hooks/useURLTableState";
import { useURLTableActions } from "../../../hooks/useURLTableActions";
import { URLTableContainer } from "./URLTableContainer";
import {
  URLTableLoadingState,
  URLTableErrorState,
  URLTableEmptyState,
  URLTableNoResultsState,
} from "./URLTableStates";

export interface URLTableProps {
  className?: string;
}

export const URLTable: React.FC<URLTableProps> = ({ className = "" }) => {
  const state = useURLTableState();
  const { handleBulkAction, handleNavigate, bulkActionMutation } = useURLTableActions(
    state.selectedIds,
    state.clearSelection
  );

  // Memoize URLTableHeader props for no results state
  const urlTableHeaderProps = useMemo(() => ({
    searchValue: state.pagination.search,
    onSearchChange: state.pagination.handleSearch,
    selectedCount: state.selectedIds.length,
    onBulkAction: handleBulkAction,
    bulkActionDisabled: bulkActionMutation.isPending,
    sortBy: state.pagination.sortBy,
    onClearSort: state.pagination.clearSort,
  }), [
    state.pagination.search,
    state.pagination.handleSearch,
    state.selectedIds.length,
    handleBulkAction,
    bulkActionMutation.isPending,
    state.pagination.sortBy,
    state.pagination.clearSort,
  ]);

  // Memoize pagination handlers
  const handleNext = useCallback(() => {
    state.pagination.nextPage(state.totalPages);
  }, [state.pagination, state.totalPages]);

  // Loading state
  if (state.isLoading) {
    return <URLTableLoadingState className={className} />;
  }

  // Error state
  if (state.error) {
    return <URLTableErrorState className={className} onRetry={state.refetch} />;
  }

  // Empty state when no URLs exist
  if (!state.isLoading && state.urls.length === 0 && !state.pagination.search) {
    return <URLTableEmptyState className={className} />;
  }

  // Empty state when search returns no results
  if (!state.isLoading && state.urls.length === 0 && state.pagination.search) {
    return (
      <URLTableNoResultsState
        className={className}
        searchValue={state.pagination.search}
        onClearSearch={() => state.pagination.handleSearch("")}
        urlTableHeaderProps={urlTableHeaderProps}
      />
    );
  }

  // Main table with data
  return (
    <URLTableContainer
      className={className}
      urls={state.urls}
      selectedIds={state.selectedIds}
      isAllSelected={state.isAllSelected}
      onToggleSelection={state.toggleSelection}
      onSelectAll={state.selectAll}
      onClearSelection={state.clearSelection}
      onNavigate={handleNavigate}
      onBulkAction={handleBulkAction}
      bulkActionDisabled={bulkActionMutation.isPending}
      currentPage={state.pagination.page}
      totalPages={state.totalPages}
      total={state.total}
      limit={state.pagination.limit}
      onPrevious={state.pagination.prevPage}
      onNext={handleNext}
      searchValue={state.pagination.search}
      onSearchChange={state.pagination.handleSearch}
      sortBy={state.pagination.sortBy}
      sortOrder={state.pagination.sortOrder}
      onSort={state.pagination.handleSort}
      onClearSort={state.pagination.clearSort}
    />
  );
};
