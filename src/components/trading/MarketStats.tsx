/**
 * MarketStats Component
 * Displays key market statistics in a card-based layout
 */

import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign } from 'lucide-react';
import type { MarketStats as MarketStatsType } from '../../types/trading';
import { formatPrice, formatNumberWithSuffix } from '../../lib/format-utils';

interface MarketStatsProps {
  stats: MarketStatsType;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  testId: string;
  ariaLabel: string;
}

function StatCard({ label, value, icon, colorClass, testId, ariaLabel }: StatCardProps) {
  return (
    <div
      className="backdrop-blur-md bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700"
      data-testid={`stat-card-${testId}`}
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span data-testid={`icon-${testId}`}>{icon}</span>
      </div>
      <div className={`text-xl font-bold ${colorClass}`} data-testid={`stat-value-${testId}`}>
        {value}
      </div>
    </div>
  );
}

export function MarketStats({ stats }: MarketStatsProps) {
  const { high24h, low24h, volume24h, vwap, openInterest } = stats;

  return (
    <div role="region" aria-label="Market statistics">
      <h3 className="text-lg font-semibold text-white mb-4">Market Stats</h3>

      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        data-testid="market-stats-grid"
      >
        {/* 24h High */}
        <StatCard
          label="24h High"
          value={formatPrice(high24h)}
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          colorClass="text-green-400"
          testId="high"
          ariaLabel="24h High price"
        />

        {/* 24h Low */}
        <StatCard
          label="24h Low"
          value={formatPrice(low24h)}
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          colorClass="text-red-400"
          testId="low"
          ariaLabel="24h Low price"
        />

        {/* 24h Volume */}
        <StatCard
          label="24h Volume"
          value={formatNumberWithSuffix(volume24h)}
          icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
          colorClass="text-gray-200"
          testId="volume"
          ariaLabel="24h Volume"
        />

        {/* VWAP */}
        <StatCard
          label="VWAP"
          value={formatPrice(vwap)}
          icon={<Activity className="w-5 h-5 text-purple-500" />}
          colorClass="text-gray-200"
          testId="vwap"
          ariaLabel="Volume Weighted Average Price"
        />

        {/* Open Interest (optional) */}
        {openInterest !== undefined && (
          <StatCard
            label="Open Interest"
            value={formatNumberWithSuffix(openInterest)}
            icon={<DollarSign className="w-5 h-5 text-yellow-500" />}
            colorClass="text-gray-200"
            testId="oi"
            ariaLabel="Open Interest"
          />
        )}
      </div>
    </div>
  );
}
