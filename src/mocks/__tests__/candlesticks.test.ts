/**
 * Tests for Candlestick Data
 */

import { describe, it, expect } from 'vitest';
import { getCandlesticks, mockCandlesticks } from '../data/candlesticks';
import { mockInstruments } from '../data/instruments';

describe('Candlestick Data', () => {
  const eurUsd = mockInstruments.find(i => i.id === 'FOREX_EUR_USD');
  if (!eurUsd) throw new Error('FOREX_EUR_USD instrument not found');

  describe('getCandlesticks', () => {
    it('should generate requested number of candlesticks', () => {
      const candlesticks = getCandlesticks('FOREX_EUR_USD', 'H1', 100);

      expect(candlesticks).toBeDefined();
      expect(candlesticks.length).toBe(100);
    });

    it('should generate candlesticks with valid OHLCV structure', () => {
      const candlesticks = getCandlesticks('FOREX_EUR_USD', 'H1', 10);

      candlesticks.forEach(candle => {
        expect(candle).toHaveProperty('timestamp');
        expect(candle).toHaveProperty('open');
        expect(candle).toHaveProperty('high');
        expect(candle).toHaveProperty('low');
        expect(candle).toHaveProperty('close');
        expect(candle).toHaveProperty('volume');

        // All values should be numbers
        expect(typeof candle.timestamp).toBe('number');
        expect(typeof candle.open).toBe('number');
        expect(typeof candle.high).toBe('number');
        expect(typeof candle.low).toBe('number');
        expect(typeof candle.close).toBe('number');
        expect(typeof candle.volume).toBe('number');
      });
    });

    it('should enforce valid OHLC relationships', () => {
      const candlesticks = getCandlesticks('FOREX_EUR_USD', 'H1', 50);

      candlesticks.forEach(candle => {
        // High should be the highest price
        expect(candle.high).toBeGreaterThanOrEqual(candle.open);
        expect(candle.high).toBeGreaterThanOrEqual(candle.close);
        expect(candle.high).toBeGreaterThanOrEqual(candle.low);

        // Low should be the lowest price
        expect(candle.low).toBeLessThanOrEqual(candle.open);
        expect(candle.low).toBeLessThanOrEqual(candle.close);
        expect(candle.low).toBeLessThanOrEqual(candle.high);
      });
    });

    it('should generate timestamps in correct intervals', () => {
      const candlesticks = getCandlesticks('FOREX_EUR_USD', 'H1', 10);

      const expectedInterval = 60 * 60 * 1000; // 1 hour

      for (let i = 1; i < candlesticks.length; i++) {
        const timeDiff =
          candlesticks[i].timestamp - candlesticks[i - 1].timestamp;
        expect(timeDiff).toBe(expectedInterval);
      }
    });
  });

  describe('mockCandlesticks', () => {
    it('should have pre-generated forex candlesticks', () => {
      expect(mockCandlesticks.EUR_USD).toBeDefined();
      expect(mockCandlesticks.EUR_USD.length).toBe(200);
      expect(mockCandlesticks.GBP_USD).toBeDefined();
      expect(mockCandlesticks.GBP_USD.length).toBe(200);
    });

    it('should have pre-generated stock candlesticks', () => {
      expect(mockCandlesticks.AAPL).toBeDefined();
      expect(mockCandlesticks.AAPL.length).toBe(200);
      expect(mockCandlesticks.GOOGL).toBeDefined();
      expect(mockCandlesticks.GOOGL.length).toBe(200);
    });

    it('should have pre-generated crypto candlesticks', () => {
      expect(mockCandlesticks.BTC).toBeDefined();
      expect(mockCandlesticks.BTC.length).toBe(200);
      expect(mockCandlesticks.ETH).toBeDefined();
      expect(mockCandlesticks.ETH.length).toBe(200);
    });
  });
});
