/**
 * useInstrument Hook
 * Fetches single instrument by ID
 */

import { useQuery } from '@tanstack/react-query';
import type { Instrument, InstrumentResponse } from '../../types/trading';

/**
 * Fetches a single instrument by ID
 *
 * @param id - Instrument ID (e.g., "EUR_USD")
 * @returns UseQueryResult with instrument data
 *
 * @example
 * ```tsx
 * function InstrumentDetails({ id }: { id: string }) {
 *   const { data: instrument, isLoading } = useInstrument(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!instrument) return <div>Not found</div>;
 *
 *   return <div>{instrument.name}: {instrument.symbol}</div>;
 * }
 * ```
 */
export function useInstrument(id: string) {
  return useQuery<Instrument>({
    queryKey: ['instruments', id],
    queryFn: async () => {
      const response = await fetch(`/api/instruments/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch instrument: ${id}`);
      }

      const data: InstrumentResponse = await response.json();
      return data.instrument;
    },
    enabled: !!id, // Only fetch when ID is provided
  });
}
