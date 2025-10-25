/**
 * Tests for Candlestick Data Generator
 * RED PHASE: These tests should FAIL until we implement the generator
 */

import { describe, it, expect } from 'vitest';
import { generateCandlesticks, getTimeframeMilliseconds } from '../data/candlesticks';
import { mockInstruments } from '../data/instruments';
import type { Timeframe } from '../../types/trading';

describe('Candlestick Data Generator', () => {
  const eurUsd = mockInstruments.find(i => i.id === 'EUR_USD')!;

  describe('getTimeframeMilliseconds', () => {
    it('should return correct milliseconds for each timeframe', () => {
      expect(getTimeframeMilliseconds('M1')).toBe(60 * 1000); // 1 minute
      expect(getTimeframeMilliseconds('M5')).toBe(5 * 60 * 1000); // 5 minutes
      expect(getTimeframeMilliseconds('M15')).toBe(15 * 60 * 1000); // 15 minutes
      expect(getTimeframeMilliseconds('M30')).toBe(30 * 60 * 1000); // 30 minutes
      expect(getTimeframeMilliseconds('H1')).toBe(60 * 60 * 1000); // 1 hour
      expect(getTimeframeMilliseconds('H4')).toBe(4 * 60 * 60 * 1000); // 4 hours
      expect(getTimeframeMilliseconds('D1')).toBe(24 * 60 * 60 * 1000); // 1 day
    });
  });

  describe('generateCandlesticks', () => {
    it('should generate requested number of candlesticks', () => {
      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 100,
      });

      expect(candlesticks).toBeDefined();
      expect(candlesticks.length).toBe(100);
    });

    it('should generate candlesticks with valid OHLCV structure', () => {
      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 10,
      });

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
      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 50,
      });

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
      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 10,
      });

      const expectedInterval = 60 * 60 * 1000; // 1 hour

      for (let i = 1; i < candlesticks.length; i++) {
        const timeDiff = candlesticks[i].timestamp - candlesticks[i - 1].timestamp;
        expect(timeDiff).toBe(expectedInterval);
      }
    });

    it('should be deterministic with same seed', () => {
      const seed = 12345;

      const candlesticks1 = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 20,
        seed,
      });

      const candlesticks2 = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 20,
        seed,
      });

      // Both runs should produce identical results
      expect(candlesticks1.length).toBe(candlesticks2.length);

      for (let i = 0; i < candlesticks1.length; i++) {
        expect(candlesticks1[i].timestamp).toBe(candlesticks2[i].timestamp);
        expect(candlesticks1[i].open).toBe(candlesticks2[i].open);
        expect(candlesticks1[i].high).toBe(candlesticks2[i].high);
        expect(candlesticks1[i].low).toBe(candlesticks2[i].low);
        expect(candlesticks1[i].close).toBe(candlesticks2[i].close);
        expect(candlesticks1[i].volume).toBe(candlesticks2[i].volume);
      }
    });

    it('should generate different data with different seeds', () => {
      const candlesticks1 = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 10,
        seed: 111,
      });

      const candlesticks2 = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 10,
        seed: 222,
      });

      // At least some values should be different
      let hasDifference = false;
      for (let i = 0; i < candlesticks1.length; i++) {
        if (
          candlesticks1[i].open !== candlesticks2[i].open ||
          candlesticks1[i].high !== candlesticks2[i].high ||
          candlesticks1[i].low !== candlesticks2[i].low ||
          candlesticks1[i].close !== candlesticks2[i].close
        ) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
    });

    it('should generate realistic prices for forex pairs', () => {
      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 20,
      });

      candlesticks.forEach(candle => {
        // EUR/USD typically trades in 1.0000 - 1.3000 range
        expect(candle.open).toBeGreaterThan(0.9);
        expect(candle.open).toBeLessThan(1.5);
        expect(candle.high).toBeGreaterThan(0.9);
        expect(candle.high).toBeLessThan(1.5);
        expect(candle.low).toBeGreaterThan(0.9);
        expect(candle.low).toBeLessThan(1.5);
        expect(candle.close).toBeGreaterThan(0.9);
        expect(candle.close).toBeLessThan(1.5);

        // Volume should be positive
        expect(candle.volume).toBeGreaterThan(0);
      });
    });

    it('should respect instrument precision', () => {
      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 10,
      });

      candlesticks.forEach(candle => {
        // EUR/USD has precision 5 (5 decimal places)
        const countDecimals = (num: number) => {
          const str = num.toString();
          const decimalIndex = str.indexOf('.');
          return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
        };

        expect(countDecimals(candle.open)).toBeLessThanOrEqual(eurUsd.precision);
        expect(countDecimals(candle.high)).toBeLessThanOrEqual(eurUsd.precision);
        expect(countDecimals(candle.low)).toBeLessThanOrEqual(eurUsd.precision);
        expect(countDecimals(candle.close)).toBeLessThanOrEqual(eurUsd.precision);
      });
    });

    it('should work with different timeframes', () => {
      const timeframes: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

      timeframes.forEach(timeframe => {
        const candlesticks = generateCandlesticks({
          instrument: eurUsd,
          timeframe,
          count: 5,
        });

        expect(candlesticks.length).toBe(5);

        // Verify timestamp intervals match timeframe
        const expectedInterval = getTimeframeMilliseconds(timeframe);
        for (let i = 1; i < candlesticks.length; i++) {
          const timeDiff = candlesticks[i].timestamp - candlesticks[i - 1].timestamp;
          expect(timeDiff).toBe(expectedInterval);
        }
      });
    });

    it('should use custom startTime when provided', () => {
      const customStartTime = new Date('2024-01-01T00:00:00Z').getTime();

      const candlesticks = generateCandlesticks({
        instrument: eurUsd,
        timeframe: 'H1',
        count: 5,
        startTime: customStartTime,
      });

      expect(candlesticks[0].timestamp).toBe(customStartTime);
    });
  });
});
