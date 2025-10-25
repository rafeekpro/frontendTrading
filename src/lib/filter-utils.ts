/**
 * Filter utilities for Dashboard
 * Provides functions for filtering and searching instruments
 */

import type { Instrument } from '../types/trading';
import type { FilterOption } from '../components/FilterDropdown';

/**
 * Filter instruments by search query and filter type
 *
 * @param instruments - Array of instruments to filter (or undefined)
 * @param search - Search query to match against symbol or name
 * @param filter - Filter option to apply (all, favorites, forex, crypto, stocks)
 * @returns Filtered array of instruments
 *
 * @example
 * ```tsx
 * const filtered = filterInstruments(instruments, 'EUR', 'forex');
 * // Returns: [EUR/USD, EUR/GBP, ...]
 * ```
 */
export function filterInstruments(
  instruments: Instrument[] | undefined,
  search: string,
  filter: FilterOption
): Instrument[] {
  if (!instruments) {
    return [];
  }

  let filtered = instruments;

  // Apply search filter
  if (search) {
    const lowerSearch = search.trim().toLowerCase();
    filtered = filtered.filter(
      (instrument) =>
        instrument.symbol.toLowerCase().includes(lowerSearch) ||
        instrument.name.toLowerCase().includes(lowerSearch)
    );
  }

  // Apply type filter
  if (filter !== 'all') {
    if (filter === 'favorites') {
      // For now, return empty array (favorites not yet implemented)
      return [];
    } else if (filter === 'stocks') {
      // Map 'stocks' filter to 'stock' type
      filtered = filtered.filter((instrument) => instrument.type === 'stock');
    } else {
      // For forex and crypto, match directly
      filtered = filtered.filter((instrument) => instrument.type === filter);
    }
  }

  return filtered;
}
