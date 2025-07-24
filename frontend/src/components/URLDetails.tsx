import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useURL } from "../hooks/useURLs";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { AlertTriangle } from "lucide-react";
import { PageHeader, MetricOverview, BrokenLinksTable } from "./molecules";
import { URLChartsSection } from "./organisms";

export const URLDetails: React.FC = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urlId = parseInt(id || "0", 10);

  const { data, isLoading, error, refetch } = useURL(urlId);

  // Auto-refresh every 3 seconds if the URL is being crawled
  useEffect(() => {
    const url = data?.data;
    if (url && ["queued", "running"].includes(url.status)) {
      const interval = setInterval(() => {
        refetch();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [data?.data, refetch]);

  const url = data?.data;
  const result = url?.results?.[0];

  const linkData = useMemo(
    () =>
      result
        ? [
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
          ]
        : [],
    [result]
  );

  const linksAreEmpty = useMemo(() => {
    return result?.internal_links === 0 && result?.external_links === 0;
  }, [result]);

  const headingData = useMemo(
    () =>
      result
        ? [
            { level: "H1", count: result.h1_count },
            { level: "H2", count: result.h2_count },
            { level: "H3", count: result.h3_count },
            { level: "H4", count: result.h4_count },
            { level: "H5", count: result.h5_count },
            { level: "H6", count: result.h6_count },
          ].filter((item) => item.count > 0)
        : [],
    [result]
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
      <PageHeader
        title={url.title || "URL Details"}
        subtitle={url.url}
        onBack={() => navigate("/dashboard")}
      />

      {!result ? (
        <div className="card">
          <EmptyState
            icon={AlertTriangle}
            title="No Analysis Available"
            description={
              url?.status === "queued"
                ? "This URL is queued for crawling. The analysis will appear here once the crawl is complete."
                : url?.status === "running"
                ? "This URL is currently being crawled. The analysis will appear here once the crawl is complete."
                : url?.status === "error"
                ? "The crawl failed for this URL. Please try crawling it again or check if the URL is accessible."
                : "This URL hasn't been crawled yet. The analysis will appear here once the crawl is complete."
            }
            action={
              url?.status === "error"
                ? {
                    label: "Retry Crawl",
                    onClick: () => {
                      // You could implement a retry function here
                      window.location.reload();
                    },
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <MetricOverview
            data={{
              htmlVersion: result.html_version,
              totalLinks: result.internal_links + result.external_links,
              brokenLinks: result.broken_links,
              hasLoginForm: result.has_login_form,
            }}
          />

          {/* Charts */}
          <URLChartsSection
            linkData={linkData}
            headingData={headingData}
            isEmpty={linksAreEmpty}
          />

          {/* Broken Links */}
          <BrokenLinksTable brokenUrls={result.broken_urls || []} />
        </>
      )}
    </div>
  );
});
