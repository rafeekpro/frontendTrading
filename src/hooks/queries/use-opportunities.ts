/**
 * useOpportunities Hook
 * Fetches list of trading opportunities with optional filters
 */

import { useQuery } from '@tanstack/react-query';
import type { Opportunity, OpportunitiesResponse } from '../../types/trading';

/**
 * Options for filtering and sorting opportunities
 */
export interface UseOpportunitiesOptions {
  /** Filter by trade type */
  type?: 'buy' | 'sell';

  /** Filter by minimum confidence level (0-1) */
  minConfidence?: number;

  /** Filter by maximum confidence level (0-1) */
  maxConfidence?: number;

  /** Filter by strategy type */
  strategy?: string;

  /** Sort field */
  sortBy?: 'confidence' | 'date';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';

  /** Maximum number of results */
  limit?: number;

  /** Page number (for pagination) */
  page?: number;
}

/**
 * Fetches opportunities with optional filtering and sorting
 *
 * @param options - Filter and sort options
 * @returns UseQueryResult with opportunities list
 *
 * @example
 * ```tsx
 * function OpportunitiesList() {
 *   const { data: opportunities, isLoading } = useOpportunities({
 *     minConfidence: 0.8,
 *     sortBy: 'confidence',
 *     sortOrder: 'desc',
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {opportunities?.map(opportunity => (
 *         <li key={opportunity.id}>
 *           {opportunity.strategy} - {opportunity.confidence}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useOpportunities(options: UseOpportunitiesOptions = {}) {
  return useQuery<Opportunity[]>({
    queryKey: ['opportunities', options],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();

      if (options.type) {
        params.append('type', options.type);
      }

      if (options.minConfidence !== undefined) {
        params.append('minConfidence', options.minConfidence.toString());
      }

      if (options.maxConfidence !== undefined) {
        params.append('maxConfidence', options.maxConfidence.toString());
      }

      if (options.strategy) {
        params.append('strategy', options.strategy);
      }

      if (options.sortBy) {
        params.append('sortBy', options.sortBy);
      }

      if (options.sortOrder) {
        params.append('sortOrder', options.sortOrder);
      }

      if (options.limit) {
        params.append('limit', options.limit.toString());
      }

      if (options.page) {
        params.append('page', options.page.toString());
      }

      // Build URL
      const url = `/api/opportunities${params.toString() ? `?${params}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }

      const data: OpportunitiesResponse = await response.json();
      return data.opportunities;
    },
  });
}
