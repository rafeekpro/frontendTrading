/**
 * useWatchlist Hook Tests
 * TDD RED Phase: Write failing tests for custom hook
 * Tests for hook that wraps watchlist store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from '../use-watchlist';
import { useWatchlistStore } from '../../store/watchlist-store';

describe('useWatchlist Hook - TDD RED Phase', () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear();
    useWatchlistStore.setState({ watchlist: [] });
  });

  describe('Hook Return Values', () => {
    it('should return watchlist state', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(result.current.watchlist).toEqual([]);
    });

    it('should return addToWatchlist function', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(typeof result.current.addToWatchlist).toBe('function');
    });

    it('should return removeFromWatchlist function', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(typeof result.current.removeFromWatchlist).toBe('function');
    });

    it('should return reorderWatchlist function', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(typeof result.current.reorderWatchlist).toBe('function');
    });

    it('should return isInWatchlist function', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(typeof result.current.isInWatchlist).toBe('function');
    });
  });

  describe('Hook Functionality', () => {
    it('should add instrument ID via hook', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.addToWatchlist('EUR_USD');
      });

      expect(result.current.watchlist).toEqual(['EUR_USD']);
    });

    it('should add multiple IDs via hook', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.addToWatchlist('EUR_USD');
        result.current.addToWatchlist('GBP_USD');
        result.current.addToWatchlist('USD_JPY');
      });

      expect(result.current.watchlist).toHaveLength(3);
      expect(result.current.watchlist).toEqual(['EUR_USD', 'GBP_USD', 'USD_JPY']);
    });

    it('should remove ID via hook', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.addToWatchlist('EUR_USD');
        result.current.addToWatchlist('GBP_USD');
        result.current.removeFromWatchlist('EUR_USD');
      });

      expect(result.current.watchlist).toEqual(['GBP_USD']);
    });

    it('should reorder items via hook', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.addToWatchlist('A');
        result.current.addToWatchlist('B');
        result.current.addToWatchlist('C');
        result.current.reorderWatchlist(0, 2);
      });

      expect(result.current.watchlist).toEqual(['B', 'C', 'A']);
    });

    it('should check if ID is in watchlist via hook', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.addToWatchlist('EUR_USD');
      });

      expect(result.current.isInWatchlist('EUR_USD')).toBe(true);
      expect(result.current.isInWatchlist('GBP_USD')).toBe(false);
    });
  });

  describe('Hook State Updates', () => {
    it('should trigger re-render when watchlist changes', () => {
      const { result } = renderHook(() => useWatchlist());
      const initialWatchlist = result.current.watchlist;

      act(() => {
        result.current.addToWatchlist('EUR_USD');
      });

      expect(result.current.watchlist).not.toBe(initialWatchlist);
      expect(result.current.watchlist).toEqual(['EUR_USD']);
    });

    it('should not trigger re-render when adding duplicate', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        result.current.addToWatchlist('EUR_USD');
      });

      const watchlistAfterFirst = result.current.watchlist;

      act(() => {
        result.current.addToWatchlist('EUR_USD');
      });

      // Should be same reference since state didn't change
      expect(result.current.watchlist).toBe(watchlistAfterFirst);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('should share state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useWatchlist());
      const { result: result2 } = renderHook(() => useWatchlist());

      act(() => {
        result1.current.addToWatchlist('EUR_USD');
      });

      expect(result1.current.watchlist).toEqual(['EUR_USD']);
      expect(result2.current.watchlist).toEqual(['EUR_USD']);
    });

    it('should update all instances when state changes', () => {
      const { result: result1 } = renderHook(() => useWatchlist());
      const { result: result2 } = renderHook(() => useWatchlist());

      act(() => {
        result1.current.addToWatchlist('EUR_USD');
        result2.current.addToWatchlist('GBP_USD');
      });

      expect(result1.current.watchlist).toEqual(['EUR_USD', 'GBP_USD']);
      expect(result2.current.watchlist).toEqual(['EUR_USD', 'GBP_USD']);
    });
  });

  describe('Hook Performance', () => {
    it('should use stable function references', () => {
      const { result, rerender } = renderHook(() => useWatchlist());

      const addToWatchlist1 = result.current.addToWatchlist;
      const removeFromWatchlist1 = result.current.removeFromWatchlist;
      const reorderWatchlist1 = result.current.reorderWatchlist;
      const isInWatchlist1 = result.current.isInWatchlist;

      rerender();

      expect(result.current.addToWatchlist).toBe(addToWatchlist1);
      expect(result.current.removeFromWatchlist).toBe(removeFromWatchlist1);
      expect(result.current.reorderWatchlist).toBe(reorderWatchlist1);
      expect(result.current.isInWatchlist).toBe(isInWatchlist1);
    });
  });

  describe('Hook Edge Cases', () => {
    it('should handle empty watchlist', () => {
      const { result } = renderHook(() => useWatchlist());

      expect(result.current.watchlist).toEqual([]);
      expect(result.current.isInWatchlist('EUR_USD')).toBe(false);
    });

    it('should handle rapid successive calls', () => {
      const { result } = renderHook(() => useWatchlist());

      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.addToWatchlist(`INSTRUMENT_${i}`);
        }
      });

      expect(result.current.watchlist).toHaveLength(50);
    });

    it('should persist across unmount and remount', () => {
      const { result: result1, unmount } = renderHook(() => useWatchlist());

      act(() => {
        result1.current.addToWatchlist('EUR_USD');
        result1.current.addToWatchlist('GBP_USD');
      });

      unmount();

      const { result: result2 } = renderHook(() => useWatchlist());
      expect(result2.current.watchlist).toEqual(['EUR_USD', 'GBP_USD']);
    });
  });
});
