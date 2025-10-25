import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient configuration constants for trading application.
 *
 * Trading data is time-sensitive, so we use conservative defaults:
 * - Short staleTime to ensure fresh data
 * - Reasonable gcTime to balance memory and network usage
 * - Retry logic for flaky network connections
 * - RefetchOnWindowFocus to keep data fresh when user returns
 */
const QUERY_CONFIG = {
  /** Trading data stale time: 30 seconds */
  STALE_TIME: 30 * 1000, // 30 seconds

  /** Cache garbage collection time: 5 minutes */
  GC_TIME: 5 * 60 * 1000, // 5 minutes

  /** Number of retry attempts for failed queries */
  RETRY_COUNT: 3,

  /** Refetch queries when window regains focus */
  REFETCH_ON_WINDOW_FOCUS: true,
} as const;

/**
 * Global QueryClient instance for the trading application.
 *
 * Configured with trading-specific defaults optimized for:
 * - Time-sensitive market data
 * - Network resilience
 * - User experience (auto-refresh on focus)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.STALE_TIME,
      gcTime: QUERY_CONFIG.GC_TIME,
      retry: QUERY_CONFIG.RETRY_COUNT,
      refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
    },
  },
});

/**
 * Query configuration constants for use in custom hooks.
 * Export for testing and hook composition.
 */
export { QUERY_CONFIG };
