/**
 * Tests for Trading API MSW Handlers
 * RED PHASE: These tests should FAIL until we implement the handlers
 *
 * Tests trading operations including:
 * - Trade execution (buy/sell)
 * - Trade history retrieval
 * - Position management
 * - Position closing with P&L calculation
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { tradingHandlers } from '../handlers/trading';
import { usePaperTradingStore } from '../../stores/paperTrading';
import { clearStoreStorage, createMockInstrument } from '../../stores/__tests__/utils';
import type { Trade, Position } from '../../types/stores';

// Setup MSW test server
const server = setupServer(...tradingHandlers);

describe('Trading API Handlers', () => {
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers and store state before each test
  beforeEach(() => {
    clearStoreStorage();
    usePaperTradingStore.getState().reset();
  });

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  describe('POST /api/trades - Execute Trade', () => {
    it('should execute a buy trade successfully', async () => {
      const mockInstrument = createMockInstrument();
      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 1.0,
        price: 1.085,
      };

      const response = await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.trade).toBeDefined();
      expect(data.trade.id).toBeDefined();
      expect(data.trade.direction).toBe('buy');
      expect(data.trade.quantity).toBe(1.0);
      expect(data.trade.status).toBe('executed');
    });

    it('should execute a sell trade successfully', async () => {
      const mockInstrument = createMockInstrument();
      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'sell' as const,
        quantity: 0.5,
        price: 1.090,
      };

      const response = await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.trade.direction).toBe('sell');
      expect(data.trade.quantity).toBe(0.5);
    });

    it('should update store balance after trade execution', async () => {
      const mockInstrument = createMockInstrument();
      const initialBalance = usePaperTradingStore.getState().balance;

      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 1.0,
        price: 1.085,
      };

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      const newBalance = usePaperTradingStore.getState().balance;
      expect(newBalance).toBeLessThan(initialBalance);
    });

    it('should create a position after successful trade', async () => {
      const mockInstrument = createMockInstrument();
      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 1.0,
        price: 1.085,
      };

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      const positions = usePaperTradingStore.getState().positions;
      expect(positions).toHaveLength(1);
      expect(positions[0].instrument_id).toBe(mockInstrument.id);
      expect(positions[0].direction).toBe('buy');
    });

    it('should return 400 for insufficient balance', async () => {
      const mockInstrument = createMockInstrument();
      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 100000.0, // Extremely large quantity
        price: 1.085,
      };

      const response = await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Insufficient balance');
    });

    it('should include spread cost in trade execution', async () => {
      const mockInstrument = createMockInstrument({ spread: 0.001 });
      const initialBalance = usePaperTradingStore.getState().balance;

      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 1.0,
        price: 1.000,
      };

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      const newBalance = usePaperTradingStore.getState().balance;
      const expectedCost = 1.0 * 1.000 + 0.001 * 1.0; // base + spread
      expect(newBalance).toBe(initialBalance - expectedCost);
    });

    it('should have realistic execution delay (200-500ms)', async () => {
      const mockInstrument = createMockInstrument();
      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 1.0,
        price: 1.085,
      };

      const startTime = Date.now();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(200);
      expect(duration).toBeLessThanOrEqual(600); // Allow some margin
    });

    it('should return proper error structure for failures', async () => {
      const mockInstrument = createMockInstrument();
      const tradeRequest = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 100000.0,
        price: 1.085,
      };

      const response = await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest),
      });

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data.success).toBe(false);
      expect(typeof data.error).toBe('string');
    });
  });

  describe('GET /api/trades - Trade History', () => {
    it('should return empty trade history initially', async () => {
      const response = await fetch('http://localhost/api/trades');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.trades).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return all executed trades', async () => {
      // Execute two trades first
      const mockInstrument = createMockInstrument();
      const tradeRequest1 = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'buy' as const,
        quantity: 1.0,
        price: 1.085,
      };

      const tradeRequest2 = {
        instrument_id: mockInstrument.id,
        instrument: mockInstrument,
        direction: 'sell' as const,
        quantity: 0.5,
        price: 1.090,
      };

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest1),
      });

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeRequest2),
      });

      // Now fetch trade history
      const response = await fetch('http://localhost/api/trades');
      const data = await response.json();

      expect(data.trades).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.trades[0].direction).toBe('buy');
      expect(data.trades[1].direction).toBe('sell');
    });

    it('should return trades with correct structure', async () => {
      // Execute one trade
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const response = await fetch('http://localhost/api/trades');
      const data = await response.json();

      const trade: Trade = data.trades[0];
      expect(trade).toHaveProperty('id');
      expect(trade).toHaveProperty('instrument_id');
      expect(trade).toHaveProperty('direction');
      expect(trade).toHaveProperty('quantity');
      expect(trade).toHaveProperty('entry_price');
      expect(trade).toHaveProperty('executed_at');
      expect(trade).toHaveProperty('status');
      expect(trade).toHaveProperty('cost');
    });

    it('should have minimal delay (<200ms)', async () => {
      const startTime = Date.now();
      await fetch('http://localhost/api/trades');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('GET /api/positions - Active Positions', () => {
    it('should return empty positions initially', async () => {
      const response = await fetch('http://localhost/api/positions');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.positions).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return all open positions', async () => {
      // Execute two trades to create positions
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const mockInstrument2 = createMockInstrument({ id: 'GBP_USD' });
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument2.id,
          instrument: mockInstrument2,
          direction: 'sell' as const,
          quantity: 0.5,
          price: 1.250,
        }),
      });

      const response = await fetch('http://localhost/api/positions');
      const data = await response.json();

      expect(data.positions).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should return positions with correct structure', async () => {
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const response = await fetch('http://localhost/api/positions');
      const data = await response.json();

      const position: Position = data.positions[0];
      expect(position).toHaveProperty('id');
      expect(position).toHaveProperty('trade_id');
      expect(position).toHaveProperty('instrument_id');
      expect(position).toHaveProperty('direction');
      expect(position).toHaveProperty('quantity');
      expect(position).toHaveProperty('entry_price');
      expect(position).toHaveProperty('current_price');
      expect(position).toHaveProperty('pnl');
      expect(position).toHaveProperty('pnl_percentage');
      expect(position).toHaveProperty('opened_at');
    });

    it('should have minimal delay (<200ms)', async () => {
      const startTime = Date.now();
      await fetch('http://localhost/api/positions');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('DELETE /api/positions/:id - Close Position', () => {
    it('should close an open position successfully', async () => {
      // First, create a position
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      const positionId = positions[0].id;

      // Close the position with body containing closing price
      const response = await fetch(`http://localhost/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.090 }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should remove position from active positions', async () => {
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      const positionId = positions[0].id;

      await fetch(`http://localhost/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.090 }),
      });

      const updatedPositions = usePaperTradingStore.getState().positions;
      expect(updatedPositions).toHaveLength(0);
    });

    it('should update balance with P&L after closing', async () => {
      const mockInstrument = createMockInstrument({ spread: 0.00015 });
      const initialBalance = usePaperTradingStore.getState().balance;

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const balanceAfterTrade = usePaperTradingStore.getState().balance;
      const positions = usePaperTradingStore.getState().positions;
      const positionId = positions[0].id;

      // Close position at higher price (profit)
      await fetch(`http://localhost/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.090 }),
      });

      const finalBalance = usePaperTradingStore.getState().balance;

      // Should get back principal + profit (not spread)
      expect(finalBalance).toBeGreaterThan(balanceAfterTrade);
      expect(finalBalance).toBeGreaterThan(initialBalance); // Profit scenario
    });

    it('should return 404 for non-existent position', async () => {
      const response = await fetch('http://localhost/api/positions/invalid-id', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.090 }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should return 400 if closing_price is missing', async () => {
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      const positionId = positions[0].id;

      const response = await fetch(`http://localhost/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('closing_price');
    });

    it('should have realistic delay (100-200ms)', async () => {
      const mockInstrument = createMockInstrument();
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.085,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      const positionId = positions[0].id;

      const startTime = Date.now();
      await fetch(`http://localhost/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.090 }),
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThanOrEqual(300);
    });
  });

  describe('CORS and Headers', () => {
    it('should include CORS headers on all endpoints', async () => {
      const endpoints = [
        { method: 'GET', url: 'http://localhost/api/trades' },
        { method: 'GET', url: 'http://localhost/api/positions' },
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.url, { method: endpoint.method });
        expect(response.headers.get('access-control-allow-origin')).toBeDefined();
      }
    });

    it('should return proper content-type for all endpoints', async () => {
      const endpoints = [
        { method: 'GET', url: 'http://localhost/api/trades' },
        { method: 'GET', url: 'http://localhost/api/positions' },
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.url, { method: endpoint.method });
        expect(response.headers.get('content-type')).toContain('application/json');
      }
    });
  });
});
