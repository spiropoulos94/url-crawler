import React from "react";
import { Globe, Search } from "lucide-react";
import { TableLoadingSkeleton } from "../../LoadingSpinner";
import { EmptyState } from "../../EmptyState";
import { Card, CardHeader, CardContent, Heading, Flex, Container } from "../../ui";
import { URLTableHeader } from "./URLTableHeader";

interface URLTableStatesProps {
  className?: string;
}

interface URLTableLoadingStateProps extends URLTableStatesProps {}

export const URLTableLoadingState: React.FC<URLTableLoadingStateProps> = ({ className = "" }) => (
  <Card className={className}>
    <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
      <Heading
        level={2}
        className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6"
      >
        Website URLs
      </Heading>
    </CardHeader>
    <CardContent className="p-8">
      <TableLoadingSkeleton />
    </CardContent>
  </Card>
);

interface URLTableErrorStateProps extends URLTableStatesProps {
  onRetry: () => void;
}

export const URLTableErrorState: React.FC<URLTableErrorStateProps> = ({ 
  className = "", 
  onRetry 
}) => (
  <Card className={className}>
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
        onClick: onRetry,
      }}
    />
  </Card>
);

interface URLTableEmptyStateProps extends URLTableStatesProps {}

export const URLTableEmptyState: React.FC<URLTableEmptyStateProps> = ({ className = "" }) => (
  <Card className={className}>
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

interface URLTableNoResultsStateProps extends URLTableStatesProps {
  searchValue: string;
  onClearSearch: () => void;
  urlTableHeaderProps: any;
}

export const URLTableNoResultsState: React.FC<URLTableNoResultsStateProps> = ({ 
  className = "", 
  searchValue,
  onClearSearch,
  urlTableHeaderProps
}) => (
  <Card className={className}>
    <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50">
      <Heading
        level={2}
        className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6"
      >
        Website URLs
      </Heading>
      <Flex
        direction="col"
        gap="md"
        className="sm:flex-row sm:justify-between sm:items-center"
      >
        <Container className="flex-1 max-w-md">
          <URLTableHeader {...urlTableHeaderProps} />
        </Container>
      </Flex>
    </CardHeader>
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={`No URLs match your search for "${searchValue}". Try a different search term or clear the search to see all URLs.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
      }}
    />
  </Card>
);