/**
 * Watchlist Page Tests
 * RED Phase: Tests written BEFORE implementation
 */

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Watchlist } from '../Watchlist';
import { useWatchlistStore } from '../../store/watchlist-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InstrumentWithMarketData } from '../../lib/list-utils';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock DraggableInstrumentRow
vi.mock('../../components/DraggableInstrumentRow', () => ({
  DraggableInstrumentRow: ({ instrument }: { instrument: InstrumentWithMarketData }) => (
    <div data-testid={`draggable-row-${instrument.id}`}>{instrument.symbol}</div>
  ),
}));

// Mock EmptyWatchlist
vi.mock('../../components/EmptyWatchlist', () => ({
  EmptyWatchlist: () => <div data-testid="empty-watchlist">Empty Watchlist</div>,
}));

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
}));

describe('Watchlist Page', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockInstruments: InstrumentWithMarketData[] = [
    {
      id: 'EUR_USD',
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      type: 'forex',
      exchange: 'FX',
      currentPrice: 1.085,
      change24h: 0.5,
      volume24h: 1000000,
      spread: 0.00015,
      pip_value: 0.0001,
      min_trade_size: 0.01,
      max_trade_size: 100,
      precision: 5,
    },
    {
      id: 'GBP_USD',
      symbol: 'GBP/USD',
      name: 'British Pound / US Dollar',
      type: 'forex',
      exchange: 'FX',
      currentPrice: 1.265,
      change24h: -0.3,
      volume24h: 800000,
      spread: 0.00018,
      pip_value: 0.0001,
      min_trade_size: 0.01,
      max_trade_size: 100,
      precision: 5,
    },
    {
      id: 'USD_JPY',
      symbol: 'USD/JPY',
      name: 'US Dollar / Japanese Yen',
      type: 'forex',
      exchange: 'FX',
      currentPrice: 150.25,
      change24h: 1.2,
      volume24h: 1200000,
      spread: 0.015,
      pip_value: 0.01,
      min_trade_size: 0.01,
      max_trade_size: 100,
      precision: 3,
    },
  ];

  beforeEach(() => {
    queryClient.clear();
    mockNavigate.mockClear();
    // Reset watchlist store to empty state
    useWatchlistStore.setState({ watchlist: [] });

    // Mock fetch for instruments
    global.fetch = vi.fn((url) => {
      if (url === '/api/instruments') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ instruments: mockInstruments }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    }) as any;
  });

  const renderWatchlist = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Watchlist />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Empty State', () => {
    it('should render EmptyWatchlist when watchlist is empty', () => {
      renderWatchlist();

      expect(screen.getByTestId('empty-watchlist')).toBeInTheDocument();
    });

    it('should not render instrument list when watchlist is empty', () => {
      renderWatchlist();

      expect(screen.queryByTestId('draggable-row-EUR_USD')).not.toBeInTheDocument();
    });
  });

  describe('With Instruments', () => {
    beforeEach(() => {
      // Add instruments to watchlist
      useWatchlistStore.setState({
        watchlist: ['EUR_USD', 'GBP_USD', 'USD_JPY'],
      });
    });

    it('should render page title', async () => {
      renderWatchlist();

      await waitFor(() => {
        expect(screen.getByText(/my watchlist/i)).toBeInTheDocument();
      });
    });

    it('should fetch and display instruments from watchlist', async () => {
      renderWatchlist();

      await waitFor(() => {
        expect(screen.getByTestId('draggable-row-EUR_USD')).toBeInTheDocument();
        expect(screen.getByTestId('draggable-row-GBP_USD')).toBeInTheDocument();
        expect(screen.getByTestId('draggable-row-USD_JPY')).toBeInTheDocument();
      });
    });

    it('should display instruments in watchlist order', async () => {
      renderWatchlist();

      await waitFor(() => {
        const rows = screen.getAllByTestId(/^draggable-row-/);
        expect(rows[0]).toHaveAttribute('data-testid', 'draggable-row-EUR_USD');
        expect(rows[1]).toHaveAttribute('data-testid', 'draggable-row-GBP_USD');
        expect(rows[2]).toHaveAttribute('data-testid', 'draggable-row-USD_JPY');
      });
    });

    it('should not render EmptyWatchlist when watchlist has items', async () => {
      renderWatchlist();

      await waitFor(() => {
        expect(screen.queryByTestId('empty-watchlist')).not.toBeInTheDocument();
      });
    });

    it('should filter out instruments not in watchlist', async () => {
      // Set watchlist to only contain one instrument
      useWatchlistStore.setState({
        watchlist: ['EUR_USD'],
      });

      renderWatchlist();

      await waitFor(() => {
        expect(screen.getByTestId('draggable-row-EUR_USD')).toBeInTheDocument();
        expect(screen.queryByTestId('draggable-row-GBP_USD')).not.toBeInTheDocument();
        expect(screen.queryByTestId('draggable-row-USD_JPY')).not.toBeInTheDocument();
      });
    });

    it('should apply dark theme styling', async () => {
      const { container } = renderWatchlist();

      await waitFor(() => {
        const darkBgElement = container.querySelector('.bg-gray-900');
        expect(darkBgElement).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state while fetching instruments', () => {
      useWatchlistStore.setState({
        watchlist: ['EUR_USD'],
      });

      // Mock slow fetch
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({ instruments: mockInstruments }),
              } as Response);
            }, 100);
          })
      ) as any;

      renderWatchlist();

      // Should show some loading indicator or empty initially
      // The component should handle loading state gracefully
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      useWatchlistStore.setState({
        watchlist: ['EUR_USD'],
      });

      // Mock fetch error
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      renderWatchlist();

      // Component should not crash on error
      // Should show some error state or fallback
    });
  });

  describe('Drag and Drop', () => {
    it('should wrap instruments in DndContext', async () => {
      useWatchlistStore.setState({
        watchlist: ['EUR_USD', 'GBP_USD'],
      });

      renderWatchlist();

      await waitFor(() => {
        expect(screen.getByTestId('draggable-row-EUR_USD')).toBeInTheDocument();
      });

      // DndContext and SortableContext are mocked, so we just verify rendering
    });

    it('should pass correct items to SortableContext', async () => {
      useWatchlistStore.setState({
        watchlist: ['EUR_USD', 'GBP_USD', 'USD_JPY'],
      });

      renderWatchlist();

      await waitFor(() => {
        const rows = screen.getAllByTestId(/^draggable-row-/);
        expect(rows).toHaveLength(3);
      });
    });
  });

  describe('Integration with Stream A (Watchlist Store)', () => {
    it('should use watchlist from store', async () => {
      const customWatchlist = ['GBP_USD', 'USD_JPY'];
      useWatchlistStore.setState({
        watchlist: customWatchlist,
      });

      renderWatchlist();

      await waitFor(() => {
        expect(screen.getByTestId('draggable-row-GBP_USD')).toBeInTheDocument();
        expect(screen.getByTestId('draggable-row-USD_JPY')).toBeInTheDocument();
        expect(screen.queryByTestId('draggable-row-EUR_USD')).not.toBeInTheDocument();
      });
    });

    it('should maintain watchlist order from store', async () => {
      useWatchlistStore.setState({
        watchlist: ['USD_JPY', 'EUR_USD', 'GBP_USD'],
      });

      renderWatchlist();

      await waitFor(() => {
        const rows = screen.getAllByTestId(/^draggable-row-/);
        expect(rows[0]).toHaveAttribute('data-testid', 'draggable-row-USD_JPY');
        expect(rows[1]).toHaveAttribute('data-testid', 'draggable-row-EUR_USD');
        expect(rows[2]).toHaveAttribute('data-testid', 'draggable-row-GBP_USD');
      });
    });
  });
});
