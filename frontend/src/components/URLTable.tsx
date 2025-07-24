import React from "react";
import { useNavigate } from "react-router-dom";
import { useURLs, useBulkAction } from "../hooks/useURLs";
import { usePagination } from "../hooks/usePagination";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { useBulkSelection } from "../hooks/useBulkSelection";
import { TableLoadingSkeleton } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { SearchInput } from "./features/SearchInput";
import { BulkActionBar } from "./features/BulkActionBar";
import { URLTableMobile } from "./features/URLTableMobile";
import { PaginationControls } from "./features/PaginationControls";
import { StatusBadge } from "./ui/StatusBadge";
import { Badge } from "./ui/Badge";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { Heading, Text } from "./ui/Typography";
import { Container, Flex, Stack } from "./ui/Layout";
import { Button } from "./ui/Button";
import {
  Eye,
  Globe,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Search,
} from "lucide-react";
import type { URL } from "../types";

type SortableColumn = {
  key: string;
  label: string;
};

export const URLTable: React.FC = React.memo(() => {
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

  const getSortIcon = (columnKey: string) => {
    if (pagination.sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return pagination.sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary-600" />
    );
  };

  const renderSortableHeader = (column: SortableColumn) => (
    <th
      key={column.key}
      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg"
      onClick={() => pagination.handleSort(column.key)}
    >
      <Flex align="center" gap="sm">
        <Text variant="body" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {column.label}
        </Text>
        {getSortIcon(column.key)}
      </Flex>
    </th>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
          <Heading level={2} className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Website URLs
          </Heading>
        </CardHeader>
        <CardContent className="p-8">
          <TableLoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
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
      <Card>
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
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
          <Heading level={2} className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Website URLs
          </Heading>
          <Flex direction="col" gap="md" className="sm:flex-row sm:justify-between sm:items-center">
            <Container className="flex-1 max-w-md">
              <SearchInput
                value={pagination.search}
                onChange={pagination.handleSearch}
                placeholder="Search URLs or titles..."
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

  return (
    <Card>
      {/* Header with gradient */}
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
        <Heading level={2} className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Website URLs
        </Heading>
        <Stack spacing="lg">
          <Flex direction="col" gap="sm" className="xs:flex-row xs:items-center">
            <SearchInput
              value={pagination.search}
              onChange={pagination.handleSearch}
              placeholder="Search URLs or titles..."
            />

            {pagination.sortBy !== "created_at" && (
              <Button
                variant="secondary"
                onClick={pagination.clearSort}
                icon={X}
                className="px-3 py-2.5 text-sm flex-shrink-0"
                title="Clear sorting"
              >
                <Text className="hidden xs:inline text-sm">Clear Sort</Text>
              </Button>
            )}
          </Flex>

          <BulkActionBar
            selectedCount={selectedIds.length}
            onAction={handleBulkAction}
            disabled={bulkActionMutation.isPending}
          />
        </Stack>
      </CardHeader>

      {/* Desktop Table - Hidden on mobile */}
      <Container className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) =>
                    e.target.checked ? selectAll(urls) : clearSelection()
                  }
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                />
              </th>
              {renderSortableHeader({ key: "url", label: "URL" })}
              {renderSortableHeader({ key: "title", label: "Title" })}
              {renderSortableHeader({ key: "status", label: "Status" })}
              <th className="px-6 py-4 text-left">
                <Text variant="body" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Internal Links
                </Text>
              </th>
              <th className="px-6 py-4 text-left">
                <Text variant="body" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  External Links
                </Text>
              </th>
              <th className="px-6 py-4 text-left">
                <Text variant="body" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Broken Links
                </Text>
              </th>
              {renderSortableHeader({ key: "created_at", label: "Created" })}
              <th className="px-6 py-4 text-left">
                <Text variant="body" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </Text>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {urls.map((url: URL) => {
              const latestResult = url.results?.[0];
              return (
                <tr
                  key={url.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(url.id)}
                      onChange={() => toggleSelection(url.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <Container className="truncate">
                      <Text variant="body" className="text-sm font-medium text-gray-900" title={url.url}>
                        {url.url}
                      </Text>
                    </Container>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <Container className="truncate">
                      <Text 
                        variant="body" 
                        className="text-sm text-gray-700 font-medium"
                        title={url.title || latestResult?.title || "-"}
                      >
                        {url.title || latestResult?.title || "-"}
                      </Text>
                    </Container>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={url.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info" size="sm">
                      {latestResult?.internal_links ?? "-"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success" size="sm">
                      {latestResult?.external_links ?? "-"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="danger" size="sm">
                      {latestResult?.broken_links ?? "-"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Text variant="body" className="text-sm text-gray-600 font-medium">
                      {new Date(url.created_at).toLocaleDateString()}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/url/${url.id}`)}
                      icon={Eye}
                      className="p-2"
                      title="View details"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Container>

      <URLTableMobile
        urls={urls}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
      />

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
});
