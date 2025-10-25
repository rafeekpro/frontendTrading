/**
 * Trade Generator - Creates realistic historical trade data
 *
 * Generates trade records with:
 * - Realistic P&L distribution (55-60% win rate)
 * - Proper buy/sell split
 * - Sequential timestamps over 90 days
 * - Log-normal position sizes
 * - Mix of open and closed trades
 */

import { SeededRandom } from './seed';
import type { Trade, TradeType, TradeStatus } from '../../types/trading';

/**
 * Generates realistic historical trades with proper P&L distribution
 *
 * @param instrumentIds - Array of instrument IDs to trade
 * @param count - Number of trades to generate
 * @param seed - Optional seed for reproducibility
 * @returns Array of Trade objects
 *
 * @example
 * ```typescript
 * const trades = generateTrades(['EUR_USD', 'GBP_USD'], 1000, 42);
 * // Returns 1000 trades with 55-60% win rate, spread over 90 days
 * ```
 */
export function generateTrades(
  instrumentIds: string[],
  count: number,
  seed?: number,
): Trade[] {
  // Use provided seed or random seed
  const rng = new SeededRandom(seed ?? Math.random() * 1000000);

  const trades: Trade[] = [];
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

  // Calculate average time between trades to spread them over 90 days
  const timeSpan = now - ninetyDaysAgo;
  const avgTimeBetweenTrades = timeSpan / count;

  let currentTime = ninetyDaysAgo;

  for (let i = 0; i < count; i++) {
    // Generate sequential timestamp with some randomness
    const timeVariation = avgTimeBetweenTrades * rng.nextFloat(0.5, 1.5);
    currentTime += timeVariation;

    // Ensure we don't exceed current time
    if (currentTime > now) {
      currentTime = now;
    }

    // Floor the timestamp for reproducibility
    const openedAt = Math.floor(currentTime);

    // Select random instrument
    const instrumentId = rng.choice(instrumentIds);

    // 50/50 buy/sell split
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

    // Determine if trade is open or closed
    // Most recent trades have higher chance of being open
    const ageInDays = (now - openedAt) / (24 * 60 * 60 * 1000);
    const openProbability = Math.max(0, 1 - ageInDays / 7); // Trades in last 7 days might be open
    const status: TradeStatus = rng.next() < openProbability ? 'open' : 'closed';

    const trade: Trade = {
      id: `trade_${i + 1}_${instrumentId}_${openedAt}`,
      instrument_id: instrumentId,
      type,
      quantity: parseFloat(quantity.toFixed(4)),
      entry_price: parseFloat(entryPrice.toFixed(5)),
      opened_at: openedAt,
      status,
    };

    // Add exit details for closed trades
    if (status === 'closed') {
      // Generate exit with realistic P&L distribution
      const exitDetails = generateExitDetails(
        trade,
        entryPrice,
        type,
        quantity,
        openedAt,
        rng,
      );

      trade.exit_price = exitDetails.exitPrice;
      trade.closed_at = exitDetails.closedAt;
      trade.profit_loss = exitDetails.profitLoss;
    }

    trades.push(trade);
  }

  return trades;
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

/**
 * Generates exit details with realistic P&L distribution
 *
 * Target distribution:
 * - Win rate: 55-60%
 * - Avg win: +2-5%
 * - Avg loss: -1-3%
 * - Some outliers: ±10-20%
 */
function generateExitDetails(
  trade: Trade,
  entryPrice: number,
  type: TradeType,
  quantity: number,
  openedAt: number,
  rng: SeededRandom,
): {
  exitPrice: number;
  closedAt: number;
  profitLoss: number;
} {
  // Fixed win probability: 57.5% (middle of 55-60% range)
  const isWin = rng.next() < 0.575;

  // Determine if this is an outlier trade (15% chance for better distribution)
  const isOutlier = rng.next() < 0.15;

  let pnlPercentage: number;

  if (isOutlier) {
    // Outliers: ±10-20%
    const outlierMagnitude = rng.nextFloat(10, 20);
    pnlPercentage = isWin ? outlierMagnitude : -outlierMagnitude;
  } else if (isWin) {
    // Normal wins: +2-5%, narrower range to control average
    pnlPercentage = rng.nextFloat(2, 4.8);
  } else {
    // Normal losses: -1-3%, narrower range to control average
    pnlPercentage = -rng.nextFloat(1, 2.8);
  }

  // Calculate exit price based on trade type and P&L percentage
  let exitPrice: number;

  if (type === 'buy') {
    // For buy: exit_price = entry_price * (1 + pnl%)
    exitPrice = entryPrice * (1 + pnlPercentage / 100);
  } else {
    // For sell: exit_price = entry_price * (1 - pnl%)
    exitPrice = entryPrice * (1 - pnlPercentage / 100);
  }

  // Calculate actual P&L with proper precision
  const exitPriceRounded = parseFloat(exitPrice.toFixed(5));
  const entryPriceRounded = parseFloat(entryPrice.toFixed(5));
  const quantityRounded = parseFloat(quantity.toFixed(4));

  let profitLoss: number;

  if (type === 'buy') {
    profitLoss = (exitPriceRounded - entryPriceRounded) * quantityRounded;
  } else {
    profitLoss = (entryPriceRounded - exitPriceRounded) * quantityRounded;
  }

  // Generate closed timestamp (between opened and now)
  const now = Date.now();
  const holdingTime = rng.nextFloat(0, now - openedAt);
  const closedAt = Math.floor(openedAt + holdingTime);

  return {
    exitPrice: exitPriceRounded,
    closedAt,
    profitLoss: parseFloat(profitLoss.toFixed(2)),
  };
}
