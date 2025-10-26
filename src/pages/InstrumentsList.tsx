/**
 * InstrumentsList Page Component
 * REFACTOR PHASE: Optimized with extracted utilities and performance improvements
 */

import { useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInstruments } from '../hooks/queries/use-instruments';
import { useWatchlist } from '../hooks/use-watchlist';
import { SearchBar } from '../components/SearchBar';
import { FilterDropdown } from '../components/FilterDropdown';
import type { FilterOption } from '../components/FilterDropdown';
import { SortButtons } from '../components/SortButtons';
import { InstrumentRow } from '../components/InstrumentRow';
import {
  applyAllFilters,
  type SortColumn,
  type SortDirection,
  type InstrumentWithMarketData,
} from '../lib/list-utils';
import { addMockMarketDataToAll } from '../lib/mock-market-data';

/**
 * Sort column configuration (constant to avoid recreation)
 */
const SORT_COLUMNS: Array<{ key: SortColumn; label: string }> = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: 'Change' },
  { key: 'volume', label: 'Volume' },
];

/**
 * InstrumentsList - Main instruments list page
 *
 * Features:
 * - Virtual scrolling with @tanstack/react-virtual
 * - Search, filter, and sort functionality
 * - Watchlist integration
 * - Navigation to instrument detail
 * - Dark theme Squaber design
 * - Responsive layout
 *
 * Performance optimizations:
 * - Memoized data transformations
 * - Memoized event handlers
 * - Virtual scrolling for large lists
 * - Constant sort column configuration
 *
 * @example
 * ```tsx
 * <Route path="/instruments" element={<InstrumentsList />} />
 * ```
 */
export function InstrumentsList() {
  const navigate = useNavigate();

  // State management
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterOption>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch data
  const { data: instruments, isLoading, error } = useInstruments();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  // Transform instruments to include market data (memoized)
  const instrumentsWithMarketData = useMemo<InstrumentWithMarketData[]>(() => {
    if (!instruments) return [];
    return addMockMarketDataToAll(instruments);
  }, [instruments]);

  // Apply filters and sort
  const filteredInstruments = useMemo(() => {
    if (!instrumentsWithMarketData.length) return [];

    return applyAllFilters(instrumentsWithMarketData, {
      search,
      type: typeFilter,
      exchange: 'all', // Exchange filter not yet implemented
      sortColumn,
      sortDirection,
    });
  }, [instrumentsWithMarketData, search, typeFilter, sortColumn, sortDirection]);

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredInstruments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height in pixels
    overscan: 5,
  });

  // Event handlers (memoized to prevent unnecessary re-renders)
  const handleNavigate = useCallback((id: string) => {
    navigate(`/instrument/${id}`);
  }, [navigate]);

  const handleToggleWatchlist = useCallback((id: string) => {
    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  const handleSortChange = useCallback((column: SortColumn, direction: SortDirection) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-gray-400">Loading instruments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-red-400">Error loading instruments. Please try again.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredInstruments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <h1 className="mb-6 text-2xl font-bold text-white">All Instruments</h1>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by symbol, name, or exchange..."
            />
          </div>
          <FilterDropdown selected={typeFilter} onChange={setTypeFilter} />
        </div>

        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-gray-400">No instruments found.</p>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">All Instruments</h1>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by symbol, name, or exchange..."
          />
        </div>
        <FilterDropdown selected={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* Sort Controls */}
      <SortButtons
        columns={SORT_COLUMNS}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      {/* Virtual List */}
      <div
        ref={parentRef}
        data-testid="virtual-list-container"
        className="h-[calc(100vh-350px)] overflow-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const instrument = filteredInstruments[virtualRow.index];
            if (!instrument) return null; // Safety check for undefined

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <InstrumentRow
                  instrument={instrument}
                  onNavigate={handleNavigate}
                  onToggleWatchlist={handleToggleWatchlist}
                  inWatchlist={isInWatchlist(instrument.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
