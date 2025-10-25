/**
 * Instrument Generator Tests
 *
 * Tests for the instrument data generator that creates realistic mock instruments
 * including stocks, cryptocurrencies, and forex pairs.
 *
 * Following TDD methodology (RED-GREEN-REFACTOR):
 * - These tests are written FIRST (RED phase)
 * - Implementation will follow (GREEN phase)
 * - Then optimization (REFACTOR phase)
 */

import { describe, it, expect } from 'vitest';
import { generateInstruments } from '../instruments';
import type { Instrument } from '../../../types/trading';

describe('generateInstruments', () => {
  describe('count validation', () => {
    it('should generate exactly the requested number of instruments', () => {
      const instruments = generateInstruments(10);
      expect(instruments).toHaveLength(10);
    });

    it('should generate 50+ instruments when requested', () => {
      const instruments = generateInstruments(50);
      expect(instruments).toHaveLength(50);
      expect(instruments.length).toBeGreaterThanOrEqual(50);
    });

    it('should generate 100 instruments when requested', () => {
      const instruments = generateInstruments(100);
      expect(instruments).toHaveLength(100);
    });
  });

  describe('type distribution', () => {
    it('should include at least 30 stocks when generating 60+ instruments', () => {
      const instruments = generateInstruments(60);
      const stocks = instruments.filter((i) => i.type === 'stock');
      expect(stocks.length).toBeGreaterThanOrEqual(30);
    });

    it('should include at least 15 crypto when generating 60+ instruments', () => {
      const instruments = generateInstruments(60);
      const crypto = instruments.filter((i) => i.type === 'crypto');
      expect(crypto.length).toBeGreaterThanOrEqual(15);
    });

    it('should include at least 10 forex when generating 60+ instruments', () => {
      const instruments = generateInstruments(60);
      const forex = instruments.filter((i) => i.type === 'forex');
      expect(forex.length).toBeGreaterThanOrEqual(10);
    });

    it('should distribute types realistically (stocks majority, then crypto, then forex)', () => {
      const instruments = generateInstruments(60);
      const stocks = instruments.filter((i) => i.type === 'stock').length;
      const crypto = instruments.filter((i) => i.type === 'crypto').length;
      const forex = instruments.filter((i) => i.type === 'forex').length;

      // Stock should be the largest group
      expect(stocks).toBeGreaterThan(crypto);
      expect(stocks).toBeGreaterThan(forex);
    });
  });

  describe('data structure validation', () => {
    it('should generate instruments with all required fields', () => {
      const instruments = generateInstruments(5);

      instruments.forEach((instrument) => {
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
    });

    it('should generate unique IDs for each instrument', () => {
      const instruments = generateInstruments(20);
      const ids = instruments.map((i) => i.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(instruments.length);
    });

    it('should generate valid instrument types', () => {
      const instruments = generateInstruments(30);
      const validTypes = ['stock', 'crypto', 'forex'];

      instruments.forEach((instrument) => {
        expect(validTypes).toContain(instrument.type);
      });
    });
  });

  describe('realistic spreads', () => {
    it('should generate stocks with spreads between 0.0001 and 0.001', () => {
      const instruments = generateInstruments(50, 42);
      const stocks = instruments.filter((i) => i.type === 'stock');

      stocks.forEach((stock) => {
        expect(stock.spread).toBeGreaterThanOrEqual(0.0001);
        expect(stock.spread).toBeLessThanOrEqual(0.001);
      });
    });

    it('should generate crypto with spreads between 0.001 and 0.01', () => {
      const instruments = generateInstruments(50, 42);
      const crypto = instruments.filter((i) => i.type === 'crypto');

      crypto.forEach((c) => {
        expect(c.spread).toBeGreaterThanOrEqual(0.001);
        expect(c.spread).toBeLessThanOrEqual(0.01);
      });
    });

    it('should generate forex with spreads between 0.00001 and 0.0001', () => {
      const instruments = generateInstruments(50, 42);
      const forex = instruments.filter((i) => i.type === 'forex');

      forex.forEach((f) => {
        expect(f.spread).toBeGreaterThanOrEqual(0.00001);
        expect(f.spread).toBeLessThanOrEqual(0.0001);
      });
    });
  });

  describe('precision validation', () => {
    it('should generate stocks with precision of 2', () => {
      const instruments = generateInstruments(50, 42);
      const stocks = instruments.filter((i) => i.type === 'stock');

      stocks.forEach((stock) => {
        expect(stock.precision).toBe(2);
      });
    });

    it('should generate crypto with precision of 8', () => {
      const instruments = generateInstruments(50, 42);
      const crypto = instruments.filter((i) => i.type === 'crypto');

      crypto.forEach((c) => {
        expect(c.precision).toBe(8);
      });
    });

    it('should generate forex with precision of 5', () => {
      const instruments = generateInstruments(50, 42);
      const forex = instruments.filter((i) => i.type === 'forex');

      forex.forEach((f) => {
        expect(f.precision).toBe(5);
      });
    });
  });

  describe('realistic instrument properties', () => {
    it('should generate realistic stock symbols (uppercase letters)', () => {
      const instruments = generateInstruments(50, 42);
      const stocks = instruments.filter((i) => i.type === 'stock');

      stocks.forEach((stock) => {
        // Stock symbols should be uppercase letters
        expect(stock.symbol).toMatch(/^[A-Z]+$/);
        // Typically 1-5 characters
        expect(stock.symbol.length).toBeGreaterThanOrEqual(1);
        expect(stock.symbol.length).toBeLessThanOrEqual(5);
      });
    });

    it('should generate realistic crypto symbols (contains BTC, ETH, etc.)', () => {
      const instruments = generateInstruments(50, 42);
      const crypto = instruments.filter((i) => i.type === 'crypto');

      // Should have some common crypto symbols
      const symbols = crypto.map((c) => c.symbol);
      const hasCommonCrypto =
        symbols.some((s) => s.includes('BTC')) ||
        symbols.some((s) => s.includes('ETH')) ||
        symbols.some((s) => s.includes('SOL'));

      expect(hasCommonCrypto).toBe(true);
    });

    it('should generate realistic forex pairs (XXX/YYY format)', () => {
      const instruments = generateInstruments(50, 42);
      const forex = instruments.filter((i) => i.type === 'forex');

      forex.forEach((pair) => {
        // Forex pairs should be in format XXX/YYY
        expect(pair.symbol).toMatch(/^[A-Z]{3}\/[A-Z]{3}$/);
      });
    });

    it('should generate valid trade size ranges', () => {
      const instruments = generateInstruments(50, 42);

      instruments.forEach((instrument) => {
        expect(instrument.min_trade_size).toBeGreaterThan(0);
        expect(instrument.max_trade_size).toBeGreaterThan(
          instrument.min_trade_size
        );
      });
    });
  });

  describe('seed reproducibility', () => {
    it('should generate identical instruments with the same seed', () => {
      const instruments1 = generateInstruments(20, 42);
      const instruments2 = generateInstruments(20, 42);

      expect(instruments1).toHaveLength(instruments2.length);

      instruments1.forEach((inst1, index) => {
        const inst2 = instruments2[index] as Instrument;
        expect(inst1.id).toBe(inst2.id);
        expect(inst1.symbol).toBe(inst2.symbol);
        expect(inst1.type).toBe(inst2.type);
        expect(inst1.spread).toBe(inst2.spread);
      });
    });

    it('should generate different instruments with different seeds', () => {
      const instruments1 = generateInstruments(20, 42);
      const instruments2 = generateInstruments(20, 123);

      // At least some instruments should be different
      const hasDifference = instruments1.some((inst1, index) => {
        const inst2 = instruments2[index] as Instrument;
        return inst1.spread !== inst2.spread || inst1.symbol !== inst2.symbol;
      });

      expect(hasDifference).toBe(true);
    });

    it('should generate consistent output when no seed is provided (uses default)', () => {
      // When no seed is provided, we expect some randomness but structure should be consistent
      const instruments = generateInstruments(10);
      expect(instruments).toHaveLength(10);

      // Verify structure is valid even without seed
      instruments.forEach((instrument) => {
        expect(instrument.id).toBeTruthy();
        expect(instrument.symbol).toBeTruthy();
        expect(['stock', 'crypto', 'forex']).toContain(instrument.type);
      });
    });
  });

  describe('realistic company names (Faker.js)', () => {
    it('should use realistic company names for stocks', () => {
      const instruments = generateInstruments(50, 42);
      const stocks = instruments.filter((i) => i.type === 'stock');

      stocks.forEach((stock) => {
        // Names should be non-empty strings
        expect(stock.name).toBeTruthy();
        expect(typeof stock.name).toBe('string');
        expect(stock.name.length).toBeGreaterThan(0);

        // Should not be generic like "Stock 1"
        expect(stock.name).not.toMatch(/^Stock \d+$/);
      });
    });

    it('should use realistic cryptocurrency names', () => {
      const instruments = generateInstruments(50, 42);
      const crypto = instruments.filter((i) => i.type === 'crypto');

      crypto.forEach((c) => {
        expect(c.name).toBeTruthy();
        expect(typeof c.name).toBe('string');
        expect(c.name.length).toBeGreaterThan(0);

        // Should not be generic
        expect(c.name).not.toMatch(/^Crypto \d+$/);
      });
    });

    it('should use realistic forex pair names', () => {
      const instruments = generateInstruments(50, 42);
      const forex = instruments.filter((i) => i.type === 'forex');

      forex.forEach((pair) => {
        expect(pair.name).toBeTruthy();
        expect(typeof pair.name).toBe('string');
        // Forex names typically include "/"
        expect(pair.name).toContain('/');
      });
    });
  });
});
