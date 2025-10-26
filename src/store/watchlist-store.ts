/**
 * Watchlist Store
 * TDD GREEN Phase: Minimum implementation to pass tests
 * Manages user's watchlist of instruments with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WatchlistState } from '../types/watchlist';

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],

      addToWatchlist: (id: string) => {
        const state = get();
        if (!state.watchlist.includes(id)) {
          set({ watchlist: [...state.watchlist, id] });
        }
      },

      removeFromWatchlist: (id: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter((wId) => wId !== id),
        }));
      },

      reorderWatchlist: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newList = [...state.watchlist];
          const [moved] = newList.splice(fromIndex, 1);
          newList.splice(toIndex, 0, moved);
          return { watchlist: newList };
        });
      },

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
