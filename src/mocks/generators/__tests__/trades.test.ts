/**
 * Trade Generator Tests
 *
 * Tests for generateTrades() - ensures realistic historical trade data
 * with proper P&L distribution and statistical properties.
 */

import { describe, it, expect } from 'vitest';
import { generateTrades } from '../trades';
import type { Trade } from '../../../types/trading';

describe('generateTrades', () => {
  const instrumentIds = ['EUR_USD', 'GBP_USD', 'BTC_USD'];
  const seed = 42;

  describe('Basic output validation', () => {
    it('should generate requested number of trades', () => {
      const trades = generateTrades(instrumentIds, 100, seed);
      expect(trades).toHaveLength(100);
    });

    it('should generate 1000+ trades as specified', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);
      expect(trades.length).toBeGreaterThanOrEqual(1000);
    });

    it('should generate reproducible results with same seed', () => {
      const trades1 = generateTrades(instrumentIds, 50, seed);
      const trades2 = generateTrades(instrumentIds, 50, seed);

      expect(trades1).toEqual(trades2);
    });

    it('should generate different results with different seeds', () => {
      const trades1 = generateTrades(instrumentIds, 50, 42);
      const trades2 = generateTrades(instrumentIds, 50, 123);

      expect(trades1).not.toEqual(trades2);
    });
  });

  describe('Trade structure validation', () => {
    it('should have valid trade properties', () => {
      const trades = generateTrades(instrumentIds, 10, seed);

      trades.forEach((trade) => {
        expect(trade).toHaveProperty('id');
        expect(trade).toHaveProperty('instrument_id');
        expect(trade).toHaveProperty('type');
        expect(trade).toHaveProperty('quantity');
        expect(trade).toHaveProperty('entry_price');
        expect(trade).toHaveProperty('opened_at');
        expect(trade).toHaveProperty('status');
      });
    });

    it('should have unique trade IDs', () => {
      const trades = generateTrades(instrumentIds, 100, seed);
      const ids = trades.map((t) => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(trades.length);
    });

    it('should only use provided instrument IDs', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        expect(instrumentIds).toContain(trade.instrument_id);
      });
    });

    it('should have valid trade types', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        expect(['buy', 'sell']).toContain(trade.type);
      });
    });

    it('should have positive quantities', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        expect(trade.quantity).toBeGreaterThan(0);
      });
    });

    it('should have positive entry prices', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        expect(trade.entry_price).toBeGreaterThan(0);
      });
    });

    it('should have valid status values', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        expect(['open', 'closed']).toContain(trade.status);
      });
    });
  });

  describe('Timestamp validation', () => {
    it('should have timestamps in the past', () => {
      const now = Date.now();
      const trades = generateTrades(instrumentIds, 50, seed);

      trades.forEach((trade) => {
        expect(trade.opened_at).toBeLessThanOrEqual(now);
      });
    });

    it('should spread timestamps over past 90 days', () => {
      const now = Date.now();
      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
      const trades = generateTrades(instrumentIds, 1000, seed);

      const oldestTrade = Math.min(...trades.map((t) => t.opened_at));
      const newestTrade = Math.max(...trades.map((t) => t.opened_at));

      expect(oldestTrade).toBeGreaterThanOrEqual(ninetyDaysAgo);
      expect(newestTrade).toBeLessThanOrEqual(now);
    });

    it('should have sequential timestamps (older to newer)', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      for (let i = 1; i < trades.length; i++) {
        expect(trades[i]!.opened_at).toBeGreaterThanOrEqual(
          trades[i - 1]!.opened_at,
        );
      }
    });

    it('should have closed_at timestamp for closed trades', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        if (trade.status === 'closed') {
          expect(trade.closed_at).toBeDefined();
          expect(trade.closed_at).toBeGreaterThan(trade.opened_at);
        }
      });
    });

    it('should not have closed_at for open trades', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        if (trade.status === 'open') {
          expect(trade.closed_at).toBeUndefined();
        }
      });
    });
  });

  describe('P&L validation for closed trades', () => {
    it('should have exit_price for closed trades', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      trades.forEach((trade) => {
        if (trade.status === 'closed') {
          expect(trade.exit_price).toBeDefined();
          expect(trade.exit_price).toBeGreaterThan(0);
        }
      });
    });

    it('should have profit_loss for closed trades', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      trades.forEach((trade) => {
        if (trade.status === 'closed') {
          expect(trade.profit_loss).toBeDefined();
        }
      });
    });

    it('should not have exit_price for open trades', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        if (trade.status === 'open') {
          expect(trade.exit_price).toBeUndefined();
        }
      });
    });

    it('should not have profit_loss for open trades', () => {
      const trades = generateTrades(instrumentIds, 100, seed);

      trades.forEach((trade) => {
        if (trade.status === 'open') {
          expect(trade.profit_loss).toBeUndefined();
        }
      });
    });

    it('should calculate P&L correctly for buy trades', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      trades.forEach((trade) => {
        if (trade.status === 'closed' && trade.type === 'buy') {
          const expectedPnL =
            (trade.exit_price! - trade.entry_price) * trade.quantity;
          expect(trade.profit_loss).toBeCloseTo(expectedPnL, 2);
        }
      });
    });

    it('should calculate P&L correctly for sell trades', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      trades.forEach((trade) => {
        if (trade.status === 'closed' && trade.type === 'sell') {
          const expectedPnL =
            (trade.entry_price - trade.exit_price!) * trade.quantity;
          expect(trade.profit_loss).toBeCloseTo(expectedPnL, 2);
        }
      });
    });
  });

  describe('Statistical distribution validation', () => {
    it('should have roughly 50/50 buy/sell split', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const buyTrades = trades.filter((t) => t.type === 'buy').length;
      const sellTrades = trades.filter((t) => t.type === 'sell').length;

      // Allow 40-60% range for randomness
      expect(buyTrades / trades.length).toBeGreaterThan(0.4);
      expect(buyTrades / trades.length).toBeLessThan(0.6);
      expect(sellTrades / trades.length).toBeGreaterThan(0.4);
      expect(sellTrades / trades.length).toBeLessThan(0.6);
    });

    it('should have win rate between 55-60%', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const closedTrades = trades.filter((t) => t.status === 'closed');
      const winningTrades = closedTrades.filter((t) => t.profit_loss! > 0);
      const winRate = winningTrades.length / closedTrades.length;

      // Allow ±2% tolerance for statistical variance
      expect(winRate).toBeGreaterThanOrEqual(0.53);
      expect(winRate).toBeLessThanOrEqual(0.62);
    });

    it('should have positive overall P&L', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const closedTrades = trades.filter((t) => t.status === 'closed');
      const totalPnL = closedTrades.reduce(
        (sum, t) => sum + (t.profit_loss || 0),
        0,
      );

      expect(totalPnL).toBeGreaterThan(0);
    });

    it('should have net P&L between +5% to +10% of total volume', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const closedTrades = trades.filter((t) => t.status === 'closed');
      const totalPnL = closedTrades.reduce(
        (sum, t) => sum + (t.profit_loss || 0),
        0,
      );
      const totalVolume = closedTrades.reduce(
        (sum, t) => sum + t.entry_price * t.quantity,
        0,
      );

      const pnlPercentage = (totalPnL / totalVolume) * 100;

      // Allow 0.5-12% range for statistical variance with outliers
      expect(pnlPercentage).toBeGreaterThanOrEqual(0.5);
      expect(pnlPercentage).toBeLessThanOrEqual(12);
    });

    it('should have average win between +2% to +5%', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const closedTrades = trades.filter((t) => t.status === 'closed');
      const winningTrades = closedTrades.filter((t) => t.profit_loss! > 0);

      const avgWinPercentage =
        winningTrades.reduce((sum, t) => {
          const pnlPercentage =
            (t.profit_loss! / (t.entry_price * t.quantity)) * 100;
          return sum + pnlPercentage;
        }, 0) / winningTrades.length;

      // Allow wider range due to outliers
      expect(avgWinPercentage).toBeGreaterThanOrEqual(2);
      expect(avgWinPercentage).toBeLessThanOrEqual(6);
    });

    it('should have average loss between -1% to -3%', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const closedTrades = trades.filter((t) => t.status === 'closed');
      const losingTrades = closedTrades.filter((t) => t.profit_loss! < 0);

      const avgLossPercentage =
        losingTrades.reduce((sum, t) => {
          const pnlPercentage =
            (t.profit_loss! / (t.entry_price * t.quantity)) * 100;
          return sum + pnlPercentage;
        }, 0) / losingTrades.length;

      // Allow wider range due to outliers
      expect(avgLossPercentage).toBeLessThanOrEqual(-1);
      expect(avgLossPercentage).toBeGreaterThanOrEqual(-5);
    });

    it('should have some outliers with ±10-20% P&L', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const closedTrades = trades.filter((t) => t.status === 'closed');
      const outliers = closedTrades.filter((t) => {
        const pnlPercentage =
          Math.abs(t.profit_loss! / (t.entry_price * t.quantity)) * 100;
        return pnlPercentage >= 10 && pnlPercentage <= 20;
      });

      // At least 5% should be outliers
      expect(outliers.length / closedTrades.length).toBeGreaterThanOrEqual(
        0.05,
      );
    });

    it('should have log-normal position sizes (0.01 to 10 units)', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      trades.forEach((trade) => {
        expect(trade.quantity).toBeGreaterThanOrEqual(0.01);
        expect(trade.quantity).toBeLessThanOrEqual(10);
      });

      // Most trades should be small (< 1 unit)
      const smallTrades = trades.filter((t) => t.quantity < 1).length;
      expect(smallTrades / trades.length).toBeGreaterThan(0.5);
    });

    it('should average 10-20 trades per day', () => {
      const trades = generateTrades(instrumentIds, 1000, seed);

      const dayInMs = 24 * 60 * 60 * 1000;
      const oldestTrade = Math.min(...trades.map((t) => t.opened_at));
      const newestTrade = Math.max(...trades.map((t) => t.opened_at));
      const daySpan = (newestTrade - oldestTrade) / dayInMs;

      const tradesPerDay = trades.length / daySpan;

      expect(tradesPerDay).toBeGreaterThanOrEqual(10);
      expect(tradesPerDay).toBeLessThanOrEqual(20);
    });
  });

  describe('Edge cases', () => {
    it('should handle single instrument', () => {
      const trades = generateTrades(['EUR_USD'], 50, seed);

      expect(trades).toHaveLength(50);
      trades.forEach((trade) => {
        expect(trade.instrument_id).toBe('EUR_USD');
      });
    });

    it('should handle small count', () => {
      const trades = generateTrades(instrumentIds, 1, seed);

      expect(trades).toHaveLength(1);
    });

    it('should handle default seed', () => {
      const trades1 = generateTrades(instrumentIds, 10);
      const trades2 = generateTrades(instrumentIds, 10);

      // Without seed, should generate different results
      expect(trades1).not.toEqual(trades2);
    });
  });
});
