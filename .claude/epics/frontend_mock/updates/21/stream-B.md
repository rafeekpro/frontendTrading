---
issue: 21
stream: Instrument & Market Data Generators
agent: javascript-frontend-engineer
started: 2025-10-25T22:06:00Z
status: in_progress
---

# Stream B: Instrument & Market Data Generators

## Scope
Generate realistic instruments (stocks, crypto, forex) and candlestick/OHLCV data with proper statistical distributions.

## Files
- `src/mocks/generators/instruments.ts` - Stock/crypto/forex generator
- `src/mocks/generators/candlesticks.ts` - OHLCV data with volatility
- `src/mocks/data/instruments.ts` - Update with generated data
- `src/mocks/data/candlesticks.ts` - Update with generated data

## Test Files
- `src/mocks/generators/__tests__/instruments.test.ts`
- `src/mocks/generators/__tests__/candlesticks.test.ts`

## Deliverables
- 50+ diverse instruments (30+ stocks, 15+ crypto, 10+ forex)
- Realistic candlestick data with multiple timeframes (1m, 5m, 1h, 1d)
- Price movements follow random walk with drift
- Volume follows log-normal distribution

## Dependencies
- ✅ Stream A completed (types and seed available)

## Progress
- Starting implementation
- Following TDD cycle: RED → GREEN → REFACTOR
