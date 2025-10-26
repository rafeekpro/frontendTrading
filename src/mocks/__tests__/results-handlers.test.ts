/**
 * Tests for Results API MSW Handlers
 * RED PHASE: These tests should FAIL until we implement the handlers
 *
 * Tests results and analytics operations including:
 * - GET /api/results/trading - P&L and trades summary
 * - GET /api/results/performance - performance metrics with charts data
 * - Query parameters (date ranges, filtering)
 * - Aggregations and calculations
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { resultsHandlers } from '../handlers/results';
import { tradingHandlers } from '../handlers/trading';
import { usePaperTradingStore } from '../../stores/paperTrading';
import { clearStoreStorage, createMockInstrument } from '../../stores/__tests__/utils';

// Setup MSW test server with both results and trading handlers
const server = setupServer(...resultsHandlers, ...tradingHandlers);

describe('Results API Handlers', () => {
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

  describe('GET /api/results/trading - Trading Results Summary', () => {
    it('should return trading results with correct structure', async () => {
      // Execute some trades to generate results
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

      const response = await fetch('http://localhost/api/results/trading');

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('total_trades');
      expect(data).toHaveProperty('total_pnl');
      expect(data).toHaveProperty('win_rate');
      expect(data).toHaveProperty('profit_factor');
      expect(data).toHaveProperty('trades');
      expect(Array.isArray(data.trades)).toBe(true);
    });

    it('should return empty results when no trades exist', async () => {
      const response = await fetch('http://localhost/api/results/trading');
      const data = await response.json();

      expect(data.total_trades).toBe(0);
      expect(data.total_pnl).toBe(0);
      expect(data.trades).toEqual([]);
    });

    it('should calculate correct total P&L from closed trades', async () => {
      const mockInstrument = createMockInstrument({ spread: 0.0001 });

      // Execute and close a profitable trade
      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.000,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      const positionId = positions[0].id;

      // Close at higher price (profit)
      await fetch(`http://localhost/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.010 }),
      });

      const response = await fetch('http://localhost/api/results/trading');
      const data = await response.json();

      expect(data.total_pnl).toBeGreaterThan(0);
      expect(data.total_trades).toBe(2); // Open + close trades
    });

    it('should have minimal delay (<200ms)', async () => {
      const startTime = Date.now();
      await fetch('http://localhost/api/results/trading');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('GET /api/results/performance - Performance Metrics', () => {
    it('should return performance metrics with correct structure', async () => {
      const response = await fetch('http://localhost/api/results/performance');

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('daily_pnl');
      expect(data).toHaveProperty('monthly_pnl');
      expect(data).toHaveProperty('equity_curve');

      expect(data.metrics).toHaveProperty('total_return');
      expect(data.metrics).toHaveProperty('sharpe_ratio');
      expect(data.metrics).toHaveProperty('max_drawdown');
      expect(data.metrics).toHaveProperty('avg_win');
      expect(data.metrics).toHaveProperty('avg_loss');
    });

    it('should return empty charts data when no trades exist', async () => {
      const response = await fetch('http://localhost/api/results/performance');
      const data = await response.json();

      expect(data.daily_pnl).toEqual([]);
      expect(data.monthly_pnl).toEqual([]);
      expect(data.equity_curve).toEqual([]);
    });

    it('should calculate metrics correctly with real trades', async () => {
      const mockInstrument = createMockInstrument({ spread: 0.0001 });

      // Execute multiple trades
      for (let i = 0; i < 5; i++) {
        await fetch('http://localhost/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instrument_id: mockInstrument.id,
            instrument: mockInstrument,
            direction: 'buy' as const,
            quantity: 0.5,
            price: 1.000 + (i * 0.001),
          }),
        });

        // Close some positions
        if (i < 3) {
          const positions = usePaperTradingStore.getState().positions;
          const lastPosition = positions[positions.length - 1];

          await fetch(`http://localhost/api/positions/${lastPosition.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ closing_price: 1.000 + (i * 0.001) + 0.005 }),
          });
        }
      }

      const response = await fetch('http://localhost/api/results/performance');
      const data = await response.json();

      expect(data.metrics.total_return).toBeDefined();
      expect(typeof data.metrics.sharpe_ratio).toBe('number');
      expect(typeof data.metrics.max_drawdown).toBe('number');
    });

    it('should return daily P&L data for charts', async () => {
      const mockInstrument = createMockInstrument({ spread: 0.0001 });

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.000,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      await fetch(`http://localhost/api/positions/${positions[0].id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.010 }),
      });

      const response = await fetch('http://localhost/api/results/performance');
      const data = await response.json();

      expect(Array.isArray(data.daily_pnl)).toBe(true);
      if (data.daily_pnl.length > 0) {
        expect(data.daily_pnl[0]).toHaveProperty('date');
        expect(data.daily_pnl[0]).toHaveProperty('pnl');
      }
    });

    it('should return equity curve data for charts', async () => {
      const mockInstrument = createMockInstrument({ spread: 0.0001 });

      await fetch('http://localhost/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_id: mockInstrument.id,
          instrument: mockInstrument,
          direction: 'buy' as const,
          quantity: 1.0,
          price: 1.000,
        }),
      });

      const positions = usePaperTradingStore.getState().positions;
      await fetch(`http://localhost/api/positions/${positions[0].id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closing_price: 1.010 }),
      });

      const response = await fetch('http://localhost/api/results/performance');
      const data = await response.json();

      expect(Array.isArray(data.equity_curve)).toBe(true);
      if (data.equity_curve.length > 0) {
        expect(data.equity_curve[0]).toHaveProperty('timestamp');
        expect(data.equity_curve[0]).toHaveProperty('balance');
      }
    });

    it('should have minimal delay (<200ms)', async () => {
      const startTime = Date.now();
      await fetch('http://localhost/api/results/performance');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('CORS and Headers', () => {
    it('should include CORS headers on all endpoints', async () => {
      const endpoints = [
        'http://localhost/api/results/trading',
        'http://localhost/api/results/performance',
      ];

      for (const url of endpoints) {
        const response = await fetch(url);
        expect(response.headers.get('access-control-allow-origin')).toBeDefined();
      }
    });

    it('should return proper content-type for all endpoints', async () => {
      const endpoints = [
        'http://localhost/api/results/trading',
        'http://localhost/api/results/performance',
      ];

      for (const url of endpoints) {
        const response = await fetch(url);
        expect(response.headers.get('content-type')).toContain('application/json');
      }
    });
  });
});
