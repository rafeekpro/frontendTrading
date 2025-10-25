---
issue: 27
title: TanStack Query setup and hooks
analyzed: 2025-10-25T22:29:30Z
estimated_hours: 3
parallelization_factor: 1.5
---

# Parallel Work Analysis: Issue #27

## Overview
Set up TanStack Query (React Query) for efficient data fetching, caching, and state management in the trading application. Implement QueryClient configuration with sensible defaults and create 4 custom hooks for fetching instruments, trades, and real-time market data with comprehensive MSW testing.

## Parallel Streams

### Stream A: Query Client Setup & Infrastructure
**Scope**: Core TanStack Query installation, configuration, and App integration
**Files**:
- `package.json` - Add @tanstack/react-query dependency
- `src/lib/query-client.ts` - QueryClient configuration with custom defaults
- `src/App.tsx` - Integrate QueryClientProvider and DevTools
- `src/lib/__tests__/query-client.test.ts` - QueryClient configuration tests
- `src/__tests__/app-integration.test.tsx` - QueryProvider integration tests

**Agent Type**: react-frontend-engineer
**Can Start**: immediately
**Estimated Hours**: 1 hour
**Dependencies**: none

**Test Files**:
- QueryClient configuration validation
- Default options (staleTime, cacheTime, retry)
- Provider integration in App
- DevTools availability in development

**Deliverables**:
- TanStack Query installed (@tanstack/react-query@latest)
- QueryClient configured with:
  - staleTime: 30 seconds (trading data time-sensitive)
  - cacheTime: 5 minutes
  - retry: 3 attempts with exponential backoff
  - refetchOnWindowFocus: true
- QueryClientProvider wrapping App
- ReactQueryDevtools in development mode
- Error boundary for query failures

---

### Stream B: Data Fetching Hooks
**Scope**: All 4 custom hooks for instruments, trades, and market data
**Files**:
- `src/hooks/queries/use-instruments.ts` - Fetch all instruments
- `src/hooks/queries/use-instrument.ts` - Fetch single instrument by ID
- `src/hooks/queries/use-trades.ts` - Fetch trades by instrument
- `src/hooks/queries/use-market-data.ts` - Fetch real-time market data
- `src/hooks/queries/index.ts` - Barrel export
- `src/hooks/queries/__tests__/use-instruments.test.ts` - Instruments hook tests
- `src/hooks/queries/__tests__/use-instrument.test.ts` - Single instrument tests
- `src/hooks/queries/__tests__/use-trades.test.ts` - Trades hook tests
- `src/hooks/queries/__tests__/use-market-data.test.ts` - Market data tests

**Agent Type**: react-frontend-engineer
**Can Start**: after Stream A completes (needs QueryClient)
**Estimated Hours**: 2 hours
**Dependencies**: Stream A (QueryClient configuration)

**Test Files**:
- All hooks tested with MSW mocked responses
- Loading states
- Error states
- Data transformation
- Cache invalidation

**Deliverables**:
- `useInstruments()` - Returns list of all instruments
- `useInstrument(id)` - Returns single instrument details
- `useTrades(instrumentId)` - Returns trades for specific instrument
- `useMarketData(instrumentId)` - Returns real-time price data
- All hooks use proper query keys
- All hooks handle loading/error states
- MSW integration for testing
- TypeScript types for all responses

## Coordination Points

### Shared Files
**No Direct Conflicts**:
- All files have single-stream ownership
- Stream A: Infrastructure files
- Stream B: All hook files

**Dependencies**:
- Stream B depends on Stream A's QueryClient being available
- Stream B imports from `src/lib/query-client.ts`

### Sequential Requirements
**Critical Path**:
1. **Stream A must complete first** - Provides QueryClient infrastructure
2. **Stream B follows** - Uses QueryClient for all hooks

**Why Sequential**:
- Hooks need QueryClient to function
- Tests need QueryClientProvider wrapper
- DevTools need QueryClient instance

## Conflict Risk Assessment
- **No Risk**: Completely separate file ownership
- **No Risk**: No shared files between streams
- **No Risk**: Clear dependency chain (A → B)

## Parallelization Strategy

**Recommended Approach**: Sequential (A then B)

### Why Sequential is Best:
1. **Dependencies**: Stream B absolutely needs Stream A's QueryClient
2. **Testing**: Hook tests require QueryClientProvider from Stream A
3. **Small Scope**: Only 3 hours total, parallelization overhead not worth it
4. **Logical Flow**: Infrastructure first, then features
5. **Cohesion**: All hooks are similar, better done by same agent

### Execution Plan:
1. **Phase 1 (Sequential)**: Complete Stream A
   - Install TanStack Query
   - Configure QueryClient
   - Integrate into App
   - Duration: 1 hour

2. **Phase 2 (Sequential)**: Complete Stream B
   - Implement all 4 hooks
   - Write tests with MSW
   - Duration: 2 hours

**Alternative (Not Recommended)**:
- Could split Stream B into:
  - Stream B1: Instruments hooks (useInstruments, useInstrument)
  - Stream B2: Trading hooks (useTrades, useMarketData)
- Both would run in parallel after Stream A
- **Not worth it**: Hooks are too similar, coordination overhead > time saved

## Expected Timeline

**With sequential execution (recommended):**
- Stream A: 1 hour
- Stream B: 2 hours
- **Total wall time: 3 hours**
- Total work: 3 hours
- **Efficiency gain: 0%** (but appropriate for this task)

**With forced parallel (not recommended):**
- Stream A: 1 hour
- Stream B1 & B2 in parallel after A: 1 hour each
- **Total wall time: 2 hours**
- Total work: 3 hours
- **Efficiency gain: 33%**
- **Downsides**: Coordination overhead, code duplication risk

**Verdict**: Sequential execution is optimal for this small, cohesive task

## TDD Cycle for Each Stream

All streams follow TDD:
1. 🔴 **RED**: Write failing tests first
2. ✅ **GREEN**: Implement minimal code to pass
3. ♻️ **REFACTOR**: Optimize and clean up

### Stream A TDD:
- RED: QueryClient configuration tests, App integration tests
- GREEN: Implement QueryClient with defaults, wrap App
- REFACTOR: Extract configuration constants, optimize setup

### Stream B TDD (per hook):
- RED: Write failing hook tests with MSW
- GREEN: Implement hook to pass tests
- REFACTOR: Extract shared query key logic, DRY patterns

## Technical Stack

**Dependencies** (to be installed):
- `@tanstack/react-query` (latest)
- `@tanstack/react-query-devtools` (latest, dev dependency)

**Existing Dependencies** (already in project):
- React 18+
- TypeScript
- MSW (for testing, from Issue #20)
- Vitest + React Testing Library

**API Endpoints** (already mocked via MSW):
- GET /api/instruments - List all instruments
- GET /api/instruments/:id - Single instrument
- GET /api/instruments/:id/candles - Market data (candlesticks)
- GET /api/trades - Trades list (can filter by instrumentId)

## Hook Specifications

### 1. useInstruments()
```typescript
function useInstruments(): UseQueryResult<Instrument[]> {
  return useQuery({
    queryKey: ['instruments'],
    queryFn: async () => {
      const res = await fetch('/api/instruments');
      return res.json();
    },
  });
}
```

### 2. useInstrument(id: string)
```typescript
function useInstrument(id: string): UseQueryResult<Instrument> {
  return useQuery({
    queryKey: ['instruments', id],
    queryFn: async () => {
      const res = await fetch(`/api/instruments/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}
```

### 3. useTrades(instrumentId?: string)
```typescript
function useTrades(instrumentId?: string): UseQueryResult<Trade[]> {
  return useQuery({
    queryKey: ['trades', instrumentId],
    queryFn: async () => {
      const url = instrumentId
        ? `/api/trades?instrumentId=${instrumentId}`
        : '/api/trades';
      const res = await fetch(url);
      return res.json();
    },
  });
}
```

### 4. useMarketData(instrumentId: string, timeframe: Timeframe = 'H1')
```typescript
function useMarketData(
  instrumentId: string,
  timeframe: Timeframe = 'H1'
): UseQueryResult<Candlestick[]> {
  return useQuery({
    queryKey: ['market-data', instrumentId, timeframe],
    queryFn: async () => {
      const res = await fetch(
        `/api/instruments/${instrumentId}/candles?timeframe=${timeframe}`
      );
      return res.json();
    },
    enabled: !!instrumentId,
    refetchInterval: 5000, // Refresh every 5s for real-time feel
  });
}
```

## Notes

**Important Considerations:**

1. **QueryClient Configuration**:
   - Trading data is time-sensitive, use short staleTime (30s)
   - Keep cacheTime reasonable (5min) to balance memory vs network
   - Retry logic important for flaky network connections
   - RefetchOnWindowFocus keeps data fresh when user returns

2. **Hook Patterns**:
   - Use consistent query key structure: `['resource', ...params]`
   - Enable/disable queries based on required params
   - Market data has auto-refresh for real-time updates

3. **Testing Strategy**:
   - All hooks tested with MSW mocked API
   - Test loading states (initial, refetching)
   - Test error states (network errors, API errors)
   - Test data transformation
   - Test cache behavior

4. **DevTools**:
   - Only in development (check import.meta.env.DEV)
   - Helps debug cache, query states, refetch behavior
   - Essential for trading app monitoring

5. **Error Handling**:
   - Global error boundary for catastrophic failures
   - Per-hook error states for granular control
   - Retry logic with exponential backoff

6. **Performance**:
   - Automatic request deduplication
   - Background refetching
   - Optimistic updates (future enhancement)
   - Prefetching (future enhancement)

**Success Metrics**:
- All hooks return data correctly
- Loading states work
- Error states handled gracefully
- Cache invalidation works
- DevTools accessible in dev
- All tests passing with MSW
- TypeScript types correct

**Agent Coordination**:
- Single agent can handle entire task sequentially
- Stream A establishes foundation
- Stream B builds on foundation
- Both follow strict TDD (RED → GREEN → REFACTOR)
- Each commit follows TDD phase naming

**Future Enhancements** (not in this task):
- Mutations (useCreateTrade, useUpdatePosition)
- Optimistic updates
- Infinite queries (pagination)
- Prefetching
- Query cancellation
- Suspense mode
