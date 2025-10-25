/**
 * Position Generator Tests
 *
 * Tests for generatePositions() - ensures realistic open position data
 * with proper unrealized P&L calculations.
 */

import { describe, it, expect } from 'vitest';
import { generatePositions } from '../positions';
import type { Position } from '../../../types/trading';

describe('generatePositions', () => {
  const instrumentIds = ['EUR_USD', 'GBP_USD', 'BTC_USD'];
  const seed = 42;

  describe('Basic output validation', () => {
    it('should generate requested number of positions', () => {
      const positions = generatePositions(instrumentIds, 20, seed);
      expect(positions).toHaveLength(20);
    });

    it('should generate 10-50 positions as specified', () => {
      const positions = generatePositions(instrumentIds, 30, seed);
      expect(positions.length).toBeGreaterThanOrEqual(10);
      expect(positions.length).toBeLessThanOrEqual(50);
    });

    it('should generate reproducible results with same seed', () => {
      const positions1 = generatePositions(instrumentIds, 20, seed);
      const positions2 = generatePositions(instrumentIds, 20, seed);

      expect(positions1).toEqual(positions2);
    });

    it('should generate different results with different seeds', () => {
      const positions1 = generatePositions(instrumentIds, 20, 42);
      const positions2 = generatePositions(instrumentIds, 20, 123);

      expect(positions1).not.toEqual(positions2);
    });
  });

  describe('Position structure validation', () => {
    it('should have valid position properties', () => {
      const positions = generatePositions(instrumentIds, 10, seed);

      positions.forEach((position) => {
        expect(position).toHaveProperty('id');
        expect(position).toHaveProperty('instrument_id');
        expect(position).toHaveProperty('type');
        expect(position).toHaveProperty('quantity');
        expect(position).toHaveProperty('entry_price');
        expect(position).toHaveProperty('current_price');
        expect(position).toHaveProperty('unrealized_pnl');
        expect(position).toHaveProperty('opened_at');
      });
    });

    it('should have unique position IDs', () => {
      const positions = generatePositions(instrumentIds, 50, seed);
      const ids = positions.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(positions.length);
    });

    it('should only use provided instrument IDs', () => {
      const positions = generatePositions(instrumentIds, 30, seed);

      positions.forEach((position) => {
        expect(instrumentIds).toContain(position.instrument_id);
      });
    });

    it('should have valid position types', () => {
      const positions = generatePositions(instrumentIds, 30, seed);

      positions.forEach((position) => {
        expect(['buy', 'sell']).toContain(position.type);
      });
    });

    it('should have positive quantities', () => {
      const positions = generatePositions(instrumentIds, 30, seed);

      positions.forEach((position) => {
        expect(position.quantity).toBeGreaterThan(0);
      });
    });

    it('should have positive entry prices', () => {
      const positions = generatePositions(instrumentIds, 30, seed);

      positions.forEach((position) => {
        expect(position.entry_price).toBeGreaterThan(0);
      });
    });

    it('should have positive current prices', () => {
      const positions = generatePositions(instrumentIds, 30, seed);

      positions.forEach((position) => {
        expect(position.current_price).toBeGreaterThan(0);
      });
    });
  });

  describe('Timestamp validation', () => {
    it('should have timestamps in the past', () => {
      const now = Date.now();
      const positions = generatePositions(instrumentIds, 20, seed);

      positions.forEach((position) => {
        expect(position.opened_at).toBeLessThanOrEqual(now);
      });
    });

    it('should have recent opened_at timestamps (past 7 days)', () => {
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const positions = generatePositions(instrumentIds, 50, seed);

      positions.forEach((position) => {
        expect(position.opened_at).toBeGreaterThanOrEqual(sevenDaysAgo);
        expect(position.opened_at).toBeLessThanOrEqual(now);
      });
    });
  });

  describe('Price movement validation', () => {
    it('should have current price within ±5% of entry price', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      positions.forEach((position) => {
        const priceChange = Math.abs(
          (position.current_price - position.entry_price) / position.entry_price,
        );
        expect(priceChange).toBeLessThanOrEqual(0.05);
      });
    });

    it('should not have identical current and entry prices', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      // At least some positions should have price movement
      const movedPositions = positions.filter(
        (p) => p.current_price !== p.entry_price,
      );
      expect(movedPositions.length).toBeGreaterThan(0);
    });
  });

  describe('Unrealized P&L validation', () => {
    it('should calculate unrealized P&L correctly for buy positions', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      positions.forEach((position) => {
        if (position.type === 'buy') {
          const expectedPnL =
            (position.current_price - position.entry_price) * position.quantity;
          expect(position.unrealized_pnl).toBeCloseTo(expectedPnL, 2);
        }
      });
    });

    it('should calculate unrealized P&L correctly for sell positions', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      positions.forEach((position) => {
        if (position.type === 'sell') {
          const expectedPnL =
            (position.entry_price - position.current_price) * position.quantity;
          expect(position.unrealized_pnl).toBeCloseTo(expectedPnL, 2);
        }
      });
    });

    it('should have mix of positive and negative unrealized P&L', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      const profitablePositions = positions.filter(
        (p) => p.unrealized_pnl > 0,
      );
      const losingPositions = positions.filter((p) => p.unrealized_pnl < 0);

      // Should have both winning and losing positions
      expect(profitablePositions.length).toBeGreaterThan(0);
      expect(losingPositions.length).toBeGreaterThan(0);
    });

    it('should have unrealized P&L as numbers (not undefined)', () => {
      const positions = generatePositions(instrumentIds, 30, seed);

      positions.forEach((position) => {
        expect(position.unrealized_pnl).toBeDefined();
        expect(typeof position.unrealized_pnl).toBe('number');
      });
    });
  });

  describe('Statistical distribution validation', () => {
    it('should have buy/sell distribution (can be unbalanced)', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      const buyPositions = positions.filter((p) => p.type === 'buy').length;
      const sellPositions = positions.filter((p) => p.type === 'sell').length;

      // Just ensure we have both types
      expect(buyPositions).toBeGreaterThan(0);
      expect(sellPositions).toBeGreaterThan(0);
    });

    it('should have log-normal position sizes (0.01 to 10 units)', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      positions.forEach((position) => {
        expect(position.quantity).toBeGreaterThanOrEqual(0.01);
        expect(position.quantity).toBeLessThanOrEqual(10);
      });

      // Most positions should be small (< 1 unit)
      const smallPositions = positions.filter((p) => p.quantity < 1).length;
      expect(smallPositions / positions.length).toBeGreaterThan(0.5);
    });

    it('should distribute positions across multiple instruments', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      const instrumentCounts = new Map<string, number>();

      positions.forEach((position) => {
        const count = instrumentCounts.get(position.instrument_id) || 0;
        instrumentCounts.set(position.instrument_id, count + 1);
      });

      // Should use all provided instruments
      expect(instrumentCounts.size).toBe(instrumentIds.length);

      // Each instrument should have at least one position
      instrumentIds.forEach((id) => {
        expect(instrumentCounts.get(id)).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle single instrument', () => {
      const positions = generatePositions(['EUR_USD'], 20, seed);

      expect(positions).toHaveLength(20);
      positions.forEach((position) => {
        expect(position.instrument_id).toBe('EUR_USD');
      });
    });

    it('should handle small count', () => {
      const positions = generatePositions(instrumentIds, 1, seed);

      expect(positions).toHaveLength(1);
    });

    it('should handle minimum count (10)', () => {
      const positions = generatePositions(instrumentIds, 10, seed);

      expect(positions).toHaveLength(10);
    });

    it('should handle maximum count (50)', () => {
      const positions = generatePositions(instrumentIds, 50, seed);

      expect(positions).toHaveLength(50);
    });

    it('should handle default seed', () => {
      const positions1 = generatePositions(instrumentIds, 10);
      const positions2 = generatePositions(instrumentIds, 10);

      // Without seed, should generate different results
      expect(positions1).not.toEqual(positions2);
    });
  });
});
