/**
 * AI Configuration Store
 * Manages AI provider settings with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AIConfigStore } from '../types/stores';

export const useAIConfigStore = create<AIConfigStore>()(
  persist(
    (set) => ({
      provider: 'none',
      apiKey: '',
      model: '',
      temperature: 0.7,
      maxTokens: 1000,
      enabled: false,

      setProvider: (provider) => set({ provider }),

      setApiKey: (apiKey) => set({ apiKey }),

      setModel: (model) => set({ model }),

      setTemperature: (temperature) => {
        // Clamp between 0 and 2
        const clamped = Math.max(0, Math.min(2, temperature));
        set({ temperature: clamped });
      },

      setMaxTokens: (maxTokens) => {
        // Ensure positive value
        set({ maxTokens: Math.max(1, maxTokens) });
      },

      toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),

      reset: () =>
        set({
          provider: 'none',
          apiKey: '',
          model: '',
          temperature: 0.7,
          maxTokens: 1000,
          enabled: false,
        }),
    }),
    {
      name: 'ai-config',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
