/**
 * Tests for Instruments API MSW Handlers
 * RED PHASE: These tests should FAIL until we implement the handlers
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { instrumentsHandlers } from '../handlers/instruments';
import type { InstrumentsResponse, InstrumentResponse, CandlesticksResponse } from '../../types/trading';

// Setup MSW test server
const server = setupServer(...instrumentsHandlers);

describe('Instruments API Handlers', () => {
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  describe('GET /api/instruments', () => {
    it('should return list of all instruments', async () => {
      const response = await fetch('http://localhost/api/instruments');
      const data = await response.json() as InstrumentsResponse;

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(data).toHaveProperty('instruments');
      expect(Array.isArray(data.instruments)).toBe(true);
      expect(data.instruments.length).toBeGreaterThan(0);
    });

    it('should return instruments with correct structure', async () => {
      const response = await fetch('http://localhost/api/instruments');
      const data = await response.json() as InstrumentsResponse;

      const instrument = data.instruments[0];
      expect(instrument).toHaveProperty('id');
      expect(instrument).toHaveProperty('name');
      expect(instrument).toHaveProperty('symbol');
      expect(instrument).toHaveProperty('type');
      expect(instrument).toHaveProperty('spread');
      expect(instrument).toHaveProperty('pip_value');
      expect(instrument).toHaveProperty('min_trade_size');
      expect(instrument).toHaveProperty('max_trade_size');
      expect(instrument).toHaveProperty('precision');
    });

    it('should include major forex pairs', async () => {
      const response = await fetch('http://localhost/api/instruments');
      const data = await response.json() as InstrumentsResponse;

      const symbols = data.instruments.map(i => i.symbol);
      expect(symbols).toContain('EUR/USD');
      expect(symbols).toContain('GBP/USD');
      expect(symbols).toContain('USD/JPY');
    });
  });

  describe('GET /api/instruments/:id', () => {
    it('should return single instrument by ID', async () => {
      const response = await fetch('http://localhost/api/instruments/EUR_USD');
      const data = await response.json() as InstrumentResponse;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('instrument');
      expect(data.instrument.id).toBe('EUR_USD');
      expect(data.instrument.symbol).toBe('EUR/USD');
    });

    it('should return 404 for non-existent instrument', async () => {
      const response = await fetch('http://localhost/api/instruments/INVALID_ID');

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return proper error message for invalid ID', async () => {
      const response = await fetch('http://localhost/api/instruments/DOES_NOT_EXIST');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
      expect(data.message).toContain('not found');
    });
  });

  describe('GET /api/instruments/:id/candlesticks', () => {
    it('should return candlestick data for valid instrument', async () => {
      const response = await fetch('http://localhost/api/instruments/EUR_USD/candlesticks?timeframe=H1');
      const data = await response.json() as CandlesticksResponse;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('candlesticks');
      expect(data).toHaveProperty('instrument_id');
      expect(data).toHaveProperty('timeframe');
      expect(data.instrument_id).toBe('EUR_USD');
      expect(data.timeframe).toBe('H1');
    });

    it('should return candlesticks with OHLCV structure', async () => {
      const response = await fetch('http://localhost/api/instruments/EUR_USD/candlesticks?timeframe=M5');
      const data = await response.json() as CandlesticksResponse;

      expect(Array.isArray(data.candlesticks)).toBe(true);
      expect(data.candlesticks.length).toBeGreaterThan(0);

      const candle = data.candlesticks[0];
      expect(candle).toHaveProperty('timestamp');
      expect(candle).toHaveProperty('open');
      expect(candle).toHaveProperty('high');
      expect(candle).toHaveProperty('low');
      expect(candle).toHaveProperty('close');
      expect(candle).toHaveProperty('volume');
    });

    it('should validate OHLC relationships', async () => {
      const response = await fetch('http://localhost/api/instruments/EUR_USD/candlesticks?timeframe=D1');
      const data = await response.json() as CandlesticksResponse;

      data.candlesticks.forEach(candle => {
        expect(candle.high).toBeGreaterThanOrEqual(candle.open);
        expect(candle.high).toBeGreaterThanOrEqual(candle.close);
        expect(candle.high).toBeGreaterThanOrEqual(candle.low);
        expect(candle.low).toBeLessThanOrEqual(candle.open);
        expect(candle.low).toBeLessThanOrEqual(candle.close);
      });
    });

    it('should accept all valid timeframes', async () => {
      const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

      for (const timeframe of timeframes) {
        const response = await fetch(`http://localhost/api/instruments/EUR_USD/candlesticks?timeframe=${timeframe}`);
        expect(response.status).toBe(200);

        const data = await response.json() as CandlesticksResponse;
        expect(data.timeframe).toBe(timeframe);
      }
    });

    it('should return 400 for invalid timeframe', async () => {
      const response = await fetch('http://localhost/api/instruments/EUR_USD/candlesticks?timeframe=INVALID');

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.message).toContain('timeframe');
    });

    it('should return 400 for missing timeframe parameter', async () => {
      const response = await fetch('http://localhost/api/instruments/EUR_USD/candlesticks');

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 404 for non-existent instrument', async () => {
      const response = await fetch('http://localhost/api/instruments/INVALID_ID/candlesticks?timeframe=H1');

      expect(response.status).toBe(404);
    });
  });

  describe('Request validation', () => {
    it('should handle CORS headers', async () => {
      const response = await fetch('http://localhost/api/instruments');

      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
    });

    it('should return proper content-type for all endpoints', async () => {
      const endpoints = [
        '/api/instruments',
        '/api/instruments/EUR_USD',
        '/api/instruments/EUR_USD/candlesticks?timeframe=H1'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost${endpoint}`);
        expect(response.headers.get('content-type')).toContain('application/json');
      }
    });
  });
});
