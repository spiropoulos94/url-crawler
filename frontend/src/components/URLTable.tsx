import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useURLs, useBulkAction } from "../hooks/useURLs";
import { usePagination } from "../hooks/usePagination";
import { TableLoadingSkeleton } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import {
  Search,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import type { URL, CrawlStatus } from "../types";

const statusColors: Record<CrawlStatus, string> = {
  queued: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

type SortableColumn = {
  key: string;
  label: string;
};

export const URLTable: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const pagination = usePagination({ initialLimit: 10 });
  const { data, isLoading, error, refetch } = useURLs(pagination.params);
  const bulkActionMutation = useBulkAction();

  // Auto-refresh every 5 seconds for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refetch if there are URLs that might be in progress
      if (
        data?.data?.urls?.some((url) =>
          ["queued", "running"].includes(url.status)
        )
      ) {
        refetch();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.data?.urls, refetch]);

  const urls = data?.data?.urls || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / pagination.limit);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? urls.map((url: URL) => url.id) : []);
  };

  const handleSelectUrl = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  const handleBulkAction = (
    action: "start" | "stop" | "delete" | "recrawl"
  ) => {
    if (selectedIds.length === 0) return;

    bulkActionMutation.mutate(
      { ids: selectedIds, action },
      { onSuccess: () => setSelectedIds([]) }
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
      <div className="flex items-center space-x-2">
        <span>{column.label}</span>
        {getSortIcon(column.key)}
      </div>
    </th>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Website URLs
          </h2>
        </div>
        <div className="p-8">
          <TableLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Website URLs</h2>
        </div>
        <EmptyState
          icon={Globe}
          title="Failed to Load URLs"
          description="We couldn't load your URLs. Please check your connection and try again."
          action={{
            label: "Retry",
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  // Empty state when no URLs exist
  if (!isLoading && urls.length === 0 && !pagination.search) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Website URLs</h2>
        </div>
        <EmptyState
          icon={Globe}
          title="No URLs Added Yet"
          description="Start by adding your first website URL to begin crawling and analyzing web content."
        />
      </div>
    );
  }

  // Empty state when search returns no results
  if (!isLoading && urls.length === 0 && pagination.search) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Website URLs
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search URLs or titles..."
                value={pagination.search}
                onChange={(e) => pagination.handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
        <EmptyState
          icon={Search}
          title="No Results Found"
          description={`No URLs match your search for "${pagination.search}". Try a different search term or clear the search to see all URLs.`}
          action={{
            label: "Clear Search",
            onClick: () => pagination.handleSearch(""),
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Website URLs</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search URLs or titles..."
                value={pagination.search}
                onChange={(e) => pagination.handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 text-base shadow-sm focus:shadow-md"
              />
            </div>
            
            {pagination.sortBy !== 'created_at' && (
              <button
                onClick={pagination.clearSort}
                className="flex items-center justify-center space-x-2 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm cursor-pointer flex-shrink-0"
                title="Clear sorting"
              >
                <X className="h-4 w-4" />
                <span className="hidden xs:inline">Clear Sort</span>
              </button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="w-full">
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-3 sm:justify-start">
                <button
                  onClick={() => handleBulkAction("start")}
                  className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-xs xs:text-sm cursor-pointer border border-green-200 shadow-sm hover:shadow-md"
                  disabled={bulkActionMutation.isPending}
                >
                  <Play className="h-4 w-4" />
                  <span className="hidden xs:inline">Start</span>
                </button>
                <button
                  onClick={() => handleBulkAction("stop")}
                  className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-xs xs:text-sm cursor-pointer border border-yellow-200 shadow-sm hover:shadow-md"
                  disabled={bulkActionMutation.isPending}
                >
                  <Square className="h-4 w-4" />
                  <span className="hidden xs:inline">Stop</span>
                </button>
                <button
                  onClick={() => handleBulkAction("recrawl")}
                  className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-xs xs:text-sm cursor-pointer border border-blue-200 shadow-sm hover:shadow-md"
                  disabled={bulkActionMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden xs:inline">Recrawl</span>
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="flex items-center justify-center space-x-1 px-3 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-xs xs:text-sm cursor-pointer border border-red-200 shadow-sm hover:shadow-md"
                  disabled={bulkActionMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden xs:inline">Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === urls.length && urls.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                />
              </th>
              {renderSortableHeader({ key: "url", label: "URL" })}
              {renderSortableHeader({ key: "title", label: "Title" })}
              {renderSortableHeader({ key: "status", label: "Status" })}
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Internal Links
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                External Links
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Broken Links
              </th>
              {renderSortableHeader({ key: "created_at", label: "Created" })}
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
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
                      onChange={(e) =>
                        handleSelectUrl(url.id, e.target.checked)
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                    <div className="truncate" title={url.url}>
                      {url.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div
                      className="truncate font-medium"
                      title={url.title || latestResult?.title || "-"}
                    >
                      {url.title || latestResult?.title || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                        statusColors[url.status]
                      }`}
                    >
                      {url.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {latestResult?.internal_links ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {latestResult?.external_links ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      {latestResult?.broken_links ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {new Date(url.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/url/${url.id}`)}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 cursor-pointer"
                      title="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="lg:hidden px-3 sm:px-4">
        <div className="space-y-4">
        {urls.map((url: URL, index) => {
          const latestResult = url.results?.[0];
          const isSelected = selectedIds.includes(url.id);
          return (
            <div
              key={url.id}
              className={`relative bg-white rounded-2xl border transition-all duration-300 animate-slide-up ${
                isSelected 
                  ? 'border-primary-300 shadow-lg ring-2 ring-primary-100' 
                  : 'border-gray-200 shadow-card hover:shadow-card-hover'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status indicator bar */}
              <div className={`h-1 rounded-t-2xl ${
                url.status === 'done' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                url.status === 'running' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse-subtle' :
                url.status === 'error' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                'bg-gradient-to-r from-yellow-400 to-amber-500'
              }`} />
              
              <div className="p-4">
                {/* Header section */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectUrl(url.id, e.target.checked)}
                      className="w-5 h-5 rounded-md border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-all duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words mb-1 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {url.title || latestResult?.title || "Untitled"}
                      </h3>
                      <div className="text-xs text-gray-500 break-all font-mono bg-gray-50 px-2 py-1 rounded-lg">
                        {url.url.length > 40 ? `${url.url.substring(0, 40)}...` : url.url}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/url/${url.id}`)}
                    className="p-2.5 bg-gradient-to-br from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 rounded-xl transition-all duration-200 group border border-primary-100"
                    title="View details"
                  >
                    <Eye className="h-4 w-4 text-primary-600 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>

                {/* Status and date row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      url.status === 'done' ? 'bg-green-500' :
                      url.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      url.status === 'error' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-xs font-medium capitalize text-gray-700">
                      {url.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(url.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </div>
                </div>

                {/* Stats section with modern design */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                      <div className="text-xs font-medium text-blue-600 mb-1">Internal</div>
                      <div className="text-lg font-bold text-blue-700">
                        {latestResult?.internal_links ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                      <div className="text-xs font-medium text-green-600 mb-1">External</div>
                      <div className="text-lg font-bold text-green-700">
                        {latestResult?.external_links ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-100">
                      <div className="text-xs font-medium text-red-600 mb-1">Broken</div>
                      <div className="text-lg font-bold text-red-700">
                        {latestResult?.broken_links ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="text-xs sm:text-sm font-medium text-gray-700 text-center sm:text-left">
            <span className="block xs:inline">
              Showing{" "}
              <span className="font-bold text-primary-600">
                {Math.min((pagination.page - 1) * pagination.limit + 1, total)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-primary-600">
                {Math.min(pagination.page * pagination.limit, total)}
              </span>
            </span>
            <span className="block xs:inline">
              {" "}of <span className="font-bold text-primary-600">{total}</span> results
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            <button
              onClick={() => pagination.prevPage()}
              disabled={pagination.page === 1}
              className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden xs:inline">Previous</span>
            </button>
            <span className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white rounded-lg border border-gray-300 whitespace-nowrap">
              <span className="hidden xs:inline">Page </span>{pagination.page}<span className="hidden xs:inline"> of {totalPages}</span>
            </span>
            <button
              onClick={() => pagination.nextPage(totalPages)}
              disabled={pagination.page === totalPages}
              className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
