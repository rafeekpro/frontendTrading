/**
 * useWatchlist Hook
 * REFACTOR Phase: Enhanced with documentation and performance optimizations
 * Custom hook to access watchlist store with optimized selectors
 */

import { useWatchlistStore } from '../store/watchlist-store';

/**
 * Hook to access watchlist store
 *
 * Performance optimizations:
 * - Uses selective subscriptions to minimize re-renders
 * - Function references are stable across re-renders
 * - Only re-renders when watchlist array changes
 *
 * @returns Watchlist state and actions
 *
 * @example
 * ```tsx
 * function WatchlistComponent() {
 *   const { watchlist, addToWatchlist, isInWatchlist } = useWatchlist();
 *
 *   return (
 *     <div>
 *       {watchlist.map(id => (
 *         <div key={id}>{id}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWatchlist() {
  // Subscribe to watchlist array only - triggers re-render on changes
  const watchlist = useWatchlistStore((state) => state.watchlist);

  // Subscribe to action functions - these are stable and won't cause re-renders
  const addToWatchlist = useWatchlistStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useWatchlistStore((state) => state.removeFromWatchlist);
  const reorderWatchlist = useWatchlistStore((state) => state.reorderWatchlist);
  const isInWatchlist = useWatchlistStore((state) => state.isInWatchlist);

  return {
    /** Array of instrument IDs in watchlist */
    watchlist,
    /** Add instrument to watchlist */
    addToWatchlist,
    /** Remove instrument from watchlist */
    removeFromWatchlist,
    /** Reorder watchlist items */
    reorderWatchlist,
    /** Check if instrument is in watchlist */
    isInWatchlist,
  };
}
