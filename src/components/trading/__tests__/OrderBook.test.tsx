/**
 * OrderBook Component Tests
 * Tests for the order book component displaying bid/ask depth
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderBook } from '../OrderBook';
import type { OrderBookEntry } from '../../../types/trading';

// Mock order book data for testing
const mockBids: OrderBookEntry[] = [
  { price: 1.0850, volume: 100000, total: 100000 },
  { price: 1.0849, volume: 150000, total: 250000 },
  { price: 1.0848, volume: 200000, total: 450000 },
  { price: 1.0847, volume: 120000, total: 570000 },
  { price: 1.0846, volume: 180000, total: 750000 },
  { price: 1.0845, volume: 90000, total: 840000 },
  { price: 1.0844, volume: 110000, total: 950000 },
  { price: 1.0843, volume: 140000, total: 1090000 },
  { price: 1.0842, volume: 160000, total: 1250000 },
  { price: 1.0841, volume: 130000, total: 1380000 },
];

const mockAsks: OrderBookEntry[] = [
  { price: 1.0851, volume: 95000, total: 95000 },
  { price: 1.0852, volume: 145000, total: 240000 },
  { price: 1.0853, volume: 190000, total: 430000 },
  { price: 1.0854, volume: 115000, total: 545000 },
  { price: 1.0855, volume: 175000, total: 720000 },
  { price: 1.0856, volume: 85000, total: 805000 },
  { price: 1.0857, volume: 105000, total: 910000 },
  { price: 1.0858, volume: 135000, total: 1045000 },
  { price: 1.0859, volume: 155000, total: 1200000 },
  { price: 1.0860, volume: 125000, total: 1325000 },
];

const mockSpread = 0.0001; // 1 pip

describe('OrderBook', () => {
  describe('Component Rendering', () => {
    it('should render order book title', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText(/order book/i)).toBeInTheDocument();
    });

    it('should render bids section header', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText(/bid/i)).toBeInTheDocument();
    });

    it('should render asks section header', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText(/ask/i)).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText(/price/i)).toBeInTheDocument();
      expect(screen.getByText(/volume/i)).toBeInTheDocument();
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it('should render spread value', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText(/spread/i)).toBeInTheDocument();
      expect(screen.getByText(/0\.0001/)).toBeInTheDocument();
    });
  });

  describe('Bid Rendering', () => {
    it('should render top 10 bids', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      // Check for first and last bid prices
      expect(screen.getByText('1.08500')).toBeInTheDocument(); // Best bid
      expect(screen.getByText('1.08410')).toBeInTheDocument(); // 10th bid
    });

    it('should display bid volumes', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      // First bid volume
      expect(screen.getByText('100,000')).toBeInTheDocument();
    });

    it('should display bid cumulative totals', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      // Check cumulative total for first bid
      expect(screen.getByText(/100,000/)).toBeInTheDocument();
    });

    it('should apply green styling to bid rows', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const bidRow = container.querySelector('[data-testid="bid-row-0"]');
      expect(bidRow).toHaveClass(/green/);
    });

    it('should highlight best bid with stronger color', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const bestBidRow = container.querySelector('[data-testid="bid-row-0"]');
      expect(bestBidRow).toHaveClass(/font-bold/);
    });
  });

  describe('Ask Rendering', () => {
    it('should render top 10 asks', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      // Check for first and last ask prices
      expect(screen.getByText('1.08510')).toBeInTheDocument(); // Best ask
      expect(screen.getByText('1.08600')).toBeInTheDocument(); // 10th ask
    });

    it('should display ask volumes', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      // First ask volume
      expect(screen.getByText('95,000')).toBeInTheDocument();
    });

    it('should display ask cumulative totals', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      // Check cumulative total for first ask
      expect(screen.getByText(/95,000/)).toBeInTheDocument();
    });

    it('should apply red styling to ask rows', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const askRow = container.querySelector('[data-testid="ask-row-0"]');
      expect(askRow).toHaveClass(/red/);
    });

    it('should highlight best ask with stronger color', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const bestAskRow = container.querySelector('[data-testid="ask-row-0"]');
      expect(bestAskRow).toHaveClass(/font-bold/);
    });
  });

  describe('Depth Visualization', () => {
    it('should render depth bars for bids', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const depthBar = container.querySelector('[data-testid="depth-bar-bid-0"]');
      expect(depthBar).toBeInTheDocument();
    });

    it('should render depth bars for asks', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const depthBar = container.querySelector('[data-testid="depth-bar-ask-0"]');
      expect(depthBar).toBeInTheDocument();
    });

    it('should scale depth bars based on maximum total volume', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const depthBar = container.querySelector('[data-testid="depth-bar-bid-0"]');
      expect(depthBar).toHaveStyle({ width: expect.stringMatching(/\d+%/) });
    });

    it('should use green color for bid depth bars', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const depthBar = container.querySelector('[data-testid="depth-bar-bid-0"]');
      expect(depthBar).toHaveClass(/bg-green/);
    });

    it('should use red color for ask depth bars', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const depthBar = container.querySelector('[data-testid="depth-bar-ask-0"]');
      expect(depthBar).toHaveClass(/bg-red/);
    });
  });

  describe('Empty State', () => {
    it('should display empty bids message when no bids provided', () => {
      render(<OrderBook bids={[]} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText(/no bids available/i)).toBeInTheDocument();
    });

    it('should display empty asks message when no asks provided', () => {
      render(<OrderBook bids={mockBids} asks={[]} spread={mockSpread} />);

      expect(screen.getByText(/no asks available/i)).toBeInTheDocument();
    });

    it('should display both empty messages when no data provided', () => {
      render(<OrderBook bids={[]} asks={[]} spread={0} />);

      expect(screen.getByText(/no bids available/i)).toBeInTheDocument();
      expect(screen.getByText(/no asks available/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive table classes', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const table = container.querySelector('table');
      expect(table).toHaveClass(/w-full/);
    });

    it('should have scrollable container on mobile', () => {
      const { container } = render(
        <OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />
      );

      const scrollContainer = container.querySelector('[data-testid="orderbook-container"]');
      expect(scrollContainer).toHaveClass(/overflow-auto/);
    });
  });

  describe('Number Formatting', () => {
    it('should format prices with 5 decimal places', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText('1.08500')).toBeInTheDocument();
    });

    it('should format volumes with thousands separators', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText('100,000')).toBeInTheDocument();
    });

    it('should format spread with appropriate precision', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      expect(screen.getByText('0.0001')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table structure', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should have column headers in thead', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should have aria-label for bid section', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      const bidSection = screen.getByLabelText(/bid orders/i);
      expect(bidSection).toBeInTheDocument();
    });

    it('should have aria-label for ask section', () => {
      render(<OrderBook bids={mockBids} asks={mockAsks} spread={mockSpread} />);

      const askSection = screen.getByLabelText(/ask orders/i);
      expect(askSection).toBeInTheDocument();
    });
  });
});
