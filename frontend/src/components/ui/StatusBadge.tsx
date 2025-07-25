import React from 'react';
import { Badge } from './Badge';

export type StatusType = 'queued' | 'running' | 'done' | 'error' | 'stopped';

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  queued: {
    variant: 'warning' as const,
    gradient: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  },
  running: {
    variant: 'info' as const,
    gradient: 'bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse-subtle',
  },
  done: {
    variant: 'success' as const,
    gradient: 'bg-gradient-to-r from-green-400 to-emerald-500',
  },
  error: {
    variant: 'danger' as const,
    gradient: 'bg-gradient-to-r from-red-400 to-rose-500',
  },
  stopped: {
    variant: 'secondary' as const,
    gradient: 'bg-gradient-to-r from-gray-400 to-slate-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];
  
  const getStatusDescription = (status: StatusType) => {
    switch (status) {
      case 'queued': return 'Crawl request is queued and waiting to start';
      case 'running': return 'Currently crawling and analyzing the website';
      case 'done': return 'Website crawl completed successfully';
      case 'error': return 'An error occurred during website crawling';
      case 'stopped': return 'Website crawling has been stopped';
      default: return `Status: ${status}`;
    }
  };
  
  return (
    <Badge 
      variant={config.variant} 
      className={`shadow-sm ${className}`}
      aria-label={getStatusDescription(status)}
    >
      {status}
    </Badge>
  );
};

export const StatusIndicatorBar: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  const getStatusDescription = (status: StatusType) => {
    switch (status) {
      case 'queued': return 'Queued for processing';
      case 'running': return 'Currently processing';
      case 'done': return 'Processing completed';
      case 'error': return 'Processing failed';
      case 'stopped': return 'Processing stopped';
      default: return `Status: ${status}`;
    }
  };
  
  return (
    <div 
      className={`h-1 rounded-t-2xl ${config.gradient}`}
      role="img"
      aria-label={getStatusDescription(status)}
    />
  );
};