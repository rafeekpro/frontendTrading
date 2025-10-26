/**
 * Tests for list-utils.ts
 * Test search, filter, and sort functionality for InstrumentsList
 */

import { describe, it, expect } from 'vitest';
import type { Instrument } from '../../types/trading';
import {
  filterInstrumentsBySearch,
  filterInstrumentsByType,
  filterInstrumentsByExchange,
  sortInstruments,
  applyAllFilters,
  type SortColumn,
  type SortDirection,
  type InstrumentWithMarketData,
} from '../list-utils';

// Mock instruments with market data
const mockInstruments: InstrumentWithMarketData[] = [
  {
    id: 'FOREX_EUR_USD',
    name: 'Euro / US Dollar',
    symbol: 'EUR/USD',
    type: 'forex',
    spread: 0.00015,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
    exchange: 'FOREX',
    currentPrice: 1.0856,
    change24h: 0.25,
    volume24h: 1250000,
  },
  {
    id: 'CRYPTO_BTC',
    name: 'Bitcoin',
    symbol: 'BTC/USD',
    type: 'crypto',
    spread: 0.001,
    pip_value: 0.00000001,
    min_trade_size: 0.001,
    max_trade_size: 1000,
    precision: 8,
    exchange: 'BINANCE',
    currentPrice: 45230.5,
    change24h: -1.45,
    volume24h: 28500000000,
  },
  {
    id: 'STOCK_AAPL',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'stock',
    spread: 0.0001,
    pip_value: 0.01,
    min_trade_size: 1,
    max_trade_size: 10000,
    precision: 2,
    exchange: 'NASDAQ',
    currentPrice: 178.25,
    change24h: 1.15,
    volume24h: 56000000,
  },
  {
    id: 'STOCK_GOOGL',
    name: 'Alphabet Inc.',
    symbol: 'GOOGL',
    type: 'stock',
    spread: 0.0001,
    pip_value: 0.01,
    min_trade_size: 1,
    max_trade_size: 10000,
    precision: 2,
    exchange: 'NASDAQ',
    currentPrice: 142.8,
    change24h: -0.35,
    volume24h: 24000000,
  },
  {
    id: 'CRYPTO_ETH',
    name: 'Ethereum',
    symbol: 'ETH/USD',
    type: 'crypto',
    spread: 0.001,
    pip_value: 0.00000001,
    min_trade_size: 0.001,
    max_trade_size: 1000,
    precision: 8,
    exchange: 'BINANCE',
    currentPrice: 2845.6,
    change24h: 2.5,
    volume24h: 15000000000,
  },
];

describe('filterInstrumentsBySearch', () => {
  it('should return all instruments when search is empty', () => {
    const result = filterInstrumentsBySearch(mockInstruments, '');
    expect(result).toEqual(mockInstruments);
  });

  it('should filter by symbol (case-insensitive)', () => {
    const result = filterInstrumentsBySearch(mockInstruments, 'btc');
    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe('BTC/USD');
  });

  it('should filter by name (case-insensitive)', () => {
    const result = filterInstrumentsBySearch(mockInstruments, 'apple');
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Apple Inc.');
  });

  it('should filter by partial matches', () => {
    const result = filterInstrumentsBySearch(mockInstruments, 'USD');
    expect(result.length).toBeGreaterThanOrEqual(2); // EUR/USD, BTC/USD
  });

  it('should handle multi-word search', () => {
    const result = filterInstrumentsBySearch(mockInstruments, 'euro dollar');
    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe('EUR/USD');
  });

  it('should trim whitespace from search query', () => {
    const result = filterInstrumentsBySearch(mockInstruments, '  AAPL  ');
    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe('AAPL');
  });

  it('should return empty array when no matches', () => {
    const result = filterInstrumentsBySearch(mockInstruments, 'NONEXISTENT');
    expect(result).toEqual([]);
  });
});

describe('filterInstrumentsByType', () => {
  it('should return all instruments when filter is "all"', () => {
    const result = filterInstrumentsByType(mockInstruments, 'all');
    expect(result).toEqual(mockInstruments);
  });

  it('should filter by forex type', () => {
    const result = filterInstrumentsByType(mockInstruments, 'forex');
    expect(result).toHaveLength(1);
    expect(result.every((i) => i.type === 'forex')).toBe(true);
  });

  it('should filter by crypto type', () => {
    const result = filterInstrumentsByType(mockInstruments, 'crypto');
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.type === 'crypto')).toBe(true);
  });

  it('should filter by stock type (singular)', () => {
    const result = filterInstrumentsByType(mockInstruments, 'stock');
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.type === 'stock')).toBe(true);
  });

  it('should filter by stocks type (plural)', () => {
    const result = filterInstrumentsByType(mockInstruments, 'stocks');
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.type === 'stock')).toBe(true);
  });

  it('should return empty array for favorites (not yet implemented)', () => {
    const result = filterInstrumentsByType(mockInstruments, 'favorites');
    expect(result).toEqual([]);
  });
});

describe('filterInstrumentsByExchange', () => {
  it('should return all instruments when exchange filter is "all"', () => {
    const result = filterInstrumentsByExchange(mockInstruments, 'all');
    expect(result).toEqual(mockInstruments);
  });

  it('should filter by NASDAQ exchange', () => {
    const result = filterInstrumentsByExchange(mockInstruments, 'NASDAQ');
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.exchange === 'NASDAQ')).toBe(true);
  });

  it('should filter by BINANCE exchange', () => {
    const result = filterInstrumentsByExchange(mockInstruments, 'BINANCE');
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.exchange === 'BINANCE')).toBe(true);
  });

  it('should filter by FOREX exchange', () => {
    const result = filterInstrumentsByExchange(mockInstruments, 'FOREX');
    expect(result).toHaveLength(1);
    expect(result[0]?.exchange).toBe('FOREX');
  });

  it('should return empty array when no instruments match exchange', () => {
    const result = filterInstrumentsByExchange(mockInstruments, 'NYSE');
    expect(result).toEqual([]);
  });
});

describe('sortInstruments', () => {
  it('should sort by symbol ascending', () => {
    const result = sortInstruments(mockInstruments, 'symbol', 'asc');
    expect(result[0]?.symbol).toBe('AAPL');
    expect(result[result.length - 1]?.symbol).toBe('GOOGL');
  });

  it('should sort by symbol descending', () => {
    const result = sortInstruments(mockInstruments, 'symbol', 'desc');
    expect(result[0]?.symbol).toBe('GOOGL');
    expect(result[result.length - 1]?.symbol).toBe('AAPL');
  });

  it('should sort by name ascending', () => {
    const result = sortInstruments(mockInstruments, 'name', 'asc');
    expect(result[0]?.name).toBe('Alphabet Inc.');
    expect(result[result.length - 1]?.name).toBe('Euro / US Dollar');
  });

  it('should sort by name descending', () => {
    const result = sortInstruments(mockInstruments, 'name', 'desc');
    expect(result[0]?.name).toBe('Euro / US Dollar');
    expect(result[result.length - 1]?.name).toBe('Alphabet Inc.');
  });

  it('should sort by price ascending', () => {
    const result = sortInstruments(mockInstruments, 'price', 'asc');
    expect(result[0]?.currentPrice).toBe(1.0856);
    expect(result[result.length - 1]?.currentPrice).toBe(45230.5);
  });

  it('should sort by price descending', () => {
    const result = sortInstruments(mockInstruments, 'price', 'desc');
    expect(result[0]?.currentPrice).toBe(45230.5);
    expect(result[result.length - 1]?.currentPrice).toBe(1.0856);
  });

  it('should sort by change24h ascending (most negative first)', () => {
    const result = sortInstruments(mockInstruments, 'change', 'asc');
    expect(result[0]?.change24h).toBe(-1.45);
    expect(result[result.length - 1]?.change24h).toBe(2.5);
  });

  it('should sort by change24h descending (most positive first)', () => {
    const result = sortInstruments(mockInstruments, 'change', 'desc');
    expect(result[0]?.change24h).toBe(2.5);
    expect(result[result.length - 1]?.change24h).toBe(-1.45);
  });

  it('should sort by volume24h ascending', () => {
    const result = sortInstruments(mockInstruments, 'volume', 'asc');
    expect(result[0]?.volume24h).toBe(1250000);
    expect(result[result.length - 1]?.volume24h).toBe(28500000000);
  });

  it('should sort by volume24h descending', () => {
    const result = sortInstruments(mockInstruments, 'volume', 'desc');
    expect(result[0]?.volume24h).toBe(28500000000);
    expect(result[result.length - 1]?.volume24h).toBe(1250000);
  });

  it('should return new array (immutable)', () => {
    const result = sortInstruments(mockInstruments, 'symbol', 'asc');
    expect(result).not.toBe(mockInstruments);
  });
});

describe('applyAllFilters', () => {
  it('should apply all filters and sort', () => {
    const result = applyAllFilters(mockInstruments, {
      search: 'USD',
      type: 'crypto',
      exchange: 'all',
      sortColumn: 'price',
      sortDirection: 'desc',
    });

    expect(result.length).toBe(2); // BTC/USD, ETH/USD
    expect(result[0]?.symbol).toBe('BTC/USD'); // Higher price
    expect(result[1]?.symbol).toBe('ETH/USD');
  });

  it('should combine search and type filter', () => {
    const result = applyAllFilters(mockInstruments, {
      search: 'inc',
      type: 'stock',
      exchange: 'all',
      sortColumn: 'symbol',
      sortDirection: 'asc',
    });

    expect(result.length).toBe(2); // AAPL, GOOGL
    expect(result.every((i) => i.name.includes('Inc.'))).toBe(true);
  });

  it('should combine type and exchange filter', () => {
    const result = applyAllFilters(mockInstruments, {
      search: '',
      type: 'stock',
      exchange: 'NASDAQ',
      sortColumn: 'name',
      sortDirection: 'asc',
    });

    expect(result.length).toBe(2);
    expect(result[0]?.name).toBe('Alphabet Inc.');
    expect(result[1]?.name).toBe('Apple Inc.');
  });

  it('should return empty array when filters match nothing', () => {
    const result = applyAllFilters(mockInstruments, {
      search: 'NONEXISTENT',
      type: 'all',
      exchange: 'all',
      sortColumn: 'symbol',
      sortDirection: 'asc',
    });

    expect(result).toEqual([]);
  });

  it('should handle all filters set to defaults', () => {
    const result = applyAllFilters(mockInstruments, {
      search: '',
      type: 'all',
      exchange: 'all',
      sortColumn: 'symbol',
      sortDirection: 'asc',
    });

    expect(result).toHaveLength(mockInstruments.length);
    expect(result[0]?.symbol).toBe('AAPL');
  });
});
