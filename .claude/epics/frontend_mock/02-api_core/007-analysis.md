---
issue: 7
title: MSW handlers for instruments API
analyzed: 2025-10-25T19:19:58Z
estimated_hours: 4
parallelization_factor: 2.5
---

# Parallel Work Analysis: Issue #7

## Overview
Create Mock Service Worker (MSW) handlers for the instruments API endpoints. This is frontend-only mocking using MSW to simulate backend API responses with realistic data for trading instruments and candlestick charts.

## Parallel Streams

### Stream A: MSW Setup & Core Handlers
**Scope**: Install MSW, create base configuration, and implement core instrument handlers
**Files**:
- `/package.json` (add MSW dependency)
- `/src/mocks/browser.ts` (new - MSW browser setup)
- `/src/mocks/handlers/index.ts` (new - handler registry)
- `/src/mocks/handlers/instruments.ts` (new - instruments handlers)
- `/src/main.tsx` (update - initialize MSW in development)
**Agent Type**: javascript-frontend-engineer
**Can Start**: immediately
**Estimated Hours**: 2.5
**Dependencies**: none

### Stream B: Mock Data Generators
**Scope**: Create realistic mock data generators for instruments and candlesticks
**Files**:
- `/src/mocks/data/instruments.ts` (new - instrument mock data)
- `/src/mocks/data/candlesticks.ts` (new - OHLCV data generator)
- `/src/types/trading.ts` (new - TypeScript interfaces)
**Agent Type**: javascript-frontend-engineer
**Can Start**: immediately (parallel with Stream A)
**Estimated Hours**: 1.5
**Dependencies**: none

## Coordination Points

### Shared Files
None - streams work on completely separate files

### Sequential Requirements
None initially, but integration needed:
1. Stream A creates handler structure
2. Stream B creates data generators
3. Both integrate: handlers import data from generators

**Coordination Strategy**:
- Streams can work 100% in parallel
- Final integration step: Stream A imports data from Stream B
- Use TypeScript interfaces for contract between streams

## Conflict Risk Assessment
- **Low Risk**: Zero file overlap between streams
- **Coordination Point**: Type definitions for API responses
  - **Resolution**: Stream B creates types first, Stream A consumes them
  - Or: Define types in separate file both import

## Parallelization Strategy

**Recommended Approach**: parallel

**Phase 1 (Parallel - 2.5h):**
- Stream A: Install MSW, create handler structure, implement basic endpoints
- Stream B: Create data generators with realistic trading data

**Phase 2 (Integration - 0.5h):**
- Import data generators into handlers
- Test complete flow with MSW in browser
- Verify all endpoints work with realistic data

**Why Parallel Works:**
- Zero file conflicts
- Clear interface contract (TypeScript types)
- Independent implementation possible
- Fast integration at the end

## Expected Timeline

With parallel execution:
- Wall time: 2.5 hours (parallel) + 0.5h (integration) = 3 hours
- Total work: 4 hours
- Efficiency gain: 25%

Without parallel execution:
- Wall time: 4 hours (sequential)

## Notes

**TDD Approach:**
- Stream A: Test that MSW intercepts requests, handlers return correct structure
- Stream B: Test that data generators produce valid trading data

**Context7 Queries Required:**
- `mcp://context7/msw/rest-handlers` - MSW REST API patterns
- `mcp://context7/msw/response-composition` - Response utilities
- `mcp://context7/msw/request-validation` - Request parameter validation
- `mcp://context7/typescript/trading-types` - Financial data type definitions

**Critical Requirements:**
- MSW v2.x (latest) with browser worker
- Realistic forex data (EUR/USD, GBP/USD, etc.)
- Proper OHLCV candlestick generation
- Request validation (timeframe parameter)
- Error responses (404, 400, 500)
- Deterministic data for testing

**MSW Integration:**
```typescript
// Stream A creates this structure
src/mocks/
  ├── browser.ts          // MSW worker setup
  ├── handlers/
  │   ├── index.ts       // Export all handlers
  │   └── instruments.ts // Instrument endpoints
  └── data/
      ├── instruments.ts // Mock instruments (Stream B)
      └── candlesticks.ts // OHLCV generator (Stream B)
```

**API Endpoints to Mock:**
1. `GET /api/instruments` - List all instruments
2. `GET /api/instruments/:id` - Single instrument
3. `GET /api/instruments/:id/candlesticks?timeframe=H1` - OHLCV data

**Parallelization Factor: 2.5x** - Both streams can work fully independently with minimal integration overhead.
