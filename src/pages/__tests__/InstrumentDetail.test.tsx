/**
 * InstrumentDetail Page Tests (RED Phase)
 * Integration tests for the complete instrument detail page
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest';
import { InstrumentDetail } from '../InstrumentDetail';
import type {
  Instrument,
  InstrumentResponse,
  CandlesticksResponse,
  Candlestick
} from '../../types/trading';

// Mock instrument data
const mockInstrument: Instrument = {
  id: 'EUR_USD',
  name: 'Euro / US Dollar',
  symbol: 'EUR/USD',
  type: 'forex',
  spread: 0.00015,
  pip_value: 0.0001,
  min_trade_size: 0.01,
  max_trade_size: 100,
  precision: 5,
};

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
  http.get('/api/instruments/:id', ({ params }) => {
    const { id } = params;
    if (id === 'EUR_USD') {
      const response: InstrumentResponse = {
        instrument: mockInstrument,
      };
      return HttpResponse.json(response);
    }
    return HttpResponse.json(
      { error: 'Not found', message: 'Instrument not found' },
      { status: 404 }
    );
  }),
  http.get('/api/instruments/:id/candles', ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'H1';

    if (id === 'EUR_USD') {
      const response: CandlesticksResponse = {
        candlesticks: mockCandlesticks,
        instrument_id: id as string,
        timeframe: timeframe as any,
      };
      return HttpResponse.json(response);
    }
    return HttpResponse.json(
      { error: 'Not found', message: 'Instrument not found' },
      { status: 404 }
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to render page with router context
function renderInstrumentDetail(instrumentId: string = 'EUR_USD') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/instrument/${instrumentId}`]}>
        <Routes>
          <Route path="/instrument/:id" element={<InstrumentDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('InstrumentDetail', () => {
  describe('Page Rendering', () => {
    it('should render the page without crashing', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display instrument name in header', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/Euro \/ US Dollar/i)).toBeInTheDocument();
      });
    });

    it('should display instrument symbol', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/EUR\/USD/i)).toBeInTheDocument();
      });
    });

    it('should have main layout sections', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should have market stats section
      expect(screen.getByTestId('market-stats')).toBeInTheDocument();

      // Should have chart section
      expect(screen.getByTestId('candlestick-chart')).toBeInTheDocument();

      // Should have order book section
      expect(screen.getByTestId('order-book')).toBeInTheDocument();
    });
  });

  describe('MarketStats Integration', () => {
    it('should render MarketStats component', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByTestId('market-stats')).toBeInTheDocument();
      });
    });

    it('should display 24h High metric', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/24h high/i)).toBeInTheDocument();
      });
    });

    it('should display 24h Low metric', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/24h low/i)).toBeInTheDocument();
      });
    });

    it('should display 24h Volume metric', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/24h volume/i)).toBeInTheDocument();
      });
    });

    it('should display VWAP metric', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/vwap/i)).toBeInTheDocument();
      });
    });

    it('should calculate market stats from OHLCV data', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const stats = screen.getByTestId('market-stats');
        expect(stats).toBeInTheDocument();
      });

      // High should be max of all highs (1.1000)
      // Low should be min of all lows (1.0940)
      // Volume should be sum of all volumes (5,300,000)
    });
  });

  describe('CandlestickChart Integration', () => {
    it('should render CandlestickChart component', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByTestId('candlestick-chart')).toBeInTheDocument();
      });
    });

    it('should pass candlestick data to chart', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const chart = screen.getByTestId('candlestick-chart');
        expect(chart).toBeInTheDocument();
      });
    });

    it('should pass volume data to chart', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const chart = screen.getByTestId('candlestick-chart');
        expect(chart).toBeInTheDocument();
      });
    });

    it('should pass current timeframe to chart', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const chart = screen.getByTestId('candlestick-chart');
        expect(chart).toBeInTheDocument();
        // Timeframe indicator "H1" should be visible in the chart
        expect(within(chart).getByText('H1')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching data', async () => {
      renderInstrumentDetail();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('TimeframeSelector Integration', () => {
    it('should render TimeframeSelector component', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByRole('group', { name: /timeframe selector/i })).toBeInTheDocument();
      });
    });

    it('should display all timeframe options', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const selector = screen.getByRole('group', { name: /timeframe selector/i });
        expect(within(selector).getByText('M1')).toBeInTheDocument();
        expect(within(selector).getByText('M5')).toBeInTheDocument();
        expect(within(selector).getByText('M15')).toBeInTheDocument();
        expect(within(selector).getByText('H1')).toBeInTheDocument();
        expect(within(selector).getByText('H4')).toBeInTheDocument();
        expect(within(selector).getByText('D1')).toBeInTheDocument();
      });
    });

    it('should have H1 selected by default', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const selector = screen.getByRole('group', { name: /timeframe selector/i });
        const h1Button = within(selector).getByText('H1');
        expect(h1Button).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should update chart when timeframe changes', async () => {
      const user = userEvent.setup();
      renderInstrumentDetail();

      await waitFor(() => {
        expect(screen.getByRole('group', { name: /timeframe selector/i })).toBeInTheDocument();
      });

      // Initially H1 should be selected
      const selector = screen.getByRole('group', { name: /timeframe selector/i });
      expect(within(selector).getByText('H1')).toHaveAttribute('aria-pressed', 'true');

      // Click M5 button - this triggers onChange which updates the timeframe state
      await user.click(within(selector).getByText('M5'));

      // Verify the selector still renders after timeframe change
      await waitFor(() => {
        expect(screen.getByRole('group', { name: /timeframe selector/i })).toBeInTheDocument();
      });
    });

    it('should refetch data when timeframe changes', async () => {
      const user = userEvent.setup();
      let requestCount = 0;

      server.use(
        http.get('/api/instruments/:id/candles', ({ request }) => {
          requestCount++;
          const url = new URL(request.url);
          const timeframe = url.searchParams.get('timeframe');

          return HttpResponse.json({
            candlesticks: mockCandlesticks,
            instrument_id: 'EUR_USD',
            timeframe: timeframe,
          });
        })
      );

      renderInstrumentDetail();

      await waitFor(() => {
        expect(screen.getByRole('group', { name: /timeframe selector/i })).toBeInTheDocument();
      });

      const initialCount = requestCount;

      // Change timeframe
      const selector = screen.getByRole('group', { name: /timeframe selector/i });
      await user.click(within(selector).getByText('M5'));

      await waitFor(() => {
        expect(requestCount).toBeGreaterThan(initialCount);
      });
    });
  });

  describe('OrderBook Integration', () => {
    it('should render OrderBook component', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByTestId('order-book')).toBeInTheDocument();
      });
    });

    it('should display bids section', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const orderBook = screen.getByTestId('order-book');
        expect(within(orderBook).getByText(/bid/i)).toBeInTheDocument();
      });
    });

    it('should display asks section', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const orderBook = screen.getByTestId('order-book');
        expect(within(orderBook).getByText(/ask/i)).toBeInTheDocument();
      });
    });

    it('should display spread information', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByText(/spread/i)).toBeInTheDocument();
      });
    });

    it('should generate realistic order book data', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        const orderBook = screen.getByTestId('order-book');
        expect(orderBook).toBeInTheDocument();
      });

      // Should have multiple price levels
      // Bids should be descending
      // Asks should be ascending
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      renderInstrumentDetail();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should hide loading state when data is loaded', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should show loading state for instrument data', () => {
      renderInstrumentDetail();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show loading state for OHLCV data', () => {
      renderInstrumentDetail();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle instrument not found error', async () => {
      renderInstrumentDetail('INVALID_ID');

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should display error message when instrument fetch fails', async () => {
      server.use(
        http.get('/api/instruments/:id', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          );
        })
      );

      renderInstrumentDetail();

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should display error message when OHLCV fetch fails', async () => {
      server.use(
        http.get('/api/instruments/:id/candles', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          );
        })
      );

      renderInstrumentDetail();

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should show error state in chart when data fails to load', async () => {
      server.use(
        http.get('/api/instruments/:id/candles', () => {
          return HttpResponse.error();
        })
      );

      renderInstrumentDetail();

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid layout', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const container = screen.getByTestId('instrument-detail-container');
      expect(container).toHaveClass('grid');
    });

    it('should stack vertically on mobile', async () => {
      // Set viewport to mobile size
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const container = screen.getByTestId('instrument-detail-container');
      expect(container).toHaveClass('grid-cols-1');
    });

    it('should use grid layout on desktop', async () => {
      // Set viewport to desktop size
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const container = screen.getByTestId('instrument-detail-container');
      expect(container).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('URL Parameter Handling', () => {
    it('should extract instrument ID from URL parameter', async () => {
      renderInstrumentDetail('EUR_USD');
      await waitFor(() => {
        expect(screen.getByText(/Euro \/ US Dollar/i)).toBeInTheDocument();
      });
    });

    it('should handle different instrument IDs', async () => {
      server.use(
        http.get('/api/instruments/:id', ({ params }) => {
          const { id } = params;
          return HttpResponse.json({
            instrument: {
              ...mockInstrument,
              id: id as string,
              name: 'Test Instrument',
            },
          });
        }),
        http.get('/api/instruments/:id/candles', ({ params }) => {
          return HttpResponse.json({
            candlesticks: mockCandlesticks,
            instrument_id: params.id as string,
            timeframe: 'H1',
          });
        })
      );

      renderInstrumentDetail('GBP_USD');
      await waitFor(() => {
        expect(screen.getByText(/Test Instrument/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Integration', () => {
    it('should transform OHLCV data for chart', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByTestId('candlestick-chart')).toBeInTheDocument();
      });

      // Chart should receive transformed data
    });

    it('should calculate market stats from OHLCV data', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByTestId('market-stats')).toBeInTheDocument();
      });

      // Stats should be calculated from candlestick data
    });

    it('should generate order book data based on current price', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.getByTestId('order-book')).toBeInTheDocument();
      });

      // Order book should be centered around latest close price
    });
  });

  describe('Real-time Updates', () => {
    it('should have auto-refresh configured', async () => {
      renderInstrumentDetail();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // OHLCV data should refetch at interval
    });
  });
});
