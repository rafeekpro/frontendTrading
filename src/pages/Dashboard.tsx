/**
 * Dashboard Page
 * Main dashboard page featuring instrument cards, quick stats, search, and filtering
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstrumentCard } from '../components/InstrumentCard';
import { QuickStats } from '../components/QuickStats';
import { SearchBar } from '../components/SearchBar';
import { FilterDropdown, type FilterOption } from '../components/FilterDropdown';
import { useInstruments } from '../hooks/queries/use-instruments';
import { filterInstruments } from '../lib/filter-utils';

/**
 * Skeleton card for loading state
 */
function SkeletonCard() {
  return (
    <div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 animate-pulse"
      data-testid="skeleton-card"
    >
      <div className="h-6 bg-gray-700 rounded w-24 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-28 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
      <div className="h-16 bg-gray-700 rounded"></div>
    </div>
  );
}

/**
 * Empty state component when no instruments match filters
 */
function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="empty-state"
    >
      <div className="text-gray-400 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No instruments found
      </h3>
      <p className="text-gray-400">
        Try adjusting your search or filters to find what you're looking for
      </p>
    </div>
  );
}

/**
 * Dashboard component - Main landing page with instruments grid
 *
 * Features:
 * - QuickStats panel at top
 * - Search and filter controls
 * - Responsive instrument cards grid
 * - Loading states with skeleton cards
 * - Empty state when no matches
 * - Navigation to instrument detail page
 */
export function Dashboard() {
  const navigate = useNavigate();
  const { data: instruments, isLoading, error } = useInstruments();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Sync URL query params (read only on mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const filterParam = params.get('filter') as FilterOption;

    if (searchParam) {
      setSearch(searchParam);
    }
    if (filterParam && ['all', 'favorites', 'forex', 'crypto', 'stocks'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, []);

  // Filter instruments based on search and filter
  const filteredInstruments = useMemo(() => {
    return filterInstruments(instruments, search, filter);
  }, [instruments, search, filter]);

  // Mock stats (can be calculated from real data later)
  const stats = {
    totalPnL: 1250.75,
    openPositions: 5,
    activeAlerts: 3,
  };

  // Mock sparkline data generator
  const generateMockSparklineData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (23 - i) * 3600000,
      close: 1.1 + Math.random() * 0.1,
    }));
  };

  // Handle navigation to instrument detail page
  const handleNavigate = (id: string) => {
    navigate(`/instrument/${id}`);
  };

  // Handle favorite toggle (mock for now)
  const handleToggleFavorite = (id: string) => {
    console.log('Toggle favorite:', id);
  };

  return (
    <div
      className="min-h-screen bg-gray-900 p-6"
      data-testid="dashboard-container"
    >
      {/* QuickStats at top */}
      <div className="mb-6">
        <QuickStats {...stats} />
      </div>

      {/* Search & Filter row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div>
          <FilterDropdown selected={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Loading state with skeleton cards */}
      {isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-testid="instruments-grid"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">
            Failed to load instruments. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredInstruments.length === 0 && (
        <EmptyState />
      )}

      {/* Instrument cards grid */}
      {!isLoading && !error && filteredInstruments.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-testid="instruments-grid"
        >
          {filteredInstruments.map((instrument) => (
            <div key={instrument.id} data-testid="instrument-card">
              <InstrumentCard
                instrument={instrument}
                currentPrice={1.1 + Math.random() * 0.1} // Mock current price
                change24h={(Math.random() - 0.5) * 10} // Mock change %
                sparklineData={generateMockSparklineData()}
                onNavigate={handleNavigate}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
