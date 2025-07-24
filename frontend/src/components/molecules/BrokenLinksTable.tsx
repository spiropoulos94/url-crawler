import React from "react";
import { Card, CardContent, Heading } from "../ui";

export interface BrokenUrl {
  id: number;
  url: string;
  status_code: number;
  error_message?: string;
}

export interface BrokenLinksTableProps {
  brokenUrls: BrokenUrl[];
  className?: string;
}

export const BrokenLinksTable: React.FC<BrokenLinksTableProps> = ({
  brokenUrls,
  className = "",
}) => {
  if (!brokenUrls || brokenUrls.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent>
        <Heading level={3} className="mb-4">
          Broken Links
        </Heading>

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
              {brokenUrls.map((brokenUrl) => (
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
          {brokenUrls.map((brokenUrl) => (
            <div
              key={brokenUrl.id}
              className="border border-gray-200 rounded-lg p-4 bg-red-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium text-gray-900 truncate"
                    title={brokenUrl.url}
                  >
                    {brokenUrl.url}
                  </div>
                </div>
                <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex-shrink-0">
                  {brokenUrl.status_code}
                </span>
              </div>
              {brokenUrl.error_message && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Error:</span>{" "}
                  {brokenUrl.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
