/**
 * Tests for filter-utils.ts
 * Tests the filterInstruments function for search and filter functionality
 */

import { describe, it, expect } from 'vitest';
import { filterInstruments } from '../filter-utils';
import type { Instrument } from '../../types/trading';

// Mock instruments for testing
const mockInstruments: Instrument[] = [
  {
    id: 'EUR_USD',
    name: 'Euro / US Dollar',
    symbol: 'EUR/USD',
    type: 'forex',
    spread: 0.00015,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
  {
    id: 'BTC_USD',
    name: 'Bitcoin / US Dollar',
    symbol: 'BTC/USD',
    type: 'crypto',
    spread: 0.5,
    pip_value: 0.01,
    min_trade_size: 0.001,
    max_trade_size: 10,
    precision: 2,
  },
  {
    id: 'AAPL',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'stock',
    spread: 0.01,
    pip_value: 0.01,
    min_trade_size: 1,
    max_trade_size: 10000,
    precision: 2,
  },
  {
    id: 'GBP_USD',
    name: 'British Pound / US Dollar',
    symbol: 'GBP/USD',
    type: 'forex',
    spread: 0.0002,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  },
  {
    id: 'ETH_USD',
    name: 'Ethereum / US Dollar',
    symbol: 'ETH/USD',
    type: 'crypto',
    spread: 0.25,
    pip_value: 0.01,
    min_trade_size: 0.01,
    max_trade_size: 50,
    precision: 2,
  },
];

describe('filterInstruments', () => {
  describe('when instruments is undefined', () => {
    it('should return empty array', () => {
      const result = filterInstruments(undefined, '', 'all');
      expect(result).toEqual([]);
    });
  });

  describe('when filter is "all" and search is empty', () => {
    it('should return all instruments', () => {
      const result = filterInstruments(mockInstruments, '', 'all');
      expect(result).toEqual(mockInstruments);
      expect(result).toHaveLength(5);
    });
  });

  describe('search filtering', () => {
    it('should filter by symbol (case-insensitive)', () => {
      const result = filterInstruments(mockInstruments, 'eur', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('EUR/USD');
    });

    it('should filter by name (case-insensitive)', () => {
      const result = filterInstruments(mockInstruments, 'apple', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('AAPL');
    });

    it('should filter by partial symbol match', () => {
      const result = filterInstruments(mockInstruments, 'USD', 'all');
      expect(result).toHaveLength(4); // EUR/USD, BTC/USD, GBP/USD, ETH/USD
    });

    it('should filter by partial name match', () => {
      const result = filterInstruments(mockInstruments, 'bitcoin', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('BTC/USD');
    });

    it('should return empty array when no matches found', () => {
      const result = filterInstruments(mockInstruments, 'xyz123', 'all');
      expect(result).toHaveLength(0);
    });

    it('should handle uppercase search terms', () => {
      const result = filterInstruments(mockInstruments, 'APPLE', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('AAPL');
    });

    it('should handle mixed case search terms', () => {
      const result = filterInstruments(mockInstruments, 'EuRo', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('EUR/USD');
    });
  });

  describe('type filtering', () => {
    it('should filter by forex type', () => {
      const result = filterInstruments(mockInstruments, '', 'forex');
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.type === 'forex')).toBe(true);
    });

    it('should filter by crypto type', () => {
      const result = filterInstruments(mockInstruments, '', 'crypto');
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.type === 'crypto')).toBe(true);
    });

    it('should filter by stocks type', () => {
      const result = filterInstruments(mockInstruments, '', 'stocks');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('stock');
    });

    it('should return empty array for favorites (not yet implemented)', () => {
      const result = filterInstruments(mockInstruments, '', 'favorites');
      expect(result).toHaveLength(0);
    });
  });

  describe('combined search and filter', () => {
    it('should apply both search and type filter', () => {
      const result = filterInstruments(mockInstruments, 'USD', 'forex');
      expect(result).toHaveLength(2); // EUR/USD, GBP/USD
      expect(result.every((i) => i.type === 'forex')).toBe(true);
    });

    it('should return empty when search matches but type does not', () => {
      const result = filterInstruments(mockInstruments, 'AAPL', 'forex');
      expect(result).toHaveLength(0);
    });

    it('should return empty when type matches but search does not', () => {
      const result = filterInstruments(mockInstruments, 'xyz', 'forex');
      expect(result).toHaveLength(0);
    });

    it('should handle search with crypto filter', () => {
      const result = filterInstruments(mockInstruments, 'BTC', 'crypto');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('BTC/USD');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string search', () => {
      const result = filterInstruments(mockInstruments, '', 'all');
      expect(result).toEqual(mockInstruments);
    });

    it('should handle whitespace in search', () => {
      const result = filterInstruments(mockInstruments, '  eur  ', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('EUR/USD');
    });

    it('should handle empty instruments array', () => {
      const result = filterInstruments([], 'test', 'all');
      expect(result).toHaveLength(0);
    });
  });
});
