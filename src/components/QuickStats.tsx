/**
 * QuickStats Component
 * Displays quick statistics panel with P&L, positions, and alerts
 */

import { TrendingUp, Briefcase, Bell } from 'lucide-react';
import { formatCurrency, getTextColorClass } from '../lib/chart-utils';

export interface QuickStatsProps {
  totalPnL: number;
  openPositions: number;
  activeAlerts: number;
}

/**
 * QuickStats - Displays key trading statistics in card layout
 *
 * Features:
 * - Total P&L with color coding (green/red/gray)
 * - Open positions count
 * - Active alerts count
 * - Responsive grid layout
 * - Glassmorphism design with icons
 */
export function QuickStats({
  totalPnL,
  openPositions,
  activeAlerts,
}: QuickStatsProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total P&L Card */}
      <div
        className="
          bg-gray-800 bg-opacity-50 backdrop-blur-md
          rounded-lg p-6
          border border-gray-700
        "
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Total P&L</p>
            <p className={`text-2xl font-bold ${getTextColorClass(totalPnL)}`}>
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div
            className="
              p-3 rounded-lg
              bg-gray-900 bg-opacity-50
            "
            aria-label="P&L Icon"
          >
            <TrendingUp
              size={24}
              className={getTextColorClass(totalPnL)}
              data-testid="pnl-icon"
            />
          </div>
        </div>
      </div>

      {/* Open Positions Card */}
      <div
        className="
          bg-gray-800 bg-opacity-50 backdrop-blur-md
          rounded-lg p-6
          border border-gray-700
        "
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Open Positions</p>
            <p className="text-2xl font-bold text-white">{openPositions}</p>
          </div>
          <div
            className="
              p-3 rounded-lg
              bg-gray-900 bg-opacity-50
            "
            aria-label="Positions Icon"
          >
            <Briefcase
              size={24}
              className="text-blue-400"
              data-testid="positions-icon"
            />
          </div>
        </div>
      </div>

      {/* Active Alerts Card */}
      <div
        className="
          bg-gray-800 bg-opacity-50 backdrop-blur-md
          rounded-lg p-6
          border border-gray-700
        "
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Active Alerts</p>
            <p className="text-2xl font-bold text-white">{activeAlerts}</p>
          </div>
          <div
            className="
              p-3 rounded-lg
              bg-gray-900 bg-opacity-50
            "
            aria-label="Alerts Icon"
          >
            <Bell
              size={24}
              className="text-yellow-400"
              data-testid="alerts-icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
