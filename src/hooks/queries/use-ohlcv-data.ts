/**
 * useOHLCVData Hook
 * Fetches historical candlestick (OHLCV) data for an instrument
 */

import { useQuery } from '@tanstack/react-query';
import type { Candlestick, CandlesticksResponse, Timeframe } from '../../types/trading';

/**
 * Fetches historical OHLCV data for a specific instrument and timeframe
 *
 * @param instrumentId - Instrument ID (e.g., "EUR_USD")
 * @param timeframe - Chart timeframe (M1, M5, M15, H1, H4, D1)
 * @returns UseQueryResult with array of candlesticks
 *
 * @example
 * ```tsx
 * function CandlestickChart({ instrumentId }: { instrumentId: string }) {
 *   const [timeframe, setTimeframe] = useState<Timeframe>('H1');
 *   const { data: candles, isLoading } = useOHLCVData(instrumentId, timeframe);
 *
 *   if (isLoading) return <div>Loading chart...</div>;
 *   if (!candles) return <div>No data</div>;
 *
 *   return <Chart data={candles} />;
 * }
 * ```
 */
export function useOHLCVData(instrumentId: string, timeframe: Timeframe) {
  return useQuery<Candlestick[]>({
    queryKey: ['ohlcv', instrumentId, timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/instruments/${instrumentId}/candles?timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch OHLCV data for instrument: ${instrumentId}`);
      }

      const data: CandlesticksResponse = await response.json();
      return data.candlesticks;
    },
    enabled: !!instrumentId, // Only fetch when instrumentId is provided
    refetchInterval: 30000, // Auto-refresh every 30 seconds for demo purposes
  });
}
