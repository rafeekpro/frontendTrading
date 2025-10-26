/**
 * useOpportunities Hook Tests
 *
 * 🔴 RED PHASE - These tests will FAIL until hook is implemented
 *
 * Tests React Query hook for fetching opportunities list
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { opportunitiesHandlers } from '../../../mocks/handlers/opportunities';
import { useOpportunities } from '../use-opportunities';
import type { ReactNode } from 'react';

// Setup MSW server
const server = setupServer(...opportunitiesHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useOpportunities', () => {
  it('should fetch opportunities successfully', async () => {
    const { result } = renderHook(() => useOpportunities(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);
  });

  it('should return opportunities with correct structure', async () => {
    const { result } = renderHook(() => useOpportunities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const opportunity = result.current.data![0];

    expect(opportunity).toHaveProperty('id');
    expect(opportunity).toHaveProperty('instrument_id');
    expect(opportunity).toHaveProperty('type');
    expect(opportunity).toHaveProperty('confidence');
    expect(opportunity).toHaveProperty('entry_price');
    expect(opportunity).toHaveProperty('target_price');
    expect(opportunity).toHaveProperty('stop_loss');
    expect(opportunity).toHaveProperty('strategy');
    expect(opportunity).toHaveProperty('detected_at');
  });

  it('should support filter by type', async () => {
    const { result } = renderHook(
      () => useOpportunities({ type: 'buy' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach(opp => {
      expect(opp.type).toBe('buy');
    });
  });

  it('should support filter by minimum confidence', async () => {
    const { result } = renderHook(
      () => useOpportunities({ minConfidence: 0.8 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach(opp => {
      expect(opp.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  it('should support filter by strategy', async () => {
    const { result } = renderHook(
      () => useOpportunities({ strategy: 'breakout' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach(opp => {
      expect(opp.strategy).toBe('breakout');
    });
  });

  it('should support sorting by confidence', async () => {
    const { result } = renderHook(
      () => useOpportunities({ sortBy: 'confidence', sortOrder: 'desc' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const opportunities = result.current.data!;
    for (let i = 1; i < opportunities.length; i++) {
      expect(opportunities[i - 1].confidence).toBeGreaterThanOrEqual(
        opportunities[i].confidence
      );
    }
  });

  it('should support pagination with limit', async () => {
    const limit = 10;
    const { result } = renderHook(
      () => useOpportunities({ limit }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.length).toBeLessThanOrEqual(limit);
  });

  it('should support multiple filters combined', async () => {
    const { result } = renderHook(
      () => useOpportunities({
        type: 'buy',
        minConfidence: 0.7,
        strategy: 'breakout',
        limit: 5,
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.length).toBeLessThanOrEqual(5);

    result.current.data!.forEach(opp => {
      expect(opp.type).toBe('buy');
      expect(opp.confidence).toBeGreaterThanOrEqual(0.7);
      expect(opp.strategy).toBe('breakout');
    });
  });

  it('should cache results with proper query key', async () => {
    const wrapper = createWrapper();

    const { result: result1 } = renderHook(
      () => useOpportunities(),
      { wrapper }
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    const firstData = result1.current.data;

    // Second render with same wrapper should use cached data
    const { result: result2 } = renderHook(
      () => useOpportunities(),
      { wrapper }
    );

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Should have same data from cache
    expect(result2.current.data).toEqual(firstData);
  });
});
