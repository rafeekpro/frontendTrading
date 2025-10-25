/**
 * Paper Trading Store
 * Manages paper trading balance, positions, and trade history
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PaperTradingStore,
  Trade,
  Position,
  TradeDirection,
} from '../types/stores';
import type { Instrument } from '../types/trading';

const INITIAL_BALANCE = 10000;

/**
 * Paper Trading Zustand Store
 * Persists to localStorage for state preservation across sessions
 */
export const usePaperTradingStore = create<PaperTradingStore>()(
  persist(
    (set, get) => ({
      balance: INITIAL_BALANCE,
      initialBalance: INITIAL_BALANCE,
      trades: [],
      positions: [],

      executeTrade: (
        instrument: Instrument,
        direction: TradeDirection,
        quantity: number,
        executionPrice: number
      ): Trade | null => {
        const state = get();

        // Calculate trade cost including spread
        const spreadCost = instrument.spread * quantity;
        const baseCost = quantity * executionPrice;
        const totalCost = baseCost + spreadCost;

        // Check if sufficient balance
        if (totalCost > state.balance) {
          return null; // Insufficient funds
        }

        // Generate unique trade ID
        const tradeId = `trade-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}`;

        // Create trade record
        const trade: Trade = {
          id: tradeId,
          instrument_id: instrument.id,
          instrument,
          direction,
          quantity,
          entry_price: executionPrice,
          executed_at: new Date().toISOString(),
          status: 'executed',
          cost: totalCost,
        };

        // Create position
        const position: Position = {
          id: `pos-${tradeId}`,
          trade_id: tradeId,
          instrument_id: instrument.id,
          instrument,
          direction,
          quantity,
          entry_price: executionPrice,
          current_price: executionPrice,
          pnl: 0,
          pnl_percentage: 0,
          opened_at: new Date().toISOString(),
        };

        // Update state
        set({
          balance: state.balance - totalCost,
          trades: [...state.trades, trade],
          positions: [...state.positions, position],
        });

        return trade;
      },

      closePosition: (positionId: string, closingPrice: number): boolean => {
        const state = get();
        const position = state.positions.find((p) => p.id === positionId);

        if (!position) {
          return false; // Position not found
        }

        // Calculate P&L
        const priceDiff =
          position.direction === 'buy'
            ? closingPrice - position.entry_price
            : position.entry_price - closingPrice;

        const pnl = priceDiff * position.quantity;

        // Find the original trade to get the principal (quantity * entry price)
        const principal = position.quantity * position.entry_price;

        // Update balance: return principal + P&L
        // (we don't add back the spread cost since that was the trading fee)
        const newBalance = state.balance + principal + pnl;

        // Create closing trade record
        const closingTrade: Trade = {
          id: `trade-close-${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}`,
          instrument_id: position.instrument_id,
          instrument: position.instrument,
          direction: position.direction === 'buy' ? 'sell' : 'buy', // Opposite direction
          quantity: position.quantity,
          entry_price: closingPrice,
          executed_at: new Date().toISOString(),
          status: 'closed',
          cost: position.quantity * closingPrice,
        };

        // Remove position and update state
        set({
          balance: newBalance,
          trades: [...state.trades, closingTrade],
          positions: state.positions.filter((p) => p.id !== positionId),
        });

        return true;
      },

      getPosition: (instrumentId: string): Position | undefined => {
        const state = get();
        return state.positions.find((p) => p.instrument_id === instrumentId);
      },

      updatePositionPrice: (
        instrumentId: string,
        currentPrice: number
      ): void => {
        const state = get();
        const updatedPositions = state.positions.map((position) => {
          if (position.instrument_id === instrumentId) {
            // Calculate P&L
            const priceDiff =
              position.direction === 'buy'
                ? currentPrice - position.entry_price
                : position.entry_price - currentPrice;

            const pnl = priceDiff * position.quantity;
            const pnlPercentage = (priceDiff / position.entry_price) * 100;

            return {
              ...position,
              current_price: currentPrice,
              pnl,
              pnl_percentage: pnlPercentage,
            };
          }
          return position;
        });

        set({ positions: updatedPositions });
      },

      getTotalPnL: (): number => {
        const state = get();
        return state.positions.reduce((total, position) => total + position.pnl, 0);
      },

      reset: (): void => {
        set({
          balance: INITIAL_BALANCE,
          initialBalance: INITIAL_BALANCE,
          trades: [],
          positions: [],
        });
      },
    }),
    {
      name: 'paper-trading-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
