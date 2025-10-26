/**
 * MSW Handlers for Results API
 * Provides performance metrics, P&L analysis, and trading statistics
 */

import { http, HttpResponse, delay } from 'msw';
import { usePaperTradingStore } from '../../stores/paperTrading';
import type { Trade } from '../../types/stores';

/**
 * Response types for results endpoints
 */
interface TradingResultsResponse {
  total_trades: number;
  total_pnl: number;
  win_rate: number;
  profit_factor: number;
  trades: Trade[];
}

interface PerformanceMetrics {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  avg_win: number;
  avg_loss: number;
}

interface DailyPnLDataPoint {
  date: string;
  pnl: number;
}

interface MonthlyPnLDataPoint {
  month: string;
  pnl: number;
}

interface EquityCurveDataPoint {
  timestamp: string;
  balance: number;
}

interface PerformanceResponse {
  metrics: PerformanceMetrics;
  daily_pnl: DailyPnLDataPoint[];
  monthly_pnl: MonthlyPnLDataPoint[];
  equity_curve: EquityCurveDataPoint[];
}

/**
 * Calculate P&L for a closed trade
 * Assumes trades array has paired buy/sell trades
 */
function calculateTradePnL(openTrade: Trade, closeTrade: Trade): number {
  if (openTrade.direction === 'buy') {
    // Long position: profit when closing price > entry price
    const priceDiff = closeTrade.entry_price - openTrade.entry_price;
    return priceDiff * openTrade.quantity;
  } else {
    // Short position: profit when closing price < entry price
    const priceDiff = openTrade.entry_price - closeTrade.entry_price;
    return priceDiff * openTrade.quantity;
  }
}

/**
 * Calculate trading statistics from trade history
 */
function calculateTradingStats(trades: Trade[]) {
  // Group trades into pairs (open/close)
  const closedPairs: { open: Trade; close: Trade; pnl: number }[] = [];

  for (let i = 0; i < trades.length - 1; i++) {
    const current = trades[i];
    const next = trades[i + 1];

    // Check if this is an open/close pair
    if (
      current.instrument_id === next.instrument_id &&
      current.direction !== next.direction &&
      current.status === 'executed' &&
      next.status === 'closed'
    ) {
      const pnl = calculateTradePnL(current, next);
      closedPairs.push({ open: current, close: next, pnl });
      i++; // Skip the close trade in next iteration
    }
  }

  // Calculate statistics
  const totalPnL = closedPairs.reduce((sum, pair) => sum + pair.pnl, 0);
  const wins = closedPairs.filter(pair => pair.pnl > 0);
  const losses = closedPairs.filter(pair => pair.pnl < 0);

  const winRate = closedPairs.length > 0 ? (wins.length / closedPairs.length) * 100 : 0;

  const totalWinAmount = wins.reduce((sum, pair) => sum + pair.pnl, 0);
  const totalLossAmount = Math.abs(losses.reduce((sum, pair) => sum + pair.pnl, 0));
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;

  return {
    totalPnL,
    winRate,
    profitFactor,
    wins,
    losses,
    closedPairs,
  };
}

/**
 * Calculate performance metrics
 */
function calculatePerformanceMetrics(trades: Trade[], initialBalance: number) {
  const stats = calculateTradingStats(trades);

  const avgWin = stats.wins.length > 0
    ? stats.wins.reduce((sum, pair) => sum + pair.pnl, 0) / stats.wins.length
    : 0;

  const avgLoss = stats.losses.length > 0
    ? stats.losses.reduce((sum, pair) => sum + pair.pnl, 0) / stats.losses.length
    : 0;

  const totalReturn = initialBalance > 0
    ? (stats.totalPnL / initialBalance) * 100
    : 0;

  // Simplified Sharpe ratio calculation (assumes risk-free rate = 0)
  const returns = stats.closedPairs.map(pair => pair.pnl);
  const avgReturn = returns.length > 0
    ? returns.reduce((sum, r) => sum + r, 0) / returns.length
    : 0;

  const variance = returns.length > 0
    ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    : 0;

  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = initialBalance;
  let currentBalance = initialBalance;

  for (const pair of stats.closedPairs) {
    currentBalance += pair.pnl;
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    const drawdown = ((peak - currentBalance) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    total_return: totalReturn,
    sharpe_ratio: sharpeRatio,
    max_drawdown: maxDrawdown,
    avg_win: avgWin,
    avg_loss: avgLoss,
  };
}

/**
 * Generate daily P&L data for charts
 */
function generateDailyPnL(trades: Trade[]): DailyPnLDataPoint[] {
  const stats = calculateTradingStats(trades);
  const dailyMap = new Map<string, number>();

  for (const pair of stats.closedPairs) {
    const date = pair.close.executed_at.split('T')[0]; // Extract date
    const currentPnL = dailyMap.get(date) || 0;
    dailyMap.set(date, currentPnL + pair.pnl);
  }

  return Array.from(dailyMap.entries())
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate monthly P&L data for charts
 */
function generateMonthlyPnL(trades: Trade[]): MonthlyPnLDataPoint[] {
  const stats = calculateTradingStats(trades);
  const monthlyMap = new Map<string, number>();

  for (const pair of stats.closedPairs) {
    const month = pair.close.executed_at.substring(0, 7); // YYYY-MM
    const currentPnL = monthlyMap.get(month) || 0;
    monthlyMap.set(month, currentPnL + pair.pnl);
  }

  return Array.from(monthlyMap.entries())
    .map(([month, pnl]) => ({ month, pnl }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Generate equity curve data for charts
 */
function generateEquityCurve(trades: Trade[], initialBalance: number): EquityCurveDataPoint[] {
  const stats = calculateTradingStats(trades);

  // Return empty if no closed trades
  if (stats.closedPairs.length === 0) {
    return [];
  }

  const curve: EquityCurveDataPoint[] = [
    { timestamp: new Date().toISOString(), balance: initialBalance }
  ];

  let currentBalance = initialBalance;
  for (const pair of stats.closedPairs) {
    currentBalance += pair.pnl;
    curve.push({
      timestamp: pair.close.executed_at,
      balance: currentBalance,
    });
  }

  return curve;
}

/**
 * MSW Request Handlers for Results Operations
 */
export const resultsHandlers = [
  /**
   * GET /api/results/trading
   * Returns trading results summary with P&L and statistics
   */
  http.get('*/api/results/trading', async () => {
    // Minimal delay for read operations
    await delay(100);

    const store = usePaperTradingStore.getState();
    const trades = store.trades;

    const stats = calculateTradingStats(trades);

    const response: TradingResultsResponse = {
      total_trades: trades.length,
      total_pnl: stats.totalPnL,
      win_rate: stats.winRate,
      profit_factor: stats.profitFactor,
      trades,
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),

  /**
   * GET /api/results/performance
   * Returns performance metrics and chart data
   */
  http.get('*/api/results/performance', async () => {
    // Minimal delay for read operations
    await delay(100);

    const store = usePaperTradingStore.getState();
    const trades = store.trades;
    const initialBalance = store.initialBalance;

    const metrics = calculatePerformanceMetrics(trades, initialBalance);
    const dailyPnL = generateDailyPnL(trades);
    const monthlyPnL = generateMonthlyPnL(trades);
    const equityCurve = generateEquityCurve(trades, initialBalance);

    const response: PerformanceResponse = {
      metrics,
      daily_pnl: dailyPnL,
      monthly_pnl: monthlyPnL,
      equity_curve: equityCurve,
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),
];
