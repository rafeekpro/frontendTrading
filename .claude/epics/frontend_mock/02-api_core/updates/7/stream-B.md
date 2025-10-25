---
issue: 7
stream: Mock Data Generators
agent: javascript-frontend-engineer
started: 2025-10-25T19:24:10Z
completed: 2025-10-25T21:33:00Z
status: complete
---

# Stream B: Mock Data Generators

## Scope
Create realistic mock data generators for instruments and candlesticks

## Files Created
- ✅ `/src/types/trading.ts` - TypeScript interfaces (Instrument, Candlestick, Timeframe)
- ✅ `/src/mocks/data/instruments.ts` - Mock instrument data (14 instruments)
- ✅ `/src/mocks/data/candlesticks.ts` - OHLCV data generator with deterministic seeding
- ✅ `/src/mocks/__tests__/trading-types.test.ts` - 7 tests for type validation
- ✅ `/src/mocks/__tests__/instruments.test.ts` - 10 tests for instrument data
- ✅ `/src/mocks/__tests__/candlesticks.test.ts` - 11 tests for candlestick generator

## Implementation Summary

### 1. TypeScript Trading Interfaces (`/src/types/trading.ts`)
- Defined `Timeframe` type: M1, M5, M15, M30, H1, H4, D1
- Defined `InstrumentType` type: forex, index, commodity
- Created `Instrument` interface with complete trading instrument structure
- Created `Candlestick` interface for OHLCV data
- Created `CandlestickGeneratorConfig` for generator configuration

### 2. Mock Instruments Data (`/src/mocks/data/instruments.ts`)
- 14 realistic trading instruments:
  - **6 Forex pairs**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF, NZD/USD
  - **4 Indices**: S&P 500, NASDAQ 100, DAX 40, FTSE 100
  - **4 Commodities**: Gold, Silver, WTI Oil, Brent Oil
- Realistic spreads (1.5-2.2 pips for major forex pairs)
- Proper pip values (0.0001 for most pairs, 0.01 for JPY pairs)
- Helper functions: `getInstrumentById()`, `getInstrumentsByType()`, etc.

### 3. Candlestick Generator (`/src/mocks/data/candlesticks.ts`)
- **Deterministic seeded random** using Linear Congruential Generator
- Generates realistic OHLCV data with proper relationships
- Respects instrument precision (5 for forex, 2-3 for others)
- Configurable volatility by instrument type and timeframe
- Helper: `getTimeframeMilliseconds()` for timeframe conversion
- Bonus: `generateMultiTimeframeCandlesticks()` for multiple timeframes

### 4. Test Coverage
- **28 tests total** - All passing ✅
- **7 tests** for TypeScript interfaces
- **10 tests** for instruments data
- **11 tests** for candlestick generator
- Tests validate:
  - Type structures
  - Data realism
  - OHLC relationships
  - Deterministic generation
  - Timeframe intervals
  - Precision handling

## TDD Methodology Followed

Complete RED-GREEN-REFACTOR cycle:

1. **RED**: `test: add failing test for trading TypeScript interfaces (RED) #7`
2. **GREEN**: `feat(types): implement TypeScript trading interfaces (GREEN) #7`
3. **RED**: `test: add failing test for instruments mock data (RED) #7`
4. **GREEN**: `feat(mock-data): implement instruments mock data (GREEN) #7`
5. **RED**: `test: add failing test for candlestick generator (RED) #7`
6. **GREEN**: `feat(mock-data): implement candlestick OHLCV generator (GREEN) #7`
7. **REFACTOR**: `refactor(mock-data): improve code quality and fix lint issues (REFACTOR) #7`

## Quality Metrics
- ✅ **28 tests** - All passing
- ✅ **0 lint errors** in Stream B files
- ✅ **TypeScript strict mode** - No type errors
- ✅ **Code formatted** with Prettier
- ✅ **100% test coverage** for Stream B functionality
- ✅ **Deterministic data** - Same seed produces same results

## Integration for Stream A

Data generators are ready for import into MSW handlers:

```typescript
import { mockInstruments, getInstrumentById } from '../data/instruments';
import { generateCandlesticks } from '../data/candlesticks';
import type { Instrument, Candlestick, Timeframe } from '../../types/trading';
```

See `HANDOFF-STREAM-B-TO-A.md` for complete integration guide.

## Stream B Status: COMPLETE ✅

All deliverables implemented, tested, and ready for Stream A integration.
