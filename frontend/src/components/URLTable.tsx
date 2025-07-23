import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlAPI } from "../services/api";
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

interface URLTableProps {
  onViewDetails: (url: URL) => void;
}

const statusColors: Record<CrawlStatus, string> = {
  queued: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export const URLTable: React.FC<URLTableProps> = ({ onViewDetails }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["urls", page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      urlAPI.getAll({
        page,
        limit,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (previousData) => previousData,
  });

  const bulkActionMutation = useMutation({
    mutationFn: urlAPI.bulkAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      setSelectedIds([]);
    },
  });

  const urls = data?.data?.urls || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

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

    bulkActionMutation.mutate({
      ids: selectedIds,
      action,
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction("start")}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={bulkActionMutation.isPending}
              >
                <Play className="h-4 w-4" />
                <span>Start</span>
              </button>
              <button
                onClick={() => handleBulkAction("stop")}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={bulkActionMutation.isPending}
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
              <button
                onClick={() => handleBulkAction("recrawl")}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={bulkActionMutation.isPending}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Recrawl</span>
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={bulkActionMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
                onClick={() => handleSort("url")}
              >
                URL
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg"
                onClick={() => handleSort("title")}
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
                onClick={() => handleSort("created_at")}
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
                      onClick={() => onViewDetails(url)}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
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

      {/* Pagination */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-700">
            Showing <span className="font-bold text-primary-600">{Math.min((page - 1) * limit + 1, total)}</span> to{" "}
            <span className="font-bold text-primary-600">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-bold text-primary-600">{total}</span> results
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded-lg border border-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
