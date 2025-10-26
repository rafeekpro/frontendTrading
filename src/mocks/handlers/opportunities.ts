/**
 * MSW Handlers for Opportunities API
 * Mocks opportunities detection endpoints with filtering, sorting, and pagination
 */

import { http, HttpResponse } from 'msw';
import { generateOpportunities } from '../generators/opportunities';
import { generateInstruments } from '../generators/instruments';
import type {
  Opportunity,
  OpportunitiesResponse,
  OpportunityResponse,
  ErrorResponse,
} from '../../types/trading';

/**
 * Generate mock opportunities data using instruments
 */
const instruments = generateInstruments(60, 42);
const instrumentIds = instruments.map(i => i.id);

const MOCK_OPPORTUNITIES = generateOpportunities(instrumentIds, 50, 42);

/**
 * Helper to create error response
 */
function createErrorResponse(status: number, error: string, message: string) {
  const errorBody: ErrorResponse = {
    error,
    message,
    status,
  };

  return HttpResponse.json(errorBody, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Filter opportunities based on query parameters
 */
function filterOpportunities(
  opportunities: Opportunity[],
  params: URLSearchParams
): Opportunity[] {
  let filtered = [...opportunities];

  // Filter by type
  const type = params.get('type');
  if (type === 'buy' || type === 'sell') {
    filtered = filtered.filter(opp => opp.type === type);
  }

  // Filter by minimum confidence
  const minConfidence = params.get('minConfidence');
  if (minConfidence) {
    const min = parseFloat(minConfidence);
    if (!isNaN(min)) {
      filtered = filtered.filter(opp => opp.confidence >= min);
    }
  }

  // Filter by maximum confidence
  const maxConfidence = params.get('maxConfidence');
  if (maxConfidence) {
    const max = parseFloat(maxConfidence);
    if (!isNaN(max)) {
      filtered = filtered.filter(opp => opp.confidence <= max);
    }
  }

  // Filter by strategy
  const strategy = params.get('strategy');
  if (strategy) {
    filtered = filtered.filter(opp => opp.strategy === strategy);
  }

  return filtered;
}

/**
 * Sort opportunities based on query parameters
 */
function sortOpportunities(
  opportunities: Opportunity[],
  params: URLSearchParams
): Opportunity[] {
  const sortBy = params.get('sortBy');
  const sortOrder = params.get('sortOrder') || 'desc';

  if (!sortBy) {
    return opportunities;
  }

  const sorted = [...opportunities];

  if (sortBy === 'confidence') {
    sorted.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.confidence - a.confidence
        : a.confidence - b.confidence;
    });
  } else if (sortBy === 'date') {
    sorted.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.detected_at - a.detected_at
        : a.detected_at - b.detected_at;
    });
  }

  return sorted;
}

/**
 * Apply pagination to opportunities
 */
function paginateOpportunities(
  opportunities: Opportunity[],
  params: URLSearchParams
): Opportunity[] {
  const limit = params.get('limit');
  const page = params.get('page') || '1';

  if (!limit) {
    return opportunities;
  }

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);

  if (isNaN(limitNum) || isNaN(pageNum)) {
    return opportunities;
  }

  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;

  return opportunities.slice(start, end);
}

/**
 * MSW Request Handlers
 */
export const opportunitiesHandlers = [
  /**
   * GET /api/opportunities/:id
   * Returns single opportunity by ID
   * MUST come before /api/opportunities to avoid matching
   */
  http.get('*/api/opportunities/:id', ({ params }) => {
    const { id } = params;

    if (typeof id !== 'string') {
      return createErrorResponse(
        400,
        'BAD_REQUEST',
        'Invalid opportunity ID format'
      );
    }

    const opportunity = MOCK_OPPORTUNITIES.find(opp => opp.id === id);

    if (!opportunity) {
      return createErrorResponse(
        404,
        'NOT_FOUND',
        `Opportunity with ID "${id}" not found`
      );
    }

    const response: OpportunityResponse = {
      opportunity,
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
   * GET /api/opportunities
   * Returns list of opportunities with filtering, sorting, and pagination
   */
  http.get('*/api/opportunities', ({ request }) => {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Apply filters
    let opportunities = filterOpportunities(MOCK_OPPORTUNITIES, params);

    // Apply sorting
    opportunities = sortOpportunities(opportunities, params);

    // Apply pagination
    opportunities = paginateOpportunities(opportunities, params);

    const response: OpportunitiesResponse = {
      opportunities,
    };

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),
];
