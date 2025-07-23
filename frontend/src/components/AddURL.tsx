import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { urlAPI } from "../services/api";
import { Plus, AlertCircle } from "lucide-react";
import type { AxiosError } from "axios";

export const AddURL: React.FC = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const addUrlMutation = useMutation({
    mutationFn: urlAPI.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      setUrl("");
      setError("");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || "Failed to add URL");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    addUrlMutation.mutate({ url: url.trim() });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Plus className="h-6 w-6 text-green-600" />
          </div>
          Add New URL
        </h2>
        <p className="text-gray-600 mt-2">Enter a website URL to start crawling and analyzing its content</p>
      </div>

      <div className="px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-bold text-gray-700 mb-3"
            >
              Website URL
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="https://example.com or example.com"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 placeholder-gray-500 text-lg"
                  disabled={addUrlMutation.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={addUrlMutation.isPending || !url.trim()}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 min-w-[140px] cursor-pointer"
              >
                {addUrlMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Add URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="p-1 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-700">{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
