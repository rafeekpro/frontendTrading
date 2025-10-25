/**
 * Tests for Dashboard page
 * Integration tests for the main Dashboard page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '../Dashboard';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Wrapper component for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Helper to render Dashboard with wrapper
function renderDashboard() {
  return render(<Dashboard />, { wrapper: TestWrapper });
}

describe('Dashboard', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  describe('page structure', () => {
    it('should render QuickStats section', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total P&L')).toBeInTheDocument();
        expect(screen.getByText('Open Positions')).toBeInTheDocument();
        expect(screen.getByText('Active Alerts')).toBeInTheDocument();
      });
    });

    it('should render SearchBar component', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search instruments...')
        ).toBeInTheDocument();
      });
    });

    it('should render FilterDropdown component', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('All Instruments')).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton cards while fetching data', () => {
      renderDashboard();

      // Should show skeleton cards immediately
      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not show instrument cards during loading', () => {
      renderDashboard();

      // Should not have any instrument cards yet
      const instrumentCards = screen.queryAllByTestId('instrument-card');
      expect(instrumentCards).toHaveLength(0);
    });
  });

  describe('data fetching', () => {
    it('should display instrument cards after data loads', async () => {
      renderDashboard();

      // Wait for loading to complete and cards to appear
      await waitFor(() => {
        const cards = screen.queryAllByRole('button', {
          name: /View details for/i,
        });
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should display instrument symbols', async () => {
      renderDashboard();

      await waitFor(() => {
        // Should show at least some instruments from mock data
        expect(screen.getByText(/EUR\/USD|BTC\/USD|AAPL/)).toBeInTheDocument();
      });
    });

    it('should render grid layout with responsive classes', async () => {
      renderDashboard();

      await waitFor(() => {
        const grid = screen.getByTestId('instruments-grid');
        expect(grid).toHaveClass('grid');
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('md:grid-cols-2');
        expect(grid).toHaveClass('lg:grid-cols-3');
      });
    });
  });

  describe('search functionality', () => {
    it('should filter instruments by search query', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText('Search instruments...');
      await user.type(searchInput, 'EUR');

      // Wait for debounce and filtering
      await waitFor(
        () => {
          const cards = screen.getAllByRole('button', {
            name: /View details for/i,
          });
          // Should only show EUR-related instruments
          expect(cards.length).toBeLessThan(5);
        },
        { timeout: 500 }
      );
    });

    it('should show empty state when no instruments match search', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Search for non-existent instrument
      const searchInput = screen.getByPlaceholderText('Search instruments...');
      await user.type(searchInput, 'xyz123nonexistent');

      // Wait for debounce and filtering
      await waitFor(
        () => {
          expect(screen.getByTestId('empty-state')).toBeInTheDocument();
          expect(screen.getByText('No instruments found')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should clear search when clear button clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search instruments...');
      await user.type(searchInput, 'EUR');

      // Click clear button
      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Should show all instruments again
      await waitFor(() => {
        const cards = screen.getAllByRole('button', {
          name: /View details for/i,
        });
        expect(cards.length).toBeGreaterThan(2);
      });
    });
  });

  describe('filter functionality', () => {
    it('should filter instruments by type (forex)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Open filter dropdown
      const filterButton = screen.getByText('All Instruments');
      await user.click(filterButton);

      // Click forex option
      const forexOption = screen.getByRole('menuitemradio', { name: /Forex/i });
      await user.click(forexOption);

      // Should only show forex instruments
      await waitFor(() => {
        const cards = screen.getAllByRole('button', {
          name: /View details for/i,
        });
        expect(cards.length).toBeGreaterThan(0);
        expect(cards.length).toBeLessThan(10);
      });
    });

    it('should filter instruments by type (crypto)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Open filter dropdown
      const filterButton = screen.getByText('All Instruments');
      await user.click(filterButton);

      // Click crypto option
      const cryptoOption = screen.getByRole('menuitemradio', {
        name: /Crypto/i,
      });
      await user.click(cryptoOption);

      // Should only show crypto instruments
      await waitFor(() => {
        const cards = screen.getAllByRole('button', {
          name: /View details for/i,
        });
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should show empty state for favorites (not yet implemented)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Open filter dropdown
      const filterButton = screen.getByText('All Instruments');
      await user.click(filterButton);

      // Click favorites option
      const favoritesOption = screen.getByRole('menuitemradio', {
        name: /Favorites/i,
      });
      await user.click(favoritesOption);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('combined search and filter', () => {
    it('should apply both search and filter together', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Apply forex filter
      const filterButton = screen.getByText('All Instruments');
      await user.click(filterButton);
      const forexOption = screen.getByRole('menuitemradio', { name: /Forex/i });
      await user.click(forexOption);

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search instruments...');
      await user.type(searchInput, 'EUR');

      // Should show only EUR forex instruments
      await waitFor(
        () => {
          const cards = screen.getAllByRole('button', {
            name: /View details for/i,
          });
          expect(cards.length).toBeGreaterThan(0);
          expect(cards.length).toBeLessThan(5);
        },
        { timeout: 500 }
      );
    });
  });

  describe('empty state', () => {
    it('should show empty state message', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments and search for non-existent
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      const searchInput = screen.getByPlaceholderText('Search instruments...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(
        () => {
          expect(screen.getByText('No instruments found')).toBeInTheDocument();
          expect(
            screen.getByText(/Try adjusting your search or filters/i)
          ).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('navigation', () => {
    it('should navigate when instrument card is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Wait for instruments to load
      await waitFor(() => {
        expect(screen.queryAllByRole('button', { name: /View details for/i }))
          .length > 0;
      });

      // Click first instrument card
      const firstCard = screen.getAllByRole('button', {
        name: /View details for/i,
      })[0];
      await user.click(firstCard);

      // Should navigate to instrument detail page
      // (in real app, would check router location)
      expect(window.location.pathname).toContain('/instrument/');
    });
  });

  describe('QuickStats integration', () => {
    it('should display mock P&L value', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/\$1,250\.75/)).toBeInTheDocument();
      });
    });

    it('should display mock open positions count', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('should display mock active alerts count', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('responsive design', () => {
    it('should have proper container classes', async () => {
      renderDashboard();

      await waitFor(() => {
        const container = screen.getByTestId('dashboard-container');
        expect(container).toHaveClass('min-h-screen');
        expect(container).toHaveClass('bg-gray-900');
        expect(container).toHaveClass('p-6');
      });
    });
  });
});
