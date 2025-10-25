/**
 * Mock Candlestick Data
 *
 * Generated realistic OHLCV candlestick data for various instruments and timeframes.
 * Uses the candlestick generator with fixed seeds for consistency.
 */

import type { Candlestick, Timeframe } from '../../types/trading';
import { generateCandlesticks } from '../generators/candlesticks';

/**
 * Generate candlesticks for a specific instrument and timeframe
 * Uses consistent seed for reproducibility
 *
 * @param instrumentId - ID of the instrument (e.g., "FOREX_EUR_USD", "STOCK_AAPL")
 * @param timeframe - Timeframe for candlesticks
 * @param count - Number of candlesticks to generate
 * @returns Array of candlesticks
 */
export function getCandlesticks(
  instrumentId: string,
  timeframe: Timeframe = 'H1',
  count: number = 100
): Candlestick[] {
  // Use instrument ID as seed component for consistent but different data per instrument
  const instrumentSeed = instrumentId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const seed = instrumentSeed + count;
  return generateCandlesticks(instrumentId, timeframe, count, seed);
}

/**
 * Pre-generated candlestick data for common instruments
 * Generated on module load for immediate availability
 */
export const mockCandlesticks = {
  // Forex pairs - H1 timeframe, 200 candles
  EUR_USD: generateCandlesticks('FOREX_EUR_USD', 'H1', 200, 1000),
  GBP_USD: generateCandlesticks('FOREX_GBP_USD', 'H1', 200, 1001),
  USD_JPY: generateCandlesticks('FOREX_USD_JPY', 'H1', 200, 1002),
  AUD_USD: generateCandlesticks('FOREX_AUD_USD', 'H1', 200, 1003),

  // Stocks - H1 timeframe, 200 candles
  AAPL: generateCandlesticks('STOCK_AAPL', 'H1', 200, 2000),
  GOOGL: generateCandlesticks('STOCK_GOOGL', 'H1', 200, 2001),
  MSFT: generateCandlesticks('STOCK_MSFT', 'H1', 200, 2002),
  TSLA: generateCandlesticks('STOCK_TSLA', 'H1', 200, 2003),

  // Crypto - H1 timeframe, 200 candles
  BTC: generateCandlesticks('CRYPTO_BTC', 'H1', 200, 3000),
  ETH: generateCandlesticks('CRYPTO_ETH', 'H1', 200, 3001),
  SOL: generateCandlesticks('CRYPTO_SOL', 'H1', 200, 3002),
} as const;

/**
 * Get candlesticks by instrument symbol
 * Returns pre-generated data if available, generates on-demand otherwise
 */
export function getCandlesticksBySymbol(
  symbol: string,
  timeframe: Timeframe = 'H1',
  count: number = 200
): Candlestick[] {
  // Check if we have pre-generated data
  const key = symbol as keyof typeof mockCandlesticks;
  if (key in mockCandlesticks) {
    return mockCandlesticks[key];
  }

  // Generate on-demand
  return getCandlesticks(symbol, timeframe, count);
}
