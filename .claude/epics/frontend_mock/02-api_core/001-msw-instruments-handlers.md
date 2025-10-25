---
task_id: frontend_mock/02-api_core/001
title: MSW handlers for instruments API
epic: frontend_mock/02-api_core
status: pending
priority: high
effort_hours: 4
created: 2025-10-25T17:11:34Z
updated: 2025-10-25T17:11:34Z
depends_on: []
parallel: true
tags: [msw, api-mocking, instruments, frontend]
context7_queries:
  - msw/rest-handlers
  - msw/response-composition
  - msw/request-validation
---

# Task: MSW handlers for instruments API

## Description

Create Mock Service Worker (MSW) handlers for the instruments API endpoints. This is for FRONTEND mocking only - not real backend implementation.

## Acceptance Criteria

- [ ] Create GET /api/instruments handler
  - Returns list of all available instruments
  - Include mock data for major forex pairs, indices, commodities
  - Response includes: id, name, symbol, type, spread, pip_value
- [ ] Create GET /api/instruments/:id handler
  - Returns single instrument details
  - Handles 404 for invalid IDs
- [ ] Create GET /api/instruments/:id/candlesticks handler
  - Accepts timeframe query parameter (M1, M5, M15, M30, H1, H4, D1)
  - Returns realistic OHLCV candlestick data
  - Generate mock historical data with realistic price movements
- [ ] Add request validation
  - Validate timeframe parameter
  - Return 400 for invalid requests
- [ ] Add error responses
  - 404 for non-existent instruments
  - 400 for invalid timeframes
  - 500 for simulated server errors (optional, for testing)

## Technical Details

**MSW Setup:**
```typescript
// src/mocks/handlers/instruments.ts
import { http, HttpResponse } from 'msw';

export const instrumentsHandlers = [
  http.get('/api/instruments', () => {
    return HttpResponse.json({ instruments: [...] });
  }),
  // ... other handlers
];
```

**Mock Data Structure:**
- Instruments: EUR/USD, GBP/USD, USD/JPY, Gold, S&P500, etc.
- Candlesticks: Generate realistic OHLCV data with proper bid/ask spreads
- Use timestamp-based generation for historical data

## Context7 Queries

Before implementation, query:
1. `mcp://context7/msw/rest-handlers` - MSW REST API patterns
2. `mcp://context7/msw/response-composition` - Response utilities
3. `mcp://context7/msw/request-validation` - Request parameter validation

## Definition of Done

- [ ] All handlers implemented and tested
- [ ] Request validation working correctly
- [ ] Error responses return appropriate status codes
- [ ] Mock data is realistic and consistent
- [ ] Handlers registered in MSW setup
- [ ] Documentation updated with API endpoints
- [ ] Unit tests for handlers (TDD - tests first!)

## Notes

- This is FRONTEND mocking only - no backend/database
- Mock data should be realistic for demo purposes
- Consider adding delay simulation for realistic loading states
- Use deterministic data generation for consistent testing
