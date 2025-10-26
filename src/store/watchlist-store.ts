/**
 * Watchlist Store
 * REFACTOR Phase: Enhanced with documentation and optimizations
 * Manages user's watchlist of instruments with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WatchlistState } from '../types/watchlist';

/**
 * Zustand store for managing watchlist state
 *
 * Features:
 * - Add/remove instruments from watchlist
 * - Reorder instruments for customization
 * - Check if instrument is in watchlist
 * - Automatic localStorage persistence
 *
 * @example
 * ```tsx
 * const { watchlist, addToWatchlist } = useWatchlistStore();
 * addToWatchlist('EUR_USD');
 * ```
 */
export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],

      /**
       * Add instrument ID to watchlist
       * Prevents duplicates automatically
       * @param id - Instrument identifier
       */
      addToWatchlist: (id: string) => {
        const state = get();
        if (!state.watchlist.includes(id)) {
          set({ watchlist: [...state.watchlist, id] });
        }
      },

      /**
       * Remove instrument ID from watchlist
       * @param id - Instrument identifier to remove
       */
      removeFromWatchlist: (id: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter((wId) => wId !== id),
        }));
      },

      /**
       * Reorder instruments in watchlist
       * Useful for drag-and-drop functionality
       * @param fromIndex - Source index
       * @param toIndex - Destination index
       */
      reorderWatchlist: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newList = [...state.watchlist];
          const [moved] = newList.splice(fromIndex, 1);
          newList.splice(toIndex, 0, moved);
          return { watchlist: newList };
        });
      },

      /**
       * Check if instrument is in watchlist
       * @param id - Instrument identifier to check
       * @returns true if instrument is in watchlist
       */
      isInWatchlist: (id: string): boolean => {
        return get().watchlist.includes(id);
      },
    }),
    {
      name: 'watchlist-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
