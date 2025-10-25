/**
 * Opportunity Generator - Creates realistic trading signal data
 *
 * Generates opportunity records with:
 * - Multiple trading strategies
 * - Confidence levels (0.60-0.95)
 * - Realistic risk/reward ratios (1:2 or better)
 * - Entry to target: +2-5%
 * - Entry to stop loss: -1-2%
 * - Recent detection timestamps (past 24 hours)
 */

import { SeededRandom } from './seed';
import type { Opportunity, TradeType } from '../../types/trading';

/**
 * Available trading strategies
 */
const STRATEGIES = [
  'breakout',
  'reversal',
  'trend_following',
  'mean_reversion',
] as const;

/**
 * Generates realistic trading opportunities with proper risk/reward
 *
 * @param instrumentIds - Array of instrument IDs for opportunities
 * @param count - Number of opportunities to generate (20-100)
 * @param seed - Optional seed for reproducibility
 * @returns Array of Opportunity objects
 *
 * @example
 * ```typescript
 * const opportunities = generateOpportunities(['EUR_USD', 'GBP_USD'], 50, 42);
 * // Returns 50 trading opportunities with multiple strategies
 * ```
 */
export function generateOpportunities(
  instrumentIds: string[],
  count: number,
  seed?: number,
): Opportunity[] {
  // Use provided seed or random seed
  const rng = new SeededRandom(seed ?? Math.random() * 1000000);

  const opportunities: Opportunity[] = [];
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    // Generate timestamp within past 24 hours
    const detectedAt = Math.floor(rng.nextFloat(oneDayAgo, now));

    // Select random instrument
    const instrumentId = rng.choice(instrumentIds);

    // Select random strategy
    const strategy = rng.choice([...STRATEGIES]);

    // Buy/sell type
    const type: TradeType = rng.next() < 0.5 ? 'buy' : 'sell';

    // Confidence level: 0.60 to 0.95
    const confidence = parseFloat(rng.nextFloat(0.6, 0.95).toFixed(2));

    // Realistic entry price based on instrument type
    const entryPrice = generateEntryPrice(instrumentId, rng);

    // Target distance: +2-5% from entry
    const targetDistancePercent = rng.nextFloat(2.5, 5);

    // Stop loss distance: -1-2% from entry (keep it smaller for better R:R)
    const stopLossDistancePercent = rng.nextFloat(1, 1.8);

    // Calculate target and stop loss based on trade type
    let targetPrice: number;
    let stopLoss: number;

    if (type === 'buy') {
      // For buy: target above entry, stop below entry
      targetPrice = entryPrice * (1 + targetDistancePercent / 100);
      stopLoss = entryPrice * (1 - stopLossDistancePercent / 100);
    } else {
      // For sell: target below entry, stop above entry
      targetPrice = entryPrice * (1 - targetDistancePercent / 100);
      stopLoss = entryPrice * (1 + stopLossDistancePercent / 100);
    }

    const opportunity: Opportunity = {
      id: `opportunity_${i + 1}_${instrumentId}_${detectedAt}`,
      instrument_id: instrumentId,
      type,
      confidence,
      entry_price: parseFloat(entryPrice.toFixed(5)),
      target_price: parseFloat(targetPrice.toFixed(5)),
      stop_loss: parseFloat(stopLoss.toFixed(5)),
      strategy,
      detected_at: detectedAt,
    };

    opportunities.push(opportunity);
  }

  return opportunities;
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
