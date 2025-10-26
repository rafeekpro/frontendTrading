/**
 * Results Page Tests
 * RED PHASE: These tests should FAIL until we implement the page
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { resultsHandlers } from '../../mocks/handlers/results';
import { BrowserRouter } from 'react-router-dom';
import Results from '../Results';
import type { ReactNode } from 'react';

// Setup MSW server
const server = setupServer(...resultsHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test wrapper with providers
function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Results Page', () => {
  it('should render page title', () => {
    render(<Results />, { wrapper: TestWrapper });

    expect(screen.getByText(/Results & Analytics/i)).toBeInTheDocument();
  });

  it('should display trading results metrics', async () => {
    render(<Results />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/Total Trades/i)).toBeInTheDocument();
      expect(screen.getByText(/Total P&L/i)).toBeInTheDocument();
      expect(screen.getByText(/Win Rate/i)).toBeInTheDocument();
    });
  });

  it('should display performance metrics', async () => {
    render(<Results />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/Sharpe Ratio/i)).toBeInTheDocument();
      expect(screen.getByText(/Max Drawdown/i)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(<Results />, { wrapper: TestWrapper });

    // Loading indicators should be present
    expect(screen.getByText(/loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
  });
});
