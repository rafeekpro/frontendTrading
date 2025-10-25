---
issue: 29
title: Instrument detail page with TradingView charts
analyzed: 2025-10-25T22:31:51Z
estimated_hours: 10
parallelization_factor: 2.5
---

# Parallel Work Analysis: Issue #29

## Overview
Create a comprehensive instrument detail page featuring professional-grade TradingView Lightweight Charts for candlestick visualization, OrderBook depth display, and MarketStats panel. Implement real-time updates, multiple timeframe support, and responsive design for a complete trading analysis experience.

## Parallel Streams

### Stream A: Chart Infrastructure & Visualization
**Scope**: TradingView Lightweight Charts integration, candlestick display, volume bars, and timeframe management
**Files**:
- `package.json` - Add lightweight-charts dependency
- `src/components/charts/CandlestickChart.tsx` - Main chart component
- `src/components/charts/TimeframeSelector.tsx` - Timeframe button group
- `src/components/charts/VolumeHistogram.tsx` - Volume bars component (if separate)
- `src/hooks/use-chart-config.ts` - Chart configuration hook
- `src/lib/chart-utils.ts` - Chart utility functions (theme, responsive)
- `src/components/charts/__tests__/CandlestickChart.test.tsx` - Chart tests
- `src/components/charts/__tests__/TimeframeSelector.test.tsx` - Selector tests

**Agent Type**: react-frontend-engineer
**Can Start**: immediately
**Estimated Hours**: 4 hours
**Dependencies**: none

**Test Files**:
- Chart rendering with data
- Timeframe switching
- Responsive behavior
- Volume display
- Zoom/pan functionality

**Deliverables**:
- `lightweight-charts` installed and configured
- CandlestickChart component with:
  - Dark theme configuration
  - Candlestick series
  - Volume histogram series
  - Responsive resizing
  - Zoom and pan controls
- TimeframeSelector component (1m, 5m, 15m, 1h, 4h, 1d)
- Chart updates when timeframe changes
- Loading states
- Error handling

---

### Stream B: Trading Data Components
**Scope**: OrderBook and MarketStats display components
**Files**:
- `src/components/trading/OrderBook.tsx` - Bid/ask depth visualization
- `src/components/trading/MarketStats.tsx` - Key metrics panel
- `src/components/trading/BidAskSpread.tsx` - Spread highlight component
- `src/components/trading/DepthBar.tsx` - Depth visualization bar
- `src/components/trading/__tests__/OrderBook.test.tsx` - OrderBook tests
- `src/components/trading/__tests__/MarketStats.test.tsx` - MarketStats tests

**Agent Type**: react-frontend-engineer
**Can Start**: immediately (parallel with Stream A)
**Estimated Hours**: 3 hours
**Dependencies**: none

**Test Files**:
- OrderBook rendering with bids/asks
- Depth visualization
- MarketStats calculations
- Data updates

**Deliverables**:
- OrderBook component:
  - Top 10 bids (green) and asks (red)
  - Depth bars showing cumulative volume
  - Best bid/ask spread highlight
  - Responsive table layout
- MarketStats component:
  - 24h High, Low, Volume
  - VWAP (Volume Weighted Average Price)
  - Open Interest
  - Auto-update from market data
  - Card-based layout

---

### Stream C: Page Integration & Real-time Updates
**Scope**: InstrumentDetail page, route setup, and real-time data flow
**Files**:
- `src/pages/InstrumentDetail.tsx` - Main page component
- `src/hooks/use-ohlcv-data.ts` - Fetch historical candlestick data
- `src/hooks/use-realtime-price.ts` - Real-time price updates (WebSocket or polling)
- `src/App.tsx` - Add /instrument/:id route
- `src/pages/__tests__/InstrumentDetail.test.tsx` - Page integration tests

**Agent Type**: react-frontend-engineer
**Can Start**: after Streams A & B complete (needs chart and trading components)
**Estimated Hours**: 3 hours
**Dependencies**: Streams A & B (needs CandlestickChart, OrderBook, MarketStats)

**Test Files**:
- Page rendering with URL param
- Data fetching integration
- Real-time updates
- Loading and error states
- Responsive layout

**Deliverables**:
- InstrumentDetail page:
  - Grid layout (Chart main, OrderBook sidebar, MarketStats top)
  - Fetch instrument data with `useInstrument(id)`
  - Fetch OHLCV data with `useOHLCVData(id, timeframe)`
  - Real-time price updates with `useRealtimePrice(id)`
- Route configuration at `/instrument/:id`
- Responsive layout (mobile, tablet, desktop)
- Loading states
- Error handling
- Integration with all components

## Coordination Points

### Shared Files
**Low Risk Coordination**:
- `package.json` - Stream A installs lightweight-charts
  - **Risk**: None - only Stream A modifies

- `src/App.tsx` - Stream C adds route
  - **Risk**: None - only Stream C modifies

**No Shared Files**:
- All component files have single-stream ownership
- Stream A: Chart components
- Stream B: Trading components
- Stream C: Page and integration

### Sequential Requirements
**Recommended Flow**:
1. **Phase 1 (Parallel)**: Streams A & B run simultaneously
   - Stream A: Build chart infrastructure (4 hours)
   - Stream B: Build trading components (3 hours)
   - Duration: 4 hours (max of both)

2. **Phase 2 (Integration)**: Stream C after A & B complete
   - Stream C: Page integration (3 hours)
   - Duration: 3 hours

**Why This Works**:
- Streams A & B are completely independent
- Stream C needs components from both A & B
- Clear dependency chain: (A & B) → C

### Dependency Chain
```
Stream A (Charts) ────┐
                      ├──> Stream C (Page Integration)
Stream B (Trading) ───┘
```

## Conflict Risk Assessment
- **No Risk**: Complete file separation between A & B
- **No Risk**: Only Stream C integrates components
- **Low Risk**: package.json only modified by Stream A
- **No Risk**: App.tsx only modified by Stream C

## Parallelization Strategy

**Recommended Approach**: Hybrid (Parallel A & B, then Sequential C)

### Execution Plan:

1. **Phase 1 (Parallel)**: Launch Streams A & B simultaneously
   - Stream A: Chart infrastructure (4 hours)
   - Stream B: Trading components (3 hours)
   - **Duration**: 4 hours (parallel)

2. **Phase 2 (Sequential)**: Stream C after A & B complete
   - Stream C: Page integration (3 hours)
   - **Duration**: 3 hours (sequential)

**Total Timeline**:
- Wall time: 4 + 3 = 7 hours
- Total work: 4 + 3 + 3 = 10 hours
- **Efficiency gain: 30%** (3 hours saved)

**Alternative (Not Recommended)**:
- Could start Stream C early with mock components
- Risk: Need to refactor when real components arrive
- Not worth the coordination overhead

## Expected Timeline

**With parallel execution (recommended hybrid):**
- Phase 1 (Streams A & B in parallel): 4 hours
- Phase 2 (Stream C sequential): 3 hours
- **Total wall time: 7 hours**
- Total work: 10 hours
- **Efficiency gain: 30%** (3 hours saved)

**Without parallel execution:**
- Sequential execution: 4 + 3 + 3 = 10 hours
- No efficiency gain

## TDD Cycle for Each Stream

All streams follow TDD:
1. 🔴 **RED**: Write failing tests first
2. ✅ **GREEN**: Implement minimal code to pass
3. ♻️ **REFACTOR**: Optimize and clean up

### Stream A TDD:
- RED: Chart rendering tests, timeframe tests, responsive tests
- GREEN: Implement CandlestickChart with lightweight-charts
- REFACTOR: Extract chart config, optimize re-renders

### Stream B TDD:
- RED: OrderBook tests, MarketStats tests
- GREEN: Implement trading components with data display
- REFACTOR: Extract reusable depth bars, optimize calculations

### Stream C TDD:
- RED: Page integration tests, route tests, real-time tests
- GREEN: Implement page with all components
- REFACTOR: Optimize data flow, prevent unnecessary re-renders

## Technical Stack

**Dependencies to Install**:
- `lightweight-charts` (latest) - TradingView chart library

**Existing Dependencies**:
- React + TypeScript
- TailwindCSS
- shadcn/ui (Card, Button components)
- TanStack Query (from Issue #27)
- React Router
- MSW (for testing)

**API Endpoints** (existing via MSW):
- GET /api/instruments/:id - Instrument details
- GET /api/instruments/:id/candles?timeframe=H1 - OHLCV data
- Real-time updates: useMarketData hook with refetchInterval

## Component Specifications

### 1. CandlestickChart Component
```typescript
interface CandlestickChartProps {
  data: Candlestick[];
  timeframe: Timeframe;
  loading?: boolean;
  onTimeframeChange?: (timeframe: Timeframe) => void;
}

function CandlestickChart(props: CandlestickChartProps) {
  // Initialize lightweight-charts
  // Add candlestick series
  // Add volume series
  // Handle responsive resizing
  // Update data when props change
}
```

**Features**:
- Dark theme
- Candlestick series (OHLC)
- Volume histogram below
- Zoom and pan
- Responsive to container size
- Loading skeleton

### 2. TimeframeSelector Component
```typescript
interface TimeframeSelectorProps {
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

function TimeframeSelector(props: TimeframeSelectorProps) {
  // Render button group
  // Highlight selected timeframe
  // Call onChange on click
}
```

### 3. OrderBook Component
```typescript
interface OrderBookProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
}

interface OrderBookEntry {
  price: number;
  volume: number;
  total: number; // Cumulative
}

function OrderBook(props: OrderBookProps) {
  // Display top 10 bids (green)
  // Display top 10 asks (red)
  // Show depth bars
  // Highlight best bid/ask
}
```

### 4. MarketStats Component
```typescript
interface MarketStatsProps {
  high24h: number;
  low24h: number;
  volume24h: number;
  vwap: number;
  openInterest?: number;
}

function MarketStats(props: MarketStatsProps) {
  // Display metrics in cards
  // Format numbers (K, M, B)
  // Color code (green/red for changes)
}
```

### 5. InstrumentDetail Page
```typescript
function InstrumentDetail() {
  const { id } = useParams();
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');

  const { data: instrument } = useInstrument(id);
  const { data: candles } = useOHLCVData(id, timeframe);
  const { data: marketData } = useRealtimePrice(id);

  // Render grid layout:
  // - MarketStats (top)
  // - CandlestickChart (main)
  // - OrderBook (sidebar)
}
```

## Notes

**Important Considerations:**

1. **Chart Performance**:
   - Lightweight Charts is highly optimized
   - Avoid unnecessary re-renders
   - Use React.memo for chart component
   - Throttle real-time updates

2. **Real-time Updates**:
   - Use TanStack Query's refetchInterval (5s)
   - Or implement WebSocket (future enhancement)
   - Update only changed data, not entire chart

3. **Responsive Design**:
   - Chart scales to container
   - OrderBook collapses on mobile (modal or bottom sheet)
   - MarketStats wraps on smaller screens

4. **Data Flow**:
   ```
   useInstrument(id) → Instrument info
   useOHLCVData(id, timeframe) → Historical candles
   useRealtimePrice(id) → Live price updates
   ```

5. **Testing Strategy**:
   - Mock lightweight-charts library in tests
   - Test component logic, not chart internals
   - Test data transformations
   - Test user interactions (timeframe change)

6. **Accessibility**:
   - Keyboard navigation for timeframe selector
   - Screen reader friendly data tables
   - ARIA labels for chart regions

7. **Error Handling**:
   - Show error state if data fetch fails
   - Fallback to last known data
   - Retry mechanism with TanStack Query

**Success Metrics**:
- Chart displays OHLCV data correctly
- Timeframe switching works smoothly
- OrderBook shows realistic bid/ask depth
- MarketStats update in real-time
- Responsive on all screen sizes
- No memory leaks (chart cleanup)
- All tests passing

**Agent Coordination**:
- Streams A & B work independently on separate components
- Both follow TDD strictly
- Stream C integrates after A & B complete
- Each stream commits independently
- All commits follow TDD phase naming (RED/GREEN/REFACTOR)

**Future Enhancements** (not in this task):
- Drawing tools (trend lines, Fibonacci)
- Technical indicators (MA, RSI, MACD)
- WebSocket real-time updates (replace polling)
- Multi-chart layout
- Chart pattern recognition
- Advanced order types display
