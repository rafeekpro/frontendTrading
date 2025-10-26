/**
 * Opportunities Page
 * Main opportunities detection page with filtering, sorting, and opportunity cards
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../hooks/queries/use-opportunities';
import { SearchBar } from '../components/SearchBar';
import type { Opportunity } from '../types/trading';

/**
 * Skeleton card for loading state
 */
function SkeletonCard() {
  return (
    <div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 animate-pulse"
      data-testid="skeleton-card"
    >
      <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-28 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-16 bg-gray-700 rounded"></div>
    </div>
  );
}

/**
 * Empty state component
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No opportunities found
      </h3>
      <p className="text-gray-400">
        Try adjusting your filters to find trading opportunities
      </p>
    </div>
  );
}

/**
 * Opportunity card component
 */
interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: (id: string) => void;
}

function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const isPositive = opportunity.type === 'buy';

  return (
    <div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
      data-testid="opportunity-card"
      onClick={() => onClick(opportunity.id)}
    >
      {/* Strategy and Type */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-semibold text-white capitalize">
          {opportunity.strategy.replace('_', ' ')}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPositive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {opportunity.type.toUpperCase()}
        </span>
      </div>

      {/* Instrument */}
      <div className="text-sm text-gray-400 mb-4">
        {opportunity.instrument_id}
      </div>

      {/* Confidence Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-400">Confidence</span>
          <span className="text-sm font-semibold text-white">
            {(opportunity.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${opportunity.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Price Targets */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-1">Entry</div>
          <div className="text-white font-medium">
            {opportunity.entry_price.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Target</div>
          <div className="text-green-400 font-medium">
            {opportunity.target_price.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Stop Loss</div>
          <div className="text-red-400 font-medium">
            {opportunity.stop_loss.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Detection Time */}
      <div className="mt-4 text-xs text-gray-500">
        Detected: {new Date(opportunity.detected_at).toLocaleString()}
      </div>
    </div>
  );
}

/**
 * Type filter options
 */
type TypeFilter = 'all' | 'buy' | 'sell';

/**
 * Sort options
 */
type SortBy = 'confidence' | 'date';

/**
 * Opportunities - Main opportunities page
 */
export function Opportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('confidence');

  // Fetch opportunities with filters
  const { data: opportunities, isLoading, error } = useOpportunities({
    type: typeFilter === 'all' ? undefined : typeFilter,
    sortBy,
    sortOrder: 'desc',
  });

  // Client-side search filter
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];

    if (!search) return opportunities;

    const searchLower = search.toLowerCase();
    return opportunities.filter(
      opp =>
        opp.instrument_id.toLowerCase().includes(searchLower) ||
        opp.strategy.toLowerCase().includes(searchLower)
    );
  }, [opportunities, search]);

  // Handle navigation to opportunity detail
  const handleNavigate = (id: string) => {
    navigate(`/opportunity/${id}`);
  };

  return (
    <div
      className="min-h-screen bg-gray-900 p-6"
      data-testid="opportunities-container"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Trading Opportunities
        </h1>
        <p className="text-gray-400">
          AI-detected trading signals with confidence scores
        </p>
      </div>

      {/* Search & Filter row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <select
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            aria-label="Type filter"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>

          {/* Sort Button */}
          <button
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            onClick={() =>
              setSortBy(sortBy === 'confidence' ? 'date' : 'confidence')
            }
            aria-label={`Sort by ${sortBy === 'confidence' ? 'date' : 'confidence'}`}
          >
            Sort: {sortBy === 'confidence' ? 'Confidence' : 'Date'}
          </button>
        </div>
      </div>

      {/* Loading state with skeleton cards */}
      {isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-testid="opportunities-grid"
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
            Failed to load opportunities. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredOpportunities.length === 0 && (
        <EmptyState />
      )}

      {/* Opportunities grid */}
      {!isLoading && !error && filteredOpportunities.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-testid="opportunities-grid"
        >
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onClick={handleNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
