/**
 * useInstruments Hook
 * Fetches list of all available trading instruments
 */

import { useQuery } from '@tanstack/react-query';
import type { Instrument, InstrumentsResponse } from '../../types/trading';

/**
 * Fetches all available trading instruments
 *
 * @returns UseQueryResult with instruments list
 *
 * @example
 * ```tsx
 * function InstrumentList() {
 *   const { data: instruments, isLoading } = useInstruments();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {instruments.map(instrument => (
 *         <li key={instrument.id}>{instrument.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useInstruments() {
  return useQuery<Instrument[]>({
    queryKey: ['instruments'],
    queryFn: async () => {
      const response = await fetch('/api/instruments');

      if (!response.ok) {
        throw new Error('Failed to fetch instruments');
      }

      const data: InstrumentsResponse = await response.json();
      return data.instruments;
    },
  });
}
