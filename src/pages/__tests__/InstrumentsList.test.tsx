/**
 * InstrumentsList Page - Integration Tests
 * RED PHASE: Comprehensive tests for InstrumentsList page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { InstrumentsList } from '../InstrumentsList';
import type { Instrument } from '../../types/trading';
import type { InstrumentWithMarketData } from '../../lib/list-utils';

// Mock @tanstack/react-virtual for JSDOM testing
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => {
    // Mock virtualizer that renders all items (no actual virtualization in tests)
    const items = Array.from({ length: count }, (_, index) => ({
      key: index,
      index,
      start: index * 60,
      size: 60,
    }));

    return {
      getTotalSize: () => count * 60,
      getVirtualItems: () => items,
      measureElement: () => {},
    };
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock watchlist store
const mockWatchlistStore = {
  watchlist: ['inst-1', 'inst-3'],
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
  isInWatchlist: vi.fn((id: string) => ['inst-1', 'inst-3'].includes(id)),
};

vi.mock('../../hooks/use-watchlist', () => ({
  useWatchlist: () => mockWatchlistStore,
}));

// Create test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock instruments data
const mockInstruments: InstrumentWithMarketData[] = [
  {
    id: 'inst-1',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    type: 'forex',
    spread: 0.00015,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
    exchange: 'FOREX',
    currentPrice: 1.0850,
    change24h: 0.25,
    volume24h: 1500000,
  },
  {
    id: 'inst-2',
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    type: 'crypto',
    spread: 0.5,
    pip_value: 1.0,
    min_trade_size: 0.001,
    max_trade_size: 10,
    precision: 2,
    exchange: 'CRYPTO',
    currentPrice: 45000.0,
    change24h: -2.5,
    volume24h: 25000000,
  },
  {
    id: 'inst-3',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    spread: 0.01,
    pip_value: 0.01,
    min_trade_size: 1,
    max_trade_size: 1000,
    precision: 2,
    exchange: 'NASDAQ',
    currentPrice: 175.5,
    change24h: 1.2,
    volume24h: 50000000,
  },
  {
    id: 'inst-4',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    type: 'forex',
    spread: 0.0002,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
    exchange: 'FOREX',
    currentPrice: 1.2650,
    change24h: -0.5,
    volume24h: 1200000,
  },
  {
    id: 'inst-5',
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    type: 'crypto',
    spread: 0.2,
    pip_value: 0.01,
    min_trade_size: 0.01,
    max_trade_size: 50,
    precision: 2,
    exchange: 'CRYPTO',
    currentPrice: 2500.0,
    change24h: 3.8,
    volume24h: 15000000,
  },
];

describe('InstrumentsList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Data Fetching', () => {
    it('should display loading state initially', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<InstrumentsList />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should fetch and display instruments', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
        expect(screen.getByText('BTC/USD')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
    });

    it('should display error state on fetch failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no instruments', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: [] }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no instruments/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should render search bar', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });

    it('should filter instruments by search term', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'EUR');

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(screen.getByText('EUR/USD')).toBeInTheDocument();
          expect(screen.queryByText('BTC/USD')).not.toBeInTheDocument();
          expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should search by instrument name', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Apple');

      await waitFor(
        () => {
          expect(screen.getByText('AAPL')).toBeInTheDocument();
          expect(screen.queryByText('EUR/USD')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should clear search filter', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'EUR');

      await waitFor(
        () => {
          expect(screen.queryByText('BTC/USD')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const clearButton = screen.getByLabelText(/clear search/i);
      await user.click(clearButton);

      // Wait for debounce to clear and all instruments to re-appear
      await waitFor(
        () => {
          expect(screen.getByText('EUR/USD')).toBeInTheDocument();
          expect(screen.getByText('BTC/USD')).toBeInTheDocument();
          expect(screen.getByText('AAPL')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('Filter Functionality', () => {
    it('should render type filter dropdown', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/filter instruments by type/i)).toBeInTheDocument();
      });
    });

    it('should filter by forex type', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const filterButton = screen.getByLabelText(/filter instruments by type/i);
      await user.click(filterButton);

      const forexOption = screen.getByRole('menuitemradio', { name: /forex/i });
      await user.click(forexOption);

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
        expect(screen.getByText('GBP/USD')).toBeInTheDocument();
        expect(screen.queryByText('BTC/USD')).not.toBeInTheDocument();
        expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
      });
    });

    it('should filter by crypto type', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('BTC/USD')).toBeInTheDocument();
      });

      const filterButton = screen.getByLabelText(/filter instruments by type/i);
      await user.click(filterButton);

      const cryptoOption = screen.getByRole('menuitemradio', { name: /crypto/i });
      await user.click(cryptoOption);

      await waitFor(() => {
        expect(screen.getByText('BTC/USD')).toBeInTheDocument();
        expect(screen.getByText('ETH/USD')).toBeInTheDocument();
        expect(screen.queryByText('EUR/USD')).not.toBeInTheDocument();
        expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
      });
    });

    it('should filter by stocks type', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });

      const filterButton = screen.getByLabelText(/filter instruments by type/i);
      await user.click(filterButton);

      const stocksOption = screen.getByRole('menuitemradio', { name: /stocks/i });
      await user.click(stocksOption);

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.queryByText('EUR/USD')).not.toBeInTheDocument();
        expect(screen.queryByText('BTC/USD')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    it('should render sort buttons', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Symbol button is active by default, so has "sorted ascending" label
        expect(screen.getByLabelText(/symbol.*sorted ascending/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sort by name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sort by price/i)).toBeInTheDocument();
      });
    });

    it('should default sort by symbol ascending', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const rows = screen.getAllByRole('button', { name: /view details/i });
        expect(rows[0]).toHaveTextContent('AAPL');
        expect(rows[1]).toHaveTextContent('BTC/USD');
        expect(rows[2]).toHaveTextContent('ETH/USD');
      });
    });

    it('should sort by price ascending', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const priceSortButton = screen.getByLabelText(/sort by price/i);
      await user.click(priceSortButton);

      await waitFor(
        () => {
          const rows = screen.getAllByRole('button', { name: /view details/i });
          expect(rows[0]).toHaveTextContent('EUR/USD'); // 1.0850
          expect(rows[1]).toHaveTextContent('GBP/USD'); // 1.2650
          expect(rows[2]).toHaveTextContent('AAPL'); // 175.5
        },
        { timeout: 500 }
      );
    });

    it('should toggle sort direction', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      // Symbol is already sorted ascending by default
      // First click should toggle to descending (since it's already active)
      const symbolSortButton = screen.getByLabelText(/symbol.*sorted ascending/i);
      await user.click(symbolSortButton);

      await waitFor(() => {
        const rows = screen.getAllByRole('button', { name: /view details/i });
        expect(rows[0]).toHaveTextContent('GBP/USD');
        expect(rows[4]).toHaveTextContent('AAPL');
      });

      // Second click should toggle back to ascending
      const symbolSortButtonDesc = screen.getByLabelText(/symbol.*sorted descending/i);
      await user.click(symbolSortButtonDesc);

      await waitFor(() => {
        const rows = screen.getAllByRole('button', { name: /view details/i });
        expect(rows[0]).toHaveTextContent('AAPL');
      });
    });
  });

  describe('Virtual Scrolling', () => {
    it('should render virtual list container', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('virtual-list-container')).toBeInTheDocument();
      });
    });

    it('should render all visible instrument rows', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const rows = screen.getAllByRole('button', { name: /view details/i });
        expect(rows.length).toBe(5);
      });
    });
  });

  describe('Row Navigation', () => {
    it('should navigate to instrument detail on row click', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const row = screen.getByRole('button', { name: /view details for EUR\/USD/i });
      await user.click(row);

      expect(mockNavigate).toHaveBeenCalledWith('/instrument/inst-1');
    });
  });

  describe('Watchlist Integration', () => {
    it('should display watchlist stars', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        const stars = screen.getAllByLabelText(/watchlist/i);
        expect(stars.length).toBeGreaterThan(0);
      });
    });

    it('should show filled star for instruments in watchlist', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        // EUR/USD (inst-1) is already in watchlist mock, so label is "Remove"
        const removeStar = screen.getByLabelText(/remove EUR\/USD from watchlist/i);
        expect(removeStar).toHaveClass('fill-yellow-400');
      });
    });

    it('should toggle watchlist on star click', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('BTC/USD')).toBeInTheDocument();
      });

      const star = screen.getByLabelText(/add BTC\/USD to watchlist/i);
      await user.click(star);

      expect(mockWatchlistStore.addToWatchlist).toHaveBeenCalledWith('inst-2');
    });

    it('should remove from watchlist on star click', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const star = screen.getByLabelText(/remove EUR\/USD from watchlist/i);
      await user.click(star);

      expect(mockWatchlistStore.removeFromWatchlist).toHaveBeenCalledWith('inst-1');
    });
  });

  describe('Combined Filters', () => {
    it('should apply search and type filter together', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      // Apply type filter
      const filterButton = screen.getByLabelText(/filter instruments by type/i);
      await user.click(filterButton);
      const forexOption = screen.getByRole('menuitemradio', { name: /forex/i });
      await user.click(forexOption);

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'GBP');

      await waitFor(
        () => {
          expect(screen.getByText('GBP/USD')).toBeInTheDocument();
          expect(screen.queryByText('EUR/USD')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('Page Layout', () => {
    it('should display page title', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /all instruments/i })).toBeInTheDocument();
      });
    });

    it('should have dark theme styling', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instruments: mockInstruments }),
      });

      const { container } = render(<InstrumentsList />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('EUR/USD')).toBeInTheDocument();
      });

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('bg-gray-900');
    });
  });
});
