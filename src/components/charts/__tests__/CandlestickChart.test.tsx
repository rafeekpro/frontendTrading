/**
 * CandlestickChart Component Tests (RED PHASE)
 * Tests for TradingView Lightweight Charts integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CandlestickChart } from '../CandlestickChart';
import type { Candlestick, Timeframe } from '@/types/trading';

// Mock lightweight-charts library
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addCandlestickSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    addHistogramSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    applyOptions: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
      scrollToPosition: vi.fn(),
    })),
    resize: vi.fn(),
    remove: vi.fn(),
  })),
  ColorType: {
    Solid: 'Solid',
  },
}));

// Mock candlestick data
const mockCandlesticks: Candlestick[] = [
  {
    timestamp: 1700000000000,
    open: 1.0800,
    high: 1.0850,
    low: 1.0790,
    close: 1.0830,
    volume: 1000,
  },
  {
    timestamp: 1700003600000,
    open: 1.0830,
    high: 1.0860,
    low: 1.0820,
    close: 1.0845,
    volume: 1200,
  },
  {
    timestamp: 1700007200000,
    open: 1.0845,
    high: 1.0870,
    low: 1.0840,
    close: 1.0865,
    volume: 900,
  },
];

describe('CandlestickChart', () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render chart container', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      const chartContainer = screen.getByTestId('candlestick-chart-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should render with full width', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      const chartContainer = screen.getByTestId('candlestick-chart-container');
      expect(chartContainer).toHaveClass(/w-full/);
    });

    it('should render with configurable height', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
          height={500}
        />
      );

      const chartContainer = screen.getByTestId('candlestick-chart-container');
      expect(chartContainer).toHaveStyle({ height: '500px' });
    });

    it('should use default height when not specified', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      const chartContainer = screen.getByTestId('candlestick-chart-container');
      // Default height should be 400px
      expect(chartContainer).toHaveStyle({ height: '400px' });
    });
  });

  describe('Chart Initialization', () => {
    it('should initialize chart on mount', async () => {
      const { createChart } = await import('lightweight-charts');

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(createChart).toHaveBeenCalled();
      });
    });

    it('should apply dark theme configuration', async () => {
      const mockChart = {
        addCandlestickSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(mockChart.applyOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            layout: expect.objectContaining({
              background: expect.objectContaining({
                type: 'Solid',
              }),
              textColor: expect.any(String),
            }),
          })
        );
      });
    });

    it('should create candlestick series', async () => {
      const mockChart = {
        addCandlestickSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(mockChart.addCandlestickSeries).toHaveBeenCalled();
      });
    });

    it('should create volume histogram series', async () => {
      const mockChart = {
        addCandlestickSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(mockChart.addHistogramSeries).toHaveBeenCalled();
      });
    });
  });

  describe('Data Loading and Updates', () => {
    it('should set candlestick data on mount', async () => {
      const mockCandlestickSeries = {
        setData: vi.fn(),
      };

      const mockChart = {
        addCandlestickSeries: vi.fn(() => mockCandlestickSeries),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(mockCandlestickSeries.setData).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              time: expect.any(Number),
              open: expect.any(Number),
              high: expect.any(Number),
              low: expect.any(Number),
              close: expect.any(Number),
            }),
          ])
        );
      });
    });

    it('should set volume data on mount', async () => {
      const mockVolumeSeries = {
        setData: vi.fn(),
      };

      const mockChart = {
        addCandlestickSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        addHistogramSeries: vi.fn(() => mockVolumeSeries),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(mockVolumeSeries.setData).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              time: expect.any(Number),
              value: expect.any(Number),
            }),
          ])
        );
      });
    });

    it('should update chart when data changes', async () => {
      const mockCandlestickSeries = {
        setData: vi.fn(),
      };

      const mockChart = {
        addCandlestickSeries: vi.fn(() => mockCandlestickSeries),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      const { rerender } = render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      const newData: Candlestick[] = [
        ...mockCandlesticks,
        {
          timestamp: 1700010800000,
          open: 1.0865,
          high: 1.0880,
          low: 1.0860,
          close: 1.0875,
          volume: 1100,
        },
      ];

      rerender(
        <CandlestickChart
          data={newData}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(mockCandlestickSeries.setData).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      render(
        <CandlestickChart
          data={[]}
          timeframe="H1"
          loading={true}
        />
      );

      const loadingSkeleton = screen.getByTestId('chart-loading-skeleton');
      expect(loadingSkeleton).toBeInTheDocument();
    });

    it('should not display chart when loading', () => {
      render(
        <CandlestickChart
          data={[]}
          timeframe="H1"
          loading={true}
        />
      );

      const chartContainer = screen.queryByTestId('candlestick-chart-container');
      expect(chartContainer).not.toBeInTheDocument();
    });

    it('should display chart when not loading', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
          loading={false}
        />
      );

      const chartContainer = screen.getByTestId('candlestick-chart-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Failed to load chart data';

      render(
        <CandlestickChart
          data={[]}
          timeframe="H1"
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display chart when error is present', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
          error="Failed to load"
        />
      );

      const chartContainer = screen.queryByTestId('candlestick-chart-container');
      expect(chartContainer).not.toBeInTheDocument();
    });

    it('should display error with retry message', () => {
      render(
        <CandlestickChart
          data={[]}
          timeframe="H1"
          error="Network error"
        />
      );

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when data is empty', () => {
      render(
        <CandlestickChart
          data={[]}
          timeframe="H1"
        />
      );

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should not display chart when data is empty', () => {
      render(
        <CandlestickChart
          data={[]}
          timeframe="H1"
        />
      );

      const chartContainer = screen.queryByTestId('candlestick-chart-container');
      expect(chartContainer).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should resize chart on container size change', async () => {
      const mockChart = {
        addCandlestickSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      await waitFor(() => {
        expect(global.ResizeObserver).toHaveBeenCalled();
      });
    });

    it('should cleanup ResizeObserver on unmount', async () => {
      const mockDisconnect = vi.fn();
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: mockDisconnect,
      }));

      const { unmount } = render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove chart on unmount', async () => {
      const mockChart = {
        addCandlestickSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        addHistogramSeries: vi.fn(() => ({
          setData: vi.fn(),
        })),
        applyOptions: vi.fn(),
        timeScale: vi.fn(() => ({
          fitContent: vi.fn(),
        })),
        resize: vi.fn(),
        remove: vi.fn(),
      };

      const { createChart } = await import('lightweight-charts');
      (createChart as ReturnType<typeof vi.fn>).mockReturnValue(mockChart);

      const { unmount } = render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      unmount();

      await waitFor(() => {
        expect(mockChart.remove).toHaveBeenCalled();
      });
    });
  });

  describe('Timeframe Display', () => {
    it('should display current timeframe', () => {
      render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      expect(screen.getByText(/H1/)).toBeInTheDocument();
    });

    it('should update timeframe display when changed', () => {
      const { rerender } = render(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="H1"
        />
      );

      expect(screen.getByText(/H1/)).toBeInTheDocument();

      rerender(
        <CandlestickChart
          data={mockCandlesticks}
          timeframe="D1"
        />
      );

      expect(screen.getByText(/D1/)).toBeInTheDocument();
    });
  });
});
