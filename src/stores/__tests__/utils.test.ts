/**
 * Test Utilities Tests
 * Validates that test helper functions work correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearStoreStorage,
  createMockInstrument,
  createMockTrade,
  createMockPosition,
  waitForStateUpdate,
} from './utils';

describe('Test Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('clearStoreStorage', () => {
    it('should clear all localStorage items', () => {
      // Setup: Add some items
      localStorage.setItem('test-key-1', 'value-1');
      localStorage.setItem('test-key-2', 'value-2');

      // Execute
      clearStoreStorage();

      // Verify
      expect(localStorage.length).toBe(0);
    });
  });

  describe('createMockInstrument', () => {
    it('should create a default forex instrument', () => {
      const instrument = createMockInstrument();

      expect(instrument.id).toBe('EUR_USD');
      expect(instrument.symbol).toBe('EUR/USD');
      expect(instrument.type).toBe('forex');
      expect(instrument.spread).toBe(0.00015);
    });

    it('should allow overriding default values', () => {
      const instrument = createMockInstrument({
        id: 'XAU_USD',
        symbol: 'XAU/USD',
        type: 'commodity',
        spread: 0.50,
      });

      expect(instrument.id).toBe('XAU_USD');
      expect(instrument.symbol).toBe('XAU/USD');
      expect(instrument.type).toBe('commodity');
      expect(instrument.spread).toBe(0.50);
    });

    it('should preserve non-overridden properties', () => {
      const instrument = createMockInstrument({
        id: 'GBP_USD',
      });

      expect(instrument.id).toBe('GBP_USD');
      expect(instrument.precision).toBe(5); // Default value preserved
      expect(instrument.pip_value).toBe(0.0001); // Default value preserved
    });
  });

  describe('createMockTrade', () => {
    it('should create a default trade', () => {
      const trade = createMockTrade();

      expect(trade.id).toMatch(/^trade-\d+-[a-z0-9]+$/);
      expect(trade.instrument_id).toBe('EUR_USD');
      expect(trade.direction).toBe('buy');
      expect(trade.quantity).toBe(1.0);
      expect(trade.entry_price).toBe(1.085);
      expect(trade.status).toBe('executed');
    });

    it('should generate unique trade IDs', () => {
      const trade1 = createMockTrade();
      const trade2 = createMockTrade();

      expect(trade1.id).not.toBe(trade2.id);
    });

    it('should have valid ISO 8601 timestamp', () => {
      const trade = createMockTrade();

      // Verify ISO 8601 format
      expect(trade.executed_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );

      // Verify it's a valid date
      const date = new Date(trade.executed_at);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should allow overriding default values', () => {
      const trade = createMockTrade({
        direction: 'sell',
        quantity: 2.5,
        entry_price: 1.090,
      });

      expect(trade.direction).toBe('sell');
      expect(trade.quantity).toBe(2.5);
      expect(trade.entry_price).toBe(1.090);
    });

    it('should include instrument object', () => {
      const trade = createMockTrade();

      expect(trade.instrument).toBeDefined();
      expect(trade.instrument.id).toBe('EUR_USD');
      expect(trade.instrument.symbol).toBe('EUR/USD');
    });
  });

  describe('createMockPosition', () => {
    it('should create a default position', () => {
      const position = createMockPosition();

      expect(position.id).toMatch(/^pos-trade-\d+-[a-z0-9]+$/);
      expect(position.instrument_id).toBe('EUR_USD');
      expect(position.direction).toBe('buy');
      expect(position.quantity).toBe(1.0);
      expect(position.entry_price).toBe(1.085);
      expect(position.current_price).toBe(1.090);
    });

    it('should generate unique position IDs', () => {
      const position1 = createMockPosition();
      const position2 = createMockPosition();

      expect(position1.id).not.toBe(position2.id);
    });

    it('should have valid P&L calculations', () => {
      const position = createMockPosition();

      expect(position.pnl).toBe(0.005); // (1.090 - 1.085) * 1.0
      expect(position.pnl_percentage).toBe(0.46);
    });

    it('should have valid ISO 8601 timestamp', () => {
      const position = createMockPosition();

      expect(position.opened_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );

      const date = new Date(position.opened_at);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should allow overriding default values', () => {
      const position = createMockPosition({
        direction: 'sell',
        quantity: 2.0,
        current_price: 1.080,
      });

      expect(position.direction).toBe('sell');
      expect(position.quantity).toBe(2.0);
      expect(position.current_price).toBe(1.080);
    });

    it('should link position ID to trade ID', () => {
      const position = createMockPosition();

      // Position ID should be "pos-" + trade ID
      expect(position.id).toBe(`pos-${position.trade_id}`);
    });

    it('should include instrument object', () => {
      const position = createMockPosition();

      expect(position.instrument).toBeDefined();
      expect(position.instrument.id).toBe('EUR_USD');
      expect(position.instrument.symbol).toBe('EUR/USD');
    });
  });

  describe('waitForStateUpdate', () => {
    it('should wait for specified milliseconds', async () => {
      const start = Date.now();
      await waitForStateUpdate(50);
      const elapsed = Date.now() - start;

      // Allow small margin for timing variations
      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(elapsed).toBeLessThan(100);
    });

    it('should resolve immediately when no delay specified', async () => {
      const start = Date.now();
      await waitForStateUpdate();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(10);
    });

    it('should return a promise', () => {
      const result = waitForStateUpdate(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
