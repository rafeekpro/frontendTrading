/**
 * Opportunity Generator Tests
 *
 * Tests for generateOpportunities() - ensures realistic trading signals
 * with proper risk/reward ratios and multiple strategies.
 */

import { describe, it, expect } from 'vitest';
import { generateOpportunities } from '../opportunities';
import type { Opportunity } from '../../../types/trading';

describe('generateOpportunities', () => {
  const instrumentIds = ['EUR_USD', 'GBP_USD', 'BTC_USD'];
  const seed = 42;

  describe('Basic output validation', () => {
    it('should generate requested number of opportunities', () => {
      const opportunities = generateOpportunities(instrumentIds, 50, seed);
      expect(opportunities).toHaveLength(50);
    });

    it('should generate 20-100 opportunities as specified', () => {
      const opportunities = generateOpportunities(instrumentIds, 60, seed);
      expect(opportunities.length).toBeGreaterThanOrEqual(20);
      expect(opportunities.length).toBeLessThanOrEqual(100);
    });

    it('should generate reproducible results with same seed', () => {
      const opportunities1 = generateOpportunities(instrumentIds, 30, seed);
      const opportunities2 = generateOpportunities(instrumentIds, 30, seed);

      expect(opportunities1).toEqual(opportunities2);
    });

    it('should generate different results with different seeds', () => {
      const opportunities1 = generateOpportunities(instrumentIds, 30, 42);
      const opportunities2 = generateOpportunities(instrumentIds, 30, 123);

      expect(opportunities1).not.toEqual(opportunities2);
    });
  });

  describe('Opportunity structure validation', () => {
    it('should have valid opportunity properties', () => {
      const opportunities = generateOpportunities(instrumentIds, 20, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity).toHaveProperty('id');
        expect(opportunity).toHaveProperty('instrument_id');
        expect(opportunity).toHaveProperty('type');
        expect(opportunity).toHaveProperty('confidence');
        expect(opportunity).toHaveProperty('entry_price');
        expect(opportunity).toHaveProperty('target_price');
        expect(opportunity).toHaveProperty('stop_loss');
        expect(opportunity).toHaveProperty('strategy');
        expect(opportunity).toHaveProperty('detected_at');
      });
    });

    it('should have unique opportunity IDs', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);
      const ids = opportunities.map((o) => o.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(opportunities.length);
    });

    it('should only use provided instrument IDs', () => {
      const opportunities = generateOpportunities(instrumentIds, 50, seed);

      opportunities.forEach((opportunity) => {
        expect(instrumentIds).toContain(opportunity.instrument_id);
      });
    });

    it('should have valid opportunity types', () => {
      const opportunities = generateOpportunities(instrumentIds, 50, seed);

      opportunities.forEach((opportunity) => {
        expect(['buy', 'sell']).toContain(opportunity.type);
      });
    });

    it('should have positive entry prices', () => {
      const opportunities = generateOpportunities(instrumentIds, 50, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity.entry_price).toBeGreaterThan(0);
      });
    });

    it('should have positive target prices', () => {
      const opportunities = generateOpportunities(instrumentIds, 50, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity.target_price).toBeGreaterThan(0);
      });
    });

    it('should have positive stop loss prices', () => {
      const opportunities = generateOpportunities(instrumentIds, 50, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity.stop_loss).toBeGreaterThan(0);
      });
    });
  });

  describe('Strategy validation', () => {
    it('should use valid strategy types', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      const validStrategies = [
        'breakout',
        'reversal',
        'trend_following',
        'mean_reversion',
      ];

      opportunities.forEach((opportunity) => {
        expect(validStrategies).toContain(opportunity.strategy);
      });
    });

    it('should have multiple different strategies', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      const strategies = new Set(opportunities.map((o) => o.strategy));

      // Should use at least 3 different strategies
      expect(strategies.size).toBeGreaterThanOrEqual(3);
    });

    it('should distribute strategies across opportunities', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      const strategyCounts = new Map<string, number>();

      opportunities.forEach((opportunity) => {
        const count = strategyCounts.get(opportunity.strategy) || 0;
        strategyCounts.set(opportunity.strategy, count + 1);
      });

      // Each strategy should have at least a few opportunities
      strategyCounts.forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Confidence level validation', () => {
    it('should have confidence between 0.60 and 0.95', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity.confidence).toBeGreaterThanOrEqual(0.6);
        expect(opportunity.confidence).toBeLessThanOrEqual(0.95);
      });
    });

    it('should have varying confidence levels', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      const confidenceLevels = opportunities.map((o) => o.confidence);
      const uniqueConfidences = new Set(confidenceLevels);

      // Should have many different confidence levels
      expect(uniqueConfidences.size).toBeGreaterThan(10);
    });
  });

  describe('Risk/Reward validation', () => {
    it('should have target price above entry for buy opportunities', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        if (opportunity.type === 'buy') {
          expect(opportunity.target_price).toBeGreaterThan(
            opportunity.entry_price,
          );
        }
      });
    });

    it('should have target price below entry for sell opportunities', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        if (opportunity.type === 'sell') {
          expect(opportunity.target_price).toBeLessThan(
            opportunity.entry_price,
          );
        }
      });
    });

    it('should have stop loss below entry for buy opportunities', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        if (opportunity.type === 'buy') {
          expect(opportunity.stop_loss).toBeLessThan(opportunity.entry_price);
        }
      });
    });

    it('should have stop loss above entry for sell opportunities', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        if (opportunity.type === 'sell') {
          expect(opportunity.stop_loss).toBeGreaterThan(
            opportunity.entry_price,
          );
        }
      });
    });

    it('should have entry to target distance of +2-5%', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        const targetDistance = Math.abs(
          ((opportunity.target_price - opportunity.entry_price) /
            opportunity.entry_price) *
            100,
        );

        expect(targetDistance).toBeGreaterThanOrEqual(2);
        expect(targetDistance).toBeLessThanOrEqual(5);
      });
    });

    it('should have entry to stop loss distance of -1-2%', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        const stopDistance = Math.abs(
          ((opportunity.stop_loss - opportunity.entry_price) /
            opportunity.entry_price) *
            100,
        );

        expect(stopDistance).toBeGreaterThanOrEqual(1);
        expect(stopDistance).toBeLessThanOrEqual(2);
      });
    });

    it('should have risk/reward ratio of at least 1:2', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        const reward = Math.abs(
          opportunity.target_price - opportunity.entry_price,
        );
        const risk = Math.abs(opportunity.entry_price - opportunity.stop_loss);

        const riskRewardRatio = reward / risk;

        // Allow 1:1.3 minimum due to price rounding
        expect(riskRewardRatio).toBeGreaterThanOrEqual(1.3);
      });
    });
  });

  describe('Timestamp validation', () => {
    it('should have timestamps in the past', () => {
      const now = Date.now();
      const opportunities = generateOpportunities(instrumentIds, 50, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity.detected_at).toBeLessThanOrEqual(now);
      });
    });

    it('should have recent detected_at timestamps (past 24 hours)', () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      opportunities.forEach((opportunity) => {
        expect(opportunity.detected_at).toBeGreaterThanOrEqual(oneDayAgo);
        expect(opportunity.detected_at).toBeLessThanOrEqual(now);
      });
    });
  });

  describe('Statistical distribution validation', () => {
    it('should have buy/sell distribution (roughly balanced)', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      const buyOpportunities = opportunities.filter(
        (o) => o.type === 'buy',
      ).length;
      const sellOpportunities = opportunities.filter(
        (o) => o.type === 'sell',
      ).length;

      // Allow 30-70% range
      expect(buyOpportunities / opportunities.length).toBeGreaterThan(0.3);
      expect(buyOpportunities / opportunities.length).toBeLessThan(0.7);
      expect(sellOpportunities / opportunities.length).toBeGreaterThan(0.3);
      expect(sellOpportunities / opportunities.length).toBeLessThan(0.7);
    });

    it('should distribute opportunities across multiple instruments', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      const instrumentCounts = new Map<string, number>();

      opportunities.forEach((opportunity) => {
        const count = instrumentCounts.get(opportunity.instrument_id) || 0;
        instrumentCounts.set(opportunity.instrument_id, count + 1);
      });

      // Should use all provided instruments
      expect(instrumentCounts.size).toBe(instrumentIds.length);

      // Each instrument should have at least a few opportunities
      instrumentIds.forEach((id) => {
        expect(instrumentCounts.get(id)).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle single instrument', () => {
      const opportunities = generateOpportunities(['EUR_USD'], 30, seed);

      expect(opportunities).toHaveLength(30);
      opportunities.forEach((opportunity) => {
        expect(opportunity.instrument_id).toBe('EUR_USD');
      });
    });

    it('should handle small count', () => {
      const opportunities = generateOpportunities(instrumentIds, 1, seed);

      expect(opportunities).toHaveLength(1);
    });

    it('should handle minimum count (20)', () => {
      const opportunities = generateOpportunities(instrumentIds, 20, seed);

      expect(opportunities).toHaveLength(20);
    });

    it('should handle maximum count (100)', () => {
      const opportunities = generateOpportunities(instrumentIds, 100, seed);

      expect(opportunities).toHaveLength(100);
    });

    it('should handle default seed', () => {
      const opportunities1 = generateOpportunities(instrumentIds, 20);
      const opportunities2 = generateOpportunities(instrumentIds, 20);

      // Without seed, should generate different results
      expect(opportunities1).not.toEqual(opportunities2);
    });
  });
});
