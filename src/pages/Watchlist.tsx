/**
 * Watchlist Page
 * GREEN Phase: Minimum implementation to pass tests
 *
 * Displays user's watchlist with drag-and-drop reordering
 */

import { useMemo } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWatchlist } from '../hooks/use-watchlist';
import { useInstruments } from '../hooks/queries/use-instruments';
import { DraggableInstrumentRow } from '../components/DraggableInstrumentRow';
import { EmptyWatchlist } from '../components/EmptyWatchlist';
import type { InstrumentWithMarketData } from '../lib/list-utils';
import type { Instrument } from '../types/trading';

/**
 * Extend Instrument with market data fields for display
 */
function extendWithMarketData(instrument: Instrument): InstrumentWithMarketData {
  return {
    ...instrument,
    exchange: 'FX', // Default exchange (would come from real API)
    currentPrice: 1.085 + Math.random() * 0.1, // Mock price (would come from real API)
    change24h: (Math.random() - 0.5) * 5, // Mock change (would come from real API)
    volume24h: Math.floor(Math.random() * 1000000) + 500000, // Mock volume (would come from real API)
  };
}

/**
 * Watchlist - Main watchlist page with drag-and-drop
 *
 * Features:
 * - Displays instruments from watchlist store (Stream A integration)
 * - Fetches full instrument data via React Query
 * - Drag-and-drop reordering with @dnd-kit
 * - Empty state when no items in watchlist
 * - Dark theme styling
 *
 * Integration Points:
 * - Stream A: useWatchlist() hook for watchlist state
 * - Stream B: InstrumentRow component for display
 * - React Query: useInstruments() for data fetching
 *
 * @example
 * ```tsx
 * // In App.tsx routes:
 * <Route path="/watchlist" element={<Watchlist />} />
 * ```
 */
export function Watchlist() {
  const { watchlist, reorderWatchlist } = useWatchlist();
  const { data: instruments, isLoading, isError } = useInstruments();

  // Filter instruments to only those in watchlist, maintaining order
  const watchlistInstruments = useMemo(() => {
    if (!instruments || !watchlist || watchlist.length === 0) return [];

    return watchlist
      .map((id) => instruments.find((i) => i.id === id))
      .filter((instrument): instrument is Instrument => instrument !== undefined)
      .map(extendWithMarketData);
  }, [watchlist, instruments]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = watchlist.indexOf(active.id as string);
      const newIndex = watchlist.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWatchlist(oldIndex, newIndex);
      }
    }
  };

  // Show empty state if watchlist is empty
  if (watchlist.length === 0) {
    return <EmptyWatchlist />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>
        <div className="text-gray-400">Loading instruments...</div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>
        <div className="text-red-400">Failed to load instruments. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={watchlist} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {watchlistInstruments.map((instrument) => (
              <DraggableInstrumentRow key={instrument.id} instrument={instrument} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
