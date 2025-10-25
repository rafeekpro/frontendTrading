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
 * - stock: Individual company stocks
 * - crypto: Cryptocurrencies
 * - forex: Foreign exchange currency pairs
 * - index: Stock market indices
 * - commodity: Physical commodities (gold, oil, etc.)
 */
export type InstrumentType = 'stock' | 'crypto' | 'forex' | 'index' | 'commodity';

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

/**
 * API Response types
 */
export interface InstrumentsResponse {
  instruments: Instrument[];
}

export interface InstrumentResponse {
  instrument: Instrument;
}

export interface CandlesticksResponse {
  candlesticks: Candlestick[];
  instrument_id: string;
  timeframe: Timeframe;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}

/**
 * Trade type - buy or sell
 */
export type TradeType = 'buy' | 'sell';

/**
 * Trade status
 */
export type TradeStatus = 'open' | 'closed';

/**
 * Historical trade record
 * Represents a completed or ongoing trade transaction
 */
export interface Trade {
  /** Unique identifier for the trade */
  id: string;

  /** ID of the instrument being traded */
  instrument_id: string;

  /** Type of trade (buy/sell) */
  type: TradeType;

  /** Quantity/size of the trade in lots */
  quantity: number;

  /** Price at which the trade was entered */
  entry_price: number;

  /** Price at which the trade was exited (undefined if still open) */
  exit_price?: number;

  /** Unix timestamp in milliseconds when trade was opened */
  opened_at: number;

  /** Unix timestamp in milliseconds when trade was closed (undefined if still open) */
  closed_at?: number;

  /** Profit or loss from the trade (undefined if still open) */
  profit_loss?: number;

  /** Current status of the trade */
  status: TradeStatus;
}

/**
 * Open position in the market
 * Represents a currently active trading position
 */
export interface Position {
  /** Unique identifier for the position */
  id: string;

  /** ID of the instrument for this position */
  instrument_id: string;

  /** Type of position (buy/sell) */
  type: TradeType;

  /** Quantity/size of the position in lots */
  quantity: number;

  /** Price at which the position was entered */
  entry_price: number;

  /** Current market price of the instrument */
  current_price: number;

  /** Unrealized profit/loss based on current price */
  unrealized_pnl: number;

  /** Unix timestamp in milliseconds when position was opened */
  opened_at: number;
}

/**
 * Trading opportunity/signal
 * Represents a potential trading opportunity identified by the system
 */
export interface Opportunity {
  /** Unique identifier for the opportunity */
  id: string;

  /** ID of the instrument for this opportunity */
  instrument_id: string;

  /** Recommended trade type */
  type: TradeType;

  /** Confidence level of the signal (0-1) */
  confidence: number;

  /** Recommended entry price */
  entry_price: number;

  /** Target profit price */
  target_price: number;

  /** Stop loss price to limit risk */
  stop_loss: number;

  /** Strategy that generated this opportunity */
  strategy: string;

  /** Unix timestamp in milliseconds when opportunity was detected */
  detected_at: number;
}

/**
 * API Response types for trades, positions, and opportunities
 */
export interface TradesResponse {
  trades: Trade[];
}

export interface TradeResponse {
  trade: Trade;
}

export interface PositionsResponse {
  positions: Position[];
}

export interface PositionResponse {
  position: Position;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
}

export interface OpportunityResponse {
  opportunity: Opportunity;
}
