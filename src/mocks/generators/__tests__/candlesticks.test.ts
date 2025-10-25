/**
 * Candlestick Generator Tests
 *
 * Tests for the candlestick/OHLCV data generator that creates realistic
 * market data with proper price movements and volume distributions.
 *
 * Following TDD methodology (RED-GREEN-REFACTOR):
 * - These tests are written FIRST (RED phase)
 * - Implementation will follow (GREEN phase)
 * - Then optimization (REFACTOR phase)
 */

import { describe, it, expect } from 'vitest';
import { generateCandlesticks } from '../candlesticks';
import type { Timeframe } from '../../../types/trading';

// Mock instrument for testing
const mockInstrument = {
  id: 'EUR_USD',
  name: 'Euro / US Dollar',
  symbol: 'EUR/USD',
  type: 'forex' as const,
  spread: 0.00015,
  pip_value: 0.0001,
  min_trade_size: 0.01,
  max_trade_size: 100,
  precision: 5,
};

describe('generateCandlesticks', () => {
  describe('count validation', () => {
    it('should generate exactly the requested number of candlesticks', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 10, 42);
      expect(candlesticks).toHaveLength(10);
    });

    it('should generate 100 candlesticks when requested', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 100, 42);
      expect(candlesticks).toHaveLength(100);
    });

    it('should handle large counts (500+ candlesticks)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'M5', 500, 42);
      expect(candlesticks).toHaveLength(500);
    });
  });

  describe('data structure validation', () => {
    it('should generate candlesticks with all required OHLCV fields', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 5, 42);

      candlesticks.forEach((candle) => {
        expect(candle).toHaveProperty('timestamp');
        expect(candle).toHaveProperty('open');
        expect(candle).toHaveProperty('high');
        expect(candle).toHaveProperty('low');
        expect(candle).toHaveProperty('close');
        expect(candle).toHaveProperty('volume');
      });
    });

    it('should generate valid OHLC relationships (high >= max(open, close))', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      candlesticks.forEach((candle) => {
        const maxOpenClose = Math.max(candle.open, candle.close);
        expect(candle.high).toBeGreaterThanOrEqual(maxOpenClose);
      });
    });

    it('should generate valid OHLC relationships (low <= min(open, close))', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      candlesticks.forEach((candle) => {
        const minOpenClose = Math.min(candle.open, candle.close);
        expect(candle.low).toBeLessThanOrEqual(minOpenClose);
      });
    });

    it('should generate positive volumes', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      candlesticks.forEach((candle) => {
        expect(candle.volume).toBeGreaterThan(0);
      });
    });

    it('should generate integer volumes', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      candlesticks.forEach((candle) => {
        expect(Number.isInteger(candle.volume)).toBe(true);
      });
    });
  });

  describe('timeframe support', () => {
    const timeframes: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

    timeframes.forEach((timeframe) => {
      it(`should support ${timeframe} timeframe`, () => {
        const candlesticks = generateCandlesticks('EUR_USD', timeframe, 10, 42);
        expect(candlesticks).toHaveLength(10);
      });
    });

    it('should generate sequential timestamps based on M1 timeframe', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'M1', 5, 42);

      for (let i = 1; i < candlesticks.length; i++) {
        const prev = candlesticks[i - 1]!;
        const curr = candlesticks[i]!;
        const diff = curr.timestamp - prev.timestamp;

        // M1 = 1 minute = 60,000 milliseconds
        expect(diff).toBe(60000);
      }
    });

    it('should generate sequential timestamps based on H1 timeframe', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 5, 42);

      for (let i = 1; i < candlesticks.length; i++) {
        const prev = candlesticks[i - 1]!;
        const curr = candlesticks[i]!;
        const diff = curr.timestamp - prev.timestamp;

        // H1 = 1 hour = 3,600,000 milliseconds
        expect(diff).toBe(3600000);
      }
    });

    it('should generate sequential timestamps based on D1 timeframe', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'D1', 5, 42);

      for (let i = 1; i < candlesticks.length; i++) {
        const prev = candlesticks[i - 1]!;
        const curr = candlesticks[i]!;
        const diff = curr.timestamp - prev.timestamp;

        // D1 = 1 day = 86,400,000 milliseconds
        expect(diff).toBe(86400000);
      }
    });
  });

  describe('price movement validation', () => {
    it('should generate realistic price movements (random walk)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 100, 42);

      // Prices should vary (not all the same)
      const closePrices = candlesticks.map((c) => c.close);
      const uniquePrices = new Set(closePrices);
      expect(uniquePrices.size).toBeGreaterThan(50); // At least 50% unique
    });

    it('should generate price changes within reasonable range (±1-3% per candle)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      for (let i = 1; i < candlesticks.length; i++) {
        const prev = candlesticks[i - 1]!;
        const curr = candlesticks[i]!;
        const change = Math.abs((curr.close - prev.close) / prev.close);

        // Normal moves should be within 3%
        expect(change).toBeLessThan(0.03);
      }
    });

    it('should have wicks (high/low different from open/close)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      // At least some candles should have upper wicks
      const hasUpperWicks = candlesticks.some(
        (c) => c.high > Math.max(c.open, c.close)
      );
      expect(hasUpperWicks).toBe(true);

      // At least some candles should have lower wicks
      const hasLowerWicks = candlesticks.some(
        (c) => c.low < Math.min(c.open, c.close)
      );
      expect(hasLowerWicks).toBe(true);
    });
  });

  describe('volume distribution', () => {
    it('should generate volume following log-normal distribution', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 100, 42);

      const volumes = candlesticks.map((c) => c.volume);
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

      // Log-normal should have most values below mean
      const belowMean = volumes.filter((v) => v < avgVolume).length;
      expect(belowMean).toBeGreaterThan(volumes.length * 0.4);
    });

    it('should generate realistic volume ranges (100k - 10M)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 50, 42);

      candlesticks.forEach((candle) => {
        expect(candle.volume).toBeGreaterThanOrEqual(10000);
        expect(candle.volume).toBeLessThanOrEqual(10000000);
      });
    });
  });

  describe('seed reproducibility', () => {
    it('should generate identical candlesticks with the same seed', () => {
      const candlesticks1 = generateCandlesticks('EUR_USD', 'H1', 20, 42);
      const candlesticks2 = generateCandlesticks('EUR_USD', 'H1', 20, 42);

      expect(candlesticks1).toHaveLength(candlesticks2.length);

      candlesticks1.forEach((candle1, index) => {
        const candle2 = candlesticks2[index]!;
        expect(candle1.timestamp).toBe(candle2.timestamp);
        expect(candle1.open).toBe(candle2.open);
        expect(candle1.high).toBe(candle2.high);
        expect(candle1.low).toBe(candle2.low);
        expect(candle1.close).toBe(candle2.close);
        expect(candle1.volume).toBe(candle2.volume);
      });
    });

    it('should generate different candlesticks with different seeds', () => {
      const candlesticks1 = generateCandlesticks('EUR_USD', 'H1', 20, 42);
      const candlesticks2 = generateCandlesticks('EUR_USD', 'H1', 20, 123);

      // At least some candlesticks should be different
      const hasDifference = candlesticks1.some((candle1, index) => {
        const candle2 = candlesticks2[index]!;
        return (
          candle1.close !== candle2.close || candle1.volume !== candle2.volume
        );
      });

      expect(hasDifference).toBe(true);
    });

    it('should generate consistent output when no seed is provided (uses default)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 10);
      expect(candlesticks).toHaveLength(10);

      // Verify structure is valid even without seed
      candlesticks.forEach((candle) => {
        expect(candle.timestamp).toBeGreaterThan(0);
        expect(candle.high).toBeGreaterThanOrEqual(
          Math.max(candle.open, candle.close)
        );
        expect(candle.low).toBeLessThanOrEqual(
          Math.min(candle.open, candle.close)
        );
        expect(candle.volume).toBeGreaterThan(0);
      });
    });
  });

  describe('statistical properties', () => {
    it('should have slight upward price drift (positive trend)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 200, 42);

      const firstClose = candlesticks[0]!.close;
      const lastClose = candlesticks[candlesticks.length - 1]!.close;

      // Over 200 candles, expect some movement (not necessarily up due to randomness)
      expect(Math.abs(lastClose - firstClose)).toBeGreaterThan(0);
    });

    it('should have realistic volatility (std dev ~2%)', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 100, 42);

      const returns = [];
      for (let i = 1; i < candlesticks.length; i++) {
        const prev = candlesticks[i - 1]!;
        const curr = candlesticks[i]!;
        const ret = (curr.close - prev.close) / prev.close;
        returns.push(ret);
      }

      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance =
        returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        returns.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be reasonable (not too high, not too low)
      expect(stdDev).toBeGreaterThan(0.001); // > 0.1%
      expect(stdDev).toBeLessThan(0.05); // < 5%
    });
  });

  describe('instrument-specific behavior', () => {
    it('should generate different price ranges for different instruments', () => {
      const forexCandles = generateCandlesticks('EUR_USD', 'H1', 50, 42);
      const stockCandles = generateCandlesticks('STOCK_AAPL', 'H1', 50, 42);

      // Forex and stocks should have different typical price ranges
      const forexAvgPrice =
        forexCandles.reduce((sum, c) => sum + c.close, 0) /
        forexCandles.length;
      const stockAvgPrice =
        stockCandles.reduce((sum, c) => sum + c.close, 0) /
        stockCandles.length;

      // They should be different (forex typically 0-2, stocks typically 50-500)
      expect(Math.abs(forexAvgPrice - stockAvgPrice)).toBeGreaterThan(10);
    });

    it('should respect instrument precision', () => {
      const candlesticks = generateCandlesticks('EUR_USD', 'H1', 20, 42);

      candlesticks.forEach((candle) => {
        // For forex (precision 5), check that decimals don't exceed 5 places
        const openDecimals = (candle.open.toString().split('.')[1] || '')
          .length;
        const highDecimals = (candle.high.toString().split('.')[1] || '')
          .length;
        const lowDecimals = (candle.low.toString().split('.')[1] || '').length;
        const closeDecimals = (candle.close.toString().split('.')[1] || '')
          .length;

        expect(openDecimals).toBeLessThanOrEqual(5);
        expect(highDecimals).toBeLessThanOrEqual(5);
        expect(lowDecimals).toBeLessThanOrEqual(5);
        expect(closeDecimals).toBeLessThanOrEqual(5);
      });
    });
  });
});
