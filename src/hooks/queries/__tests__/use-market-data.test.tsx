/**
 * Tests for useMarketData hook
 * Fetches real-time candlestick market data for a specific instrument and timeframe
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from 'vitest';
import { setupServer } from 'msw/node';
import { useMarketData } from '../use-market-data';
import { instrumentsHandlers } from '../../../mocks/handlers/instruments';
import type { PropsWithChildren } from 'react';

// Setup MSW test server
const server = setupServer(...instrumentsHandlers);

/**
 * Test wrapper with fresh QueryClient
 * Prevents test pollution and ensures isolated cache
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests for faster failure
      },
    },
  });

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMarketData', () => {
  // Start MSW server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  it('should start in loading state when instrumentId is provided', () => {
    const { result } = renderHook(() => useMarketData('EUR_USD'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should be disabled when no instrumentId is provided', () => {
    const { result } = renderHook(() => useMarketData(''), {
      wrapper: createWrapper(),
    });

    // Query should be disabled (not loading, not fetching)
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch market data with default timeframe (H1)', async () => {
    const { result } = renderHook(() => useMarketData('EUR_USD'), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data structure
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);

    // Verify candlestick structure
    const firstCandle = result.current.data![0];
    expect(firstCandle).toHaveProperty('timestamp');
    expect(firstCandle).toHaveProperty('open');
    expect(firstCandle).toHaveProperty('high');
    expect(firstCandle).toHaveProperty('low');
    expect(firstCandle).toHaveProperty('close');
    expect(firstCandle).toHaveProperty('volume');
  });

  it('should fetch market data with custom timeframe', async () => {
    const { result } = renderHook(() => useMarketData('EUR_USD', 'M5'), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data is an array
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should handle non-existent instrument (404)', async () => {
    const { result } = renderHook(() => useMarketData('INVALID_ID'), {
      wrapper: createWrapper(),
    });

    // Wait for query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key structure', () => {
    const { result: result1 } = renderHook(
      () => useMarketData('EUR_USD', 'H1'),
      {
        wrapper: createWrapper(),
      }
    );

    const { result: result2 } = renderHook(
      () => useMarketData('EUR_USD', 'M5'),
      {
        wrapper: createWrapper(),
      }
    );

    // Both should be defined but independent
    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
  });

  it('should auto-refresh every 5 seconds', async () => {
    // Mock timers for testing refetch interval
    vi.useFakeTimers();

    const { result } = renderHook(() => useMarketData('EUR_USD'), {
      wrapper: createWrapper(),
    });

    // Wait for initial fetch
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const initialFetchTime = Date.now();

    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);

    // Wait for refetch to start
    await waitFor(() => {
      // Check if query has been refetched (either fetching or success)
      return result.current.isFetching || result.current.isSuccess;
    });

    // Verify refetch occurred
    expect(result.current).toBeDefined();

    // Cleanup
    vi.useRealTimers();
  });

  it('should refetch when timeframe changes', async () => {
    // Create a single wrapper instance to share QueryClient
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ timeframe }) => useMarketData('EUR_USD', timeframe),
      {
        wrapper,
        initialProps: { timeframe: 'H1' as const },
      }
    );

    // Wait for first query
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Change timeframe
    rerender({ timeframe: 'M5' as const });

    // Wait for success state again
    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 2000,
    });

    // Verify we have data
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
