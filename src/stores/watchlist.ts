/**
 * Watchlist Store
 * Manages user's watchlist of instruments with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WatchlistStore } from '../types/stores';

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      instruments: [],

      addInstrument: (instrumentId: string) => {
        const state = get();
        if (!state.instruments.includes(instrumentId)) {
          set({ instruments: [...state.instruments, instrumentId] });
        }
      },

      removeInstrument: (instrumentId: string) => {
        set((state) => ({
          instruments: state.instruments.filter((id) => id !== instrumentId),
        }));
      },

      clearWatchlist: () => {
        set({ instruments: [] });
      },

      hasInstrument: (instrumentId: string): boolean => {
        return get().instruments.includes(instrumentId);
      },
    }),
    {
      name: 'trading-watchlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
