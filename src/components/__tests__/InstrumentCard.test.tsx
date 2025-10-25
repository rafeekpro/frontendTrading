/**
 * InstrumentCard Component Tests
 * Tests for the instrument card component with Squaber-style design
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { InstrumentCard } from '../InstrumentCard';
import type { Instrument } from '../../types/trading';

// Mock instrument data for testing
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

// Mock current price and 24h change data
const mockPriceData = {
  currentPrice: 1.0850,
  change24h: 1.25, // +1.25%
};

const mockNegativePriceData = {
  currentPrice: 1.0750,
  change24h: -0.85, // -0.85%
};

// Mock sparkline data (last 24h price points)
const mockSparklineData = [
  { timestamp: Date.now() - 86400000, close: 1.0800 },
  { timestamp: Date.now() - 72000000, close: 1.0825 },
  { timestamp: Date.now() - 57600000, close: 1.0810 },
  { timestamp: Date.now() - 43200000, close: 1.0840 },
  { timestamp: Date.now() - 28800000, close: 1.0835 },
  { timestamp: Date.now() - 14400000, close: 1.0845 },
  { timestamp: Date.now(), close: 1.0850 },
];

describe('InstrumentCard', () => {
  describe('Component Rendering', () => {
    it('should render instrument symbol', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      expect(screen.getByText('EUR/USD')).toBeInTheDocument();
    });

    it('should render instrument name', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      expect(screen.getByText('Euro / US Dollar')).toBeInTheDocument();
    });

    it('should render current price with correct precision', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      // Price should be formatted to 5 decimal places (precision)
      expect(screen.getByText(/1\.08500/)).toBeInTheDocument();
    });

    it('should render 24h change percentage', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      expect(screen.getByText(/\+1\.25%/)).toBeInTheDocument();
    });

    it('should render favorite toggle button', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should render sparkline chart', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      // Sparkline should be present in the card
      const sparkline = screen.getByTestId('sparkline-chart');
      expect(sparkline).toBeInTheDocument();
    });
  });

  describe('Positive/Negative Change Styling', () => {
    it('should apply green color for positive 24h change', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const changeElement = screen.getByText(/\+1\.25%/);
      expect(changeElement).toHaveClass(/green/);
    });

    it('should apply red color for negative 24h change', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockNegativePriceData.currentPrice}
          change24h={mockNegativePriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const changeElement = screen.getByText(/-0\.85%/);
      expect(changeElement).toHaveClass(/red/);
    });

    it('should display up arrow icon for positive change', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      // lucide-react TrendingUp icon should be present
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });

    it('should display down arrow icon for negative change', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockNegativePriceData.currentPrice}
          change24h={mockNegativePriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      // lucide-react TrendingDown icon should be present
      expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onNavigate when card is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();

      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={onNavigate}
        />
      );

      const card = screen.getByRole('button', { name: /View details for EUR\/USD/i });
      await user.click(card);

      expect(onNavigate).toHaveBeenCalledWith('EUR_USD');
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleFavorite when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
          onToggleFavorite={onToggleFavorite}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith('EUR_USD');
      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    });

    it('should not call onNavigate when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();
      const onToggleFavorite = vi.fn();

      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={onNavigate}
          onToggleFavorite={onToggleFavorite}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      // Clicking favorite should NOT trigger navigation
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('should show filled star icon when instrument is favorited', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
          isFavorite={true}
        />
      );

      const favoriteIcon = screen.getByTestId('star-filled-icon');
      expect(favoriteIcon).toBeInTheDocument();
    });

    it('should show empty star icon when instrument is not favorited', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
          isFavorite={false}
        />
      );

      const favoriteIcon = screen.getByTestId('star-empty-icon');
      expect(favoriteIcon).toBeInTheDocument();
    });
  });

  describe('Glassmorphism and Squaber Design', () => {
    it('should apply glassmorphism effect classes', () => {
      const { container } = render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const card = container.querySelector('.backdrop-blur-md');
      expect(card).toBeInTheDocument();
    });

    it('should apply dark theme background classes', () => {
      const { container } = render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const card = container.querySelector('.bg-gray-800');
      expect(card).toBeInTheDocument();
    });

    it('should apply hover scale animation class', () => {
      const { container } = render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const card = container.querySelector('.hover\\:scale-105');
      expect(card).toBeInTheDocument();
    });

    it('should apply rounded corners', () => {
      const { container } = render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const card = container.querySelector('.rounded-lg');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible name for main card button', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const card = screen.getByRole('button', { name: /View details for EUR\/USD/i });
      expect(card).toBeInTheDocument();
    });

    it('should have aria-label on favorite button', () => {
      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={vi.fn()}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();

      render(
        <InstrumentCard
          instrument={mockInstrument}
          currentPrice={mockPriceData.currentPrice}
          change24h={mockPriceData.change24h}
          sparklineData={mockSparklineData}
          onNavigate={onNavigate}
        />
      );

      const card = screen.getByRole('button', { name: /View details for EUR\/USD/i });
      card.focus();
      await user.keyboard('{Enter}');

      expect(onNavigate).toHaveBeenCalledWith('EUR_USD');
    });
  });
});
