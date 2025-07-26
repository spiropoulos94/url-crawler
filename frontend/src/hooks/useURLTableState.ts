import { useMemo, useCallback } from "react";
import { useURLs } from "./useURLs";
import { usePagination } from "./usePagination";
import { useAutoRefresh } from "./useAutoRefresh";
import { useBulkSelection } from "./useBulkSelection";

export const useURLTableState = () => {
  const pagination = usePagination({ initialLimit: 10 });
  const { data, isLoading, error, refetch } = useURLs(pagination.params);

  const urls = useMemo(() => data?.urls || [], [data?.urls]);
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pagination.limit);

  const {
    selectedIds,
    isAllSelected,
    selectAll: selectAllItems,
    toggleSelection,
    clearSelection,
  } = useBulkSelection(urls);

  // Wrap selectAll to not require parameters
  const selectAll = useCallback(() => {
    selectAllItems(urls);
  }, [selectAllItems, urls]);

  // Memoize expensive calculations
  const shouldRefresh = useMemo(
    () => urls.some((url) => ["queued", "running"].includes(url.status)),
    [urls]
  );

  // Auto-refresh for URLs in progress
  useAutoRefresh(refetch, {
    enabled: true,
    interval: 5000,
    shouldRefresh: () => shouldRefresh,
  });

  return {
    // Data
    urls,
    total,
    totalPages,
    isLoading,
    error,
    refetch,

    // Pagination
    pagination,

    // Selection
    selectedIds,
    isAllSelected,
    selectAll,
    toggleSelection,
    clearSelection,

    // Auto-refresh
    shouldRefresh,
  };
};
