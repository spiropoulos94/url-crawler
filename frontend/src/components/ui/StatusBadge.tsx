import React from 'react';
import { Badge } from './Badge';
import { Container } from './Layout';

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
  
  return (
    <Badge variant={config.variant} className={`shadow-sm ${className}`}>
      {status}
    </Badge>
  );
};

export const StatusIndicatorBar: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <Container className={`h-1 rounded-t-2xl ${config.gradient}`} />
  );
};