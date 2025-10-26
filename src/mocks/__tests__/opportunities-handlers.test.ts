/**
 * MSW Handlers Tests for Opportunities API
 *
 * 🔴 RED PHASE - These tests will FAIL until handlers are implemented
 *
 * Tests MSW handlers for opportunities endpoints:
 * - GET /api/opportunities - list with pagination, filtering, sorting
 * - GET /api/opportunities/:id - single opportunity detail
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { opportunitiesHandlers } from '../handlers/opportunities';
import type { OpportunitiesResponse, OpportunityResponse } from '../../types/trading';

// Setup MSW server for testing
const server = setupServer(...opportunitiesHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Opportunities Handlers', () => {
  describe('GET /api/opportunities', () => {
    it('should return list of opportunities', async () => {
      const response = await fetch('/api/opportunities');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data: OpportunitiesResponse = await response.json();

      expect(data).toHaveProperty('opportunities');
      expect(Array.isArray(data.opportunities)).toBe(true);
      expect(data.opportunities.length).toBeGreaterThan(0);
    });

    it('should return opportunities with valid structure', async () => {
      const response = await fetch('/api/opportunities');
      const data: OpportunitiesResponse = await response.json();

      const opportunity = data.opportunities[0];

      expect(opportunity).toHaveProperty('id');
      expect(opportunity).toHaveProperty('instrument_id');
      expect(opportunity).toHaveProperty('type');
      expect(opportunity).toHaveProperty('confidence');
      expect(opportunity).toHaveProperty('entry_price');
      expect(opportunity).toHaveProperty('target_price');
      expect(opportunity).toHaveProperty('stop_loss');
      expect(opportunity).toHaveProperty('strategy');
      expect(opportunity).toHaveProperty('detected_at');

      expect(['buy', 'sell']).toContain(opportunity.type);
      expect(opportunity.confidence).toBeGreaterThanOrEqual(0);
      expect(opportunity.confidence).toBeLessThanOrEqual(1);
    });

    it('should support pagination with limit parameter', async () => {
      const limit = 10;
      const response = await fetch(`/api/opportunities?limit=${limit}`);
      const data: OpportunitiesResponse = await response.json();

      expect(data.opportunities.length).toBeLessThanOrEqual(limit);
    });

    it('should support filtering by type', async () => {
      const response = await fetch('/api/opportunities?type=buy');
      const data: OpportunitiesResponse = await response.json();

      data.opportunities.forEach(opp => {
        expect(opp.type).toBe('buy');
      });
    });

    it('should support filtering by minimum confidence', async () => {
      const minConfidence = 0.8;
      const response = await fetch(`/api/opportunities?minConfidence=${minConfidence}`);
      const data: OpportunitiesResponse = await response.json();

      data.opportunities.forEach(opp => {
        expect(opp.confidence).toBeGreaterThanOrEqual(minConfidence);
      });
    });

    it('should support filtering by maximum confidence', async () => {
      const maxConfidence = 0.7;
      const response = await fetch(`/api/opportunities?maxConfidence=${maxConfidence}`);
      const data: OpportunitiesResponse = await response.json();

      data.opportunities.forEach(opp => {
        expect(opp.confidence).toBeLessThanOrEqual(maxConfidence);
      });
    });

    it('should support filtering by strategy', async () => {
      const strategy = 'breakout';
      const response = await fetch(`/api/opportunities?strategy=${strategy}`);
      const data: OpportunitiesResponse = await response.json();

      data.opportunities.forEach(opp => {
        expect(opp.strategy).toBe(strategy);
      });
    });

    it('should support sorting by confidence (descending)', async () => {
      const response = await fetch('/api/opportunities?sortBy=confidence&sortOrder=desc');
      const data: OpportunitiesResponse = await response.json();

      for (let i = 1; i < data.opportunities.length; i++) {
        expect(data.opportunities[i - 1].confidence).toBeGreaterThanOrEqual(
          data.opportunities[i].confidence
        );
      }
    });

    it('should support sorting by date (descending)', async () => {
      const response = await fetch('/api/opportunities?sortBy=date&sortOrder=desc');
      const data: OpportunitiesResponse = await response.json();

      for (let i = 1; i < data.opportunities.length; i++) {
        expect(data.opportunities[i - 1].detected_at).toBeGreaterThanOrEqual(
          data.opportunities[i].detected_at
        );
      }
    });

    it('should return empty array when no opportunities match filters', async () => {
      const response = await fetch('/api/opportunities?minConfidence=0.99');
      const data: OpportunitiesResponse = await response.json();

      expect(data.opportunities).toEqual([]);
    });

    it('should have CORS headers', async () => {
      const response = await fetch('/api/opportunities');

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('GET /api/opportunities/:id', () => {
    it('should return single opportunity by ID', async () => {
      // First get list to find a valid ID
      const listResponse = await fetch('/api/opportunities');
      const listData: OpportunitiesResponse = await listResponse.json();
      const validId = listData.opportunities[0].id;

      // Then fetch by ID
      const response = await fetch(`/api/opportunities/${validId}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data: OpportunityResponse = await response.json();

      expect(data).toHaveProperty('opportunity');
      expect(data.opportunity.id).toBe(validId);
    });

    it('should return 404 for non-existent opportunity', async () => {
      const response = await fetch('/api/opportunities/INVALID_ID_12345');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
    });

    it('should have CORS headers for single opportunity', async () => {
      const listResponse = await fetch('/api/opportunities');
      const listData: OpportunitiesResponse = await listResponse.json();
      const validId = listData.opportunities[0].id;

      const response = await fetch(`/api/opportunities/${validId}`);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Query parameter combinations', () => {
    it('should support multiple filters at once', async () => {
      const params = new URLSearchParams({
        type: 'buy',
        minConfidence: '0.7',
        strategy: 'breakout',
        limit: '5'
      });

      const response = await fetch(`/api/opportunities?${params}`);
      const data: OpportunitiesResponse = await response.json();

      expect(data.opportunities.length).toBeLessThanOrEqual(5);

      data.opportunities.forEach(opp => {
        expect(opp.type).toBe('buy');
        expect(opp.confidence).toBeGreaterThanOrEqual(0.7);
        expect(opp.strategy).toBe('breakout');
      });
    });

    it('should support filter + sort combination', async () => {
      const params = new URLSearchParams({
        minConfidence: '0.6',
        sortBy: 'confidence',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/opportunities?${params}`);
      const data: OpportunitiesResponse = await response.json();

      data.opportunities.forEach(opp => {
        expect(opp.confidence).toBeGreaterThanOrEqual(0.6);
      });

      for (let i = 1; i < data.opportunities.length; i++) {
        expect(data.opportunities[i - 1].confidence).toBeGreaterThanOrEqual(
          data.opportunities[i].confidence
        );
      }
    });
  });
});
