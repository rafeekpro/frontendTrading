/**
 * Paper Trading Store Tests
 * RED PHASE: These tests should FAIL until we implement the store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePaperTradingStore } from '../paperTrading';
import type { Instrument } from '../../types/trading';

describe('Paper Trading Store', () => {
  // Mock instrument for testing
  const mockInstrument: Instrument = {
    id: 'EUR_USD',
    name: 'Euro / US Dollar',
    symbol: 'EUR/USD',
    type: 'forex',
    spread: 0.00015,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5,
  };

  beforeEach(() => {
    // Reset store before each test
    usePaperTradingStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have default balance of 10000', () => {
      const store = usePaperTradingStore.getState();
      expect(store.balance).toBe(10000);
      expect(store.initialBalance).toBe(10000);
    });

    it('should have empty trades array', () => {
      const store = usePaperTradingStore.getState();
      expect(store.trades).toEqual([]);
    });

    it('should have empty positions array', () => {
      const store = usePaperTradingStore.getState();
      expect(store.positions).toEqual([]);
    });
  });

  describe('executeTrade', () => {
    it('should execute a buy trade successfully', () => {
      const store = usePaperTradingStore.getState();
      const trade = store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      expect(trade).not.toBeNull();
      expect(trade?.direction).toBe('buy');
      expect(trade?.quantity).toBe(1.0);
      expect(trade?.entry_price).toBe(1.085);
      expect(trade?.status).toBe('executed');
    });

    it('should execute a sell trade successfully', () => {
      const store = usePaperTradingStore.getState();
      const trade = store.executeTrade(mockInstrument, 'sell', 0.5, 1.086);

      expect(trade).not.toBeNull();
      expect(trade?.direction).toBe('sell');
      expect(trade?.quantity).toBe(0.5);
    });

    it('should deduct cost from balance after buy trade', () => {
      const store = usePaperTradingStore.getState();
      const initialBalance = store.balance;

      const trade = store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      // Cost = quantity * price + spread
      const expectedCost = 1.0 * 1.085 + 0.00015;
      const newBalance = usePaperTradingStore.getState().balance;

      expect(newBalance).toBeLessThan(initialBalance);
      expect(trade?.cost).toBeCloseTo(expectedCost, 5);
    });

    it('should fail when insufficient balance', () => {
      const store = usePaperTradingStore.getState();
      // Try to buy with quantity that exceeds balance
      const trade = store.executeTrade(mockInstrument, 'buy', 100000, 1.085);

      expect(trade).toBeNull();
      expect(store.balance).toBe(10000); // Balance unchanged
    });

    it('should add trade to trades history', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      const trades = usePaperTradingStore.getState().trades;
      expect(trades).toHaveLength(1);
      expect(trades[0]?.instrument_id).toBe('EUR_USD');
    });

    it('should create an open position after buy trade', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      const positions = usePaperTradingStore.getState().positions;
      expect(positions).toHaveLength(1);
      expect(positions[0]?.direction).toBe('buy');
      expect(positions[0]?.entry_price).toBe(1.085);
    });

    it('should generate unique trade IDs', () => {
      const store = usePaperTradingStore.getState();
      const trade1 = store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);
      const trade2 = store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      expect(trade1?.id).not.toBe(trade2?.id);
    });
  });

  describe('closePosition', () => {
    beforeEach(() => {
      // Setup: Create an open position
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);
    });

    it('should close an open position successfully', () => {
      const store = usePaperTradingStore.getState();
      const positions = store.positions;
      const positionId = positions[0]?.id;

      const success = store.closePosition(positionId!, 1.090);

      expect(success).toBe(true);
      expect(usePaperTradingStore.getState().positions).toHaveLength(0);
    });

    it('should calculate profit when closing position at higher price', () => {
      const store = usePaperTradingStore.getState();
      const initialBalance = store.balance;
      const positionId = store.positions[0]?.id;

      store.closePosition(positionId!, 1.090); // Close at higher price (profit)

      const newBalance = usePaperTradingStore.getState().balance;
      expect(newBalance).toBeGreaterThan(initialBalance);
    });

    it('should calculate loss when closing position at lower price', () => {
      const originalBalance = 10000; // Store balance before any trades
      const store = usePaperTradingStore.getState();
      const positionId = store.positions[0]?.id;

      store.closePosition(positionId!, 1.080); // Close at lower price (loss)

      const newBalance = usePaperTradingStore.getState().balance;
      expect(newBalance).toBeLessThan(originalBalance); // Should have overall loss
    });

    it('should fail when closing non-existent position', () => {
      const store = usePaperTradingStore.getState();
      const success = store.closePosition('non-existent-id', 1.090);

      expect(success).toBe(false);
    });

    it('should add closing trade to history', () => {
      const store = usePaperTradingStore.getState();
      const initialTradesCount = store.trades.length;
      const positionId = store.positions[0]?.id;

      store.closePosition(positionId!, 1.090);

      const trades = usePaperTradingStore.getState().trades;
      expect(trades.length).toBeGreaterThan(initialTradesCount);

      const closingTrade = trades[trades.length - 1];
      expect(closingTrade?.status).toBe('closed');
    });
  });

  describe('getPosition', () => {
    it('should return position for given instrument', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      const position = store.getPosition('EUR_USD');
      expect(position).toBeDefined();
      expect(position?.instrument_id).toBe('EUR_USD');
    });

    it('should return undefined for non-existent position', () => {
      const store = usePaperTradingStore.getState();
      const position = store.getPosition('NON_EXISTENT');
      expect(position).toBeUndefined();
    });
  });

  describe('updatePositionPrice', () => {
    beforeEach(() => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);
    });

    it('should update position current price', () => {
      const store = usePaperTradingStore.getState();
      store.updatePositionPrice('EUR_USD', 1.090);

      const position = store.getPosition('EUR_USD');
      expect(position?.current_price).toBe(1.090);
    });

    it('should recalculate P&L after price update', () => {
      const store = usePaperTradingStore.getState();
      store.updatePositionPrice('EUR_USD', 1.090);

      const position = store.getPosition('EUR_USD');
      expect(position?.pnl).toBeGreaterThan(0); // Should show profit
    });

    it('should calculate P&L percentage correctly', () => {
      const store = usePaperTradingStore.getState();
      store.updatePositionPrice('EUR_USD', 1.090);

      const position = store.getPosition('EUR_USD');
      // P&L% = ((current - entry) / entry) * 100
      const expectedPnL = ((1.090 - 1.085) / 1.085) * 100;
      expect(position?.pnl_percentage).toBeCloseTo(expectedPnL, 2);
    });
  });

  describe('getTotalPnL', () => {
    it('should return 0 when no positions', () => {
      const store = usePaperTradingStore.getState();
      const totalPnL = store.getTotalPnL();
      expect(totalPnL).toBe(0);
    });

    it('should sum P&L across multiple positions', () => {
      const store = usePaperTradingStore.getState();

      // Open two positions
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.086);

      // Update prices
      store.updatePositionPrice('EUR_USD', 1.090);

      const totalPnL = store.getTotalPnL();
      expect(totalPnL).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should reset balance to initial amount', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      store.reset();

      expect(usePaperTradingStore.getState().balance).toBe(10000);
    });

    it('should clear all trades', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      store.reset();

      expect(usePaperTradingStore.getState().trades).toEqual([]);
    });

    it('should clear all positions', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      store.reset();

      expect(usePaperTradingStore.getState().positions).toEqual([]);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist state to localStorage', () => {
      const store = usePaperTradingStore.getState();
      store.executeTrade(mockInstrument, 'buy', 1.0, 1.085);

      // Check localStorage
      const stored = localStorage.getItem('paper-trading-state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.trades).toHaveLength(1);
    });
  });
});
