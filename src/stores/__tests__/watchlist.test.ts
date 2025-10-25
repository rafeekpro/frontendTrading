/**
 * Watchlist Store Tests
 * Tests for watchlist store actions and localStorage persistence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWatchlistStore } from '../watchlist';
import { clearStoreStorage } from './utils';

describe('Watchlist Store', () => {
  beforeEach(() => {
    // Clear store and localStorage before each test
    clearStoreStorage();
    useWatchlistStore.getState().clearWatchlist();
  });

  describe('Initial State', () => {
    it('should have empty instruments array', () => {
      const store = useWatchlistStore.getState();
      expect(store.instruments).toEqual([]);
    });
  });

  describe('addInstrument', () => {
    it('should add instrument to watchlist', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(1);
      expect(instruments[0]).toBe('EUR_USD');
    });

    it('should add multiple instruments', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('GBP_USD');
      store.addInstrument('USD_JPY');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(3);
      expect(instruments).toEqual(['EUR_USD', 'GBP_USD', 'USD_JPY']);
    });

    it('should not add duplicate instruments', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('EUR_USD');
      store.addInstrument('EUR_USD');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(1);
      expect(instruments[0]).toBe('EUR_USD');
    });

    it('should preserve order when adding new instruments', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('AAPL');
      store.addInstrument('GOOGL');
      store.addInstrument('MSFT');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual(['AAPL', 'GOOGL', 'MSFT']);
    });
  });

  describe('removeInstrument', () => {
    beforeEach(() => {
      // Setup: Add some instruments
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('GBP_USD');
      store.addInstrument('USD_JPY');
    });

    it('should remove instrument from watchlist', () => {
      const store = useWatchlistStore.getState();
      store.removeInstrument('GBP_USD');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(2);
      expect(instruments).toEqual(['EUR_USD', 'USD_JPY']);
    });

    it('should handle removing first instrument', () => {
      const store = useWatchlistStore.getState();
      store.removeInstrument('EUR_USD');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual(['GBP_USD', 'USD_JPY']);
    });

    it('should handle removing last instrument', () => {
      const store = useWatchlistStore.getState();
      store.removeInstrument('USD_JPY');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual(['EUR_USD', 'GBP_USD']);
    });

    it('should handle removing non-existent instrument gracefully', () => {
      const store = useWatchlistStore.getState();
      store.removeInstrument('NON_EXISTENT');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(3);
      expect(instruments).toEqual(['EUR_USD', 'GBP_USD', 'USD_JPY']);
    });

    it('should handle removing all instruments one by one', () => {
      const store = useWatchlistStore.getState();
      store.removeInstrument('EUR_USD');
      store.removeInstrument('GBP_USD');
      store.removeInstrument('USD_JPY');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual([]);
    });
  });

  describe('clearWatchlist', () => {
    beforeEach(() => {
      // Setup: Add some instruments
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('GBP_USD');
      store.addInstrument('USD_JPY');
    });

    it('should clear all instruments from watchlist', () => {
      const store = useWatchlistStore.getState();
      store.clearWatchlist();

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual([]);
    });

    it('should handle clearing empty watchlist', () => {
      const store = useWatchlistStore.getState();
      store.clearWatchlist();
      store.clearWatchlist();

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual([]);
    });

    it('should allow adding instruments after clearing', () => {
      const store = useWatchlistStore.getState();
      store.clearWatchlist();
      store.addInstrument('AAPL');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toEqual(['AAPL']);
    });
  });

  describe('hasInstrument', () => {
    beforeEach(() => {
      // Setup: Add some instruments
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('GBP_USD');
    });

    it('should return true for existing instrument', () => {
      const store = useWatchlistStore.getState();
      expect(store.hasInstrument('EUR_USD')).toBe(true);
      expect(store.hasInstrument('GBP_USD')).toBe(true);
    });

    it('should return false for non-existent instrument', () => {
      const store = useWatchlistStore.getState();
      expect(store.hasInstrument('USD_JPY')).toBe(false);
      expect(store.hasInstrument('NON_EXISTENT')).toBe(false);
    });

    it('should return false for empty watchlist', () => {
      const store = useWatchlistStore.getState();
      store.clearWatchlist();

      expect(store.hasInstrument('EUR_USD')).toBe(false);
    });

    it('should reflect changes after adding instrument', () => {
      const store = useWatchlistStore.getState();
      expect(store.hasInstrument('USD_JPY')).toBe(false);

      store.addInstrument('USD_JPY');
      expect(store.hasInstrument('USD_JPY')).toBe(true);
    });

    it('should reflect changes after removing instrument', () => {
      const store = useWatchlistStore.getState();
      expect(store.hasInstrument('EUR_USD')).toBe(true);

      store.removeInstrument('EUR_USD');
      expect(store.hasInstrument('EUR_USD')).toBe(false);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist watchlist to localStorage', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('GBP_USD');

      // Check localStorage
      const stored = localStorage.getItem('trading-watchlist');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.instruments).toHaveLength(2);
      expect(parsed.state.instruments).toContain('EUR_USD');
      expect(parsed.state.instruments).toContain('GBP_USD');
    });

    it('should persist after removing instruments', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.addInstrument('GBP_USD');
      store.removeInstrument('EUR_USD');

      const stored = localStorage.getItem('trading-watchlist');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.instruments).toHaveLength(1);
      expect(parsed.state.instruments).toEqual(['GBP_USD']);
    });

    it('should persist after clearing watchlist', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');
      store.clearWatchlist();

      const stored = localStorage.getItem('trading-watchlist');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.instruments).toEqual([]);
    });

    it('should use correct storage key name', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR_USD');

      // Verify key exists
      const key = 'trading-watchlist';
      expect(localStorage.getItem(key)).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string instrument ID', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(1);
      expect(instruments[0]).toBe('');
    });

    it('should handle special characters in instrument ID', () => {
      const store = useWatchlistStore.getState();
      store.addInstrument('EUR/USD');
      store.addInstrument('BTC-USD');
      store.addInstrument('GOLD_SPOT');

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(3);
      expect(instruments).toContain('EUR/USD');
      expect(instruments).toContain('BTC-USD');
      expect(instruments).toContain('GOLD_SPOT');
    });

    it('should handle very long instrument IDs', () => {
      const store = useWatchlistStore.getState();
      const longId = 'A'.repeat(1000);
      store.addInstrument(longId);

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(1);
      expect(instruments[0]).toBe(longId);
    });

    it('should handle rapid successive operations', () => {
      const store = useWatchlistStore.getState();

      // Rapid add/remove operations
      for (let i = 0; i < 100; i++) {
        store.addInstrument(`INSTRUMENT_${i}`);
      }

      const instruments = useWatchlistStore.getState().instruments;
      expect(instruments).toHaveLength(100);

      for (let i = 0; i < 50; i++) {
        store.removeInstrument(`INSTRUMENT_${i}`);
      }

      const remaining = useWatchlistStore.getState().instruments;
      expect(remaining).toHaveLength(50);
    });
  });
});
