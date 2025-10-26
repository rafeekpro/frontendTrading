---
issue: 29
stream: Page Integration & Real-time Updates
agent: react-frontend-engineer
started: 2025-10-25T23:50:30Z
status: in_progress
---

# Stream C: Page Integration & Real-time Updates

## Scope
InstrumentDetail page, route setup, and real-time data flow

## Files
- `src/pages/InstrumentDetail.tsx` - Main page component
- `src/hooks/use-ohlcv-data.ts` - Fetch historical candlestick data
- `src/hooks/use-realtime-price.ts` - Real-time price updates (WebSocket or polling)
- `src/App.tsx` - Add /instrument/:id route
- `src/pages/__tests__/InstrumentDetail.test.tsx` - Page integration tests

## Dependencies
- Stream A: Chart Infrastructure ✅ COMPLETED
- Stream B: Trading Data Components ✅ COMPLETED

## Progress
- Starting implementation
- Agent assigned: react-frontend-engineer
- All required components from Streams A & B are ready
