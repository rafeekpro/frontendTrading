/**
 * InstrumentRow Component
 * Individual row component for instruments list display
 */

import { Star } from 'lucide-react';
import type { InstrumentWithMarketData } from '../lib/list-utils';
import { formatPrice, formatNumberWithSuffix, formatPercentage } from '../lib/format-utils';

export interface InstrumentRowProps {
  /**
   * Instrument with market data
   */
  instrument: InstrumentWithMarketData;

  /**
   * Callback when row is clicked (navigate to detail page)
   */
  onNavigate: (id: string) => void;

  /**
   * Optional callback when watchlist star is clicked
   */
  onToggleWatchlist?: (id: string) => void;

  /**
   * Whether instrument is in watchlist
   */
  inWatchlist?: boolean;
}

/**
 * InstrumentRow - Row component for displaying instrument in list
 *
 * Features:
 * - Displays: symbol, name, type, price, 24h change, volume
 * - Star icon for watchlist toggle
 * - Click to navigate to detail page
 * - Hover highlight effect
 * - Color-coded 24h change (green/red/gray)
 * - Squaber-style dark theme design
 *
 * @example
 * ```tsx
 * <InstrumentRow
 *   instrument={instrument}
 *   onNavigate={(id) => navigate(`/instruments/${id}`)}
 *   onToggleWatchlist={(id) => toggleWatchlist(id)}
 *   inWatchlist={watchlist.includes(instrument.id)}
 * />
 * ```
 */
export function InstrumentRow({
  instrument,
  onNavigate,
  onToggleWatchlist,
  inWatchlist = false,
}: InstrumentRowProps) {
  const handleRowClick = () => {
    onNavigate(instrument.id);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row navigation
    onToggleWatchlist?.(instrument.id);
  };

  // Determine change color class
  const getChangeColorClass = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="flex items-center gap-4 border-b border-gray-700 bg-gray-800 p-3">
      {/* Watchlist Star Button */}
      <button
        onClick={handleStarClick}
        aria-label={
          inWatchlist
            ? `Remove ${instrument.symbol} from watchlist`
            : `Add ${instrument.symbol} to watchlist`
        }
        className="flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
      >
        <Star
          size={18}
          className={inWatchlist ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}
          aria-hidden="true"
        />
      </button>

      {/* Main Row Content - Clickable for navigation */}
      <button
        onClick={handleRowClick}
        aria-label={`View details for ${instrument.symbol}`}
        className="flex flex-1 items-center gap-4 text-left hover:bg-gray-700 rounded transition-colors p-2 -m-2"
      >
        {/* Symbol */}
        <div className="w-24 flex-shrink-0">
          <span className="text-sm font-bold text-white">{instrument.symbol}</span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-300 truncate block">{instrument.name}</span>
        </div>

        {/* Type */}
        <div className="w-20 flex-shrink-0">
          <span className="text-xs text-gray-400 uppercase">{instrument.type}</span>
        </div>

        {/* Price */}
        <div className="w-28 flex-shrink-0 text-right">
          <span className="text-sm font-medium text-white">
            {formatPrice(instrument.currentPrice, instrument.precision)}
          </span>
        </div>

        {/* 24h Change */}
        <div className="w-24 flex-shrink-0 text-right">
          <span className={`text-sm font-medium ${getChangeColorClass(instrument.change24h)}`}>
            {formatPercentage(instrument.change24h)}
          </span>
        </div>

        {/* 24h Volume */}
        <div className="w-24 flex-shrink-0 text-right">
          <span className="text-sm text-gray-300">
            {formatNumberWithSuffix(instrument.volume24h)}
          </span>
        </div>
      </button>
    </div>
  );
}
