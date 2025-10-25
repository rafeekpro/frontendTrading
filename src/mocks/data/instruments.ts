/**
 * Mock Instruments Data
 *
 * Generated realistic mock data for tradable financial instruments including:
 * - Major stocks (AAPL, GOOGL, MSFT, TSLA, etc.)
 * - Cryptocurrencies (BTC, ETH, SOL, DOGE, etc.)
 * - Forex currency pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
 *
 * Uses the instrument generator with a fixed seed for consistency.
 */

import type { Instrument } from '../../types/trading';
import { generateInstruments } from '../generators/instruments';

/**
 * Mock instruments database
 * Generated using instrument generator with fixed seed for reproducibility.
 * Contains 60+ realistic trading instruments.
 */
export const mockInstruments: Instrument[] = generateInstruments(60, 42);

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
