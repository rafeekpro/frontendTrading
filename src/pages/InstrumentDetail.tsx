/**
 * InstrumentDetail Page
 * Comprehensive instrument detail page with charts, stats, and order book
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CandlestickChart, TimeframeSelector } from '@/components/charts';
import { OrderBook, MarketStats } from '@/components/trading';
import { useInstrument, useOHLCVData } from '@/hooks/queries';
import { convertToCandlestickData, convertToVolumeData } from '@/lib/chart-utils';
import type { Timeframe, OrderBook as OrderBookType, MarketStats as MarketStatsType, Candlestick } from '@/types/trading';

/**
 * Calculate market statistics from OHLCV data
 */
function calculateMarketStats(candles: Candlestick[] | undefined): MarketStatsType {
  if (!candles || candles.length === 0) {
    return {
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      vwap: 0,
      timestamp: Date.now(),
    };
  }

  const high24h = Math.max(...candles.map(c => c.high));
  const low24h = Math.min(...candles.map(c => c.low));
  const volume24h = candles.reduce((sum, c) => sum + c.volume, 0);

  // Calculate VWAP (Volume Weighted Average Price)
  const totalPriceVolume = candles.reduce((sum, c) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    return sum + (typicalPrice * c.volume);
  }, 0);
  const vwap = totalPriceVolume / volume24h;

  return {
    high24h,
    low24h,
    volume24h,
    vwap,
    timestamp: Date.now(),
  };
}

/**
 * Generate mock order book data based on current price
 */
function generateMockOrderBook(currentPrice: number, spread: number): OrderBookType {
  const bids = [];
  const asks = [];
  const spreadPips = spread;

  // Generate 10 bid levels (below current price)
  let cumulativeBidVolume = 0;
  for (let i = 0; i < 10; i++) {
    const price = currentPrice - (i + 1) * spreadPips;
    const volume = Math.floor(Math.random() * 500000) + 100000;
    cumulativeBidVolume += volume;

    bids.push({
      price,
      volume,
      total: cumulativeBidVolume,
    });
  }

  // Generate 10 ask levels (above current price)
  let cumulativeAskVolume = 0;
  for (let i = 0; i < 10; i++) {
    const price = currentPrice + (i + 1) * spreadPips;
    const volume = Math.floor(Math.random() * 500000) + 100000;
    cumulativeAskVolume += volume;

    asks.push({
      price,
      volume,
      total: cumulativeAskVolume,
    });
  }

  return {
    bids,
    asks,
    spread: spreadPips,
    timestamp: Date.now(),
  };
}

export function InstrumentDetail() {
  const { id } = useParams<{ id: string }>();
  const [timeframe, setTimeframe] = useState<Timeframe>('H1');

  // Fetch instrument data and OHLCV data
  const { data: instrument, isLoading: instrumentLoading, error: instrumentError } = useInstrument(id!);
  const { data: ohlcvData, isLoading: ohlcvLoading, error: ohlcvError } = useOHLCVData(id!, timeframe);

  // Handle loading state
  if (instrumentLoading || ohlcvLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading instrument data...</div>
      </div>
    );
  }

  // Handle error state
  if (instrumentError || ohlcvError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">
          Error loading instrument data. Please try again.
        </div>
      </div>
    );
  }

  // Handle missing data
  if (!instrument) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Instrument not found</div>
      </div>
    );
  }

  // Transform data for chart
  const candlestickData = ohlcvData ? convertToCandlestickData(ohlcvData) : [];
  const volumeData = ohlcvData ? convertToVolumeData(ohlcvData) : [];

  // Calculate market stats
  const marketStats = calculateMarketStats(ohlcvData);

  // Generate order book data based on latest price
  const currentPrice = ohlcvData?.[ohlcvData.length - 1]?.close || 1.0;
  const orderBookData = generateMockOrderBook(currentPrice, instrument.spread);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {instrument.name}
        </h1>
        <p className="text-gray-400 text-lg">{instrument.symbol}</p>
      </div>

      {/* MarketStats - Top Section */}
      <div className="mb-6" data-testid="market-stats">
        <MarketStats stats={marketStats} />
      </div>

      {/* Main Grid Layout */}
      <div
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        data-testid="instrument-detail-container"
      >
        {/* Chart Section - Takes 3 columns on desktop */}
        <div className="lg:col-span-3">
          {/* Timeframe Selector */}
          <div className="mb-4">
            <TimeframeSelector
              selected={timeframe}
              onChange={setTimeframe}
            />
          </div>

          {/* Candlestick Chart */}
          <div data-testid="candlestick-chart">
            <CandlestickChart
              data={candlestickData}
              volumeData={volumeData}
              timeframe={timeframe}
              loading={ohlcvLoading}
            />
          </div>
        </div>

        {/* OrderBook Sidebar - Takes 1 column on desktop */}
        <div className="lg:col-span-1">
          <div data-testid="order-book">
            <OrderBook
              bids={orderBookData.bids}
              asks={orderBookData.asks}
              spread={orderBookData.spread}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
