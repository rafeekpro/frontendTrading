/**
 * useTrades Hook
 * Fetches trades list (optionally filtered by instrument ID)
 */

import { useQuery } from '@tanstack/react-query';
import type { Trade } from '../../types/trading';

/**
 * Response type from trades API
 */
interface TradesResponse {
  trades: Trade[];
  total: number;
}

/**
 * Fetches trades list, optionally filtered by instrument ID
 *
 * @param instrumentId - Optional instrument ID to filter trades
 * @returns UseQueryResult with trades list
 *
 * @example
 * ```tsx
 * // Fetch all trades
 * function AllTrades() {
 *   const { data: trades, isLoading } = useTrades();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <ul>{trades.map(trade => <li key={trade.id}>{trade.id}</li>)}</ul>;
 * }
 *
 * // Fetch trades for specific instrument
 * function InstrumentTrades({ instrumentId }: { instrumentId: string }) {
 *   const { data: trades } = useTrades(instrumentId);
 *
 *   return <div>{trades?.length || 0} trades</div>;
 * }
 * ```
 */
export function useTrades(instrumentId?: string) {
  return useQuery<Trade[]>({
    queryKey: ['trades', instrumentId],
    queryFn: async () => {
      const url = instrumentId
        ? `/api/trades?instrumentId=${instrumentId}`
        : '/api/trades';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch trades');
      }

      const data: TradesResponse = await response.json();
      return data.trades;
    },
  });
}
