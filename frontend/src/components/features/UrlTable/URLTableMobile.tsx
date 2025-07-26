import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatusIndicatorBar } from '../../ui/StatusBadge';
import { Card } from '../../ui/Card';
import { Text } from '../../ui/Typography';
import { Container, Flex, Grid, Stack } from '../../ui/Layout';
import { Button } from '../../ui/Button';
import type { URL } from '../../../types';

export interface URLTableMobileProps {
  urls: URL[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
}

// Memoized mobile card component to prevent unnecessary re-renders
const URLMobileCard: React.FC<{
  url: URL;
  isSelected: boolean;
  onToggleSelection: (id: number) => void;
  onNavigate: (id: number) => void;
}> = React.memo(({ url, isSelected, onToggleSelection, onNavigate }) => {
  const latestResult = url.results?.[0];
  
  return (
    <Card
      key={url.id}
      className={`relative transition-all duration-300 animate-slide-up ${
        isSelected 
          ? 'border-primary-300 shadow-lg ring-2 ring-primary-100' 
          : 'border-gray-200 shadow-card hover:shadow-card-hover'
      }`}
      role="article"
      aria-labelledby={`url-title-${url.id}`}
      aria-describedby={`url-status-${url.id} url-stats-${url.id}`}
      tabIndex={0}
    >
      <StatusIndicatorBar status={url.status} />
      
      <Container className="p-4">
        {/* Header section */}
        <Flex align="start" gap="sm" className="mb-4">
          <Flex align="center" gap="sm" className="flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(url.id)}
              className="w-5 h-5 rounded-md border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-all duration-200"
              aria-label={`Select URL: ${url.url}`}
              aria-describedby={`url-title-${url.id}`}
            />
            <Container className="flex-1 min-w-0">
              <div 
                id={`url-title-${url.id}`}
                className="font-semibold text-gray-900 text-sm leading-tight break-words mb-1 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {url.title || latestResult?.title || "Untitled"}
              </div>
              <Container className="bg-gray-50 px-2 py-1 rounded-lg">
                <Text variant="caption" className="break-all font-mono">
                  {url.url.length > 40 ? `${url.url.substring(0, 40)}...` : url.url}
                </Text>
              </Container>
            </Container>
          </Flex>
          
          <Button
            variant="secondary"
            onClick={() => onNavigate(url.id)}
            icon={Eye}
            className="p-2.5 bg-gradient-to-br from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 rounded-xl group border border-primary-100"
            aria-label={`View details for ${url.title || url.url}`}
          />
        </Flex>

        {/* Status and date row */}
        <Flex 
          align="center" 
          justify="between" 
          className="mb-4"
          id={`url-status-${url.id}`}
        >
          <Flex align="center" gap="sm">
            <div 
              className={`w-2 h-2 rounded-full ${
                url.status === 'done' ? 'bg-green-500' :
                url.status === 'running' ? 'bg-blue-500 animate-pulse' :
                url.status === 'error' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}
              role="img"
              aria-label={`Status: ${url.status}`}
            />
            <Text variant="caption" className="font-medium capitalize text-gray-700">
              {url.status}
            </Text>
          </Flex>
          <Text 
            variant="caption" 
            className="text-gray-500 font-medium"
            aria-label={`Created on ${new Date(url.created_at).toLocaleDateString()}`}
          >
            {new Date(url.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: '2-digit'
            })}
          </Text>
        </Flex>

        {/* Stats section */}
        <Grid 
          cols={3} 
          gap="sm"
          id={`url-stats-${url.id}`}
          role="group"
          aria-label="Link statistics"
        >
          <Container className="text-center">
            <Container 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100"
              role="img"
              aria-label={`${latestResult?.internal_links ?? 0} internal links`}
            >
              <Text variant="caption" className="font-medium text-blue-600 mb-1" aria-hidden="true">
                Internal
              </Text>
              <Text className="text-lg font-bold text-blue-700" aria-hidden="true">
                {latestResult?.internal_links ?? "—"}
              </Text>
            </Container>
          </Container>
          <Container className="text-center">
            <Container 
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100"
              role="img"
              aria-label={`${latestResult?.external_links ?? 0} external links`}
            >
              <Text variant="caption" className="font-medium text-green-600 mb-1" aria-hidden="true">
                External
              </Text>
              <Text className="text-lg font-bold text-green-700" aria-hidden="true">
                {latestResult?.external_links ?? "—"}
              </Text>
            </Container>
          </Container>
          <Container className="text-center">
            <Container 
              className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-100"
              role="img"
              aria-label={`${latestResult?.broken_links ?? 0} broken links`}
            >
              <Text variant="caption" className="font-medium text-red-600 mb-1" aria-hidden="true">
                Broken
              </Text>
              <Text className="text-lg font-bold text-red-700" aria-hidden="true">
                {latestResult?.broken_links ?? "—"}
              </Text>
            </Container>
          </Container>
        </Grid>
      </Container>
    </Card>
  );
});

export const URLTableMobile: React.FC<URLTableMobileProps> = React.memo(({
  urls,
  selectedIds,
  onToggleSelection,
}) => {
  const navigate = useNavigate();

  const handleNavigate = React.useCallback((id: number) => {
    navigate(`/url/${id}`);
  }, [navigate]);

  return (
    <Container 
      className="lg:hidden px-3 sm:px-4"
      role="region"
      aria-label="Mobile URL table"
    >
      <div className="sr-only" id="mobile-table-description">
        Table showing {urls.length} URL{urls.length === 1 ? '' : 's'} with their status, links count, and creation date. Each card can be selected using checkboxes and viewed in detail.
      </div>
      <Stack spacing="lg" aria-describedby="mobile-table-description">
        {urls.map((url: URL) => (
          <URLMobileCard
            key={url.id}
            url={url}
            isSelected={selectedIds.includes(url.id)}
            onToggleSelection={onToggleSelection}
            onNavigate={handleNavigate}
          />
        ))}
      </Stack>
    </Container>
  );
});