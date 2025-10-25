/**
 * Position Generator - Creates realistic open position data
 *
 * Generates position records with:
 * - Current unrealized P&L based on market prices
 * - Mix of profitable and losing positions
 * - Recent open dates (past 7 days)
 * - Log-normal position sizes
 * - Current prices within ±5% of entry
 */

import { SeededRandom } from './seed';
import type { Position, TradeType } from '../../types/trading';

/**
 * Generates realistic open positions with proper unrealized P&L
 *
 * @param instrumentIds - Array of instrument IDs for positions
 * @param count - Number of positions to generate (10-50)
 * @param seed - Optional seed for reproducibility
 * @returns Array of Position objects
 *
 * @example
 * ```typescript
 * const positions = generatePositions(['EUR_USD', 'GBP_USD'], 30, 42);
 * // Returns 30 open positions with unrealized P&L
 * ```
 */
export function generatePositions(
  instrumentIds: string[],
  count: number,
  seed?: number,
): Position[] {
  // Use provided seed or random seed
  const rng = new SeededRandom(seed ?? Math.random() * 1000000);

  const positions: Position[] = [];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    // Generate timestamp within past 7 days
    const openedAt = Math.floor(rng.nextFloat(sevenDaysAgo, now));

    // Select random instrument
    const instrumentId = rng.choice(instrumentIds);

    // Buy/sell type (can be unbalanced, so use random distribution)
    const type: TradeType = rng.next() < 0.5 ? 'buy' : 'sell';

    // Log-normal distribution for position sizes (0.01 to 10)
    // Use Box-Muller transform for log-normal distribution
    const u1 = rng.next();
    const u2 = rng.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const logNormalValue = Math.exp(z0 * 0.8 - 1); // mu=-1, sigma=0.8
    const quantity = Math.max(0.01, Math.min(10, logNormalValue));

    // Realistic entry prices based on instrument type
    const entryPrice = generateEntryPrice(instrumentId, rng);

    // Current price within ±5% of entry
    const priceChangePercent = rng.nextFloat(-5, 5);
    const currentPrice = entryPrice * (1 + priceChangePercent / 100);

    // Round values for precision
    const quantityRounded = parseFloat(quantity.toFixed(4));
    const entryPriceRounded = parseFloat(entryPrice.toFixed(5));
    const currentPriceRounded = parseFloat(currentPrice.toFixed(5));

    // Calculate unrealized P&L using rounded values
    let unrealizedPnL: number;

    if (type === 'buy') {
      // For buy positions: (current_price - entry_price) * quantity
      unrealizedPnL =
        (currentPriceRounded - entryPriceRounded) * quantityRounded;
    } else {
      // For sell positions: (entry_price - current_price) * quantity
      unrealizedPnL =
        (entryPriceRounded - currentPriceRounded) * quantityRounded;
    }

    const position: Position = {
      id: `position_${i + 1}_${instrumentId}_${openedAt}`,
      instrument_id: instrumentId,
      type,
      quantity: quantityRounded,
      entry_price: entryPriceRounded,
      current_price: currentPriceRounded,
      unrealized_pnl: parseFloat(unrealizedPnL.toFixed(2)),
      opened_at: openedAt,
    };

    positions.push(position);
  }

  return positions;
}

/**
 * Generates realistic entry price based on instrument
 */
function generateEntryPrice(instrumentId: string, rng: SeededRandom): number {
  // Different price ranges for different instrument types
  if (instrumentId.includes('BTC')) {
    // Bitcoin: $30k-$50k range
    return rng.nextFloat(30000, 50000);
  } else if (instrumentId.includes('ETH')) {
    // Ethereum: $1.5k-$3k range
    return rng.nextFloat(1500, 3000);
  } else if (instrumentId.endsWith('_USD')) {
    // Forex pairs: 0.8-2.0 range
    return rng.nextFloat(0.8, 2.0);
  } else if (instrumentId.endsWith('_JPY')) {
    // JPY pairs: 100-150 range
    return rng.nextFloat(100, 150);
  } else {
    // Stocks/other: $50-$500 range
    return rng.nextFloat(50, 500);
  }
}
