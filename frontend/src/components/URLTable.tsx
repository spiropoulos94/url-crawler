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
    <div className="card">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search URLs or titles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-10"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction("start")}
              className="btn-secondary flex items-center space-x-1"
              disabled={bulkActionMutation.isPending}
            >
              <Play className="h-4 w-4" />
              <span>Start</span>
            </button>
            <button
              onClick={() => handleBulkAction("stop")}
              className="btn-secondary flex items-center space-x-1"
              disabled={bulkActionMutation.isPending}
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </button>
            <button
              onClick={() => handleBulkAction("recrawl")}
              className="btn-secondary flex items-center space-x-1"
              disabled={bulkActionMutation.isPending}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Recrawl</span>
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="btn-danger flex items-center space-x-1"
              disabled={bulkActionMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === urls.length && urls.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("url")}
              >
                URL
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("title")}
              >
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Internal Links
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                External Links
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broken Links
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("created_at")}
              >
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {urls.map((url: URL) => {
              const latestResult = url.results?.[0];
              return (
                <tr key={url.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(url.id)}
                      onChange={(e) =>
                        handleSelectUrl(url.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {url.url}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {url.title || latestResult?.title || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[url.status]
                      }`}
                    >
                      {url.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {latestResult?.internal_links ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {latestResult?.external_links ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {latestResult?.broken_links ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(url.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewDetails(url)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {Math.min((page - 1) * limit + 1, total)} to{" "}
          {Math.min(page * limit, total)} of {total} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
