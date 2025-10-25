/**
 * InstrumentCard Component
 * Displays trading instrument information with Squaber-style design
 */

import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { Instrument } from '../types/trading';
import {
  getChartColor,
  getTextColorClass,
  formatPercentage,
  formatPrice,
} from '../lib/chart-utils';

interface SparklineDataPoint {
  timestamp: number;
  close: number;
}

export interface InstrumentCardProps {
  instrument: Instrument;
  currentPrice: number;
  change24h: number;
  sparklineData: SparklineDataPoint[];
  onNavigate: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

/**
 * InstrumentCard - Displays instrument data with sparkline chart
 *
 * Features:
 * - Glassmorphism design with dark theme
 * - Mini sparkline chart showing 24h price movement
 * - Color-coded change percentage (green/red)
 * - Favorite toggle with star icon
 * - Click to navigate to instrument detail page
 * - Hover animation effect
 */
export function InstrumentCard({
  instrument,
  currentPrice,
  change24h,
  sparklineData,
  onNavigate,
  onToggleFavorite,
  isFavorite = false,
}: InstrumentCardProps) {
  const isPositiveChange = change24h > 0;
  const isNegativeChange = change24h < 0;

  const handleCardClick = () => {
    onNavigate(instrument.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation when clicking favorite
    onToggleFavorite?.(instrument.id);
  };

  return (
    <div className="relative">
      {/* Main Card - clickable for navigation */}
      <button
        onClick={handleCardClick}
        aria-label={`View details for ${instrument.symbol}`}
        className="
          w-full text-left
          bg-gray-800 bg-opacity-50 backdrop-blur-md
          rounded-lg p-6
          hover:scale-105 transition-all duration-200
          border border-gray-700 hover:border-gray-600
          cursor-pointer
        "
      >
        {/* Symbol and Name */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white">{instrument.symbol}</h3>
          <p className="text-sm text-gray-400">{instrument.name}</p>
        </div>

        {/* Current Price */}
        <div className="mb-2">
          <p className="text-2xl font-semibold text-white">
            {formatPrice(currentPrice, instrument.precision)}
          </p>
        </div>

        {/* 24h Change with Icon */}
        <div className="flex items-center gap-2 mb-4">
          {isPositiveChange && (
            <TrendingUp
              size={16}
              className="text-green-500"
              data-testid="trending-up-icon"
            />
          )}
          {isNegativeChange && (
            <TrendingDown
              size={16}
              className="text-red-500"
              data-testid="trending-down-icon"
            />
          )}
          <span className={`text-sm font-medium ${getTextColorClass(change24h)}`}>
            {formatPercentage(change24h)}
          </span>
        </div>

        {/* Sparkline Chart */}
        <div className="h-16" data-testid="sparkline-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="close"
                stroke={getChartColor(change24h)}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </button>

      {/* Favorite Button - positioned absolutely in top-right */}
      <button
        onClick={handleFavoriteClick}
        aria-label={
          isFavorite
            ? `Remove ${instrument.symbol} from favorites`
            : `Add ${instrument.symbol} to favorites`
        }
        className="
          absolute top-4 right-4
          p-2 rounded-full
          bg-gray-900 bg-opacity-50 backdrop-blur-sm
          hover:bg-opacity-70 transition-all
          border border-gray-700 hover:border-yellow-500
        "
      >
        {isFavorite ? (
          <Star
            size={18}
            className="text-yellow-400 fill-yellow-400"
            data-testid="star-filled-icon"
          />
        ) : (
          <Star
            size={18}
            className="text-gray-400 hover:text-yellow-400"
            data-testid="star-empty-icon"
          />
        )}
      </button>
    </div>
  );
}
