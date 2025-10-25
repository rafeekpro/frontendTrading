/**
 * MSW Handlers for Trading API
 * Mocks trading operations: execute trades, view positions, close positions
 * Integrates with Zustand paper trading store for state management
 */

import { http, HttpResponse, delay } from 'msw';
import { usePaperTradingStore } from '../../stores/paperTrading';
import type { Trade, Position, TradeDirection } from '../../types/stores';
import type { Instrument } from '../../types/trading';

/**
 * Request types for trading operations
 */
interface ExecuteTradeRequest {
  instrument_id: string;
  instrument: Instrument;
  direction: TradeDirection;
  quantity: number;
  price: number;
}

interface ClosePositionRequest {
  closing_price: number;
}

/**
 * Response types
 */
interface TradeExecutionResponse {
  success: boolean;
  trade?: Trade;
  error?: string;
}

interface TradesResponse {
  trades: Trade[];
  total: number;
}

interface PositionsResponse {
  positions: Position[];
  total: number;
}

interface ClosePositionResponse {
  success: boolean;
  error?: string;
}

/**
 * Helper to create error response
 */
function createErrorResponse(status: number, error: string) {
  return HttpResponse.json(
    { success: false, error },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * MSW Request Handlers for Trading Operations
 */
export const tradingHandlers = [
  /**
   * POST /api/trades
   * Execute a trade (buy or sell)
   * Validates balance and creates position via Zustand store
   */
  http.post('*/api/trades', async ({ request }) => {
    // Realistic execution delay: 200-500ms
    await delay(Math.random() * 300 + 200);

    try {
      const body = (await request.json()) as ExecuteTradeRequest;

      // Validate required fields
      if (!body.instrument_id || !body.instrument || !body.direction || !body.quantity || !body.price) {
        return createErrorResponse(400, 'Missing required fields');
      }

      // Execute trade via Zustand store
      const store = usePaperTradingStore.getState();
      const trade = store.executeTrade(
        body.instrument,
        body.direction,
        body.quantity,
        body.price
      );

      // Check if trade execution failed (insufficient balance)
      if (!trade) {
        return createErrorResponse(400, 'Insufficient balance');
      }

      const response: TradeExecutionResponse = {
        success: true,
        trade,
      };

      return HttpResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return createErrorResponse(500, 'Internal server error');
    }
  }),

  /**
   * GET /api/trades
   * Returns trade history from store
   */
  http.get('*/api/trades', async () => {
    // Minimal delay for read operations
    await delay(100);

    const trades = usePaperTradingStore.getState().trades;

    const response: TradesResponse = {
      trades,
      total: trades.length,
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),

  /**
   * GET /api/positions
   * Returns active positions from store
   */
  http.get('*/api/positions', async () => {
    // Minimal delay for read operations
    await delay(100);

    const positions = usePaperTradingStore.getState().positions;

    const response: PositionsResponse = {
      positions,
      total: positions.length,
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),

  /**
   * DELETE /api/positions/:id
   * Close a position at specified price
   * Updates balance with P&L via Zustand store
   */
  http.delete('*/api/positions/:id', async ({ params, request }) => {
    // Realistic delay for position closing: 100-200ms
    await delay(Math.random() * 100 + 100);

    try {
      const { id } = params;

      if (typeof id !== 'string') {
        return createErrorResponse(400, 'Invalid position ID format');
      }

      // Parse closing price from request body
      const body = (await request.json()) as ClosePositionRequest;

      if (!body.closing_price || typeof body.closing_price !== 'number') {
        return createErrorResponse(400, 'Missing or invalid closing_price');
      }

      // Close position via Zustand store
      const store = usePaperTradingStore.getState();
      const success = store.closePosition(id, body.closing_price);

      if (!success) {
        return createErrorResponse(404, 'Position not found');
      }

      const response: ClosePositionResponse = {
        success: true,
      };

      return HttpResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return createErrorResponse(500, 'Internal server error');
    }
  }),
];
