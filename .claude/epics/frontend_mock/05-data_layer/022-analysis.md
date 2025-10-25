---
issue: 22
title: "Zustand stores (watchlist, paper trading, AI config)"
analyzed: 2025-10-25T20:10:04Z
estimated_hours: 6
parallelization_factor: 2.5
status: ready
blocker: none
---

# Parallel Work Analysis: Issue #22

## Overview

Issue #22 requires creating three Zustand stores with localStorage persistence and comprehensive testing. This work can be significantly parallelized by having different agents work on different stores simultaneously.

**Stores to Implement:**
1. Watchlist store (add/remove/clear with localStorage)
2. Paper trading store (balance, positions, trades management)
3. AI config store (provider selection and settings)

## Parallel Streams

### Stream A: Type Definitions & Infrastructure
**Scope**: Set up shared infrastructure and type definitions
**Files**:
- `package.json` (add Zustand dependency)
- `src/types/stores.ts` (new - all store type definitions)
- `src/stores/index.ts` (new - barrel export file)
- `src/stores/__tests__/utils.ts` (new - shared test utilities)

**Agent Type**: react-frontend-engineer
**Can Start**: Immediately
**Estimated Hours**: 1.5h
**Dependencies**: None

**Why This First**: All other streams need the type definitions and test utilities to work properly. This stream creates the foundation.

**Tasks**:
1. Install Zustand: `docker compose run --rm app npm install zustand`
2. Create TypeScript interfaces for all three stores
3. Create shared test utilities for store testing
4. Set up barrel export structure

### Stream B: Watchlist Store (TDD)
**Scope**: Implement watchlist store with localStorage persistence
**Files**:
- `src/stores/watchlist.ts` (new)
- `src/stores/__tests__/watchlist.test.ts` (new)

**Agent Type**: react-frontend-engineer
**Can Start**: After Stream A completes
**Estimated Hours**: 1.5h
**Dependencies**: Stream A (types and test utils)

**TDD Workflow**:
1. 🔴 RED: Write failing tests for watchlist actions
2. 🟢 GREEN: Implement watchlist store with minimal code
3. 🔵 REFACTOR: Optimize and add localStorage persistence

**Acceptance Criteria**:
- Add/remove/clear watchlist items
- Persist to localStorage (`trading-watchlist` key)
- Type-safe with WatchlistStore interface
- All tests passing

### Stream C: Paper Trading Store (TDD)
**Scope**: Implement paper trading store for balance and position management
**Files**:
- `src/stores/paperTrading.ts` (new)
- `src/stores/__tests__/paperTrading.test.ts` (new)

**Agent Type**: react-frontend-engineer
**Can Start**: After Stream A completes (parallel with Stream B)
**Estimated Hours**: 2h
**Dependencies**: Stream A (types and test utils)

**TDD Workflow**:
1. 🔴 RED: Write failing tests for trading actions
2. 🟢 GREEN: Implement trading store with minimal code
3. 🔵 REFACTOR: Add P&L calculation and persistence

**Acceptance Criteria**:
- Manage balance, positions, and trades
- Execute trade, close position actions
- Persist to localStorage (`paper-trading-state` key)
- Calculate P&L correctly
- Type-safe with TradingStore interface
- All tests passing

### Stream D: AI Config Store (TDD)
**Scope**: Implement AI configuration store
**Files**:
- `src/stores/aiConfig.ts` (new)
- `src/stores/__tests__/aiConfig.test.ts` (new)

**Agent Type**: react-frontend-engineer
**Can Start**: After Stream A completes (parallel with B & C)
**Estimated Hours**: 1h
**Dependencies**: Stream A (types and test utils)

**TDD Workflow**:
1. 🔴 RED: Write failing tests for AI config actions
2. 🟢 GREEN: Implement AI config store with minimal code
3. 🔵 REFACTOR: Add validation and persistence

**Acceptance Criteria**:
- Manage AI provider selection
- Manage AI settings
- Persist to localStorage (`ai-config` key)
- Type-safe with AIConfigStore interface
- All tests passing

## Coordination Points

### Shared Files
- `src/types/stores.ts` - Stream A creates, all others import
- `src/stores/__tests__/utils.ts` - Stream A creates, all others use
- `src/stores/index.ts` - Stream A creates structure, others add exports

### Sequential Requirements
1. **Stream A MUST complete first** - Provides types and test utilities
2. **Streams B, C, D can run in parallel** - Independent implementations
3. **Final integration check** - After all streams complete

### Type Contract (Stream A Output)

Stream A must define these interfaces:

```typescript
// src/types/stores.ts

// Watchlist Store
export interface WatchlistItem {
  instrument_id: string;
  symbol: string;
  added_at: string; // ISO 8601
}

export interface WatchlistStore {
  items: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (instrument_id: string) => void;
  clearWatchlist: () => void;
}

// Paper Trading Store
export interface Trade {
  id: string;
  instrument_id: string;
  direction: 'buy' | 'sell';
  quantity: number;
  price: number;
  executedAt: string; // ISO 8601
}

export interface Position {
  id: string;
  instrument_id: string;
  direction: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percentage: number;
  opened_at: string; // ISO 8601
}

export interface PaperTradingStore {
  balance: number;
  positions: Position[];
  trades: Trade[];
  executeTrade: (trade: Omit<Trade, 'id' | 'executedAt'>, executionPrice: number) => void;
  closePosition: (positionId: string) => void;
  updatePositionPrice: (instrumentId: string, newPrice: number) => void;
}

// AI Config Store
export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AISettings {
  model: string;
  temperature: number;
  max_tokens: number;
}

export interface AIConfigStore {
  provider: AIProvider;
  settings: AISettings;
  setProvider: (provider: AIProvider) => void;
  updateSettings: (settings: Partial<AISettings>) => void;
  resetToDefaults: () => void;
}
```

### Test Utilities Contract (Stream A Output)

Stream A must provide these test helpers:

```typescript
// src/stores/__tests__/utils.ts

// Clear all localStorage between tests
export const clearStoreStorage = () => {
  localStorage.clear();
};

// Create mock watchlist items
export const createMockWatchlistItem = (overrides?: Partial<WatchlistItem>): WatchlistItem => ({
  instrument_id: 'AAPL',
  symbol: 'AAPL',
  added_at: new Date().toISOString(),
  ...overrides,
});

// Create mock trades
export const createMockTrade = (overrides?: Partial<Trade>): Trade => ({
  id: `trade-${Date.now()}`,
  instrument_id: 'AAPL',
  direction: 'buy',
  quantity: 10,
  price: 150.00,
  executedAt: new Date().toISOString(),
  ...overrides,
});

// Create mock positions
export const createMockPosition = (overrides?: Partial<Position>): Position => ({
  id: `pos-${Date.now()}`,
  instrument_id: 'AAPL',
  direction: 'buy',
  quantity: 10,
  entry_price: 150.00,
  current_price: 155.00,
  pnl: 50.00,
  pnl_percentage: 3.33,
  opened_at: new Date().toISOString(),
  ...overrides,
});
```

## Conflict Risk Assessment

**✅ LOW RISK** - Well-isolated work:
- Each stream works on completely different files
- Clear type contracts defined upfront
- No shared implementation code
- Only shared dependency is types from Stream A

**⚠️ MEDIUM RISK** - Stream A quality:
- If Stream A's types are incomplete, others blocked
- If test utilities are insufficient, testing harder
- **Mitigation**: Thorough review of Stream A before proceeding

**🚨 ZERO RISK** - File conflicts:
- No streams share implementation files
- Barrel export (`index.ts`) updated by each stream independently

## Parallelization Strategy

**Recommended Approach**: Phased Parallel

### Phase 1: Infrastructure (Sequential)
- **Stream A only**: 1.5h
- Creates foundation for all other work

### Phase 2: Store Implementation (Full Parallel)
- **Streams B + C + D**: 2h (wall time)
- All three stores implemented simultaneously
- Each follows TDD independently
- Total work: 4.5h in 2h wall time

### Phase 3: Integration (Quick Check)
- **Manual verification**: 0.5h
- Verify all stores work together
- Test barrel exports
- Confirm localStorage persistence

## Expected Timeline

### With Parallel Execution:
- Phase 1 (Sequential): 1.5h
- Phase 2 (Parallel): 2h
- Phase 3 (Integration): 0.5h
- **Wall Time**: 4 hours
- **Total Work**: 6 hours
- **Efficiency Gain**: 33%

### Without Parallel Execution:
- **Wall Time**: 6 hours

### Parallelization Factor: 2.5
- 3 streams can run simultaneously in Phase 2
- Achieves 2.5x speedup in store implementation phase

## Docker-First Development

**CRITICAL**: All commands must run in Docker containers.

```bash
# Install dependency
docker compose run --rm app npm install zustand

# Run tests
docker compose run --rm app npm test

# Type check
docker compose run --rm app npm run typecheck

# Lint
docker compose run --rm app npm run lint
```

## Context7 Documentation Queries

Before starting each stream, agents should query:

**Stream A (Infrastructure)**:
- `mcp://context7/zustand/typescript-setup`
- `mcp://context7/zustand/testing-patterns`

**Stream B (Watchlist)**:
- `mcp://context7/zustand/persist-middleware`
- `mcp://context7/zustand/array-state-management`

**Stream C (Paper Trading)**:
- `mcp://context7/zustand/complex-state-updates`
- `mcp://context7/zustand/computed-values`

**Stream D (AI Config)**:
- `mcp://context7/zustand/simple-state-management`
- `mcp://context7/zustand/persist-middleware`

## Notes

### Critical Success Factors
1. **Stream A quality is paramount** - Sets foundation for all others
2. **TDD discipline** - All streams must follow RED-GREEN-REFACTOR
3. **Type safety** - Leverage TypeScript strict mode
4. **localStorage** - All stores must persist correctly

### Risk Mitigation
- Stream A should be reviewed before launching B/C/D
- Each stream commits independently
- Integration phase catches any issues
- Test utilities ensure consistent testing

### Performance Requirements
- Stores should be lightweight (no heavy computations)
- localStorage updates should be debounced if needed
- All actions should be synchronous (except persist)

### Future Enhancements (Not in Scope)
- WebSocket integration for real-time updates
- Store devtools integration
- Time-travel debugging
- Store performance monitoring

**Recommendation**: This task is ideal for parallel execution. Stream A provides a solid foundation, and streams B/C/D are completely independent. Follow the phased approach for maximum efficiency.
