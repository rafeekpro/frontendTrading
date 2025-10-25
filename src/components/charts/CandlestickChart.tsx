/**
 * CandlestickChart Component
 * TradingView Lightweight Charts integration for candlestick visualization
 */

import { useEffect, useRef } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import type { Candlestick, Timeframe } from '@/types/trading';
import {
  getDefaultChartOptions,
  CANDLESTICK_SERIES_OPTIONS,
  VOLUME_SERIES_OPTIONS,
} from '@/lib/chart-config';
import { convertToCandlestickData, convertToVolumeData } from '@/lib/chart-utils';

interface CandlestickChartProps {
  /** Candlestick data to display */
  data: Candlestick[];
  /** Current timeframe */
  timeframe: Timeframe;
  /** Chart height in pixels */
  height?: number;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
}

export function CandlestickChart({
  data,
  timeframe,
  height = 400,
  loading = false,
  error,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || loading || error || data.length === 0) {
      return;
    }

    // Create chart instance with default options
    const containerWidth = chartContainerRef.current.clientWidth;
    const chartOptions = getDefaultChartOptions(containerWidth, height);
    const chart = createChart(chartContainerRef.current, chartOptions);

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries(CANDLESTICK_SERIES_OPTIONS);
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries(VOLUME_SERIES_OPTIONS);
    volumeSeriesRef.current = volumeSeries;

    // Setup ResizeObserver
    resizeObserverRef.current = new ResizeObserver((entries) => {
      if (entries.length === 0 || entries[0] === undefined) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });

    resizeObserverRef.current.observe(chartContainerRef.current);

    // Cleanup function
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [loading, error, height]); // Recreate chart when these change

  // Update data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || data.length === 0) {
      return;
    }

    // Convert data to lightweight-charts format using utilities
    const candlestickData = convertToCandlestickData(data);
    const volumeData = convertToVolumeData(data);

    // Set data
    candlestickSeriesRef.current.setData(candlestickData);
    volumeSeriesRef.current.setData(volumeData);

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div
        data-testid="chart-loading-skeleton"
        className="w-full animate-pulse rounded-lg bg-gray-800"
        style={{ height: `${height}px` }}
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="w-full rounded-lg border border-red-500/20 bg-red-500/10 p-8"
        style={{ height: `${height}px` }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-red-400">Error loading chart</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-8"
        style={{ height: `${height}px` }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-gray-400">No data available</p>
          <p className="text-sm text-gray-500">Select a different timeframe to view data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Timeframe indicator */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">Timeframe:</span>
          <span className="rounded bg-blue-600/20 px-2 py-1 text-sm font-semibold text-blue-400">
            {timeframe}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div
        ref={chartContainerRef}
        data-testid="candlestick-chart-container"
        className="w-full rounded-lg"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
