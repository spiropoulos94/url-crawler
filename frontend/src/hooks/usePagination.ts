import { useState, useCallback, useMemo } from 'react';
import type { PaginationParams } from '../types';

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  initialSearch = '',
  initialSortBy = 'created_at',
  initialSortOrder = 'desc',
}: UsePaginationProps = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const params: PaginationParams = useMemo(() => ({
    page,
    limit,
    search,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [page, limit, search, sortBy, sortOrder]);

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback((totalPages: number) => {
    setPage(prev => Math.min(totalPages, prev + 1));
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setSearch(initialSearch);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialPage, initialLimit, initialSearch, initialSortBy, initialSortOrder]);

  return {
    params,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    handleSearch,
    handleSort,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
};