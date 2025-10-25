/**
 * MarketStats Component Tests
 * Tests for market statistics panel component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketStats } from '../MarketStats';
import type { MarketStats as MarketStatsType } from '../../../types/trading';

// Mock market stats data
const mockStats: MarketStatsType = {
  high24h: 1.0875,
  low24h: 1.0825,
  volume24h: 125000000,
  vwap: 1.0850,
  openInterest: 45000000,
  timestamp: Date.now(),
};

const mockStatsWithoutOI: MarketStatsType = {
  high24h: 1.0875,
  low24h: 1.0825,
  volume24h: 125000000,
  vwap: 1.0850,
  timestamp: Date.now(),
};

describe('MarketStats', () => {
  describe('Component Rendering', () => {
    it('should render market stats title', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/market stats/i)).toBeInTheDocument();
    });

    it('should render 24h high label', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/24h high/i)).toBeInTheDocument();
    });

    it('should render 24h low label', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/24h low/i)).toBeInTheDocument();
    });

    it('should render 24h volume label', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/24h volume/i)).toBeInTheDocument();
    });

    it('should render VWAP label', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/vwap/i)).toBeInTheDocument();
    });

    it('should render Open Interest label when provided', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/open interest/i)).toBeInTheDocument();
    });

    it('should not render Open Interest when not provided', () => {
      render(<MarketStats stats={mockStatsWithoutOI} />);

      expect(screen.queryByText(/open interest/i)).not.toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('should format 24h high with 5 decimal places', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText('1.08750')).toBeInTheDocument();
    });

    it('should format 24h low with 5 decimal places', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText('1.08250')).toBeInTheDocument();
    });

    it('should format VWAP with 5 decimal places', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText('1.08500')).toBeInTheDocument();
    });

    it('should format volume with M suffix for millions', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/125\.00M/)).toBeInTheDocument();
    });

    it('should format open interest with M suffix for millions', () => {
      render(<MarketStats stats={mockStats} />);

      expect(screen.getByText(/45\.00M/)).toBeInTheDocument();
    });

    it('should format large volumes with B suffix for billions', () => {
      const largeVolumeStats: MarketStatsType = {
        ...mockStats,
        volume24h: 2500000000,
      };
      render(<MarketStats stats={largeVolumeStats} />);

      expect(screen.getByText(/2\.50B/)).toBeInTheDocument();
    });

    it('should format small volumes with K suffix for thousands', () => {
      const smallVolumeStats: MarketStatsType = {
        ...mockStats,
        volume24h: 45000,
      };
      render(<MarketStats stats={smallVolumeStats} />);

      expect(screen.getByText(/45\.00K/)).toBeInTheDocument();
    });
  });

  describe('Card Layout', () => {
    it('should render stats in card components', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const cards = container.querySelectorAll('[data-testid^="stat-card-"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render high stat card', () => {
      render(<MarketStats stats={mockStats} />);

      const highCard = screen.getByTestId('stat-card-high');
      expect(highCard).toBeInTheDocument();
    });

    it('should render low stat card', () => {
      render(<MarketStats stats={mockStats} />);

      const lowCard = screen.getByTestId('stat-card-low');
      expect(lowCard).toBeInTheDocument();
    });

    it('should render volume stat card', () => {
      render(<MarketStats stats={mockStats} />);

      const volumeCard = screen.getByTestId('stat-card-volume');
      expect(volumeCard).toBeInTheDocument();
    });

    it('should render VWAP stat card', () => {
      render(<MarketStats stats={mockStats} />);

      const vwapCard = screen.getByTestId('stat-card-vwap');
      expect(vwapCard).toBeInTheDocument();
    });

    it('should render Open Interest card when provided', () => {
      render(<MarketStats stats={mockStats} />);

      const oiCard = screen.getByTestId('stat-card-oi');
      expect(oiCard).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply grid layout classes', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const grid = container.querySelector('[data-testid="market-stats-grid"]');
      expect(grid).toHaveClass(/grid/);
    });

    it('should have responsive column classes', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const grid = container.querySelector('[data-testid="market-stats-grid"]');
      expect(grid).toHaveClass(/grid-cols/);
    });
  });

  describe('Visual Design', () => {
    it('should apply glassmorphism to cards', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const card = container.querySelector('[data-testid="stat-card-high"]');
      expect(card).toHaveClass(/backdrop-blur/);
    });

    it('should apply dark theme background', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const card = container.querySelector('[data-testid="stat-card-high"]');
      expect(card).toHaveClass(/bg-gray/);
    });

    it('should apply rounded corners to cards', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const card = container.querySelector('[data-testid="stat-card-high"]');
      expect(card).toHaveClass(/rounded/);
    });

    it('should apply padding to cards', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const card = container.querySelector('[data-testid="stat-card-high"]');
      expect(card).toHaveClass(/p-/);
    });
  });

  describe('Color Indicators', () => {
    it('should display high value with positive color indicator', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const highValue = container.querySelector('[data-testid="stat-value-high"]');
      expect(highValue).toHaveClass(/green/);
    });

    it('should display low value with negative color indicator', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const lowValue = container.querySelector('[data-testid="stat-value-low"]');
      expect(lowValue).toHaveClass(/red/);
    });

    it('should display VWAP with neutral color', () => {
      const { container } = render(<MarketStats stats={mockStats} />);

      const vwapValue = container.querySelector('[data-testid="stat-value-vwap"]');
      expect(vwapValue).toHaveClass(/gray/);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<MarketStats stats={mockStats} />);

      const statsContainer = screen.getByRole('region', { name: /market statistics/i });
      expect(statsContainer).toBeInTheDocument();
    });

    it('should have aria-label for each stat card', () => {
      render(<MarketStats stats={mockStats} />);

      const highCard = screen.getByLabelText(/24h high/i);
      expect(highCard).toBeInTheDocument();
    });

    it('should have screen reader friendly labels', () => {
      render(<MarketStats stats={mockStats} />);

      const volumeLabel = screen.getByLabelText(/24h volume/i);
      expect(volumeLabel).toBeInTheDocument();
    });
  });

  describe('Empty/Loading States', () => {
    it('should handle zero values gracefully', () => {
      const zeroStats: MarketStatsType = {
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        vwap: 0,
        timestamp: Date.now(),
      };
      render(<MarketStats stats={zeroStats} />);

      // Multiple zero values will be present (high, low, vwap)
      const zeroValues = screen.getAllByText('0.00000');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it('should format zero volume correctly', () => {
      const zeroStats: MarketStatsType = {
        high24h: 1.0850,
        low24h: 1.0825,
        volume24h: 0,
        vwap: 1.0850,
        timestamp: Date.now(),
      };
      render(<MarketStats stats={zeroStats} />);

      expect(screen.getByText('0.00')).toBeInTheDocument();
    });
  });

  describe('Icons and Labels', () => {
    it('should display TrendingUp icon for high stat', () => {
      render(<MarketStats stats={mockStats} />);

      const icon = screen.getByTestId('icon-high');
      expect(icon).toBeInTheDocument();
    });

    it('should display TrendingDown icon for low stat', () => {
      render(<MarketStats stats={mockStats} />);

      const icon = screen.getByTestId('icon-low');
      expect(icon).toBeInTheDocument();
    });

    it('should display BarChart icon for volume stat', () => {
      render(<MarketStats stats={mockStats} />);

      const icon = screen.getByTestId('icon-volume');
      expect(icon).toBeInTheDocument();
    });

    it('should display Activity icon for VWAP stat', () => {
      render(<MarketStats stats={mockStats} />);

      const icon = screen.getByTestId('icon-vwap');
      expect(icon).toBeInTheDocument();
    });
  });
});
