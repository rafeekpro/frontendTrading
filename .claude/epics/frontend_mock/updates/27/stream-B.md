---
issue: 27
stream: Data Fetching Hooks
agent: react-frontend-engineer
started: 2025-10-25T22:50:15Z
status: in_progress
---

# Stream B: Data Fetching Hooks

## Scope
All 4 custom hooks for instruments, trades, and market data

## Files
- `src/hooks/queries/use-instruments.ts` - Fetch all instruments
- `src/hooks/queries/use-instrument.ts` - Fetch single instrument by ID
- `src/hooks/queries/use-trades.ts` - Fetch trades by instrument
- `src/hooks/queries/use-market-data.ts` - Fetch real-time market data
- `src/hooks/queries/index.ts` - Barrel export
- `src/hooks/queries/__tests__/use-instruments.test.ts` - Instruments hook tests
- `src/hooks/queries/__tests__/use-instrument.test.ts` - Single instrument tests
- `src/hooks/queries/__tests__/use-trades.test.ts` - Trades hook tests
- `src/hooks/queries/__tests__/use-market-data.test.ts` - Market data tests

## Progress
- Starting implementation
- Agent assigned: react-frontend-engineer
- Dependencies: Stream A completed ✅
