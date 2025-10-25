/**
 * Test Utilities for Store Testing
 * Provides helper functions for creating mock data and clearing storage
 */

import type { Trade, Position } from '../../types/stores';
import type { Instrument } from '../../types/trading';

/**
 * Clear all localStorage between tests
 * Essential for test isolation
 */
export const clearStoreStorage = (): void => {
  localStorage.clear();
};

/**
 * Create a mock instrument for testing
 * @param overrides - Partial instrument properties to override defaults
 */
export const createMockInstrument = (
  overrides?: Partial<Instrument>
): Instrument => ({
  id: 'EUR_USD',
  name: 'Euro / US Dollar',
  symbol: 'EUR/USD',
  type: 'forex',
  spread: 0.00015,
  pip_value: 0.0001,
  min_trade_size: 0.01,
  max_trade_size: 100,
  precision: 5,
  ...overrides,
});

/**
 * Create a mock trade for testing
 * @param overrides - Partial trade properties to override defaults
 */
export const createMockTrade = (overrides?: Partial<Trade>): Trade => ({
  id: `trade-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  instrument_id: 'EUR_USD',
  instrument: createMockInstrument(),
  direction: 'buy',
  quantity: 1.0,
  entry_price: 1.085,
  executed_at: new Date().toISOString(),
  status: 'executed',
  cost: 1.08515, // Base cost + spread
  ...overrides,
});

/**
 * Create a mock position for testing
 * @param overrides - Partial position properties to override defaults
 */
export const createMockPosition = (overrides?: Partial<Position>): Position => {
  const baseId = `trade-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  return {
    id: `pos-${baseId}`,
    trade_id: baseId,
    instrument_id: 'EUR_USD',
    instrument: createMockInstrument(),
    direction: 'buy',
    quantity: 1.0,
    entry_price: 1.085,
    current_price: 1.090,
    pnl: 0.005, // (1.090 - 1.085) * 1.0
    pnl_percentage: 0.46, // ((1.090 - 1.085) / 1.085) * 100 ≈ 0.46%
    opened_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Wait for async state updates in tests
 * Useful when testing Zustand stores with async operations
 */
export const waitForStateUpdate = (ms = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
