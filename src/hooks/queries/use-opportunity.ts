/**
 * useOpportunity Hook
 * Fetches a single trading opportunity by ID
 */

import { useQuery } from '@tanstack/react-query';
import type { Opportunity, OpportunityResponse } from '../../types/trading';

/**
 * Fetches a single opportunity by ID
 *
 * @param id - Opportunity ID (undefined to skip fetching)
 * @returns UseQueryResult with opportunity data
 *
 * @example
 * ```tsx
 * function OpportunityDetail({ opportunityId }: { opportunityId: string }) {
 *   const { data: opportunity, isLoading } = useOpportunity(opportunityId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!opportunity) return <div>Not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{opportunity.strategy}</h1>
 *       <p>Confidence: {opportunity.confidence}</p>
 *       <p>Entry: {opportunity.entry_price}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOpportunity(id: string | undefined) {
  return useQuery<Opportunity>({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Opportunity ID is required');
      }

      const response = await fetch(`/api/opportunities/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch opportunity');
      }

      const data: OpportunityResponse = await response.json();
      return data.opportunity;
    },
    enabled: !!id,
  });
}
