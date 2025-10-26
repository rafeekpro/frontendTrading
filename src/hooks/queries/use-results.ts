/**
 * React Query hooks for results and analytics data
 */

import { useQuery } from '@tanstack/react-query';

/**
 * Trading results response type
 */
export interface TradingResultsResponse {
  total_trades: number;
  total_pnl: number;
  win_rate: number;
  profit_factor: number;
  trades: Array<{
    id: string;
    instrument_id: string;
    direction: 'buy' | 'sell';
    quantity: number;
    entry_price: number;
    executed_at: string;
    status: string;
    cost: number;
  }>;
}

/**
 * Performance metrics response type
 */
export interface PerformanceMetrics {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  avg_win: number;
  avg_loss: number;
}

export interface DailyPnLDataPoint {
  date: string;
  pnl: number;
}

export interface MonthlyPnLDataPoint {
  month: string;
  pnl: number;
}

export interface EquityCurveDataPoint {
  timestamp: string;
  balance: number;
}

export interface PerformanceResponse {
  metrics: PerformanceMetrics;
  daily_pnl: DailyPnLDataPoint[];
  monthly_pnl: MonthlyPnLDataPoint[];
  equity_curve: EquityCurveDataPoint[];
}

/**
 * Fetch trading results from API
 */
async function fetchTradingResults(): Promise<TradingResultsResponse> {
  const response = await fetch('/api/results/trading');

  if (!response.ok) {
    throw new Error('Failed to fetch trading results');
  }

  return response.json();
}

/**
 * Fetch performance metrics from API
 */
async function fetchPerformanceMetrics(): Promise<PerformanceResponse> {
  const response = await fetch('/api/results/performance');

  if (!response.ok) {
    throw new Error('Failed to fetch performance metrics');
  }

  return response.json();
}

/**
 * Hook to fetch trading results
 */
export function useTradingResults() {
  return useQuery({
    queryKey: ['trading-results'],
    queryFn: fetchTradingResults,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch performance metrics
 */
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: fetchPerformanceMetrics,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
