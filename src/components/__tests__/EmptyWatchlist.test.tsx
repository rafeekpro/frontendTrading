/**
 * EmptyWatchlist Component Tests
 * RED Phase: Tests written BEFORE implementation
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { EmptyWatchlist } from '../EmptyWatchlist';
import { describe, it, expect, vi } from 'vitest';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EmptyWatchlist', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should display empty state message', () => {
    render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
  });

  it('should display helpful description text', () => {
    render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/start adding instruments to your watchlist/i)
    ).toBeInTheDocument();
  });

  it('should display star icon', () => {
    render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    // Star icon should be present (using role or test-id)
    const starIcon = screen.getByTestId('star-icon');
    expect(starIcon).toBeInTheDocument();
  });

  it('should display "Browse Instruments" button', () => {
    render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /browse instruments/i });
    expect(button).toBeInTheDocument();
  });

  it('should navigate to dashboard when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /browse instruments/i });
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should have accessible structure', () => {
    render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    // Check for heading
    const heading = screen.getByRole('heading', { name: /your watchlist is empty/i });
    expect(heading).toBeInTheDocument();

    // Check button is focusable
    const button = screen.getByRole('button', { name: /browse instruments/i });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should apply dark theme styling', () => {
    const { container } = render(
      <BrowserRouter>
        <EmptyWatchlist />
      </BrowserRouter>
    );

    // Check for dark background class
    const darkBgElement = container.querySelector('.bg-gray-900');
    expect(darkBgElement).toBeInTheDocument();
  });
});
