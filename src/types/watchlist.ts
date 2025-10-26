/**
 * Watchlist Type Definitions
 * TypeScript interfaces for watchlist operations
 */

/**
 * Watchlist Store State
 */
export interface WatchlistState {
  /** Array of instrument IDs in watchlist */
  watchlist: string[];

  /** Add instrument ID to watchlist */
  addToWatchlist: (id: string) => void;

  /** Remove instrument ID from watchlist */
  removeFromWatchlist: (id: string) => void;

  /** Reorder items in watchlist */
  reorderWatchlist: (fromIndex: number, toIndex: number) => void;

  /** Check if instrument ID is in watchlist */
  isInWatchlist: (id: string) => boolean;
}
