/**
 * Watchlist Store Tests
 * TDD RED Phase: Write failing tests first
 * Tests for watchlist store actions and localStorage persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWatchlistStore } from '../watchlist-store';

describe('Watchlist Store - TDD RED Phase', () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear();
    useWatchlistStore.setState({ watchlist: [] });
  });

  describe('Initial State', () => {
    it('should have empty watchlist array', () => {
      const state = useWatchlistStore.getState();
      expect(state.watchlist).toEqual([]);
    });
  });

  describe('addToWatchlist', () => {
    it('should add instrument ID to watchlist', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0]).toBe('EUR_USD');
    });

    it('should add multiple instrument IDs', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');
      addToWatchlist('GBP_USD');
      addToWatchlist('USD_JPY');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(3);
      expect(watchlist).toEqual(['EUR_USD', 'GBP_USD', 'USD_JPY']);
    });

    it('should not add duplicate IDs', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');
      addToWatchlist('EUR_USD');
      addToWatchlist('EUR_USD');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0]).toBe('EUR_USD');
    });

    it('should preserve order when adding new IDs', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('AAPL');
      addToWatchlist('GOOGL');
      addToWatchlist('MSFT');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['AAPL', 'GOOGL', 'MSFT']);
    });
  });

  describe('removeFromWatchlist', () => {
    beforeEach(() => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');
      addToWatchlist('GBP_USD');
      addToWatchlist('USD_JPY');
    });

    it('should remove instrument ID from watchlist', () => {
      const { removeFromWatchlist } = useWatchlistStore.getState();
      removeFromWatchlist('GBP_USD');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(2);
      expect(watchlist).toEqual(['EUR_USD', 'USD_JPY']);
    });

    it('should handle removing first ID', () => {
      const { removeFromWatchlist } = useWatchlistStore.getState();
      removeFromWatchlist('EUR_USD');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['GBP_USD', 'USD_JPY']);
    });

    it('should handle removing last ID', () => {
      const { removeFromWatchlist } = useWatchlistStore.getState();
      removeFromWatchlist('USD_JPY');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['EUR_USD', 'GBP_USD']);
    });

    it('should handle removing non-existent ID gracefully', () => {
      const { removeFromWatchlist } = useWatchlistStore.getState();
      removeFromWatchlist('NON_EXISTENT');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(3);
      expect(watchlist).toEqual(['EUR_USD', 'GBP_USD', 'USD_JPY']);
    });
  });

  describe('reorderWatchlist', () => {
    beforeEach(() => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('A');
      addToWatchlist('B');
      addToWatchlist('C');
      addToWatchlist('D');
    });

    it('should move item from index 0 to index 2', () => {
      const { reorderWatchlist } = useWatchlistStore.getState();
      reorderWatchlist(0, 2);

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['B', 'C', 'A', 'D']);
    });

    it('should move item from index 3 to index 0', () => {
      const { reorderWatchlist } = useWatchlistStore.getState();
      reorderWatchlist(3, 0);

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['D', 'A', 'B', 'C']);
    });

    it('should move item from index 1 to index 2', () => {
      const { reorderWatchlist } = useWatchlistStore.getState();
      reorderWatchlist(1, 2);

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['A', 'C', 'B', 'D']);
    });

    it('should handle moving item to same position', () => {
      const { reorderWatchlist } = useWatchlistStore.getState();
      reorderWatchlist(1, 1);

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should handle reordering with 2 items', () => {
      useWatchlistStore.setState({ watchlist: ['X', 'Y'] });
      const { reorderWatchlist } = useWatchlistStore.getState();
      reorderWatchlist(0, 1);

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toEqual(['Y', 'X']);
    });
  });

  describe('isInWatchlist', () => {
    beforeEach(() => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');
      addToWatchlist('GBP_USD');
    });

    it('should return true for existing ID', () => {
      const { isInWatchlist } = useWatchlistStore.getState();
      expect(isInWatchlist('EUR_USD')).toBe(true);
      expect(isInWatchlist('GBP_USD')).toBe(true);
    });

    it('should return false for non-existent ID', () => {
      const { isInWatchlist } = useWatchlistStore.getState();
      expect(isInWatchlist('USD_JPY')).toBe(false);
      expect(isInWatchlist('NON_EXISTENT')).toBe(false);
    });

    it('should return false for empty watchlist', () => {
      useWatchlistStore.setState({ watchlist: [] });
      const { isInWatchlist } = useWatchlistStore.getState();

      expect(isInWatchlist('EUR_USD')).toBe(false);
    });

    it('should reflect changes after adding ID', () => {
      const { addToWatchlist, isInWatchlist } = useWatchlistStore.getState();
      expect(isInWatchlist('USD_JPY')).toBe(false);

      addToWatchlist('USD_JPY');
      expect(isInWatchlist('USD_JPY')).toBe(true);
    });

    it('should reflect changes after removing ID', () => {
      const { removeFromWatchlist, isInWatchlist } = useWatchlistStore.getState();
      expect(isInWatchlist('EUR_USD')).toBe(true);

      removeFromWatchlist('EUR_USD');
      expect(isInWatchlist('EUR_USD')).toBe(false);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist watchlist to localStorage', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');
      addToWatchlist('GBP_USD');

      // Check localStorage
      const stored = localStorage.getItem('watchlist-store');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.watchlist).toHaveLength(2);
      expect(parsed.state.watchlist).toContain('EUR_USD');
      expect(parsed.state.watchlist).toContain('GBP_USD');
    });

    it('should persist after removing IDs', () => {
      const { addToWatchlist, removeFromWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');
      addToWatchlist('GBP_USD');
      removeFromWatchlist('EUR_USD');

      const stored = localStorage.getItem('watchlist-store');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.watchlist).toHaveLength(1);
      expect(parsed.state.watchlist).toEqual(['GBP_USD']);
    });

    it('should persist after reordering', () => {
      const { addToWatchlist, reorderWatchlist } = useWatchlistStore.getState();
      addToWatchlist('A');
      addToWatchlist('B');
      addToWatchlist('C');
      reorderWatchlist(0, 2);

      const stored = localStorage.getItem('watchlist-store');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.watchlist).toEqual(['B', 'C', 'A']);
    });

    it('should use correct storage key name', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR_USD');

      // Verify key exists
      const key = 'watchlist-store';
      expect(localStorage.getItem(key)).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string ID', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0]).toBe('');
    });

    it('should handle special characters in ID', () => {
      const { addToWatchlist } = useWatchlistStore.getState();
      addToWatchlist('EUR/USD');
      addToWatchlist('BTC-USD');
      addToWatchlist('GOLD_SPOT');

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(3);
      expect(watchlist).toContain('EUR/USD');
      expect(watchlist).toContain('BTC-USD');
      expect(watchlist).toContain('GOLD_SPOT');
    });

    it('should handle rapid successive operations', () => {
      const { addToWatchlist, removeFromWatchlist } = useWatchlistStore.getState();

      // Rapid add operations
      for (let i = 0; i < 100; i++) {
        addToWatchlist(`INSTRUMENT_${i}`);
      }

      const { watchlist } = useWatchlistStore.getState();
      expect(watchlist).toHaveLength(100);

      // Rapid remove operations
      for (let i = 0; i < 50; i++) {
        removeFromWatchlist(`INSTRUMENT_${i}`);
      }

      const remaining = useWatchlistStore.getState().watchlist;
      expect(remaining).toHaveLength(50);
    });
  });
});
