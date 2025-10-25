/**
 * Candlestick Generator
 *
 * Generates realistic OHLCV (Open, High, Low, Close, Volume) candlestick data
 * using SeededRandom for reproducibility and statistical distributions.
 */

import { SeededRandom } from './seed';
import type { Candlestick, Timeframe } from '../../types/trading';

/**
 * Price movement constants
 */
const PRICE_CONSTANTS = {
  drift: 0.00001, // Slight upward bias (0.001% per candle)
  volatility: 0.015, // 1.5% standard deviation
  slippageRange: 0.0001, // ±0.01% slippage between candles
} as const;

/**
 * Wick generation constants
 */
const WICK_CONSTANTS = {
  minRatio: 0.2, // Minimum wick size as ratio of body
  maxRatio: 0.8, // Maximum wick size as ratio of body
} as const;

/**
 * Volume distribution constants (log-normal)
 */
const VOLUME_CONSTANTS = {
  mean: 1000000, // 1 million average volume
  stdDev: 0.5, // Standard deviation for log-normal
  minimum: 10000, // Minimum volume (10k)
} as const;

/**
 * Timeframe durations in milliseconds
 */
const TIMEFRAME_MS: Record<Timeframe, number> = {
  M1: 60 * 1000, // 1 minute
  M5: 5 * 60 * 1000, // 5 minutes
  M15: 15 * 60 * 1000, // 15 minutes
  M30: 30 * 60 * 1000, // 30 minutes
  H1: 60 * 60 * 1000, // 1 hour
  H4: 4 * 60 * 60 * 1000, // 4 hours
  D1: 24 * 60 * 60 * 1000, // 1 day
} as const;

/**
 * Base prices for different instrument types
 */
const BASE_PRICES: Record<string, number> = {
  // Forex pairs
  EUR_USD: 1.085,
  GBP_USD: 1.265,
  USD_JPY: 149.5,
  AUD_USD: 0.655,
  USD_CHF: 0.875,
  NZD_USD: 0.595,
  USD_CAD: 1.365,
  EUR_GBP: 0.857,
  EUR_JPY: 162.2,
  GBP_JPY: 189.3,
  AUD_JPY: 97.9,
  EUR_CHF: 0.95,
  GBP_CHF: 1.11,
  AUD_NZD: 1.1,

  // Default for unknown instruments
  default: 100,
};

/**
 * Get base price for an instrument
 */
function getBasePrice(instrumentId: string): number {
  // Check for exact match
  if (instrumentId in BASE_PRICES) {
    return BASE_PRICES[instrumentId]!;
  }

  // Handle different instrument types
  if (instrumentId.startsWith('FOREX_')) {
    // Extract currency pair (e.g., FOREX_EUR_USD -> EUR_USD)
    const pair = instrumentId.replace('FOREX_', '');
    if (pair in BASE_PRICES) {
      return BASE_PRICES[pair]!;
    }
    return 1.0; // Default forex price
  }

  if (instrumentId.startsWith('STOCK_')) {
    return 150.0; // Default stock price
  }

  if (instrumentId.startsWith('CRYPTO_')) {
    return 50000.0; // Default crypto price (like BTC)
  }

  return BASE_PRICES.default!;
}

/**
 * Get precision for an instrument
 */
function getPrecision(instrumentId: string): number {
  if (instrumentId.startsWith('FOREX_')) {
    return 5;
  }
  if (instrumentId.startsWith('STOCK_')) {
    return 2;
  }
  if (instrumentId.startsWith('CRYPTO_')) {
    return 8;
  }
  return 5;
}

/**
 * Round number to specified precision
 */
function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Generate log-normal distributed volume
 */
function generateLogNormalVolume(rng: SeededRandom): number {
  // Box-Muller transform for normal distribution
  const u1 = rng.next();
  const u2 = rng.next();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  // Log-normal: exp(mu + sigma * Z)
  const { mean, stdDev, minimum } = VOLUME_CONSTANTS;
  const logMean = Math.log(mean) - (stdDev * stdDev) / 2;
  const volume = Math.exp(logMean + stdDev * z0);

  return Math.max(minimum, Math.round(volume));
}

/**
 * Generate a single candlestick
 */
function generateSingleCandlestick(
  timestamp: number,
  openPrice: number,
  precision: number,
  rng: SeededRandom
): Candlestick {
  // Price movement: random walk with drift
  const { drift, volatility } = PRICE_CONSTANTS;

  // Normal distribution for price change (Box-Muller transform)
  const u1 = rng.next();
  const u2 = rng.next();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const priceChange = drift + volatility * z;

  const closePrice = openPrice * (1 + priceChange);

  // Generate high and low with wicks
  const upperPrice = Math.max(openPrice, closePrice);
  const lowerPrice = Math.min(openPrice, closePrice);

  const bodySize = Math.abs(upperPrice - lowerPrice);
  const wickSize =
    bodySize *
    rng.nextFloat(WICK_CONSTANTS.minRatio, WICK_CONSTANTS.maxRatio);

  const high = upperPrice + wickSize * rng.nextFloat(0, 1);
  const low = lowerPrice - wickSize * rng.nextFloat(0, 1);

  // Generate volume (log-normal distribution)
  const volume = generateLogNormalVolume(rng);

  return {
    timestamp,
    open: roundToPrecision(openPrice, precision),
    high: roundToPrecision(high, precision),
    low: roundToPrecision(low, precision),
    close: roundToPrecision(closePrice, precision),
    volume,
  };
}

/**
 * Generate realistic candlestick data
 *
 * Creates OHLCV data with:
 * - Random walk price movements with slight upward drift
 * - Realistic high/low wicks
 * - Log-normal volume distribution
 * - Sequential timestamps based on timeframe
 *
 * @param instrumentId - ID of the instrument (e.g., "EUR_USD", "STOCK_AAPL")
 * @param timeframe - Candlestick timeframe (M1, M5, M15, M30, H1, H4, D1)
 * @param count - Number of candlesticks to generate
 * @param seed - Optional seed for reproducibility (default: 42)
 * @returns Array of candlesticks in chronological order (oldest first)
 *
 * @example
 * ```typescript
 * // Generate 100 hourly candles for EUR/USD
 * const candles = generateCandlesticks('EUR_USD', 'H1', 100, 42);
 *
 * // Generate 500 5-minute candles for a stock
 * const stockCandles = generateCandlesticks('STOCK_AAPL', 'M5', 500, 12345);
 * ```
 */
export function generateCandlesticks(
  instrumentId: string,
  timeframe: Timeframe,
  count: number,
  seed: number = 42
): Candlestick[] {
  const rng = new SeededRandom(seed);
  const candlesticks: Candlestick[] = [];

  // Get instrument properties
  const basePrice = getBasePrice(instrumentId);
  const precision = getPrecision(instrumentId);
  const interval = TIMEFRAME_MS[timeframe];

  // Start time: count intervals ago from now
  const now = Date.now();
  let currentTime = now - count * interval;
  let currentPrice = basePrice;

  // Generate candlesticks
  for (let i = 0; i < count; i++) {
    const candle = generateSingleCandlestick(
      currentTime,
      currentPrice,
      precision,
      rng
    );

    candlesticks.push(candle);

    // Next candle opens at previous close (with small slippage)
    const { slippageRange } = PRICE_CONSTANTS;
    const slippage = rng.nextFloat(-slippageRange, slippageRange);
    currentPrice = candle.close * (1 + slippage);
    currentTime += interval;
  }

  return candlesticks;
}
