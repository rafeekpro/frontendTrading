---
issue: 7
from: Stream B (Mock Data Generators)
to: Stream A (MSW Handlers)
status: complete
handoff_date: 2025-10-25T21:33:00Z
---

# Stream B → Stream A Handoff Document

## Stream B Completion Summary

Stream B (Mock Data Generators) has been **COMPLETED** following TDD (RED-GREEN-REFACTOR) methodology.

### Deliverables

#### 1. TypeScript Trading Interfaces
**Location**: `/src/types/trading.ts`

**Exports**:
- `Timeframe` type: `'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1'`
- `InstrumentType` type: `'forex' | 'index' | 'commodity'`
- `Instrument` interface: Complete trading instrument structure
- `Candlestick` interface: OHLCV data structure
- `CandlestickGeneratorConfig` interface: Configuration for generator

**Usage**:
```typescript
import type { Instrument, Candlestick, Timeframe } from '../../types/trading';
```

#### 2. Mock Instruments Data
**Location**: `/src/mocks/data/instruments.ts`

**Exports**:
- `mockInstruments: Instrument[]` - Array of 14 realistic instruments
  - 6 Forex pairs: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF, NZD/USD
  - 4 Indices: S&P 500, NASDAQ 100, DAX 40, FTSE 100
  - 4 Commodities: Gold, Silver, WTI Oil, Brent Oil

**Helper Functions**:
- `getInstrumentById(id: string): Instrument | undefined`
- `getInstrumentsByType(type: InstrumentType): Instrument[]`
- `getForexPairs(): Instrument[]`
- `getIndices(): Instrument[]`
- `getCommodities(): Instrument[]`

**Usage Example**:
```typescript
import { mockInstruments, getInstrumentById } from '../data/instruments';

// Get all instruments
const instruments = mockInstruments;

// Get specific instrument
const eurUsd = getInstrumentById('EUR_USD');
```

#### 3. Candlestick Data Generator
**Location**: `/src/mocks/data/candlesticks.ts`

**Exports**:
- `generateCandlesticks(config: CandlestickGeneratorConfig): Candlestick[]`
  - Generates realistic OHLCV data
  - **Deterministic** with seed parameter
  - Proper OHLC relationships enforced
  - Respects instrument precision
  - Realistic volatility by instrument type

- `getTimeframeMilliseconds(timeframe: Timeframe): number`
  - Converts timeframe to milliseconds

- `generateMultiTimeframeCandlesticks(config, timeframes): Record<Timeframe, Candlestick[]>`
  - Generate data for multiple timeframes at once

**Usage Example**:
```typescript
import { generateCandlesticks } from '../data/candlesticks';
import { getInstrumentById } from '../data/instruments';

const eurUsd = getInstrumentById('EUR_USD');
if (!eurUsd) throw new Error('Instrument not found');

const candlesticks = generateCandlesticks({
  instrument: eurUsd,
  timeframe: 'H1',
  count: 100,
  seed: 12345, // Optional: for deterministic output
});
```

### Test Coverage

All functionality is **100% tested** with 28 passing tests:

- **Trading Types Tests** (7 tests): `/src/mocks/__tests__/trading-types.test.ts`
- **Instruments Tests** (10 tests): `/src/mocks/__tests__/instruments.test.ts`
- **Candlesticks Tests** (11 tests): `/src/mocks/__tests__/candlesticks.test.ts`

Run tests:
```bash
npm test -- src/mocks/__tests__/trading-types.test.ts
npm test -- src/mocks/__tests__/instruments.test.ts
npm test -- src/mocks/__tests__/candlesticks.test.ts
```

### Key Features

1. **Deterministic Generation**: Use seed parameter for consistent test data
2. **Realistic Data**: 
   - Proper forex spreads (1.5-2.2 pips for majors)
   - Correct pip values (0.0001 for most pairs, 0.01 for JPY)
   - Realistic base prices and volatility
3. **Type Safety**: Full TypeScript support with strict types
4. **OHLC Validation**: All candlesticks enforce proper high/low/open/close relationships
5. **Precision Handling**: Respects instrument precision (5 for forex, 2-3 for others)

## Integration Points for Stream A

### 1. Import Instrument Data

```typescript
// In your MSW handlers file
import { mockInstruments, getInstrumentById } from '../data/instruments';
import type { Instrument } from '../../types/trading';

// GET /api/instruments - Return all instruments
http.get('/api/instruments', () => {
  return HttpResponse.json({ 
    instruments: mockInstruments 
  });
});

// GET /api/instruments/:id - Return single instrument
http.get('/api/instruments/:id', ({ params }) => {
  const { id } = params;
  const instrument = getInstrumentById(id as string);
  
  if (!instrument) {
    return new HttpResponse(null, { status: 404 });
  }
  
  return HttpResponse.json({ instrument });
});
```

### 2. Generate Candlestick Data

```typescript
// In your MSW handlers file
import { generateCandlesticks, getTimeframeMilliseconds } from '../data/candlesticks';
import { getInstrumentById } from '../data/instruments';
import type { Timeframe } from '../../types/trading';

// GET /api/instruments/:id/candlesticks?timeframe=H1
http.get('/api/instruments/:id/candlesticks', ({ params, request }) => {
  const { id } = params;
  const url = new URL(request.url);
  const timeframe = url.searchParams.get('timeframe') as Timeframe;
  
  // Validate timeframe
  const validTimeframes: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
  if (!timeframe || !validTimeframes.includes(timeframe)) {
    return HttpResponse.json(
      { error: 'Invalid timeframe' },
      { status: 400 }
    );
  }
  
  // Get instrument
  const instrument = getInstrumentById(id as string);
  if (!instrument) {
    return new HttpResponse(null, { status: 404 });
  }
  
  // Generate candlesticks
  const candlesticks = generateCandlesticks({
    instrument,
    timeframe,
    count: 100,
    seed: 12345, // Use consistent seed for testing
  });
  
  return HttpResponse.json({ candlesticks });
});
```

### 3. Type Safety

All handlers should use the TypeScript types:

```typescript
import type { Instrument, Candlestick, Timeframe } from '../../types/trading';
```

## Testing Recommendations

### Test Handler Responses

```typescript
// Verify instruments endpoint returns correct structure
const response = await fetch('/api/instruments');
const data = await response.json();
expect(data.instruments).toHaveLength(14);
expect(data.instruments[0]).toHaveProperty('id');
expect(data.instruments[0]).toHaveProperty('symbol');

// Verify candlesticks endpoint
const response = await fetch('/api/instruments/EUR_USD/candlesticks?timeframe=H1');
const data = await response.json();
expect(data.candlesticks).toHaveLength(100);
expect(data.candlesticks[0]).toHaveProperty('timestamp');
expect(data.candlesticks[0]).toHaveProperty('open');
expect(data.candlesticks[0]).toHaveProperty('high');
expect(data.candlesticks[0]).toHaveProperty('low');
expect(data.candlesticks[0]).toHaveProperty('close');
expect(data.candlesticks[0]).toHaveProperty('volume');
```

## Commit History (TDD Cycle)

Stream B followed strict TDD methodology:

1. ✅ `test: add failing test for trading TypeScript interfaces (RED) #7`
2. ✅ `feat(types): implement TypeScript trading interfaces (GREEN) #7`
3. ✅ `test: add failing test for instruments mock data (RED) #7`
4. ✅ `feat(mock-data): implement instruments mock data (GREEN) #7`
5. ✅ `test: add failing test for candlestick generator (RED) #7`
6. ✅ `feat(mock-data): implement candlestick OHLCV generator (GREEN) #7`
7. ✅ `refactor(mock-data): improve code quality and fix lint issues (REFACTOR) #7`

## Quality Metrics

- ✅ **28 tests** - All passing
- ✅ **0 lint errors** in Stream B files
- ✅ **TypeScript strict mode** - No type errors
- ✅ **Code formatted** with Prettier
- ✅ **100% test coverage** for Stream B functionality
- ✅ **Deterministic data** - Same seed produces same results

## Next Steps for Stream A

1. Import mock data generators into your MSW handlers
2. Implement the three endpoints:
   - `GET /api/instruments`
   - `GET /api/instruments/:id`
   - `GET /api/instruments/:id/candlesticks?timeframe=X`
3. Add request validation
4. Test integration with mock data
5. Register handlers in MSW setup

## Questions / Issues

If you need to modify the data structure or add new features:
- Data generators are in `/src/mocks/data/`
- Types are in `/src/types/trading.ts`
- All changes should be test-driven (RED-GREEN-REFACTOR)

## Stream B Complete ✅

All deliverables ready for Stream A integration. No blocking issues.
