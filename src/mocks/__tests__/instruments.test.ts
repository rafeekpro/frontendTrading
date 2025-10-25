/**
 * Tests for Mock Instruments Data Generator
 * RED PHASE: These tests should FAIL until we implement the mock data
 */

import { describe, it, expect } from 'vitest';
import { mockInstruments, getInstrumentById } from '../data/instruments';
import type { Instrument, InstrumentType } from '../../types/trading';

describe('Mock Instruments Data', () => {
  describe('mockInstruments array', () => {
    it('should contain at least 10 instruments', () => {
      expect(mockInstruments).toBeDefined();
      expect(mockInstruments.length).toBeGreaterThanOrEqual(10);
    });

    it('should contain major forex pairs', () => {
      const forexPairs = mockInstruments.filter(i => i.type === 'forex');
      expect(forexPairs.length).toBeGreaterThanOrEqual(4);

      // Check for specific major pairs
      const symbols = forexPairs.map(i => i.symbol);
      expect(symbols).toContain('EUR/USD');
      expect(symbols).toContain('GBP/USD');
      expect(symbols).toContain('USD/JPY');
      expect(symbols).toContain('AUD/USD');
    });

    it('should contain stock indices', () => {
      const indices = mockInstruments.filter(i => i.type === 'index');
      expect(indices.length).toBeGreaterThanOrEqual(3);

      const names = indices.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes('s&p') || n.includes('500'))).toBe(true);
      expect(names.some(n => n.includes('nasdaq'))).toBe(true);
      expect(names.some(n => n.includes('dax'))).toBe(true);
    });

    it('should contain commodities', () => {
      const commodities = mockInstruments.filter(i => i.type === 'commodity');
      expect(commodities.length).toBeGreaterThanOrEqual(3);

      const names = commodities.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes('gold'))).toBe(true);
      expect(names.some(n => n.includes('silver'))).toBe(true);
      expect(names.some(n => n.includes('oil'))).toBe(true);
    });

    it('should have valid instrument structure', () => {
      mockInstruments.forEach((instrument: Instrument) => {
        // Required fields
        expect(instrument.id).toBeTruthy();
        expect(instrument.name).toBeTruthy();
        expect(instrument.symbol).toBeTruthy();
        expect(instrument.type).toBeTruthy();

        // Numeric fields should be positive
        expect(instrument.spread).toBeGreaterThan(0);
        expect(instrument.pip_value).toBeGreaterThan(0);
        expect(instrument.min_trade_size).toBeGreaterThan(0);
        expect(instrument.max_trade_size).toBeGreaterThan(0);
        expect(instrument.precision).toBeGreaterThanOrEqual(0);

        // Type should be valid
        expect(['forex', 'index', 'commodity']).toContain(instrument.type);

        // Max should be greater than min
        expect(instrument.max_trade_size).toBeGreaterThan(instrument.min_trade_size);
      });
    });

    it('should have realistic spreads for forex pairs', () => {
      const forexPairs = mockInstruments.filter(i => i.type === 'forex');

      forexPairs.forEach(pair => {
        // Spreads should be in reasonable range (0.00001 to 0.001 for forex)
        expect(pair.spread).toBeGreaterThan(0.000001);
        expect(pair.spread).toBeLessThan(0.01);

        // Major pairs should have tighter spreads
        const majorPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
        if (majorPairs.includes(pair.symbol)) {
          expect(pair.spread).toBeLessThan(0.0003); // Less than 3 pips
        }
      });
    });

    it('should have proper pip values', () => {
      const forexPairs = mockInstruments.filter(i => i.type === 'forex');

      forexPairs.forEach(pair => {
        // Most forex pairs have pip value of 0.0001
        // Except JPY pairs which have 0.01
        if (pair.symbol.includes('JPY')) {
          expect(pair.pip_value).toBe(0.01);
          expect(pair.precision).toBe(3);
        } else {
          expect(pair.pip_value).toBe(0.0001);
          expect(pair.precision).toBe(5);
        }
      });
    });
  });

  describe('getInstrumentById function', () => {
    it('should return instrument when ID exists', () => {
      const instrument = getInstrumentById('EUR_USD');
      expect(instrument).toBeDefined();
      expect(instrument?.id).toBe('EUR_USD');
      expect(instrument?.symbol).toBe('EUR/USD');
    });

    it('should return undefined when ID does not exist', () => {
      const instrument = getInstrumentById('INVALID_ID');
      expect(instrument).toBeUndefined();
    });

    it('should handle case sensitivity correctly', () => {
      const upperCase = getInstrumentById('EUR_USD');
      const lowerCase = getInstrumentById('eur_usd');

      // Should be case-sensitive
      expect(upperCase).toBeDefined();
      expect(lowerCase).toBeUndefined();
    });
  });
});
