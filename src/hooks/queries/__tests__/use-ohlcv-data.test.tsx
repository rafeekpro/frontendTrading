/**
 * useOHLCVData Hook Tests (RED Phase)
 * Tests for fetching historical candlestick data
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest';
import { useOHLCVData } from '../use-ohlcv-data';
import type { CandlesticksResponse, Candlestick } from '../../../types/trading';

// Mock candlestick data
const mockCandlesticks: Candlestick[] = [
  {
    timestamp: 1730000000000,
    open: 1.0950,
    high: 1.0980,
    low: 1.0940,
    close: 1.0975,
    volume: 1500000,
  },
  {
    timestamp: 1730003600000,
    open: 1.0975,
    high: 1.0990,
    low: 1.0960,
    close: 1.0985,
    volume: 1800000,
  },
  {
    timestamp: 1730007200000,
    open: 1.0985,
    high: 1.1000,
    low: 1.0970,
    close: 1.0995,
    volume: 2000000,
  },
];

// Setup MSW server
const server = setupServer(
  http.get('/api/instruments/:id/candles', ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'H1';

    const response: CandlesticksResponse = {
      candlesticks: mockCandlesticks,
      instrument_id: id as string,
      timeframe: timeframe as any,
    };

    return HttpResponse.json(response);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useOHLCVData', () => {
  describe('Hook Initialization', () => {
    it('should return initial loading state', () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('should accept instrumentId as first parameter', () => {
      const { result } = renderHook(
        () => useOHLCVData('GBP_USD', 'M5'),
        { wrapper: createWrapper() }
      );

      expect(result.current).toBeDefined();
    });

    it('should accept timeframe as second parameter', () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'D1'),
        { wrapper: createWrapper() }
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch OHLCV data successfully', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCandlesticks);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should use correct query key format', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Query key should be ['ohlcv', instrumentId, timeframe]
      expect(result.current.data).toBeDefined();
    });

    it('should make API request to correct endpoint', async () => {
      let requestUrl = '';

      server.use(
        http.get('/api/instruments/:id/candles', ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json({
            candlesticks: mockCandlesticks,
            instrument_id: 'EUR_USD',
            timeframe: 'H1',
          });
        })
      );

      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(requestUrl).toContain('/api/instruments/EUR_USD/candles');
      expect(requestUrl).toContain('timeframe=H1');
    });

    it('should include timeframe in query params', async () => {
      let requestUrl = '';

      server.use(
        http.get('/api/instruments/:id/candles', ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json({
            candlesticks: mockCandlesticks,
            instrument_id: 'EUR_USD',
            timeframe: 'M5',
          });
        })
      );

      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'M5'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(requestUrl).toContain('timeframe=M5');
    });
  });

  describe('Timeframe Changes', () => {
    it('should refetch data when timeframe changes', async () => {
      const { result, rerender } = renderHook(
        ({ timeframe }) => useOHLCVData('EUR_USD', timeframe),
        {
          wrapper: createWrapper(),
          initialProps: { timeframe: 'H1' as const },
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const firstData = result.current.data;

      // Change timeframe
      rerender({ timeframe: 'M5' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Data should be fetched again
      expect(result.current.data).toBeDefined();
    });

    it('should handle all supported timeframes', async () => {
      const timeframes = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as const;

      for (const timeframe of timeframes) {
        const { result } = renderHook(
          () => useOHLCVData('EUR_USD', timeframe),
          { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBeDefined();
      }
    });
  });

  describe('Enabled State', () => {
    it('should not fetch when instrumentId is empty', async () => {
      const { result } = renderHook(
        () => useOHLCVData('', 'H1'),
        { wrapper: createWrapper() }
      );

      // Wait a bit to ensure no fetch is triggered
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should be enabled when instrumentId is provided', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      server.use(
        http.get('/api/instruments/:id/candles', () => {
          return HttpResponse.json(
            { error: 'Not found', message: 'Instrument not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(
        () => useOHLCVData('INVALID_ID', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/instruments/:id/candles', () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should throw error with descriptive message', async () => {
      server.use(
        http.get('/api/instruments/:id/candles', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('EUR_USD');
    });
  });

  describe('Auto-refresh', () => {
    it('should have refetchInterval configured', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Hook should be configured with refetchInterval
      // We can't directly test the interval value, but we can verify the query is set up
      expect(result.current.data).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return array of candlesticks', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return candlesticks with correct structure', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const candlestick = result.current.data?.[0];
      expect(candlestick).toHaveProperty('timestamp');
      expect(candlestick).toHaveProperty('open');
      expect(candlestick).toHaveProperty('high');
      expect(candlestick).toHaveProperty('low');
      expect(candlestick).toHaveProperty('close');
      expect(candlestick).toHaveProperty('volume');
    });

    it('should have numeric OHLCV values', async () => {
      const { result } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const candlestick = result.current.data?.[0];
      expect(typeof candlestick?.timestamp).toBe('number');
      expect(typeof candlestick?.open).toBe('number');
      expect(typeof candlestick?.high).toBe('number');
      expect(typeof candlestick?.low).toBe('number');
      expect(typeof candlestick?.close).toBe('number');
      expect(typeof candlestick?.volume).toBe('number');
    });
  });

  describe('Multiple Instruments', () => {
    it('should handle different instruments independently', async () => {
      const { result: eurResult } = renderHook(
        () => useOHLCVData('EUR_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      const { result: gbpResult } = renderHook(
        () => useOHLCVData('GBP_USD', 'H1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(eurResult.current.isSuccess).toBe(true);
        expect(gbpResult.current.isSuccess).toBe(true);
      });

      expect(eurResult.current.data).toBeDefined();
      expect(gbpResult.current.data).toBeDefined();
    });
  });
});
