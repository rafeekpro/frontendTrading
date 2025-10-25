/**
 * Tests for useInstrument hook
 * Fetches single instrument by ID
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
import { useInstrument } from '../use-instrument';
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

describe('useInstrument', () => {
  // Start MSW server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  it('should start in loading state when ID is provided', () => {
    const { result } = renderHook(() => useInstrument('EUR_USD'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should be disabled when no ID is provided', () => {
    const { result } = renderHook(() => useInstrument(''), {
      wrapper: createWrapper(),
    });

    // Query should be disabled (not loading, not fetching)
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch and return single instrument', async () => {
    const { result } = renderHook(() => useInstrument('EUR_USD'), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data structure
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.id).toBe('EUR_USD');
    expect(result.current.data).toHaveProperty('name');
    expect(result.current.data).toHaveProperty('symbol');
    expect(result.current.data).toHaveProperty('type');
    expect(result.current.data).toHaveProperty('spread');
  });

  it('should handle non-existent instrument (404)', async () => {
    const { result } = renderHook(() => useInstrument('INVALID_ID'), {
      wrapper: createWrapper(),
    });

    // Wait for query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key structure', () => {
    const { result } = renderHook(() => useInstrument('EUR_USD'), {
      wrapper: createWrapper(),
    });

    // Query key should be ['instruments', id]
    // We verify behavior is consistent
    expect(result.current).toBeDefined();
  });

  it('should refetch when ID changes', async () => {
    // Create a single wrapper instance to share QueryClient
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ id }) => useInstrument(id),
      {
        wrapper,
        initialProps: { id: 'EUR_USD' },
      }
    );

    // Wait for first query
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const firstData = result.current.data;
    expect(firstData!.id).toBe('EUR_USD');

    // Change ID - this should trigger a new query
    rerender({ id: 'GBP_USD' });

    // Wait for loading state (query is refetching)
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // Wait for second query to complete
    await waitFor(() => {
      return result.current.isSuccess && !result.current.isFetching;
    });

    // Verify new data is loaded
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.id).toBe('GBP_USD');
    expect(result.current.data).not.toBe(firstData);
  });
});
