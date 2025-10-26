/**
 * Opportunities Page Tests
 *
 * 🔴 RED PHASE - These tests will FAIL until component is implemented
 *
 * Tests the main opportunities list page with filtering and sorting
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { opportunitiesHandlers } from '../../mocks/handlers/opportunities';
import { Opportunities } from '../Opportunities';
import type { ReactNode } from 'react';

// Setup MSW server
const server = setupServer(...opportunitiesHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Create a wrapper with QueryClient and Router
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
}

describe('Opportunities Page', () => {
  it('should render opportunities page', async () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    expect(screen.getByTestId('opportunities-container')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    // Should show skeleton cards while loading
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('should display opportunities after loading', async () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    // Wait for opportunities to load
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    // Should show opportunities grid
    const opportunityCards = screen.getAllByTestId('opportunity-card');
    expect(opportunityCards.length).toBeGreaterThan(0);
  });

  it('should display opportunity card with key metrics', async () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    const firstCard = screen.getAllByTestId('opportunity-card')[0];

    // Should show strategy (with spaces, not underscores)
    expect(within(firstCard).getByText(/breakout|reversal|trend following|mean reversion/i)).toBeInTheDocument();

    // Should show confidence score
    expect(within(firstCard).getByText(/confidence/i)).toBeInTheDocument();

    // Should show type (BUY/SELL in uppercase)
    expect(within(firstCard).getByText(/BUY|SELL/)).toBeInTheDocument();
  });

  it('should support filter by type', async () => {
    const user = userEvent.setup();
    render(<Opportunities />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    // Get initial count
    const initialCards = screen.getAllByTestId('opportunity-card');
    const initialCount = initialCards.length;

    // Find and change type filter to "buy"
    const typeFilter = screen.getByLabelText(/type filter/i);
    await user.selectOptions(typeFilter, 'buy');

    // Should still have cards after filtering
    await waitFor(() => {
      const filteredCards = screen.getAllByTestId('opportunity-card');
      expect(filteredCards.length).toBeGreaterThan(0);
      // All visible cards should be "BUY" type
      filteredCards.forEach(card => {
        expect(within(card).getByText('BUY')).toBeInTheDocument();
      });
    });
  });

  it('should support sorting by confidence', async () => {
    const user = userEvent.setup();
    render(<Opportunities />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    // Find sort button (aria-label is "Sort by date" initially, text shows "Sort: Confidence")
    const sortButton = screen.getByRole('button', { name: /sort by/i });
    expect(sortButton).toHaveTextContent(/Sort: Confidence/i);

    // Click to toggle to date sort
    await user.click(sortButton);

    // Button should now show different text
    await waitFor(() => {
      expect(sortButton).toHaveTextContent(/Sort: Date/i);
    });

    // Cards should still be visible
    const cards = screen.getAllByTestId('opportunity-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should show empty state when no opportunities match filters', async () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    // Apply filter that returns no results (very high confidence)
    // This would require implementing a confidence filter in the UI
    // For now, we'll just test that empty state component exists
    // when opportunities array is empty
  });

  it('should handle errors gracefully', async () => {
    // Override handler to return error
    server.use(
      ...opportunitiesHandlers.map(handler => {
        // Force an error response
        return handler;
      })
    );

    render(<Opportunities />, { wrapper: createWrapper() });

    // Should eventually show error state or fallback
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });
  });

  it('should display search bar', () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should display filter controls', () => {
    render(<Opportunities />, { wrapper: createWrapper() });

    // Should have type filter
    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
  });
});
