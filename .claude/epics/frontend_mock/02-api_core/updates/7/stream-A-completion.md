---
stream: A
title: MSW Setup & Core Handlers - COMPLETION
issue: 7
completed: 2025-10-25T21:35:00Z
agent: javascript-frontend-engineer
---

# Stream A Completion: MSW Setup & Core Handlers

## Summary

Successfully implemented Mock Service Worker (MSW) setup with comprehensive instruments API handlers following Test-Driven Development principles.

## Completed Tasks

### 1. MSW Installation & Setup ✅
- Installed MSW v2.x as dev dependency
- Initialized MSW service worker in `/public/mockServiceWorker.js`
- Updated `package.json` with MSW configuration

### 2. TypeScript Types ✅
**File**: `/src/types/trading.ts`
- Created complete type definitions for trading data
- Defined: `Instrument`, `Candlestick`, `Timeframe`, `InstrumentType`
- Added API response types: `InstrumentsResponse`, `InstrumentResponse`, `CandlesticksResponse`, `ErrorResponse`
- All types fully documented with JSDoc comments

### 3. MSW Browser Worker ✅
**File**: `/src/mocks/browser.ts`
- Created browser worker setup function
- Implemented development-only initialization
- Added proper logging for MSW startup

### 4. Handler Registry ✅
**File**: `/src/mocks/handlers/index.ts`
- Created central handler export point
- Structured for easy addition of future handlers
- Clean separation of concerns

### 5. Instruments API Handlers ✅
**File**: `/src/mocks/handlers/instruments.ts`
- Implemented 3 complete REST endpoints:
  - `GET /api/instruments` - List all instruments
  - `GET /api/instruments/:id` - Single instrument details
  - `GET /api/instruments/:id/candlesticks?timeframe=X` - OHLCV data

**Features**:
- Request validation (instrument ID, timeframe parameter)
- Proper error responses (400, 404) with structured error objects
- CORS headers on all responses
- Placeholder data for 3 major forex pairs (EUR/USD, GBP/USD, USD/JPY)
- Generates realistic candlestick data (will be replaced by Stream B generators)

**Handler Order**: Correctly ordered from most specific to least specific to avoid route conflicts

### 6. Main.tsx Integration ✅
**File**: `/src/main.tsx`
- Added MSW initialization before React app bootstrap
- Development-only conditional loading
- Proper async/await handling
- Error catching for MSW startup failures

### 7. Comprehensive Tests ✅
**File**: `/src/mocks/__tests__/instruments-handlers.test.ts`
- 15 passing tests covering all endpoints
- Tests validate:
  - Response structures
  - Status codes
  - Error handling
  - Request validation
  - OHLCV data integrity
  - CORS headers
  - Content-Type headers

**TDD Cycle Followed**:
1. RED: Created failing tests first
2. GREEN: Implemented handlers to pass tests
3. REFACTOR: Improved code quality and fixed linting

## Test Results

```
✓ src/mocks/__tests__/trading-types.test.ts (7 tests)
✓ src/mocks/__tests__/instruments-handlers.test.ts (15 tests)
─────────────────────────────────────────────────
Test Files: 2 passed (2)
Tests: 22 passed (22)
```

## Quality Checks

- ✅ All tests passing
- ✅ ESLint passing (no errors)
- ✅ TypeScript type checking passing
- ✅ Code formatted with Prettier
- ✅ No console warnings (except development MSW logs)

## Files Created/Modified

### Created:
1. `/src/types/trading.ts` - TypeScript type definitions
2. `/src/mocks/browser.ts` - MSW browser worker
3. `/src/mocks/handlers/index.ts` - Handler registry
4. `/src/mocks/handlers/instruments.ts` - Instruments API handlers
5. `/src/mocks/__tests__/instruments-handlers.test.ts` - Handler tests
6. `/public/mockServiceWorker.js` - MSW service worker (generated)

### Modified:
1. `/src/main.tsx` - Added MSW initialization
2. `/package.json` - Added MSW dependency and test scripts

## Integration with Stream B

**Placeholder Data**: Currently using simple placeholder data in handlers. Stream B has created sophisticated data generators that should be integrated:

### Integration Steps (Future):
1. Import `mockInstruments` from `/src/mocks/data/instruments.ts`
2. Import `generateCandlesticks` from `/src/mocks/data/candlesticks.ts`
3. Replace `PLACEHOLDER_INSTRUMENTS` array with `mockInstruments`
4. Replace `generatePlaceholderCandlesticks()` function with Stream B's generator

**Example Integration**:
```typescript
// In src/mocks/handlers/instruments.ts
import { mockInstruments } from '../data/instruments';
import { generateCandlesticks } from '../data/candlesticks';

// Replace PLACEHOLDER_INSTRUMENTS
const INSTRUMENTS = mockInstruments;

// Replace generatePlaceholderCandlesticks
function getCandlesticks(instrumentId: string, timeframe: Timeframe) {
  const instrument = findInstrument(instrumentId);
  return generateCandlesticks({
    instrument,
    timeframe,
    count: 100
  });
}
```

## API Endpoints Available

### GET /api/instruments
Returns list of all available instruments
```json
{
  "instruments": [
    {
      "id": "EUR_USD",
      "name": "Euro / US Dollar",
      "symbol": "EUR/USD",
      "type": "forex",
      "spread": 0.00015,
      "pip_value": 0.0001,
      "min_trade_size": 0.01,
      "max_trade_size": 100,
      "precision": 5
    }
  ]
}
```

### GET /api/instruments/:id
Returns single instrument details
- Success: 200 with instrument object
- Error: 404 if instrument not found

### GET /api/instruments/:id/candlesticks?timeframe=H1
Returns OHLCV candlestick data
- **Required**: `timeframe` query parameter
- **Valid timeframes**: M1, M5, M15, M30, H1, H4, D1
- Success: 200 with candlesticks array
- Errors:
  - 400 if timeframe missing or invalid
  - 404 if instrument not found

## Development Usage

### Start Development Server
```bash
docker compose up -d
docker compose exec app npm run dev
```

MSW will automatically start in development mode and intercept API calls.

### Run Tests
```bash
docker compose exec app npm test
```

### Check Types
```bash
docker compose exec app npm run typecheck
```

### Lint Code
```bash
docker compose exec app npm run lint
```

## Known Limitations

1. **Placeholder Data**: Currently using minimal placeholder data for 3 forex pairs. Stream B has created comprehensive mock data that should be integrated.

2. **Candlestick Generation**: Using simple random generation. Stream B has implemented sophisticated OHLCV generation with realistic price movements.

3. **Browser-Only**: MSW setup is browser-only. If SSR or Node.js testing is needed, additional setup required.

## Next Steps

1. **Integration**: Integrate Stream B's mock data generators
2. **Enhancement**: Add more instrument types (indices, commodities)
3. **Features**: Consider adding:
   - Rate limiting simulation
   - Network delay simulation
   - Random error injection for testing
4. **Documentation**: Add API documentation in README

## Commits

Following TDD RED-GREEN-REFACTOR cycle, changes were committed in multiple stages:
- RED: Tests created first (instruments-handlers.test.ts)
- GREEN: Handlers implemented to pass tests
- REFACTOR: Code quality improvements and lint fixes

All commits tagged with issue #7.

## Success Criteria Met

✅ MSW installed and initialized
✅ Browser worker configured
✅ Handler structure created
✅ All endpoints respond correctly
✅ Tests validate MSW intercepts requests
✅ Main.tsx initializes MSW in dev mode
✅ Zero lint/type errors

## Handoff Status

🟢 **COMPLETE** - Stream A work finished successfully. Ready for integration with Stream B's mock data generators.
