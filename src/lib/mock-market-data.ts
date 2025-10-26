/**
 * Mock Market Data Utilities
 * REFACTOR Phase: Extracted from InstrumentsList for reusability and testing
 *
 * Generates deterministic mock market data for instruments
 */

import type { Instrument } from '../types/trading';
import type { InstrumentWithMarketData } from './list-utils';

/**
 * Get exchange for instrument based on type
 */
export function getExchangeForInstrument(instrument: Instrument): string {
  switch (instrument.type) {
    case 'forex':
      return 'FOREX';
    case 'crypto':
      return 'CRYPTO';
    case 'stock':
      return getStockExchange(instrument.symbol);
    case 'index':
      return 'INDEX';
    case 'commodity':
      return 'COMMODITY';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Get stock exchange based on symbol pattern
 * Simple heuristic - in real app, this would come from API
 */
function getStockExchange(symbol: string): string {
  if (symbol.includes('.L')) return 'LSE';
  if (symbol.includes('.HK')) return 'HKEX';
  if (symbol.includes('.T')) return 'TSE';
  return 'NASDAQ';
}

/**
 * Generate mock current price
 * Uses deterministic hash for consistent values
 */
export function getMockPrice(instrument: Instrument): number {
  const hash = hashString(instrument.id);
  const basePrice = (hash % 10000) + 1;

  switch (instrument.type) {
    case 'forex':
      return basePrice / 10000 + 1.0; // 1.0 - 2.0 range
    case 'crypto':
      return basePrice * 5; // 0 - 50000 range
    case 'stock':
      return basePrice / 50; // 0 - 200 range
    default:
      return basePrice / 100;
  }
}

/**
 * Generate mock 24h change percentage
 * Uses deterministic hash for consistent values
 */
export function getMockChange24h(instrument: Instrument): number {
  const hash = hashString(instrument.id + 'change');
  return ((hash % 1000) - 500) / 100; // -5% to +5% range
}

/**
 * Generate mock 24h volume
 * Uses deterministic hash for consistent values
 */
export function getMockVolume24h(instrument: Instrument): number {
  const hash = hashString(instrument.id + 'volume');
  const base = (hash % 100000000) + 1000000;

  switch (instrument.type) {
    case 'crypto':
      return base * 10;
    case 'stock':
      return base * 5;
    default:
      return base;
  }
}

/**
 * Transform instrument to include mock market data
 * Main function for adding market data to instruments
 */
export function addMockMarketData(instrument: Instrument): InstrumentWithMarketData {
  return {
    ...instrument,
    exchange: getExchangeForInstrument(instrument),
    currentPrice: getMockPrice(instrument),
    change24h: getMockChange24h(instrument),
    volume24h: getMockVolume24h(instrument),
  };
}

/**
 * Transform array of instruments to include mock market data
 */
export function addMockMarketDataToAll(instruments: Instrument[]): InstrumentWithMarketData[] {
  return instruments.map(addMockMarketData);
}

/**
 * Simple string hash function for deterministic mock data
 * Uses djb2 algorithm for consistent hashing
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; // hash * 33 + char
  }
  return Math.abs(hash);
}
