/**
 * EmptyWatchlist Component
 * GREEN Phase: Minimum implementation to pass tests
 *
 * Displays empty state when watchlist has no items
 */

import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

/**
 * EmptyWatchlist - Empty state component for watchlist page
 *
 * Features:
 * - Displays helpful empty state message
 * - Star icon for visual clarity
 * - Call-to-action button to browse instruments
 * - Dark theme styling consistent with app design
 *
 * @example
 * ```tsx
 * function Watchlist() {
 *   const { watchlist } = useWatchlist();
 *
 *   if (watchlist.length === 0) {
 *     return <EmptyWatchlist />;
 *   }
 *
 *   return <WatchlistContent />;
 * }
 * ```
 */
export function EmptyWatchlist() {
  const navigate = useNavigate();

  const handleBrowseClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <Star
          className="w-16 h-16 mx-auto mb-4 text-gray-600"
          data-testid="star-icon"
          aria-hidden="true"
        />
        <h2 className="text-2xl font-bold text-white mb-2">Your Watchlist is Empty</h2>
        <p className="text-gray-400 mb-6">
          Start adding instruments to your watchlist to track them here. Click the star icon
          on any instrument to add it.
        </p>
        <button
          type="button"
          onClick={handleBrowseClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Browse Instruments
        </button>
      </div>
    </div>
  );
}
