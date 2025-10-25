/**
 * Chart Configuration
 * Centralized configuration for TradingView Lightweight Charts
 */

import { ColorType, type DeepPartial, type ChartOptions } from 'lightweight-charts';

/**
 * Color constants for chart styling
 */
export const CHART_COLORS = {
  background: '#1a1a1a',
  text: '#d1d5db',
  gridLines: '#2a2a2a',
  upColor: '#22c55e',
  downColor: '#ef4444',
  volume: '#6366f1',
  volumeUp: '#22c55e40',
  volumeDown: '#ef444440',
} as const;

/**
 * Default chart options for dark theme
 */
export function getDefaultChartOptions(width: number, height: number): DeepPartial<ChartOptions> {
  return {
    layout: {
      background: {
        type: ColorType.Solid,
        color: CHART_COLORS.background,
      },
      textColor: CHART_COLORS.text,
    },
    grid: {
      vertLines: {
        color: CHART_COLORS.gridLines,
      },
      horzLines: {
        color: CHART_COLORS.gridLines,
      },
    },
    width,
    height,
  };
}

/**
 * Candlestick series options
 */
export const CANDLESTICK_SERIES_OPTIONS = {
  upColor: CHART_COLORS.upColor,
  downColor: CHART_COLORS.downColor,
  borderUpColor: CHART_COLORS.upColor,
  borderDownColor: CHART_COLORS.downColor,
  wickUpColor: CHART_COLORS.upColor,
  wickDownColor: CHART_COLORS.downColor,
} as const;

/**
 * Volume histogram series options
 */
export const VOLUME_SERIES_OPTIONS = {
  color: CHART_COLORS.volume,
  priceFormat: {
    type: 'volume' as const,
  },
  priceScaleId: '',
} as const;
