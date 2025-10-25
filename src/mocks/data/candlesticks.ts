/**
 * Candlestick Data Generator
 *
 * Generates realistic OHLCV (Open, High, Low, Close, Volume) candlestick data
 * for financial instruments with deterministic random generation.
 */

import type { Candlestick, CandlestickGeneratorConfig, Timeframe } from '../../types/trading';

/**
 * Seeded pseudo-random number generator
 * Uses a simple LCG (Linear Congruential Generator) algorithm
 * This ensures deterministic output for testing purposes
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Generate random number in range [min, max]
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Convert timeframe string to milliseconds
 */
export function getTimeframeMilliseconds(timeframe: Timeframe): number {
  const timeframeMap: Record<Timeframe, number> = {
    M1: 60 * 1000, // 1 minute
    M5: 5 * 60 * 1000, // 5 minutes
    M15: 15 * 60 * 1000, // 15 minutes
    M30: 30 * 60 * 1000, // 30 minutes
    H1: 60 * 60 * 1000, // 1 hour
    H4: 4 * 60 * 60 * 1000, // 4 hours
    D1: 24 * 60 * 60 * 1000, // 1 day
  };

  return timeframeMap[timeframe];
}

/**
 * Get realistic base price for an instrument
 */
function getBasePrice(instrumentId: string): number {
  const basePrices: Record<string, number> = {
    // Forex pairs
    EUR_USD: 1.085,
    GBP_USD: 1.265,
    USD_JPY: 149.5,
    AUD_USD: 0.655,
    USD_CHF: 0.875,
    NZD_USD: 0.595,

    // Indices
    SPX500: 4500,
    NASDAQ100: 15500,
    DAX40: 16000,
    FTSE100: 7500,

    // Commodities
    XAU_USD: 2050,
    XAG_USD: 24.5,
    WTI_USD: 78,
    BRENT_USD: 82,
  };

  return basePrices[instrumentId] || 100;
}

/**
 * Get realistic volatility (as percentage) for an instrument type
 */
function getVolatility(instrumentType: string, timeframe: Timeframe): number {
  // Base volatility by instrument type (as percentage of price)
  const baseVolatility: Record<string, number> = {
    forex: 0.003, // 0.3%
    index: 0.008, // 0.8%
    commodity: 0.012, // 1.2%
  };

  // Adjust volatility based on timeframe (longer timeframes = more movement)
  const timeframeMultiplier: Record<Timeframe, number> = {
    M1: 0.2,
    M5: 0.4,
    M15: 0.6,
    M30: 0.8,
    H1: 1.0,
    H4: 2.0,
    D1: 3.5,
  };

  const base = baseVolatility[instrumentType] || 0.005;
  const multiplier = timeframeMultiplier[timeframe] || 1.0;

  return base * multiplier;
}

/**
 * Round number to specified precision
 */
function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Generate a single candlestick with realistic OHLCV data
 */
function generateSingleCandlestick(
  timestamp: number,
  openPrice: number,
  volatility: number,
  precision: number,
  random: SeededRandom
): Candlestick {
  // Determine if candle is bullish (close > open) or bearish (close < open)
  const isBullish = random.next() > 0.5;

  // Generate price movement within volatility range
  const priceChange = random.range(-volatility, volatility);
  const close = openPrice * (1 + priceChange);

  // Generate high and low prices
  // High should be above both open and close
  // Low should be below both open and close
  const upperPrice = Math.max(openPrice, close);
  const lowerPrice = Math.min(openPrice, close);

  // Add wicks (high above upper, low below lower)
  const wickRange = Math.abs(upperPrice - lowerPrice) * 0.5;
  const highWick = random.range(0, wickRange);
  const lowWick = random.range(0, wickRange);

  const high = upperPrice + highWick;
  const low = lowerPrice - lowWick;

  // Generate volume (higher volume for larger price movements)
  const baseVolume = 10000;
  const volumeMultiplier = 1 + Math.abs(priceChange) * 100;
  const volume = Math.round(baseVolume * volumeMultiplier * random.range(0.5, 1.5));

  return {
    timestamp,
    open: roundToPrecision(openPrice, precision),
    high: roundToPrecision(high, precision),
    low: roundToPrecision(low, precision),
    close: roundToPrecision(close, precision),
    volume,
  };
}

/**
 * Generate an array of realistic candlestick data
 *
 * @param config - Configuration for candlestick generation
 * @returns Array of candlesticks in chronological order (oldest first)
 *
 * @example
 * ```typescript
 * const candlesticks = generateCandlesticks({
 *   instrument: eurUsd,
 *   timeframe: 'H1',
 *   count: 100,
 *   seed: 12345, // Optional: for deterministic output
 * });
 * ```
 */
export function generateCandlesticks(config: CandlestickGeneratorConfig): Candlestick[] {
  const { instrument, timeframe, count, startTime, seed } = config;

  // Initialize seeded random generator
  const random = new SeededRandom(seed ?? Date.now());

  // Get timeframe interval in milliseconds
  const interval = getTimeframeMilliseconds(timeframe);

  // Calculate start time (default: count intervals ago from now)
  const endTime = startTime ?? Date.now();
  let currentTime = startTime ?? endTime - count * interval;

  // Get base price and volatility for instrument
  const basePrice = getBasePrice(instrument.id);
  const volatility = getVolatility(instrument.type, timeframe);

  // Generate candlesticks
  const candlesticks: Candlestick[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < count; i++) {
    const candle = generateSingleCandlestick(
      currentTime,
      currentPrice,
      volatility,
      instrument.precision,
      random
    );

    candlesticks.push(candle);

    // Next candle opens at previous close (with small gap/slippage)
    const slippage = random.range(-0.0001, 0.0001);
    currentPrice = candle.close * (1 + slippage);

    // Move to next time interval
    currentTime += interval;
  }

  return candlesticks;
}

/**
 * Generate candlesticks for multiple timeframes
 * Useful for creating consistent data across different chart views
 */
export function generateMultiTimeframeCandlesticks(
  config: Omit<CandlestickGeneratorConfig, 'timeframe'>,
  timeframes: Timeframe[]
): Record<Timeframe, Candlestick[]> {
  const result: Record<string, Candlestick[]> = {};

  timeframes.forEach(timeframe => {
    result[timeframe] = generateCandlesticks({
      ...config,
      timeframe,
    });
  });

  return result as Record<Timeframe, Candlestick[]>;
}
