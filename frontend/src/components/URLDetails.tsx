import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useURL } from "../hooks/useURLs";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import {
  ArrowLeft,
  Globe,
  Hash,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export const URLDetails: React.FC = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urlId = parseInt(id || '0', 10);

  const { data, isLoading, error, refetch } = useURL(urlId);

  // Auto-refresh every 3 seconds if the URL is being crawled
  useEffect(() => {
    const url = data?.data;
    if (url && ['queued', 'running'].includes(url.status)) {
      const interval = setInterval(() => {
        refetch();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [data?.data, refetch]);
  
  const url = data?.data;
  const result = url?.results?.[0];

  const linkData = useMemo(() => 
    result ? [
      {
        name: "Internal Links",
        value: result.internal_links,
        color: "#3b82f6",
      },
      {
        name: "External Links",
        value: result.external_links,
        color: "#10b981",
      },
    ] : [], [result]
  );

  const headingData = useMemo(() => 
    result ? [
      { level: "H1", count: result.h1_count },
      { level: "H2", count: result.h2_count },
      { level: "H3", count: result.h3_count },
      { level: "H4", count: result.h4_count },
      { level: "H5", count: result.h5_count },
      { level: "H6", count: result.h6_count },
    ].filter((item) => item.count > 0) : [], [result]
  );

  if (!id || isNaN(urlId)) {
    return (
      <div className="text-center text-red-600 p-4">
        Invalid URL ID. Please check the URL and try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading URL details..." />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load URL details. Please try again.
      </div>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="self-start px-4 sm:px-6 py-2 sm:py-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back to Dashboard</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {url.title || "URL Details"}
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">{url.url}</span>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="card">
          <EmptyState
            icon={AlertTriangle}
            title="No Analysis Available"
            description={
              url?.status === 'queued' 
                ? "This URL is queued for crawling. The analysis will appear here once the crawl is complete."
                : url?.status === 'running'
                ? "This URL is currently being crawled. The analysis will appear here once the crawl is complete."
                : url?.status === 'error'
                ? "The crawl failed for this URL. Please try crawling it again or check if the URL is accessible."
                : "This URL hasn't been crawled yet. The analysis will appear here once the crawl is complete."
            }
            action={
              url?.status === 'error' ? {
                label: "Retry Crawl",
                onClick: () => {
                  // You could implement a retry function here
                  window.location.reload();
                }
              } : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Hash className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    HTML Version
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.html_version}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExternalLink className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Links
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.internal_links + result.external_links}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className={`h-8 w-8 ${
                      result.broken_links > 0 ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Broken Links
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.broken_links}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {result.has_login_form ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Login Form
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.has_login_form ? "Present" : "Not Found"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Links Distribution */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Links Distribution
              </h3>
              {linkData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <PieChart>
                    <Pie
                      data={linkData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {linkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No link data available
                </p>
              )}
            </div>

            {/* Heading Distribution */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Heading Distribution
              </h3>
              {headingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <BarChart data={headingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No heading data available
                </p>
              )}
            </div>
          </div>

          {/* Broken Links */}
          {result.broken_urls && result.broken_urls.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Broken Links
              </h3>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.broken_urls.map((brokenUrl) => (
                      <tr key={brokenUrl.id}>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                          {brokenUrl.url}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {brokenUrl.status_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {brokenUrl.error_message || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {result.broken_urls.map((brokenUrl) => (
                  <div key={brokenUrl.id} className="border border-gray-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={brokenUrl.url}>
                          {brokenUrl.url}
                        </div>
                      </div>
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex-shrink-0">
                        {brokenUrl.status_code}
                      </span>
                    </div>
                    {brokenUrl.error_message && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Error:</span> {brokenUrl.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});
