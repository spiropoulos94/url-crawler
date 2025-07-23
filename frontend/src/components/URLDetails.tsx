import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { urlAPI } from '../services/api';
import { URL } from '../types';
import { 
  ArrowLeft, 
  Globe, 
  Hash, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface URLDetailsProps {
  urlId: number;
  onBack: () => void;
}

export const URLDetails: React.FC<URLDetailsProps> = ({ urlId, onBack }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['url', urlId],
    queryFn: () => urlAPI.getById(urlId),
  });

  const url = data?.data;
  const result = url?.results?.[0];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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

  const linkData = result ? [
    { name: 'Internal Links', value: result.internal_links, color: '#3b82f6' },
    { name: 'External Links', value: result.external_links, color: '#10b981' },
  ] : [];

  const headingData = result ? [
    { level: 'H1', count: result.h1_count },
    { level: 'H2', count: result.h2_count },
    { level: 'H3', count: result.h3_count },
    { level: 'H4', count: result.h4_count },
    { level: 'H5', count: result.h5_count },
    { level: 'H6', count: result.h6_count },
  ].filter(item => item.count > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{url.title || 'URL Details'}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{url.url}</span>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="card text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-600">This URL hasn't been crawled yet or the crawl failed.</p>
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
                  <p className="text-sm font-medium text-gray-500">HTML Version</p>
                  <p className="text-lg font-semibold text-gray-900">{result.html_version}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExternalLink className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Links</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.internal_links + result.external_links}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className={`h-8 w-8 ${result.broken_links > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Broken Links</p>
                  <p className="text-lg font-semibold text-gray-900">{result.broken_links}</p>
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
                  <p className="text-sm font-medium text-gray-500">Login Form</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.has_login_form ? 'Present' : 'Not Found'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Links Distribution */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Distribution</h3>
              {linkData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={linkData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {linkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No link data available</p>
              )}
            </div>

            {/* Heading Distribution */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Heading Distribution</h3>
              {headingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={headingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No heading data available</p>
              )}
            </div>
          </div>

          {/* Broken Links */}
          {result.broken_urls && result.broken_urls.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Broken Links</h3>
              <div className="overflow-x-auto">
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
                          {brokenUrl.error_message || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};