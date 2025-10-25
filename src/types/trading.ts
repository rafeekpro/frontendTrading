/**
 * Trading Types - TypeScript interfaces for trading instruments and market data
 *
 * This module defines the core data structures used throughout the trading application
 * for representing financial instruments, market data, and trading timeframes.
 */

/**
 * Supported trading timeframes for candlestick charts
 * - M1, M5, M15, M30: Minute-based timeframes
 * - H1, H4: Hour-based timeframes
 * - D1: Daily timeframe
 */
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';

/**
 * Types of financial instruments available for trading
 * - forex: Foreign exchange currency pairs
 * - index: Stock market indices
 * - commodity: Physical commodities (gold, oil, etc.)
 */
export type InstrumentType = 'forex' | 'index' | 'commodity';

/**
 * Represents a tradable financial instrument
 */
export interface Instrument {
  /** Unique identifier for the instrument (e.g., "EUR_USD") */
  id: string;

  /** Human-readable display name (e.g., "Euro / US Dollar") */
  name: string;

  /** Trading symbol (e.g., "EUR/USD") */
  symbol: string;

  /** Type of instrument */
  type: InstrumentType;

  /** Current bid-ask spread as a decimal (e.g., 0.00015 = 1.5 pips) */
  spread: number;

  /** Value of one pip movement (e.g., 0.0001 for most forex pairs) */
  pip_value: number;

  /** Minimum trade size in lots */
  min_trade_size: number;

  /** Maximum trade size in lots */
  max_trade_size: number;

  /** Number of decimal places for price precision */
  precision: number;
}

/**
 * OHLCV (Open, High, Low, Close, Volume) candlestick data point
 * Represents price movement within a specific time period
 */
export interface Candlestick {
  /** Unix timestamp in milliseconds */
  timestamp: number;

  /** Opening price at start of period */
  open: number;

  /** Highest price during period */
  high: number;

  /** Lowest price during period */
  low: number;

  /** Closing price at end of period */
  close: number;

  /** Trading volume during period */
  volume: number;
}

/**
 * Configuration for generating candlestick data
 */
export interface CandlestickGeneratorConfig {
  /** Instrument to generate data for */
  instrument: Instrument;

  /** Timeframe for the candlesticks */
  timeframe: Timeframe;

  /** Number of candlesticks to generate */
  count: number;

  /** Starting timestamp (defaults to current time - count * timeframe duration) */
  startTime?: number;

  /** Seed for deterministic random generation */
  seed?: number;
}
