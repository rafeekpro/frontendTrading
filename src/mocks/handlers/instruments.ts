/**
 * MSW Handlers for Instruments API
 * Mocks instrument listing, details, and candlestick data endpoints
 */

import { http, HttpResponse } from 'msw';
import type {
  Instrument,
  Candlestick,
  Timeframe,
  InstrumentsResponse,
  InstrumentResponse,
  CandlesticksResponse,
  ErrorResponse
} from '../../types/trading';

/**
 * Placeholder instruments data
 * TODO: Replace with data from Stream B (mock data generators)
 */
const PLACEHOLDER_INSTRUMENTS: Instrument[] = [
  {
    id: 'EUR_USD',
    name: 'Euro / US Dollar',
    symbol: 'EUR/USD',
    type: 'forex',
    spread: 0.00015,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5
  },
  {
    id: 'GBP_USD',
    name: 'British Pound / US Dollar',
    symbol: 'GBP/USD',
    type: 'forex',
    spread: 0.00018,
    pip_value: 0.0001,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 5
  },
  {
    id: 'USD_JPY',
    name: 'US Dollar / Japanese Yen',
    symbol: 'USD/JPY',
    type: 'forex',
    spread: 0.015,
    pip_value: 0.01,
    min_trade_size: 0.01,
    max_trade_size: 100,
    precision: 3
  }
];

/**
 * Valid timeframes for validation
 */
const VALID_TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

/**
 * Generate placeholder candlestick data
 * TODO: Replace with sophisticated generator from Stream B
 */
function generatePlaceholderCandlesticks(
  _instrumentId: string,
  _timeframe: Timeframe,
  count: number = 100
): Candlestick[] {
  const candlesticks: Candlestick[] = [];
  const now = Date.now();
  const basePrice = 1.0850; // Placeholder base price

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 60000; // 1 minute intervals
    const open = basePrice + (Math.random() - 0.5) * 0.01;
    const close = open + (Math.random() - 0.5) * 0.005;
    const high = Math.max(open, close) + Math.random() * 0.003;
    const low = Math.min(open, close) - Math.random() * 0.003;
    const volume = Math.floor(Math.random() * 10000) + 1000;

    candlesticks.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });
  }

  return candlesticks;
}

/**
 * Helper to find instrument by ID
 */
function findInstrument(id: string): Instrument | undefined {
  return PLACEHOLDER_INSTRUMENTS.find(instrument => instrument.id === id);
}

/**
 * Helper to create error response
 */
function createErrorResponse(status: number, error: string, message: string) {
  const errorBody: ErrorResponse = {
    error,
    message,
    status
  };

  return HttpResponse.json(errorBody, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * MSW Request Handlers
 * Order matters: more specific routes MUST come before less specific ones
 */
export const instrumentsHandlers = [
  /**
   * GET /api/instruments/:id/candlesticks
   * Returns candlestick data for specified instrument and timeframe
   * MUST come before /api/instruments/:id to avoid matching
   */
  http.get('*/api/instruments/:id/candlesticks', ({ params, request }) => {
    const { id } = params;

    if (typeof id !== 'string') {
      return createErrorResponse(400, 'BAD_REQUEST', 'Invalid instrument ID format');
    }

    // Validate instrument exists
    const instrument = findInstrument(id);
    if (!instrument) {
      return createErrorResponse(404, 'NOT_FOUND', `Instrument with ID "${id}" not found`);
    }

    // Parse and validate timeframe parameter
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe');

    if (!timeframe) {
      return createErrorResponse(
        400,
        'BAD_REQUEST',
        'Missing required parameter: timeframe. Valid values: M1, M5, M15, M30, H1, H4, D1'
      );
    }

    if (!VALID_TIMEFRAMES.includes(timeframe as Timeframe)) {
      return createErrorResponse(
        400,
        'BAD_REQUEST',
        `Invalid timeframe: "${timeframe}". Valid values: ${VALID_TIMEFRAMES.join(', ')}`
      );
    }

    // Generate placeholder candlestick data
    const candlesticks = generatePlaceholderCandlesticks(id, timeframe as Timeframe);

    const response: CandlesticksResponse = {
      candlesticks,
      instrument_id: id,
      timeframe: timeframe as Timeframe
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }),

  /**
   * GET /api/instruments/:id
   * Returns single instrument by ID
   */
  http.get('*/api/instruments/:id', ({ params }) => {
    const { id } = params;

    if (typeof id !== 'string') {
      return createErrorResponse(400, 'BAD_REQUEST', 'Invalid instrument ID format');
    }

    const instrument = findInstrument(id);

    if (!instrument) {
      return createErrorResponse(404, 'NOT_FOUND', `Instrument with ID "${id}" not found`);
    }

    const response: InstrumentResponse = {
      instrument
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }),

  /**
   * GET /api/instruments
   * Returns list of all available instruments
   */
  http.get('*/api/instruments', () => {
    const response: InstrumentsResponse = {
      instruments: PLACEHOLDER_INSTRUMENTS
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  })
];
