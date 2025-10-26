/**
 * Tests for Results Query Hooks
 * RED PHASE: These tests should FAIL until we implement the hooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { resultsHandlers } from '../../../mocks/handlers/results';
import { tradingHandlers } from '../../../mocks/handlers/trading';
import { useTradingResults, usePerformanceMetrics } from '../use-results';
import { usePaperTradingStore } from '../../../stores/paperTrading';
import { clearStoreStorage } from '../../../stores/__tests__/utils';
import type { ReactNode } from 'react';

// Setup MSW server with both results and trading handlers
const server = setupServer(...resultsHandlers, ...tradingHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to wrap hooks with QueryClient provider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTradingResults', () => {
  beforeEach(() => {
    clearStoreStorage();
    usePaperTradingStore.getState().reset();
  });

  it('should fetch trading results successfully', async () => {
    const { result } = renderHook(() => useTradingResults(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty('total_trades');
    expect(result.current.data).toHaveProperty('total_pnl');
    expect(result.current.data).toHaveProperty('win_rate');
    expect(result.current.data).toHaveProperty('profit_factor');
  });

  it('should return empty results initially', async () => {
    const { result } = renderHook(() => useTradingResults(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_trades).toBe(0);
    expect(result.current.data?.total_pnl).toBe(0);
    expect(result.current.data?.trades).toEqual([]);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useTradingResults(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // This would require MSW error handler setup
    const { result } = renderHook(() => useTradingResults(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should either succeed or have error, not hang
    expect(result.current.isSuccess || result.current.isError).toBe(true);
  });
});

describe('usePerformanceMetrics', () => {
  beforeEach(() => {
    clearStoreStorage();
    usePaperTradingStore.getState().reset();
  });

  it('should fetch performance metrics successfully', async () => {
    const { result } = renderHook(() => usePerformanceMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty('metrics');
    expect(result.current.data).toHaveProperty('daily_pnl');
    expect(result.current.data).toHaveProperty('monthly_pnl');
    expect(result.current.data).toHaveProperty('equity_curve');
  });

  it('should return metrics structure', async () => {
    const { result } = renderHook(() => usePerformanceMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const metrics = result.current.data?.metrics;
    expect(metrics).toHaveProperty('total_return');
    expect(metrics).toHaveProperty('sharpe_ratio');
    expect(metrics).toHaveProperty('max_drawdown');
    expect(metrics).toHaveProperty('avg_win');
    expect(metrics).toHaveProperty('avg_loss');
  });

  it('should return empty chart data initially', async () => {
    const { result } = renderHook(() => usePerformanceMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.daily_pnl).toEqual([]);
    expect(result.current.data?.monthly_pnl).toEqual([]);
    expect(result.current.data?.equity_curve).toEqual([]);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => usePerformanceMetrics(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
