import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatusIndicatorBar } from '../ui/StatusBadge';
import { Card } from '../ui/Card';
import { Heading, Text } from '../ui/Typography';
import { Container, Flex, Grid, Stack } from '../ui/Layout';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { URL } from '../../types';

export interface URLTableMobileProps {
  urls: URL[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
}

export const URLTableMobile: React.FC<URLTableMobileProps> = ({
  urls,
  selectedIds,
  onToggleSelection,
}) => {
  const navigate = useNavigate();

  return (
    <Container className="lg:hidden px-3 sm:px-4">
      <Stack spacing="lg">
        {urls.map((url: URL, index) => {
          const latestResult = url.results?.[0];
          const isSelected = selectedIds.includes(url.id);
          
          return (
            <Card
              key={url.id}
              className={`relative transition-all duration-300 animate-slide-up ${
                isSelected 
                  ? 'border-primary-300 shadow-lg ring-2 ring-primary-100' 
                  : 'border-gray-200 shadow-card hover:shadow-card-hover'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <StatusIndicatorBar status={url.status} />
              
              <Container className="p-4">
                {/* Header section */}
                <Flex align="start" gap="sm" className="mb-4">
                  <Flex align="center" gap="sm" className="flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onToggleSelection(url.id)}
                      className="w-5 h-5 rounded-md border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-all duration-200"
                    />
                    <Container className="flex-1 min-w-0">
                      <Heading
                        level={3}
                        className="font-semibold text-gray-900 text-sm leading-tight break-words mb-1 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {url.title || latestResult?.title || "Untitled"}
                      </Heading>
                      <Container className="bg-gray-50 px-2 py-1 rounded-lg">
                        <Text variant="caption" className="break-all font-mono">
                          {url.url.length > 40 ? `${url.url.substring(0, 40)}...` : url.url}
                        </Text>
                      </Container>
                    </Container>
                  </Flex>
                  
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/url/${url.id}`)}
                    icon={Eye}
                    className="p-2.5 bg-gradient-to-br from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 rounded-xl group border border-primary-100"
                    title="View details"
                  />
                </Flex>

                {/* Status and date row */}
                <Flex align="center" justify="between" className="mb-4">
                  <Flex align="center" gap="sm">
                    <Container className={`w-2 h-2 rounded-full ${
                      url.status === 'done' ? 'bg-green-500' :
                      url.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      url.status === 'error' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <Text variant="caption" className="font-medium capitalize text-gray-700">
                      {url.status}
                    </Text>
                  </Flex>
                  <Text variant="caption" className="text-gray-500 font-medium">
                    {new Date(url.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </Text>
                </Flex>

                {/* Stats section */}
                <Grid cols={3} gap="sm">
                  <Container className="text-center">
                    <Container className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                      <Text variant="caption" className="font-medium text-blue-600 mb-1">
                        Internal
                      </Text>
                      <Text className="text-lg font-bold text-blue-700">
                        {latestResult?.internal_links ?? "—"}
                      </Text>
                    </Container>
                  </Container>
                  <Container className="text-center">
                    <Container className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                      <Text variant="caption" className="font-medium text-green-600 mb-1">
                        External
                      </Text>
                      <Text className="text-lg font-bold text-green-700">
                        {latestResult?.external_links ?? "—"}
                      </Text>
                    </Container>
                  </Container>
                  <Container className="text-center">
                    <Container className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-100">
                      <Text variant="caption" className="font-medium text-red-600 mb-1">
                        Broken
                      </Text>
                      <Text className="text-lg font-bold text-red-700">
                        {latestResult?.broken_links ?? "—"}
                      </Text>
                    </Container>
                  </Container>
                </Grid>
              </Container>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};