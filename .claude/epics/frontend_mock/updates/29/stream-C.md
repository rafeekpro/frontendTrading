---
issue: 29
stream: Page Integration & Real-time Updates
agent: react-frontend-engineer
started: 2025-10-26T09:04:00Z
completed: 2025-10-26T09:30:00Z
status: completed
---

# Stream C: Page Integration & Real-time Updates

## Scope
InstrumentDetail page, route setup, and real-time data flow integration

## Files Implemented
- ✅ `src/hooks/queries/use-ohlcv-data.ts` - OHLCV data fetching hook (45 lines)
- ✅ `src/hooks/queries/index.ts` - Updated barrel export
- ✅ `src/pages/InstrumentDetail.tsx` - Main page component (194 lines)
- ✅ `src/pages/__tests__/InstrumentDetail.test.tsx` - Integration tests (544 lines, 42 tests)
- ✅ `src/components/charts/index.ts` - Chart components barrel export
- ✅ `src/App.tsx` - Added /instrument/:id route
- ✅ `src/__tests__/setup.ts` - Added global lightweight-charts mock

## TDD Cycle Completed

### useOHLCVData Hook (RED → GREEN → REFACTOR)
1. **RED Phase**: Created 19 failing tests for OHLCV data fetching
2. **GREEN Phase**: Implemented hook - ALL 19 TESTS PASSING
3. **REFACTOR Phase**: No refactoring needed (clean implementation)

### InstrumentDetail Page (RED → GREEN → REFACTOR)
1. **RED Phase**: Created 42 comprehensive integration tests
2. **GREEN Phase**: Implemented page with full integration - ALL 42 TESTS PASSING
3. **REFACTOR Phase**: No refactoring needed (helper functions extracted during GREEN phase)

## Features Implemented

### useOHLCVData Hook
- ✅ TanStack Query hook for fetching candlestick data
- ✅ Query key: `['ohlcv', instrumentId, timeframe]`
- ✅ Endpoint: `GET /api/instruments/:id/candles?timeframe={timeframe}`
- ✅ Returns: `Candlestick[]` (OHLCV data)
- ✅ Enabled only when instrumentId exists
- ✅ Auto-refresh every 30 seconds (refetchInterval: 30000)

### InstrumentDetail Page
- ✅ Full page layout with all components integrated
- ✅ Fetch instrument data using `useInstrument(id)` from URL param
- ✅ Fetch OHLCV data using `useOHLCVData(id, timeframe)` hook
- ✅ Timeframe state management (default: H1)
- ✅ Data transformation using chart-utils
- ✅ Market stats calculation from OHLCV data
- ✅ Mock OrderBook generation based on current price

### Page Layout
- ✅ MarketStats at top - displays 24h High/Low/Volume/VWAP
- ✅ Main grid layout:
  - Chart section (3 columns on desktop): TimeframeSelector + CandlestickChart
  - OrderBook sidebar (1 column on desktop)
- ✅ Responsive design:
  - Mobile: Stack vertically (grid-cols-1)
  - Desktop: 4-column grid (lg:grid-cols-4)

### User Interactions
- ✅ Timeframe switching (M1, M5, M15, H1, H4, D1)
- ✅ Data refetch on timeframe change
- ✅ Loading states during data fetch
- ✅ Error states for failed requests
- ✅ URL parameter navigation (/instrument/:id)

### Data Integration
- ✅ Transform OHLCV data to chart format (`convertToCandlestickData`, `convertToVolumeData`)
- ✅ Calculate market stats from candles (high, low, volume, VWAP)
- ✅ Generate realistic OrderBook data (10 bids + 10 asks with depth)
- ✅ Pass data to all child components

## Test Results
```
Stream C Tests:
- useOHLCVData: 19 PASSING
- InstrumentDetail: 42 PASSING
- Total: 61 PASSING

Project Total: 792 PASSING
```

## Commits
1. ✅ `test(#29): RED phase - add failing tests for useOHLCVData hook`
2. ✅ `feat(#29): GREEN phase - implement useOHLCVData hook with passing tests`
3. ✅ `test(#29): RED phase - add failing tests for InstrumentDetail page`
4. ✅ `feat(#29): GREEN phase - implement InstrumentDetail page with all tests passing`
5. ✅ `feat(#29): add InstrumentDetail route to App.tsx`

## Component Integration

### Import Pattern
```typescript
import { CandlestickChart, TimeframeSelector } from '@/components/charts';
import { OrderBook, MarketStats } from '@/components/trading';
import { useInstrument, useOHLCVData } from '@/hooks/queries';
```

### Data Flow
```
URL Param (:id)
  → useInstrument(id) → Instrument data → Header display
  → useOHLCVData(id, timeframe) → Candlestick[]
    → convertToCandlestickData() → CandlestickChart
    → convertToVolumeData() → CandlestickChart (volume)
    → calculateMarketStats() → MarketStats
    → getCurrentPrice() → generateMockOrderBook() → OrderBook

Timeframe State
  → TimeframeSelector (selected prop)
  → useOHLCVData (refetch with new timeframe)
  → Chart updates with new data
```

## Code Quality

### TypeScript
- ✅ Strict type safety enforced
- ✅ All props properly typed
- ✅ Helper functions with clear type signatures

### Accessibility
- ✅ WCAG 2.1 AA compliance
- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

### Performance
- ✅ Auto-refresh interval (30s) for demo purposes
- ✅ Data transformation utilities prevent inline logic
- ✅ Responsive design with proper breakpoints
- ✅ Loading states prevent layout shifts

### Code Organization
- ✅ Helper functions extracted (`calculateMarketStats`, `generateMockOrderBook`)
- ✅ Clear separation of concerns
- ✅ Proper error handling
- ✅ Loading state management

## Integration with Streams A & B

**From Stream A** (Chart Components):
- ✅ `CandlestickChart` - Receives transformed candlestick + volume data
- ✅ `TimeframeSelector` - Manages timeframe state and triggers refetch

**From Stream B** (Trading Components):
- ✅ `OrderBook` - Receives generated bid/ask depth data
- ✅ `MarketStats` - Receives calculated statistics

**Data Transformation**:
- ✅ `convertToCandlestickData()` - OHLCV → TradingView format
- ✅ `convertToVolumeData()` - OHLCV → Volume histogram format
- ✅ `calculateMarketStats()` - OHLCV → Market statistics
- ✅ `generateMockOrderBook()` - Current price → Realistic order book

## Next Steps
Stream C is now **COMPLETE**. This completes all work for Issue #29:
- ✅ Stream A: Chart Infrastructure (42 tests passing)
- ✅ Stream B: Trading Components (70 tests passing)
- ✅ Stream C: Page Integration (61 tests passing)

**Total for Issue #29: 173 tests passing**

## Route Configuration
```typescript
// App.tsx
<Route path="/instrument/:id" element={<InstrumentDetail />} />

// Usage:
// Navigate to: /instrument/EUR_USD
// Navigate to: /instrument/GBP_USD
// etc.
```

## Notes

**Mock Data**:
- OHLCV data: Fetched from MSW handlers (uses realistic generators from Stream C data layer)
- OrderBook: Generated mock data based on current price and spread
- MarketStats: Calculated from OHLCV data (high, low, volume, VWAP)

**Real-time Updates**:
- `refetchInterval: 30000` (30 seconds) configured in useOHLCVData
- In production, would integrate WebSocket for true real-time updates
- Current implementation suitable for demo/development

**Responsive Design**:
- Mobile (< 1024px): Stack all components vertically
- Desktop (≥ 1024px):
  - MarketStats: Full width at top
  - Chart: 3 columns (75% width)
  - OrderBook: 1 column (25% width, sidebar)

**Success Metrics**:
- ✅ All components integrated successfully
- ✅ Data flows correctly from hooks to components
- ✅ Timeframe switching triggers data refetch
- ✅ Page renders on all screen sizes
- ✅ All 61 Stream C tests passing
- ✅ No breaking changes to Streams A & B
- ✅ Total project tests: 792 passing

**Issue #29 Status: COMPLETE ✅**
