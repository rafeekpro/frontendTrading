/**
 * Store Type Definitions
 * TypeScript interfaces for Zustand stores
 */

import type { Instrument } from './trading';

/**
 * Trade Direction
 */
export type TradeDirection = 'buy' | 'sell';

/**
 * Trade Status
 */
export type TradeStatus = 'pending' | 'executed' | 'failed' | 'closed';

/**
 * Trade Entry
 */
export interface Trade {
  id: string;
  instrument_id: string;
  instrument: Instrument;
  direction: TradeDirection;
  quantity: number;
  entry_price: number;
  executed_at: string; // ISO 8601 timestamp
  status: TradeStatus;
  cost: number; // Total cost including spread
}

/**
 * Position (open trade)
 */
export interface Position {
  id: string;
  trade_id: string;
  instrument_id: string;
  instrument: Instrument;
  direction: TradeDirection;
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number; // Profit and loss in currency
  pnl_percentage: number; // P&L as percentage
  opened_at: string; // ISO 8601 timestamp
}

/**
 * Watchlist Store State
 */
export interface WatchlistStore {
  /** List of watched instrument IDs */
  instruments: string[];

  /** Add instrument to watchlist */
  addInstrument: (instrumentId: string) => void;

  /** Remove instrument from watchlist */
  removeInstrument: (instrumentId: string) => void;

  /** Clear all instruments from watchlist */
  clearWatchlist: () => void;

  /** Check if instrument is in watchlist */
  hasInstrument: (instrumentId: string) => boolean;
}

/**
 * Paper Trading Store State
 */
export interface PaperTradingStore {
  /** Account balance in base currency */
  balance: number;

  /** Initial starting balance */
  initialBalance: number;

  /** List of all executed trades */
  trades: Trade[];

  /** List of open positions */
  positions: Position[];

  /** Execute a trade (buy/sell) */
  executeTrade: (
    instrument: Instrument,
    direction: TradeDirection,
    quantity: number,
    executionPrice: number
  ) => Trade | null;

  /** Close an open position */
  closePosition: (positionId: string, closingPrice: number) => boolean;

  /** Get current position for an instrument */
  getPosition: (instrumentId: string) => Position | undefined;

  /** Update position with current market price */
  updatePositionPrice: (instrumentId: string, currentPrice: number) => void;

  /** Get total P&L across all positions */
  getTotalPnL: () => number;

  /** Reset trading account to initial state */
  reset: () => void;
}

/**
 * AI Provider Options
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local' | 'none';

/**
 * AI Configuration Store State
 */
export interface AIConfigStore {
  /** Selected AI provider */
  provider: AIProvider;

  /** API key for the selected provider */
  apiKey: string;

  /** Model name/version */
  model: string;

  /** Temperature setting (0-2) */
  temperature: number;

  /** Max tokens for responses */
  maxTokens: number;

  /** Whether AI features are enabled */
  enabled: boolean;

  /** Set AI provider */
  setProvider: (provider: AIProvider) => void;

  /** Set API key */
  setApiKey: (apiKey: string) => void;

  /** Set model */
  setModel: (model: string) => void;

  /** Set temperature */
  setTemperature: (temperature: number) => void;

  /** Set max tokens */
  setMaxTokens: (maxTokens: number) => void;

  /** Toggle AI features */
  toggleEnabled: () => void;

  /** Reset to default configuration */
  reset: () => void;
}
