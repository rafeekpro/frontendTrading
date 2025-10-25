---
issue: 9
title: "MSW handlers for trading API (mock only)"
analyzed: 2025-10-25T19:46:46Z
updated: 2025-10-25T20:30:22Z
estimated_hours: 5
parallelization_factor: 1.0
status: READY
blocker: none
unblocked_by: "Issue #22 completed (Zustand stores)"
---

# Parallel Work Analysis: Issue #9

## ✅ STATUS: READY TO START

This issue is **NOW UNBLOCKED** as of 2025-10-25T20:30:22Z.

**Previous Blocker**: Zustand paper trading store (Epic 05, Task 003) - ✅ COMPLETED

**Why**: The MSW trading handlers need to read/write state from `usePaperTradingStore`, which doesn't exist yet. Without the store, handlers cannot:
- Validate trade execution (check balance)
- Store executed trades
- Manage active positions
- Calculate P&L

**Recommended Action**: Complete Epic 05 Task 003 first, then return to this issue.

## Overview

Issue #9 requests MSW mock handlers for paper trading operations including:
- Trade execution (POST /api/trades)
- Trade history retrieval (GET /api/trades)
- Position management (GET /api/positions, DELETE /api/positions/:id)
- Trade validation and P&L calculation

This is a **stateful mock** that integrates with Zustand stores for in-memory state management.

## Dependency Chain

```
Epic 05 Task 003: Zustand Stores
  └── Paper Trading Store
      ├── balance: number
      ├── positions: Position[]
      ├── trades: Trade[]
      └── actions: executeTrade(), closePosition()
          ↓
Issue #9: MSW Trading Handlers
  ├── POST /api/trades (uses store.executeTrade())
  ├── GET /api/trades (reads store.trades)
  ├── GET /api/positions (reads store.positions)
  └── DELETE /api/positions/:id (uses store.closePosition())
```

## Parallel Streams (WHEN UNBLOCKED)

Once the Zustand store is available, this work can be split into 3 parallel streams:

### Stream A: Type Definitions & Store Integration
**Scope**: Define trading-related types and verify store integration
**Files**:
- `src/types/trading.ts` (extend with Trade, Position types)
- `src/types/stores.ts` (verify PaperTradingStore interface exists)
**Agent Type**: javascript-frontend-engineer
**Can Start**: After Epic 05 Task 003 completes
**Estimated Hours**: 2h
**Dependencies**: Epic 05 Task 003 (Zustand stores)

**Why This First**: Types must exist before handlers can reference them. This stream validates that the store API matches handler requirements.

### Stream B: MSW Handlers Implementation
**Scope**: Create trading API handlers with store integration
**Files**:
- `src/mocks/handlers/trading.ts` (new - 4 endpoints)
- `src/mocks/handlers/index.ts` (update to export tradingHandlers)
**Agent Type**: frontend-testing-engineer
**Can Start**: After Stream A completes
**Estimated Hours**: 3h
**Dependencies**: Stream A (types defined)

**Endpoints**:
1. POST /api/trades - Execute trade with validation
2. GET /api/trades - Return trade history
3. GET /api/positions - Return active positions
4. DELETE /api/positions/:id - Close position

**Validation Logic**:
- Check balance before trade execution
- Validate instrument ID exists
- Validate trade quantity within limits
- Calculate trade cost including spread

### Stream C: Tests & Documentation
**Scope**: Comprehensive test coverage for trading handlers
**Files**:
- `src/mocks/__tests__/trading-handlers.test.ts` (new)
- Update documentation
**Agent Type**: frontend-testing-engineer
**Can Start**: Parallel with Stream B (TDD approach)
**Estimated Hours**: 3h
**Dependencies**: Stream A (types), can start with Stream B

**Test Coverage**:
- Trade execution success scenarios
- Trade validation (insufficient balance, invalid instrument)
- Position retrieval and closing
- Trade history retrieval
- Realistic execution delays (200-500ms)
- Error response formats

### Stream D: Integration & Validation
**Scope**: Wire everything together and end-to-end validation
**Files**:
- All files from Streams B & C
- Integration with existing instrument handlers
**Agent Type**: frontend-testing-engineer
**Can Start**: After Streams B & C complete
**Estimated Hours**: 3h
**Dependencies**: Streams B, C

**Tasks**:
- Verify handlers work with real Zustand store
- Test trade execution flow end-to-end
- Validate P&L calculation accuracy
- Ensure realistic latency
- Verify localStorage persistence

## Coordination Points

### Shared Files
- `src/types/trading.ts` - Stream A adds types, Stream B imports them
- `src/mocks/handlers/index.ts` - Stream B updates exports

### Sequential Requirements
1. **MUST COMPLETE FIRST**: Epic 05 Task 003 (Zustand stores)
2. Type definitions before handler implementation
3. Handler implementation before integration tests (or parallel with TDD)
4. All streams before final integration validation

### Store Contract Requirements

The paper trading store MUST provide:

```typescript
interface PaperTradingStore {
  // State
  balance: number;
  positions: Position[];
  trades: Trade[];

  // Actions
  executeTrade: (trade: TradeRequest, executionPrice: number) => void;
  closePosition: (positionId: string) => void;

  // Optional (for validation)
  getBalance: () => number;
  getPosition: (id: string) => Position | undefined;
}
```

## Conflict Risk Assessment

**✅ LOW RISK** - Once unblocked:
- Streams work on different files (A: types, B: handlers, C: tests)
- Clear ownership boundaries
- Only coordination needed: types must be defined before imports

**⚠️ MEDIUM RISK** - Dependency coordination:
- If Epic 05 Task 003 changes store API, handlers need updates
- Recommend: Define store interface contract first, implement concurrently

**🚨 HIGH RISK** - Current blocker:
- Cannot proceed without Zustand store
- Creating handlers without store = dead code that won't work

## Parallelization Strategy

**Current Status**: SEQUENTIAL (blocked)

**Once Unblocked - Recommended Approach**: Hybrid

1. **Phase 1**: Stream A (types) - 2h sequential
2. **Phase 2**: Streams B (handlers) + C (tests) - 3h parallel (TDD approach)
3. **Phase 3**: Stream D (integration) - 3h sequential

**Why Hybrid**: Types must be defined first, but handlers and tests can be developed in parallel using TDD methodology. Integration waits for both to complete.

## Expected Timeline

### Current Status (BLOCKED):
- **Cannot estimate** until Epic 05 Task 003 completes
- Epic 05 Task 003 estimate: 6 hours
- **Earliest start**: After 6 hour delay

### With parallel execution (once unblocked):
- Phase 1: 2 hours (sequential)
- Phase 2: 3 hours (parallel B+C)
- Phase 3: 3 hours (sequential)
- **Wall time**: 8 hours
- **Total work**: 11 hours
- **Efficiency gain**: 27%

### Without parallel execution (sequential):
- **Wall time**: 11 hours

### Total Project Timeline:
- Epic 05 Task 003: 6 hours (blocker)
- This issue: 8 hours (parallel) or 11 hours (sequential)
- **Total**: 14-17 hours

## Type Definitions Needed

To unblock this work, these types must be added to `src/types/trading.ts`:

```typescript
// Trade-related types
export type TradeDirection = 'buy' | 'sell';
export type TradeStatus = 'pending' | 'executed' | 'failed';

export interface TradeRequest {
  instrument_id: string;
  direction: TradeDirection;
  quantity: number;
  price: number; // Entry price
}

export interface Trade extends TradeRequest {
  id: string;
  executedAt: string; // ISO 8601 timestamp
  status: TradeStatus;
  cost: number; // Total cost including spread
}

export interface Position {
  id: string;
  instrument_id: string;
  direction: TradeDirection;
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number; // Profit and loss
  pnl_percentage: number;
  opened_at: string; // ISO 8601 timestamp
}

// API Response types
export interface TradeExecutionResponse {
  success: boolean;
  trade?: Trade;
  error?: string;
}

export interface TradesResponse {
  trades: Trade[];
  total: number;
}

export interface PositionsResponse {
  positions: Position[];
  total: number;
}

export interface ClosePositionResponse {
  success: boolean;
  position_id: string;
  pnl: number;
}
```

## Notes

### Critical Path
1. **BLOCKER**: Epic 05 Task 003 must complete first
2. Without the store, this issue cannot proceed
3. Do not create partial implementations - handlers won't work

### Risk Mitigation
- Define store interface contract with Epic 05 Task 003 team
- Share type definitions early to avoid mismatches
- Consider creating mock store for handler development if Epic 05 is delayed

### TDD Considerations
- Tests should be written alongside handler implementation (parallel B+C)
- Each handler endpoint: RED test → GREEN code → REFACTOR
- Mock the Zustand store in tests to isolate handler logic

### Performance Requirements
- Realistic execution time: 200-500ms (use `delay()` from MSW)
- Validation should fail fast (<50ms)
- State updates should be synchronous

### Future Enhancements (Not in Scope)
- WebSocket for real-time price updates
- Order types (market, limit, stop-loss)
- Advanced P&L tracking with history charts
- Risk management (margin, leverage)

**Recommendation**: Complete Epic 05 Task 003 (Zustand stores) before starting this issue. Without the store dependency, this work is blocked and cannot proceed.
