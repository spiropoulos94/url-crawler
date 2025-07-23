import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useURLs, useBulkAction } from "../hooks/useURLs";
import { usePagination } from "../hooks/usePagination";
import { TableLoadingSkeleton } from "./LoadingSpinner";
import {
  Search,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { URL, CrawlStatus } from "../types";

const statusColors: Record<CrawlStatus, string> = {
  queued: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export const URLTable: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const pagination = usePagination({ initialLimit: 10 });
  const { data, isLoading, error } = useURLs(pagination.params);
  const bulkActionMutation = useBulkAction();

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Website URLs</h2>
        </div>
        <div className="p-8">
          <TableLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load URLs. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Website URLs</h2>
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

          {selectedIds.length > 0 && (
            <div className="w-full sm:w-auto">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => handleBulkAction("start")}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm cursor-pointer"
                  disabled={bulkActionMutation.isPending}
                >
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Start</span>
                </button>
                <button
                  onClick={() => handleBulkAction("stop")}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm cursor-pointer"
                  disabled={bulkActionMutation.isPending}
                >
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
                <button
                  onClick={() => handleBulkAction("recrawl")}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm cursor-pointer"
                  disabled={bulkActionMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Recrawl</span>
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm cursor-pointer"
                  disabled={bulkActionMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
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
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg"
                onClick={() => pagination.handleSort("url")}
              >
                URL
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg"
                onClick={() => pagination.handleSort("title")}
              >
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Internal Links
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                External Links
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Broken Links
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg"
                onClick={() => pagination.handleSort("created_at")}
              >
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {urls.map((url: URL) => {
              const latestResult = url.results?.[0];
              return (
                <tr key={url.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
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
                    <div className="truncate font-medium" title={url.title || latestResult?.title || "-"}>
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
      <div className="lg:hidden space-y-4">
        {urls.map((url: URL) => {
          const latestResult = url.results?.[0];
          return (
            <div key={url.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(url.id)}
                    onChange={(e) =>
                      handleSelectUrl(url.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 truncate text-sm" title={url.title || latestResult?.title || "-"}>
                      {url.title || latestResult?.title || "-"}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1" title={url.url}>
                      {url.url}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/url/${url.id}`)}
                  className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0 cursor-pointer"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full shadow-sm ${
                      statusColors[url.status]
                    }`}
                  >
                    {url.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 text-right">
                  {new Date(url.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Internal</div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {latestResult?.internal_links ?? "-"}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">External</div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {latestResult?.external_links ?? "-"}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Broken</div>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {latestResult?.broken_links ?? "-"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-700">
            Showing <span className="font-bold text-primary-600">{Math.min((pagination.page - 1) * pagination.limit + 1, total)}</span> to{" "}
            <span className="font-bold text-primary-600">{Math.min(pagination.page * pagination.limit, total)}</span> of{" "}
            <span className="font-bold text-primary-600">{total}</span> results
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => pagination.prevPage()}
              disabled={pagination.page === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded-lg border border-gray-300">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => pagination.nextPage(totalPages)}
              disabled={pagination.page === totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
