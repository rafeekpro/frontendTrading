/**
 * useOpportunity Hook Tests
 *
 * 🔴 RED PHASE - These tests will FAIL until hook is implemented
 *
 * Tests React Query hook for fetching single opportunity by ID
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { opportunitiesHandlers } from '../../../mocks/handlers/opportunities';
import { useOpportunity } from '../use-opportunity';
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

// Get a valid opportunity ID from the list
async function getValidOpportunityId(): Promise<string> {
  const response = await fetch('/api/opportunities');
  const data = await response.json();
  return data.opportunities[0].id;
}

describe('useOpportunity', () => {
  it('should fetch single opportunity by ID', async () => {
    const validId = await getValidOpportunityId();

    const { result } = renderHook(() => useOpportunity(validId), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.id).toBe(validId);
  });

  it('should return opportunity with correct structure', async () => {
    const validId = await getValidOpportunityId();

    const { result } = renderHook(() => useOpportunity(validId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const opportunity = result.current.data!;

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

  it('should handle 404 for invalid opportunity ID', async () => {
    const { result } = renderHook(() => useOpportunity('INVALID_ID_12345'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should not fetch when ID is undefined', () => {
    const { result } = renderHook(() => useOpportunity(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should cache results with proper query key', async () => {
    const validId = await getValidOpportunityId();
    const wrapper = createWrapper();

    const { result: result1 } = renderHook(() => useOpportunity(validId), {
      wrapper,
    });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    const firstData = result1.current.data;

    // Second render with same wrapper should use cached data
    const { result: result2 } = renderHook(() => useOpportunity(validId), {
      wrapper,
    });

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Should have same data from cache
    expect(result2.current.data).toEqual(firstData);
  });
});
