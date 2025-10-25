/**
 * useMarketData Hook
 * Fetches real-time candlestick market data with auto-refresh
 */

import { useQuery } from '@tanstack/react-query';
import type {
  Candlestick,
  Timeframe,
  CandlesticksResponse,
} from '../../types/trading';

/**
 * Fetches real-time candlestick market data for a specific instrument and timeframe
 *
 * Features:
 * - Auto-refreshes every 5 seconds for real-time feel
 * - Disabled when no instrumentId provided
 * - Defaults to H1 (1-hour) timeframe
 *
 * @param instrumentId - Instrument ID (e.g., "EUR_USD")
 * @param timeframe - Candlestick timeframe (default: 'H1')
 * @returns UseQueryResult with candlestick array
 *
 * @example
 * ```tsx
 * // Default timeframe (H1)
 * function Chart({ instrumentId }: { instrumentId: string }) {
 *   const { data: candles, isLoading } = useMarketData(instrumentId);
 *
 *   if (isLoading) return <div>Loading chart...</div>;
 *
 *   return <CandlestickChart data={candles} />;
 * }
 *
 * // Custom timeframe
 * function MultiTimeframeChart({ instrumentId }: { instrumentId: string }) {
 *   const { data: m5 } = useMarketData(instrumentId, 'M5');
 *   const { data: h1 } = useMarketData(instrumentId, 'H1');
 *   const { data: d1 } = useMarketData(instrumentId, 'D1');
 *
 *   return (
 *     <div>
 *       <CandlestickChart data={m5} title="5 Minutes" />
 *       <CandlestickChart data={h1} title="1 Hour" />
 *       <CandlestickChart data={d1} title="Daily" />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMarketData(
  instrumentId: string,
  timeframe: Timeframe = 'H1'
) {
  return useQuery<Candlestick[]>({
    queryKey: ['market-data', instrumentId, timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/instruments/${instrumentId}/candlesticks?timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch market data for ${instrumentId}`);
      }

      const data: CandlesticksResponse = await response.json();
      return data.candlesticks;
    },
    enabled: !!instrumentId, // Only fetch when instrumentId is provided
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}
