---
issue: 27
stream: Data Fetching Hooks
agent: react-frontend-engineer
started: 2025-10-25T22:50:15Z
completed: 2025-10-26T01:02:50Z
status: completed
---

# Stream B: Data Fetching Hooks

## Scope
All 4 custom hooks for instruments, trades, and market data

## Files Created
- `src/hooks/queries/use-instruments.ts` - Fetch all instruments
- `src/hooks/queries/use-instrument.ts` - Fetch single instrument by ID
- `src/hooks/queries/use-trades.ts` - Fetch trades by instrument
- `src/hooks/queries/use-market-data.ts` - Fetch real-time market data
- `src/hooks/queries/index.ts` - Barrel export
- `src/hooks/queries/__tests__/use-instruments.test.tsx` - Instruments hook tests (5 tests)
- `src/hooks/queries/__tests__/use-instrument.test.tsx` - Single instrument tests (6 tests)
- `src/hooks/queries/__tests__/use-trades.test.tsx` - Trades hook tests (5 tests)
- `src/hooks/queries/__tests__/use-market-data.test.tsx` - Market data tests (8 tests)

## Progress
- Dependencies: Stream A completed ✅
- All 4 hooks implemented following strict TDD (RED-GREEN-REFACTOR) ✅
- Comprehensive MSW-based testing ✅
- All 24 tests passing ✅
- Barrel export created ✅
- **Stream B completed successfully** ✅

## TDD Commit History
1. Issue #27 Stream B: RED - Add failing useInstruments tests
2. Issue #27 Stream B: GREEN - Implement useInstruments hook
3. Issue #27 Stream B: RED - Add failing useInstrument tests
4. Issue #27 Stream B: GREEN - Implement useInstrument hook
5. Issue #27 Stream B: RED - Add failing useTrades tests
6. Issue #27 Stream B: GREEN - Implement useTrades hook
7. Issue #27 Stream B: RED - Add failing useMarketData tests
8. Issue #27 Stream B: GREEN - Implement useMarketData hook
9. Issue #27 Stream B: Add barrel export for query hooks

## Test Results
```
Test Files: 4 passed (4)
     Tests: 24 passed (24)
  Duration: 1.13s
```

## Hook Specifications

### useInstruments()
- Query key: `['instruments']`
- Endpoint: `GET /api/instruments`
- Returns: `Instrument[]`
- Features: Lists all available trading instruments

### useInstrument(id: string)
- Query key: `['instruments', id]`
- Endpoint: `GET /api/instruments/:id`
- Returns: `Instrument`
- Features: Conditional fetching (enabled only when id provided)

### useTrades(instrumentId?: string)
- Query key: `['trades', instrumentId]`
- Endpoint: `GET /api/trades?instrumentId={id}` or `GET /api/trades`
- Returns: `Trade[]`
- Features: Optional filtering by instrument

### useMarketData(instrumentId: string, timeframe: Timeframe = 'H1')
- Query key: `['market-data', instrumentId, timeframe]`
- Endpoint: `GET /api/instruments/:id/candlesticks?timeframe={timeframe}`
- Returns: `Candlestick[]`
- Features: Auto-refresh every 5 seconds, conditional fetching, default H1 timeframe
