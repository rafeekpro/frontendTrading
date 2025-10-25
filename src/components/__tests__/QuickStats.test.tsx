/**
 * QuickStats Component Tests
 * Tests for the quick statistics panel with P&L, positions, and alerts
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickStats } from '../QuickStats';

describe('QuickStats', () => {
  describe('Component Rendering', () => {
    it('should render Total P&L card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByText('Total P&L')).toBeInTheDocument();
    });

    it('should render Open Positions card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByText('Open Positions')).toBeInTheDocument();
    });

    it('should render Active Alerts card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    });
  });

  describe('P&L Display', () => {
    it('should format positive P&L with currency symbol', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByText(/\$1,250\.75/)).toBeInTheDocument();
    });

    it('should format negative P&L with currency symbol', () => {
      render(
        <QuickStats totalPnL={-850.25} openPositions={2} activeAlerts={1} />
      );

      expect(screen.getByText(/-\$850\.25/)).toBeInTheDocument();
    });

    it('should apply green color for positive P&L', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const pnlValue = screen.getByText(/\$1,250\.75/);
      expect(pnlValue).toHaveClass(/green/);
    });

    it('should apply red color for negative P&L', () => {
      render(
        <QuickStats totalPnL={-850.25} openPositions={2} activeAlerts={1} />
      );

      const pnlValue = screen.getByText(/-\$850\.25/);
      expect(pnlValue).toHaveClass(/red/);
    });

    it('should handle zero P&L', () => {
      render(
        <QuickStats totalPnL={0} openPositions={0} activeAlerts={0} />
      );

      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    it('should apply neutral color for zero P&L', () => {
      render(
        <QuickStats totalPnL={0} openPositions={0} activeAlerts={0} />
      );

      const pnlValue = screen.getByText(/\$0\.00/);
      expect(pnlValue).toHaveClass(/gray/);
    });
  });

  describe('Positions Display', () => {
    it('should display open positions count', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should handle zero positions', () => {
      render(
        <QuickStats totalPnL={0} openPositions={0} activeAlerts={2} />
      );

      const positionsCard = screen.getByText('Open Positions').closest('div');
      expect(positionsCard).toHaveTextContent('0');
    });

    it('should handle multiple positions', () => {
      render(
        <QuickStats totalPnL={500} openPositions={15} activeAlerts={3} />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Alerts Display', () => {
    it('should display active alerts count', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle zero alerts', () => {
      render(
        <QuickStats totalPnL={100} openPositions={2} activeAlerts={0} />
      );

      const alertsCard = screen.getByText('Active Alerts').closest('div');
      expect(alertsCard).toHaveTextContent('0');
    });

    it('should handle multiple alerts', () => {
      render(
        <QuickStats totalPnL={500} openPositions={3} activeAlerts={12} />
      );

      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render TrendingUp icon for P&L card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByTestId('pnl-icon')).toBeInTheDocument();
    });

    it('should render Briefcase icon for Positions card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByTestId('positions-icon')).toBeInTheDocument();
    });

    it('should render Bell icon for Alerts card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      expect(screen.getByTestId('alerts-icon')).toBeInTheDocument();
    });
  });

  describe('Layout and Grid', () => {
    it('should render cards in a grid layout', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should apply responsive grid classes', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      // Should have responsive columns
      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });

    it('should have gap between cards', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const grid = container.querySelector('.gap-4');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Squaber Design Styling', () => {
    it('should apply glassmorphism effect to cards', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const glassCard = container.querySelector('.backdrop-blur-md');
      expect(glassCard).toBeInTheDocument();
    });

    it('should apply dark theme background', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const darkCard = container.querySelector('.bg-gray-800');
      expect(darkCard).toBeInTheDocument();
    });

    it('should apply rounded corners to cards', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const roundedCard = container.querySelector('.rounded-lg');
      expect(roundedCard).toBeInTheDocument();
    });

    it('should have consistent padding across all cards', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const paddedCards = container.querySelectorAll('.p-6');
      expect(paddedCards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure for each card', () => {
      render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      // Each card should be identifiable by its heading
      expect(screen.getByText('Total P&L')).toBeInTheDocument();
      expect(screen.getByText('Open Positions')).toBeInTheDocument();
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    });

    it('should have aria-labels for icon elements', () => {
      const { container } = render(
        <QuickStats totalPnL={1250.75} openPositions={3} activeAlerts={5} />
      );

      const icons = container.querySelectorAll('[aria-label]');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large P&L values', () => {
      render(
        <QuickStats
          totalPnL={999999.99}
          openPositions={100}
          activeAlerts={500}
        />
      );

      expect(screen.getByText(/\$999,999\.99/)).toBeInTheDocument();
    });

    it('should handle very small P&L values', () => {
      render(
        <QuickStats totalPnL={0.01} openPositions={1} activeAlerts={1} />
      );

      expect(screen.getByText(/\$0\.01/)).toBeInTheDocument();
    });

    it('should handle negative P&L with large absolute value', () => {
      render(
        <QuickStats
          totalPnL={-123456.78}
          openPositions={5}
          activeAlerts={10}
        />
      );

      expect(screen.getByText(/-\$123,456\.78/)).toBeInTheDocument();
    });
  });
});
