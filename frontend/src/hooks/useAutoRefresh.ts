import { useEffect } from 'react';

export interface AutoRefreshOptions {
  enabled: boolean;
  interval?: number;
  shouldRefresh?: () => boolean;
}

export const useAutoRefresh = (
  refetch: () => void,
  options: AutoRefreshOptions
) => {
  const { enabled, interval = 5000, shouldRefresh } = options;

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      if (!shouldRefresh || shouldRefresh()) {
        refetch();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, refetch, shouldRefresh]);
};