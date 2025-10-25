/**
 * Mock Instruments Data
 *
 * Realistic mock data for tradable financial instruments including:
 * - Major forex currency pairs
 * - Stock market indices
 * - Commodities (precious metals, energy)
 */

import type { Instrument } from '../../types/trading';

/**
 * Mock instruments database
 * Contains realistic trading instruments with proper spreads, pip values, and constraints
 */
export const mockInstruments: Instrument[] = [
  // ========== FOREX PAIRS ==========
  {
    id: 'EUR_USD',
    name: 'Euro / US Dollar',
    symbol: 'EUR/USD',
    type: 'forex',
    spread: 0.00015, // 1.5 pips
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
  {
    id: 'GBP_USD',
    name: 'British Pound / US Dollar',
    symbol: 'GBP/USD',
    type: 'forex',
    spread: 0.0002, // 2 pips
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
  {
    id: 'USD_JPY',
    name: 'US Dollar / Japanese Yen',
    symbol: 'USD/JPY',
    type: 'forex',
    spread: 0.02, // 2 pips (JPY pairs use different pip value)
    pip_value: 0.01,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 3,
  },
  {
    id: 'AUD_USD',
    name: 'Australian Dollar / US Dollar',
    symbol: 'AUD/USD',
    type: 'forex',
    spread: 0.00018, // 1.8 pips
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
  {
    id: 'USD_CHF',
    name: 'US Dollar / Swiss Franc',
    symbol: 'USD/CHF',
    type: 'forex',
    spread: 0.0002, // 2 pips
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
  {
    id: 'NZD_USD',
    name: 'New Zealand Dollar / US Dollar',
    symbol: 'NZD/USD',
    type: 'forex',
    spread: 0.00022, // 2.2 pips
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },

  // ========== INDICES ==========
  {
    id: 'SPX500',
    name: 'S&P 500 Index',
    symbol: 'SPX500',
    type: 'index',
    spread: 0.5, // 0.5 points
    pip_value: 0.01,
    min_trade_size: 0.1,
    max_trade_size: 50,
    precision: 2,
  },
  {
    id: 'NASDAQ100',
    name: 'NASDAQ 100 Index',
    symbol: 'NASDAQ100',
    type: 'index',
    spread: 1.0, // 1 point
    pip_value: 0.01,
    min_trade_size: 0.1,
    max_trade_size: 50,
    precision: 2,
  },
  {
    id: 'DAX40',
    name: 'DAX 40 Index',
    symbol: 'DAX40',
    type: 'index',
    spread: 2.0, // 2 points
    pip_value: 0.01,
    min_trade_size: 0.1,
    max_trade_size: 25,
    precision: 2,
  },
  {
    id: 'FTSE100',
    name: 'FTSE 100 Index',
    symbol: 'FTSE100',
    type: 'index',
    spread: 1.5, // 1.5 points
    pip_value: 0.01,
    min_trade_size: 0.1,
    max_trade_size: 50,
    precision: 2,
  },

  // ========== COMMODITIES ==========
  {
    id: 'XAU_USD',
    name: 'Gold / US Dollar',
    symbol: 'XAUUSD',
    type: 'commodity',
    spread: 0.35, // $0.35 per ounce
    pip_value: 0.01,
    min_trade_size: 0.01,
    max_trade_size: 50,
    precision: 2,
  },
  {
    id: 'XAG_USD',
    name: 'Silver / US Dollar',
    symbol: 'XAGUSD',
    type: 'commodity',
    spread: 0.03, // $0.03 per ounce
    pip_value: 0.001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 3,
  },
  {
    id: 'WTI_USD',
    name: 'Crude Oil WTI / US Dollar',
    symbol: 'WTIUSD',
    type: 'commodity',
    spread: 0.05, // $0.05 per barrel
    pip_value: 0.01,
    min_trade_size: 0.1,
    max_trade_size: 100,
    precision: 2,
  },
  {
    id: 'BRENT_USD',
    name: 'Brent Crude Oil / US Dollar',
    symbol: 'BRENTUSD',
    type: 'commodity',
    spread: 0.05, // $0.05 per barrel
    pip_value: 0.01,
    min_trade_size: 0.1,
    max_trade_size: 100,
    precision: 2,
  },
];

/**
 * Get a single instrument by its ID
 * @param id - Instrument ID (e.g., "EUR_USD")
 * @returns The instrument if found, undefined otherwise
 */
export function getInstrumentById(id: string): Instrument | undefined {
  return mockInstruments.find(instrument => instrument.id === id);
}

/**
 * Get instruments by type
 * @param type - Instrument type ('forex', 'index', 'commodity')
 * @returns Array of instruments matching the type
 */
export function getInstrumentsByType(type: Instrument['type']): Instrument[] {
  return mockInstruments.filter(instrument => instrument.type === type);
}

/**
 * Get all forex pairs
 */
export function getForexPairs(): Instrument[] {
  return getInstrumentsByType('forex');
}

/**
 * Get all indices
 */
export function getIndices(): Instrument[] {
  return getInstrumentsByType('index');
}

/**
 * Get all commodities
 */
export function getCommodities(): Instrument[] {
  return getInstrumentsByType('commodity');
}
