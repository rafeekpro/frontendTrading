/**
 * OrderBook Component
 * Displays bid and ask depth with visualization
 */

import type { OrderBookEntry } from '../../types/trading';
import { formatPrice, formatVolume } from '../../lib/format-utils';

interface OrderBookProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
}

/**
 * Calculate maximum total volume for depth bar scaling
 */
function calculateMaxTotal(bids: OrderBookEntry[], asks: OrderBookEntry[]): number {
  return Math.max(
    ...bids.map((b) => b.total),
    ...asks.map((a) => a.total),
    1 // Prevent division by zero
  );
}

/**
 * Calculate depth bar width as percentage
 */
function getDepthWidth(total: number, maxTotal: number): string {
  return `${(total / maxTotal) * 100}%`;
}

export function OrderBook({ bids, asks, spread }: OrderBookProps) {
  const maxTotal = calculateMaxTotal(bids, asks);

  return (
    <div className="w-full overflow-auto" data-testid="orderbook-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Order Book</h3>
        <div className="text-sm text-gray-400">
          Spread: {spread.toFixed(4)}
        </div>
      </div>

      {/* Single table with both sections */}
      <table className="w-full text-sm" role="table">
        <thead>
          <tr>
            <th className="text-left text-gray-400 font-normal" role="columnheader">
              Price
            </th>
            <th className="text-right text-gray-400 font-normal" role="columnheader">
              Volume
            </th>
            <th className="text-right text-gray-400 font-normal" role="columnheader">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Asks Section */}
          <tr>
            <td colSpan={3}>
              <div aria-label="Ask orders" className="my-2">
                <h4 className="text-sm font-medium text-red-500 mb-2">Ask</h4>
              </div>
            </td>
          </tr>
          {asks.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 py-4">
                No asks available
              </td>
            </tr>
          ) : (
            asks.slice(0, 10).map((ask, index) => (
              <tr
                key={`ask-${ask.price}-${index}`}
                data-testid={`ask-row-${index}`}
                className={`relative text-red-400 ${index === 0 ? 'font-bold' : ''}`}
              >
                <td className="relative z-10 py-1">
                  <div
                    data-testid={`depth-bar-ask-${index}`}
                    className="absolute inset-0 bg-red-500 bg-opacity-10"
                    style={{ width: getDepthWidth(ask.total, maxTotal) }}
                  />
                  <span className="relative">{formatPrice(ask.price)}</span>
                </td>
                <td className="relative z-10 text-right py-1">
                  {formatVolume(ask.volume)}
                </td>
                <td className="relative z-10 text-right py-1">
                  {formatVolume(ask.total)}
                </td>
              </tr>
            ))
          )}

          {/* Bids Section */}
          <tr>
            <td colSpan={3}>
              <div aria-label="Bid orders" className="my-2">
                <h4 className="text-sm font-medium text-green-500 mb-2">Bid</h4>
              </div>
            </td>
          </tr>
          {bids.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 py-4">
                No bids available
              </td>
            </tr>
          ) : (
            bids.slice(0, 10).map((bid, index) => (
              <tr
                key={`bid-${bid.price}-${index}`}
                data-testid={`bid-row-${index}`}
                className={`relative text-green-400 ${index === 0 ? 'font-bold' : ''}`}
              >
                <td className="relative z-10 py-1">
                  <div
                    data-testid={`depth-bar-bid-${index}`}
                    className="absolute inset-0 bg-green-500 bg-opacity-10"
                    style={{ width: getDepthWidth(bid.total, maxTotal) }}
                  />
                  <span className="relative">{formatPrice(bid.price)}</span>
                </td>
                <td className="relative z-10 text-right py-1">
                  {formatVolume(bid.volume)}
                </td>
                <td className="relative z-10 text-right py-1">
                  {formatVolume(bid.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
