/**
 * useWatchlist Hook
 * TDD GREEN Phase: Minimum implementation to pass tests
 * Custom hook to access watchlist store with optimized selectors
 */

import { useWatchlistStore } from '../store/watchlist-store';

/**
 * Hook to access watchlist store
 * Uses selective subscriptions for optimal re-render performance
 */
export function useWatchlist() {
  const watchlist = useWatchlistStore((state) => state.watchlist);
  const addToWatchlist = useWatchlistStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useWatchlistStore((state) => state.removeFromWatchlist);
  const reorderWatchlist = useWatchlistStore((state) => state.reorderWatchlist);
  const isInWatchlist = useWatchlistStore((state) => state.isInWatchlist);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    reorderWatchlist,
    isInWatchlist,
  };
}
