/**
 * Tests for InstrumentRow component
 * Individual row component for instruments list
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstrumentRow, type InstrumentRowProps } from '../InstrumentRow';
import type { InstrumentWithMarketData } from '../../lib/list-utils';

describe('InstrumentRow', () => {
  const mockInstrument: InstrumentWithMarketData = {
    id: 'FOREX_EUR_USD',
    name: 'Euro / US Dollar',
    symbol: 'EUR/USD',
    type: 'forex',
    spread: 0.00015,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
    exchange: 'FOREX',
    currentPrice: 1.0856,
    change24h: 0.25,
    volume24h: 1250000,
  };

  const defaultProps: InstrumentRowProps = {
    instrument: mockInstrument,
    onNavigate: vi.fn(),
    onToggleWatchlist: vi.fn(),
    inWatchlist: false,
  };

  it('should render instrument symbol', () => {
    render(<InstrumentRow {...defaultProps} />);

    expect(screen.getByText('EUR/USD')).toBeInTheDocument();
  });

  it('should render instrument name', () => {
    render(<InstrumentRow {...defaultProps} />);

    expect(screen.getByText('Euro / US Dollar')).toBeInTheDocument();
  });

  it('should render instrument type', () => {
    render(<InstrumentRow {...defaultProps} />);

    expect(screen.getByText(/forex/i)).toBeInTheDocument();
  });

  it('should render current price', () => {
    render(<InstrumentRow {...defaultProps} />);

    expect(screen.getByText('1.08560')).toBeInTheDocument();
  });

  it('should render 24h change percentage', () => {
    render(<InstrumentRow {...defaultProps} />);

    expect(screen.getByText('+0.25%')).toBeInTheDocument();
  });

  it('should render 24h volume', () => {
    render(<InstrumentRow {...defaultProps} />);

    // Volume formatted as 1.25M
    expect(screen.getByText(/1\.25M/i)).toBeInTheDocument();
  });

  it('should display positive change in green', () => {
    render(<InstrumentRow {...defaultProps} />);

    const changeElement = screen.getByText('+0.25%');
    expect(changeElement).toHaveClass(/text-green/);
  });

  it('should display negative change in red', () => {
    const negativeInstrument = {
      ...mockInstrument,
      change24h: -1.45,
    };

    render(<InstrumentRow {...defaultProps} instrument={negativeInstrument} />);

    const changeElement = screen.getByText('-1.45%');
    expect(changeElement).toHaveClass(/text-red/);
  });

  it('should display neutral change in gray', () => {
    const neutralInstrument = {
      ...mockInstrument,
      change24h: 0,
    };

    render(<InstrumentRow {...defaultProps} instrument={neutralInstrument} />);

    const changeElement = screen.getByText('0.00%');
    expect(changeElement).toHaveClass(/text-gray/);
  });

  it('should show empty star when not in watchlist', () => {
    render(<InstrumentRow {...defaultProps} inWatchlist={false} />);

    // Look for star button
    const starButton = screen.getByRole('button', { name: /watchlist/i });
    expect(starButton).toBeInTheDocument();

    // Check for empty star (not filled)
    const svg = starButton.querySelector('svg');
    expect(svg).not.toHaveClass(/fill-yellow/);
  });

  it('should show filled star when in watchlist', () => {
    render(<InstrumentRow {...defaultProps} inWatchlist={true} />);

    const starButton = screen.getByRole('button', { name: /watchlist/i });
    const svg = starButton.querySelector('svg');

    // Filled star should have fill class
    expect(svg).toHaveClass(/fill-yellow/);
  });

  it('should call onNavigate when row is clicked', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();

    render(<InstrumentRow {...defaultProps} onNavigate={handleNavigate} />);

    // Click the row (not the star button)
    const row = screen.getByRole('button', { name: /view details/i });
    await user.click(row);

    expect(handleNavigate).toHaveBeenCalledWith('FOREX_EUR_USD');
  });

  it('should call onToggleWatchlist when star is clicked', async () => {
    const user = userEvent.setup();
    const handleToggleWatchlist = vi.fn();

    render(<InstrumentRow {...defaultProps} onToggleWatchlist={handleToggleWatchlist} />);

    const starButton = screen.getByRole('button', { name: /watchlist/i });
    await user.click(starButton);

    expect(handleToggleWatchlist).toHaveBeenCalledWith('FOREX_EUR_USD');
  });

  it('should not navigate when star button is clicked', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();
    const handleToggleWatchlist = vi.fn();

    render(
      <InstrumentRow
        {...defaultProps}
        onNavigate={handleNavigate}
        onToggleWatchlist={handleToggleWatchlist}
      />
    );

    const starButton = screen.getByRole('button', { name: /watchlist/i });
    await user.click(starButton);

    // Star click should NOT trigger navigation
    expect(handleNavigate).not.toHaveBeenCalled();
    expect(handleToggleWatchlist).toHaveBeenCalled();
  });

  it('should have hover highlight effect', () => {
    render(<InstrumentRow {...defaultProps} />);

    const row = screen.getByRole('button', { name: /view details/i });
    expect(row).toHaveClass(/hover:bg-/);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();

    render(<InstrumentRow {...defaultProps} onNavigate={handleNavigate} />);

    // Tab to row
    await user.tab();
    const row = screen.getByRole('button', { name: /view details/i });
    expect(row).toHaveFocus();

    // Press Enter to navigate
    await user.keyboard('{Enter}');
    expect(handleNavigate).toHaveBeenCalled();
  });

  it('should be accessible with ARIA labels', () => {
    render(<InstrumentRow {...defaultProps} />);

    const row = screen.getByRole('button', { name: /view details.*EUR\/USD/i });
    expect(row).toBeInTheDocument();

    const starButton = screen.getByRole('button', { name: /watchlist/i });
    expect(starButton).toBeInTheDocument();
  });

  it('should apply Squaber-style dark theme design', () => {
    render(<InstrumentRow {...defaultProps} />);

    const row = screen.getByRole('button', { name: /view details/i });
    expect(row).toHaveClass(/bg-gray-|dark/);
  });

  it('should format large volume numbers correctly', () => {
    const largeVolumeInstrument = {
      ...mockInstrument,
      volume24h: 28500000000, // 28.5B
    };

    render(<InstrumentRow {...defaultProps} instrument={largeVolumeInstrument} />);

    // Volume should be formatted as 28.5B
    expect(screen.getByText(/28\.5B/i)).toBeInTheDocument();
  });

  it('should format small volume numbers correctly', () => {
    const smallVolumeInstrument = {
      ...mockInstrument,
      volume24h: 1500, // 1.5K
    };

    render(<InstrumentRow {...defaultProps} instrument={smallVolumeInstrument} />);

    // Volume should be formatted as 1.5K
    expect(screen.getByText(/1\.5K/i)).toBeInTheDocument();
  });

  it('should handle optional onToggleWatchlist prop', async () => {
    const user = userEvent.setup();

    // Render without onToggleWatchlist
    render(<InstrumentRow instrument={mockInstrument} onNavigate={vi.fn()} />);

    const starButton = screen.getByRole('button', { name: /watchlist/i });
    // Should not throw error when clicked
    await user.click(starButton);
  });
});
