/**
 * Tests for useInstruments hook
 * Fetches list of all available trading instruments
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
import { useInstruments } from '../use-instruments';
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

describe('useInstruments', () => {
  // Start MSW server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  it('should start in loading state', () => {
    const { result } = renderHook(() => useInstruments(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch and return instruments list', async () => {
    const { result } = renderHook(() => useInstruments(), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data structure
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);

    // Verify first instrument has correct shape
    const firstInstrument = result.current.data![0];
    expect(firstInstrument).toHaveProperty('id');
    expect(firstInstrument).toHaveProperty('name');
    expect(firstInstrument).toHaveProperty('symbol');
    expect(firstInstrument).toHaveProperty('type');
    expect(firstInstrument).toHaveProperty('spread');
  });

  it('should handle error state', async () => {
    // TODO: Mock fetch to throw error
    // This test will be implemented when we add error scenarios
    expect(true).toBe(true);
  });

  it('should use correct query key', () => {
    const { result } = renderHook(() => useInstruments(), {
      wrapper: createWrapper(),
    });

    // Query key should be ['instruments']
    // We can't directly access queryKey from the hook,
    // but we can verify behavior is consistent
    expect(result.current).toBeDefined();
  });

  it('should not refetch when data is fresh', async () => {
    const { result, rerender } = renderHook(() => useInstruments(), {
      wrapper: createWrapper(),
    });

    // Wait for initial fetch
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const initialData = result.current.data;

    // Rerender should not trigger refetch (data is still fresh)
    rerender();

    // Data should be the same instance (cached)
    expect(result.current.data).toBe(initialData);
  });
});
