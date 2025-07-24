import React from "react";
import { useNavigate } from "react-router-dom";
import { useURLs, useBulkAction } from "../hooks/useURLs";
import { usePagination } from "../hooks/usePagination";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { useBulkSelection } from "../hooks/useBulkSelection";
import { TableLoadingSkeleton } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { URLTableMobile } from "./features/URLTableMobile";
import { PaginationControls } from "./features/PaginationControls";
import { URLTableHeader, URLTableDesktop } from "./features";
import { Card, CardHeader, CardContent, Heading, Flex, Container } from "./ui";
import { Globe, Search } from "lucide-react";

export interface URLTableProps {
  className?: string;
}

export const URLTable: React.FC<URLTableProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const pagination = usePagination({ initialLimit: 10 });
  const { data, isLoading, error, refetch } = useURLs(pagination.params);
  const bulkActionMutation = useBulkAction();

  const urls = data?.data?.urls || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / pagination.limit);

  const {
    selectedIds,
    isAllSelected,
    selectAll,
    toggleSelection,
    clearSelection,
  } = useBulkSelection(urls);

  // Auto-refresh for URLs in progress
  useAutoRefresh(refetch, {
    enabled: true,
    interval: 5000,
    shouldRefresh: () =>
      urls.some((url) => ["queued", "running"].includes(url.status)),
  });

  const handleBulkAction = (
    action: "start" | "stop" | "delete" | "recrawl"
  ) => {
    if (selectedIds.length === 0) return;

    bulkActionMutation.mutate(
      { ids: selectedIds, action },
      { onSuccess: clearSelection }
    );
  };

  const handleNavigate = (id: number) => {
    navigate(`/url/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
          <Heading
            level={2}
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6"
          >
            Website URLs
          </Heading>
        </CardHeader>
        <CardContent className="p-8">
          <TableLoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
          <Heading level={2} className="text-2xl font-bold text-gray-900">
            Website URLs
          </Heading>
        </CardHeader>
        <EmptyState
          icon={Globe}
          title="Failed to Load URLs"
          description="We couldn't load your URLs. Please check your connection and try again."
          action={{
            label: "Retry",
            onClick: () => refetch(),
          }}
        />
      </Card>
    );
  }

  // Empty state when no URLs exist
  if (!isLoading && urls.length === 0 && !pagination.search) {
    return (
      <Card className={className}>
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
          <Heading level={2} className="text-2xl font-bold text-gray-900">
            Website URLs
          </Heading>
        </CardHeader>
        <EmptyState
          icon={Globe}
          title="No URLs Added Yet"
          description="Start by adding your first website URL to begin crawling and analyzing web content."
        />
      </Card>
    );
  }

  // Empty state when search returns no results
  if (!isLoading && urls.length === 0 && pagination.search) {
    return (
      <Card className={className}>
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
          <Heading
            level={2}
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6"
          >
            Website URLs
          </Heading>
          <Flex
            direction="col"
            gap="md"
            className="sm:flex-row sm:justify-between sm:items-center"
          >
            <Container className="flex-1 max-w-md">
              <URLTableHeader
                searchValue={pagination.search}
                onSearchChange={pagination.handleSearch}
                selectedCount={selectedIds.length}
                onBulkAction={handleBulkAction}
                bulkActionDisabled={bulkActionMutation.isPending}
                sortBy={pagination.sortBy}
                onClearSort={pagination.clearSort}
              />
            </Container>
          </Flex>
        </CardHeader>
        <EmptyState
          icon={Search}
          title="No Results Found"
          description={`No URLs match your search for "${pagination.search}". Try a different search term or clear the search to see all URLs.`}
          action={{
            label: "Clear Search",
            onClick: () => pagination.handleSearch(""),
          }}
        />
      </Card>
    );
  }

  // Main table with data
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

        <URLTableHeader
          searchValue={pagination.search}
          onSearchChange={pagination.handleSearch}
          selectedCount={selectedIds.length}
          onBulkAction={handleBulkAction}
          bulkActionDisabled={bulkActionMutation.isPending}
          sortBy={pagination.sortBy}
          onClearSort={pagination.clearSort}
        />
      </CardHeader>

      {/* Desktop Table */}
      <URLTableDesktop
        urls={urls}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onNavigate={handleNavigate}
        sortBy={pagination.sortBy}
        sortOrder={pagination.sortOrder}
        onSort={pagination.handleSort}
        isAllSelected={isAllSelected}
      />

      {/* Mobile Table */}
      <URLTableMobile
        urls={urls}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
      />

      {/* Pagination */}
      <PaginationControls
        currentPage={pagination.page}
        totalPages={totalPages}
        total={total}
        limit={pagination.limit}
        onPrevious={pagination.prevPage}
        onNext={() => pagination.nextPage(totalPages)}
      />
    </Card>
  );
};
