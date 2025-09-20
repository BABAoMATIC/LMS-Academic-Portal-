import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
  onRefresh?: () => void | Promise<void>;
  dependencies?: any[];
}

/**
 * Custom hook for automatic refresh functionality
 * @param options Configuration options for auto-refresh
 * @returns Object with refresh control functions
 */
export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onRefresh,
    dependencies = []
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshingRef.current || !onRefresh) return;
    
    try {
      isRefreshingRef.current = true;
      await onRefresh();
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefresh]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enabled && onRefresh) {
      intervalRef.current = setInterval(refresh, interval);
    }
  }, [enabled, interval, refresh, onRefresh]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const forceRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Start/stop auto-refresh based on enabled state and dependencies
  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return stopAutoRefresh;
  }, [enabled, startAutoRefresh, stopAutoRefresh, ...dependencies]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
    forceRefresh,
    isRefreshing: isRefreshingRef.current
  };
};

export default useAutoRefresh;
