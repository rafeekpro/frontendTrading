/**
 * List utilities for InstrumentsList page
 * Provides search, filter, and sort functionality for instrument lists
 */

import type { Instrument } from '../types/trading';
import type { FilterOption } from '../components/FilterDropdown';

/**
 * Sort column options
 */
export type SortColumn = 'symbol' | 'name' | 'price' | 'change' | 'volume';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Extended Instrument type with market data for list display
 */
export interface InstrumentWithMarketData extends Instrument {
  /** Exchange where instrument is traded */
  exchange: string;

  /** Current market price */
  currentPrice: number;

  /** 24-hour price change percentage */
  change24h: number;

  /** 24-hour trading volume */
  volume24h: number;
}

/**
 * Filter instruments by search query
 * Searches in symbol and name fields (case-insensitive)
 *
 * @param instruments - Array of instruments to filter
 * @param search - Search query string
 * @returns Filtered array of instruments
 */
export function filterInstrumentsBySearch(
  instruments: InstrumentWithMarketData[],
  search: string
): InstrumentWithMarketData[] {
  const trimmed = search.trim();

  if (!trimmed) {
    return instruments;
  }

  const lowerSearch = trimmed.toLowerCase();

  return instruments.filter((instrument) => {
    const lowerSymbol = instrument.symbol.toLowerCase();
    const lowerName = instrument.name.toLowerCase();

    // For multi-word search, check if all words are present
    const searchWords = lowerSearch.split(/\s+/);
    const allWordsMatch = searchWords.every(
      (word) => lowerSymbol.includes(word) || lowerName.includes(word)
    );

    return allWordsMatch;
  });
}

/**
 * Filter instruments by type
 *
 * @param instruments - Array of instruments to filter
 * @param filterType - Filter option (all, favorites, forex, crypto, stocks)
 * @returns Filtered array of instruments
 */
export function filterInstrumentsByType(
  instruments: InstrumentWithMarketData[],
  filterType: FilterOption
): InstrumentWithMarketData[] {
  if (filterType === 'all') {
    return instruments;
  }

  if (filterType === 'favorites') {
    // Favorites not yet implemented - return empty array
    return [];
  }

  if (filterType === 'stocks') {
    // Map 'stocks' to 'stock' type
    return instruments.filter((instrument) => instrument.type === 'stock');
  }

  // For forex and crypto, match directly
  return instruments.filter((instrument) => instrument.type === filterType);
}

/**
 * Filter instruments by exchange
 *
 * @param instruments - Array of instruments to filter
 * @param exchange - Exchange filter ('all' or specific exchange name)
 * @returns Filtered array of instruments
 */
export function filterInstrumentsByExchange(
  instruments: InstrumentWithMarketData[],
  exchange: string
): InstrumentWithMarketData[] {
  if (exchange === 'all') {
    return instruments;
  }

  return instruments.filter((instrument) => instrument.exchange === exchange);
}

/**
 * Sort instruments by column and direction
 *
 * @param instruments - Array of instruments to sort
 * @param column - Column to sort by
 * @param direction - Sort direction (asc or desc)
 * @returns New sorted array (immutable)
 */
export function sortInstruments(
  instruments: InstrumentWithMarketData[],
  column: SortColumn,
  direction: SortDirection
): InstrumentWithMarketData[] {
  // Create a copy to avoid mutating original array
  const sorted = [...instruments];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (column) {
      case 'symbol':
        compareValue = a.symbol.localeCompare(b.symbol);
        break;
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'price':
        compareValue = a.currentPrice - b.currentPrice;
        break;
      case 'change':
        compareValue = a.change24h - b.change24h;
        break;
      case 'volume':
        compareValue = a.volume24h - b.volume24h;
        break;
    }

    return direction === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

/**
 * Combined filter options
 */
export interface FilterOptions {
  search: string;
  type: FilterOption;
  exchange: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

/**
 * Apply all filters and sort to instrument list
 * Combines search, type filter, exchange filter, and sorting
 *
 * @param instruments - Array of instruments to process
 * @param options - Filter and sort options
 * @returns Filtered and sorted array of instruments
 */
export function applyAllFilters(
  instruments: InstrumentWithMarketData[],
  options: FilterOptions
): InstrumentWithMarketData[] {
  // Apply filters in sequence
  let result = instruments;

  result = filterInstrumentsBySearch(result, options.search);
  result = filterInstrumentsByType(result, options.type);
  result = filterInstrumentsByExchange(result, options.exchange);

  // Apply sort
  result = sortInstruments(result, options.sortColumn, options.sortDirection);

  return result;
}
