import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient configuration for trading application.
 *
 * Trading data is time-sensitive, so we use:
 * - Short staleTime (30s) to ensure fresh data
 * - Reasonable gcTime (5min) to balance memory and network usage
 * - Retry logic (3 attempts) for flaky network connections
 * - RefetchOnWindowFocus to keep data fresh when user returns
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Trading data is time-sensitive - 30 seconds stale time
      staleTime: 30000, // 30 seconds

      // Keep unused data in cache for 5 minutes
      gcTime: 300000, // 5 minutes (formerly cacheTime)

      // Retry failed queries 3 times with exponential backoff
      retry: 3,

      // Refetch on window focus to keep data fresh
      refetchOnWindowFocus: true,
    },
  },
});
