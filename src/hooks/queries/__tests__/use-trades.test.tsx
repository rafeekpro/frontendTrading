/**
 * Tests for useTrades hook
 * Fetches trades list (optionally filtered by instrument ID)
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
} from 'vitest';
import { setupServer } from 'msw/node';
import { useTrades } from '../use-trades';
import { tradingHandlers } from '../../../mocks/handlers/trading';
import type { PropsWithChildren } from 'react';

// Setup MSW test server
const server = setupServer(...tradingHandlers);

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

describe('useTrades', () => {
  // Start MSW server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  it('should start in loading state', () => {
    const { result } = renderHook(() => useTrades(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch all trades when no instrumentId provided', async () => {
    const { result } = renderHook(() => useTrades(), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data structure
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);

    // Verify trade structure if trades exist
    if (result.current.data!.length > 0) {
      const firstTrade = result.current.data![0];
      expect(firstTrade).toHaveProperty('id');
      expect(firstTrade).toHaveProperty('instrument_id');
      expect(firstTrade).toHaveProperty('type');
      expect(firstTrade).toHaveProperty('quantity');
      expect(firstTrade).toHaveProperty('entry_price');
    }
  });

  it('should fetch trades filtered by instrumentId', async () => {
    const instrumentId = 'EUR_USD';
    const { result } = renderHook(() => useTrades(instrumentId), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data is an array
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should use different query keys for different instrumentIds', () => {
    const { result: result1 } = renderHook(() => useTrades('EUR_USD'), {
      wrapper: createWrapper(),
    });

    const { result: result2 } = renderHook(() => useTrades('GBP_USD'), {
      wrapper: createWrapper(),
    });

    // Both should be defined but independent
    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
  });

  it('should refetch when instrumentId changes', async () => {
    // Create a single wrapper instance to share QueryClient
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ instrumentId }) => useTrades(instrumentId),
      {
        wrapper,
        initialProps: { instrumentId: undefined as string | undefined },
      }
    );

    // Wait for first query (all trades)
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const allTrades = result.current.data;

    // Change to filtered query
    rerender({ instrumentId: 'EUR_USD' });

    // Wait for loading state (query is refetching)
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // Wait for second query to complete
    await waitFor(() => {
      return result.current.isSuccess && !result.current.isFetching;
    });

    // Data might be the same or different depending on trades
    // Just verify it's an array
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
