/**
 * InstrumentsList Page Component
 * GREEN PHASE: Main list page with virtual scrolling, search, filter, and sort
 */

import { useMemo, useState, useRef } from 'react';
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
import type { Instrument } from '../types/trading';

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

  // Transform instruments to include market data
  const instrumentsWithMarketData = useMemo<InstrumentWithMarketData[]>(() => {
    if (!instruments) return [];

    return instruments.map((instrument) => ({
      ...instrument,
      exchange: getExchangeForInstrument(instrument),
      currentPrice: getMockPrice(instrument),
      change24h: getMockChange24h(instrument),
      volume24h: getMockVolume24h(instrument),
    }));
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

  // Event handlers
  const handleNavigate = (id: string) => {
    navigate(`/instrument/${id}`);
  };

  const handleToggleWatchlist = (id: string) => {
    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  };

  const handleSortChange = (column: SortColumn, direction: SortDirection) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

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

  // Define sort column configuration
  const sortColumns = [
    { key: 'symbol' as SortColumn, label: 'Symbol' },
    { key: 'name' as SortColumn, label: 'Name' },
    { key: 'price' as SortColumn, label: 'Price' },
    { key: 'change' as SortColumn, label: 'Change' },
    { key: 'volume' as SortColumn, label: 'Volume' },
  ];

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
        columns={sortColumns}
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

// Helper functions for mock market data

/**
 * Get exchange for instrument based on type
 */
function getExchangeForInstrument(instrument: Instrument): string {
  switch (instrument.type) {
    case 'forex':
      return 'FOREX';
    case 'crypto':
      return 'CRYPTO';
    case 'stock':
      return getStockExchange(instrument.symbol);
    case 'index':
      return 'INDEX';
    case 'commodity':
      return 'COMMODITY';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Get stock exchange based on symbol pattern
 */
function getStockExchange(symbol: string): string {
  // Simple heuristic - in real app, this would come from API
  if (symbol.includes('.L')) return 'LSE';
  if (symbol.includes('.HK')) return 'HKEX';
  if (symbol.includes('.T')) return 'TSE';
  return 'NASDAQ';
}

/**
 * Generate mock current price
 */
function getMockPrice(instrument: Instrument): number {
  // Use instrument ID hash for deterministic mock data
  const hash = hashString(instrument.id);
  const basePrice = (hash % 10000) + 1;

  switch (instrument.type) {
    case 'forex':
      return basePrice / 10000 + 1.0; // 1.0 - 2.0 range
    case 'crypto':
      return basePrice * 5; // 0 - 50000 range
    case 'stock':
      return basePrice / 50; // 0 - 200 range
    default:
      return basePrice / 100;
  }
}

/**
 * Generate mock 24h change percentage
 */
function getMockChange24h(instrument: Instrument): number {
  const hash = hashString(instrument.id + 'change');
  return ((hash % 1000) - 500) / 100; // -5% to +5% range
}

/**
 * Generate mock 24h volume
 */
function getMockVolume24h(instrument: Instrument): number {
  const hash = hashString(instrument.id + 'volume');
  const base = (hash % 100000000) + 1000000;

  switch (instrument.type) {
    case 'crypto':
      return base * 10;
    case 'stock':
      return base * 5;
    default:
      return base;
  }
}

/**
 * Simple string hash function for deterministic mock data
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
