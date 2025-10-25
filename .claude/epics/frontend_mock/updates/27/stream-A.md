---
stream: A
issue: 27
title: Query Client Setup & Infrastructure
status: completed
completed_at: 2025-10-26T00:49:30Z
---

# Stream A: Query Client Setup & Infrastructure

## Status: COMPLETED ✅

## Summary
Successfully set up TanStack Query (React Query) core infrastructure for the trading application following strict TDD methodology (RED-GREEN-REFACTOR).

## Deliverables

### 1. Dependencies Installed
- `@tanstack/react-query@latest` - Core query library
- `@tanstack/react-query-devtools@latest` - Development tools

### 2. QueryClient Configuration (`src/lib/query-client.ts`)
- ✅ Configured with trading-specific defaults:
  - **staleTime**: 30 seconds (time-sensitive trading data)
  - **gcTime**: 5 minutes (cache garbage collection)
  - **retry**: 3 attempts with exponential backoff
  - **refetchOnWindowFocus**: true (keep data fresh)
- ✅ Extracted configuration constants for reusability
- ✅ Comprehensive documentation and JSDoc comments

### 3. App Integration (`src/App.tsx`)
- ✅ Wrapped application with `QueryClientProvider`
- ✅ Added `ReactQueryDevtools` conditionally (development mode only)
- ✅ Proper component hierarchy maintained

### 4. Test Coverage
- ✅ QueryClient configuration tests (`src/lib/__tests__/query-client.test.ts`)
  - Validates all default options
  - Tests QueryClient instance creation
  - 5 passing tests
- ✅ App integration tests (`src/__tests__/app-integration.test.tsx`)
  - Tests QueryClientProvider wrapper
  - Tests query context availability
  - Tests DevTools conditional rendering
  - 3 passing tests

## TDD Cycle Evidence

### Commits (RED-GREEN-REFACTOR pattern):
1. **RED**: `9719c71` - Add QueryClient config tests (failing)
2. **GREEN**: `69b02ca` - Implement QueryClient with trading-specific defaults (passing)
3. **RED**: `56363e4` - Add App integration tests for QueryProvider and DevTools (1 failing)
4. **GREEN**: `9d6c452` - Wrap App with QueryClientProvider and add DevTools (all passing)
5. **REFACTOR**: `0554607` - Extract configuration constants and improve documentation (all passing)

## Test Results
```
✓ src/lib/__tests__/query-client.test.ts (5 tests)
✓ src/__tests__/app-integration.test.tsx (3 tests)

Test Files  2 passed (2)
Tests       8 passed (8)
```

## Files Modified
- `package.json` - Added TanStack Query dependencies
- `src/lib/query-client.ts` - QueryClient configuration (NEW)
- `src/App.tsx` - Integrated QueryClientProvider and DevTools
- `src/lib/__tests__/query-client.test.ts` - QueryClient tests (NEW)
- `src/__tests__/app-integration.test.tsx` - App integration tests (NEW)

## Configuration Details

### QueryClient Defaults
```typescript
const QUERY_CONFIG = {
  STALE_TIME: 30 * 1000,              // 30 seconds
  GC_TIME: 5 * 60 * 1000,             // 5 minutes
  RETRY_COUNT: 3,                      // 3 retry attempts
  REFETCH_ON_WINDOW_FOCUS: true,      // Refetch on focus
} as const;
```

### Rationale
- **Short staleTime (30s)**: Trading data is time-sensitive and requires frequent updates
- **Reasonable gcTime (5min)**: Balances memory usage with network efficiency
- **Retry logic (3x)**: Handles flaky network connections common in trading platforms
- **RefetchOnWindowFocus**: Ensures data freshness when users return to the application

## Next Steps for Stream B
Stream B can now proceed with implementing data fetching hooks:
- `useInstruments()` - Fetch all instruments
- `useInstrument(id)` - Fetch single instrument
- `useTrades(instrumentId)` - Fetch trades
- `useMarketData(instrumentId, timeframe)` - Fetch market data

All hooks will use the QueryClient configured in Stream A.

## Notes
- All tests follow TDD cycle strictly (RED → GREEN → REFACTOR)
- Configuration constants exported for use in custom hooks
- DevTools only available in development mode
- Error boundary for query failures can be added later if needed
- QueryClient properly typed with TypeScript
- No breaking changes to existing functionality
