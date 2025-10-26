/**
 * Results & Analytics Page
 * Displays trading performance metrics, P&L analysis, and charts
 */

import { useTradingResults, usePerformanceMetrics } from '../hooks/queries/use-results';

export default function Results() {
  const { data: tradingResults, isLoading: isLoadingResults } = useTradingResults();
  const { data: performanceData, isLoading: isLoadingPerformance } = usePerformanceMetrics();

  if (isLoadingResults || isLoadingPerformance) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Results & Analytics</h1>
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Results & Analytics</h1>

      {/* Trading Results Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Trades"
          value={tradingResults?.total_trades?.toString() || '0'}
        />
        <MetricCard
          label="Total P&L"
          value={`$${tradingResults?.total_pnl?.toFixed(2) || '0.00'}`}
          positive={tradingResults ? tradingResults.total_pnl > 0 : undefined}
        />
        <MetricCard
          label="Win Rate"
          value={`${tradingResults?.win_rate?.toFixed(1) || '0.0'}%`}
        />
        <MetricCard
          label="Profit Factor"
          value={tradingResults?.profit_factor?.toFixed(2) || '0.00'}
        />
      </div>

      {/* Performance Metrics */}
      <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Sharpe Ratio"
          value={performanceData?.metrics?.sharpe_ratio?.toFixed(2) || '0.00'}
        />
        <MetricCard
          label="Max Drawdown"
          value={`${performanceData?.metrics?.max_drawdown?.toFixed(2) || '0.00'}%`}
        />
        <MetricCard
          label="Avg Win"
          value={`$${performanceData?.metrics?.avg_win?.toFixed(2) || '0.00'}`}
          positive={performanceData ? performanceData.metrics.avg_win > 0 : undefined}
        />
        <MetricCard
          label="Avg Loss"
          value={`$${performanceData?.metrics?.avg_loss?.toFixed(2) || '0.00'}`}
          positive={performanceData ? performanceData.metrics.avg_loss >= 0 : undefined}
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Daily P&L</h3>
          <p className="text-sm text-gray-500">
            {performanceData?.daily_pnl?.length || 0} data points
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Equity Curve</h3>
          <p className="text-sm text-gray-500">
            {performanceData?.equity_curve?.length || 0} data points
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string;
  positive?: boolean;
}

function MetricCard({ label, value, positive }: MetricCardProps) {
  const valueColor = positive === undefined
    ? 'text-gray-900'
    : positive
    ? 'text-green-600'
    : 'text-red-600';

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
