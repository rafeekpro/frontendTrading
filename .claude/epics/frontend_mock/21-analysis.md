---
issue: 21
title: Mock data generators (Faker.js + custom)
analyzed: 2025-10-25T21:46:04Z
estimated_hours: 8
parallelization_factor: 2.0
---

# Parallel Work Analysis: Issue #21

## Overview
Create comprehensive mock data generators using Faker.js to produce realistic trading data including 50+ instruments (stocks, crypto, forex), candlestick/OHLCV data, 1000+ trade history, positions, and opportunities with proper statistical distributions and TypeScript typing.

## Parallel Streams

### Stream A: Type Definitions & Foundation
**Scope**: Core TypeScript types and seeded random number generator
**Files**:
- `src/types/trading.ts` - Instrument, Candlestick, Trade, Position, Opportunity types
- `src/mocks/generators/seed.ts` - Seeded RNG for reproducibility
- `src/mocks/generators/index.ts` - Barrel export (initial setup)
- `package.json` - Add @faker-js/faker dependency

**Agent Type**: javascript-frontend-engineer
**Can Start**: immediately
**Estimated Hours**: 2 hours
**Dependencies**: none

**Test Files**:
- `src/mocks/generators/__tests__/seed.test.ts`
- `src/types/__tests__/trading.test.ts` (type validation tests)

**Deliverables**:
- Complete TypeScript interfaces for all data models
- Seeded RNG implementation with tests
- Faker.js installed and configured

---

### Stream B: Instrument & Market Data Generators
**Scope**: Generate instruments and candlestick/OHLCV data
**Files**:
- `src/mocks/generators/instruments.ts` - Stock/crypto/forex generator
- `src/mocks/generators/candlesticks.ts` - OHLCV data with volatility
- `src/mocks/data/instruments.ts` - Update with generated data
- `src/mocks/data/candlesticks.ts` - Update with generated data

**Agent Type**: javascript-frontend-engineer
**Can Start**: after Stream A completes
**Estimated Hours**: 3 hours
**Dependencies**: Stream A (needs types and seed)

**Test Files**:
- `src/mocks/generators/__tests__/instruments.test.ts`
- `src/mocks/generators/__tests__/candlesticks.test.ts`

**Deliverables**:
- 50+ diverse instruments (30+ stocks, 15+ crypto, 10+ forex)
- Realistic candlestick data with multiple timeframes (1m, 5m, 1h, 1d)
- Price movements follow random walk with drift
- Volume follows log-normal distribution

---

### Stream C: Trading Activity Generators
**Scope**: Generate trades, positions, and opportunities
**Files**:
- `src/mocks/generators/trades.ts` - Trade history with P&L
- `src/mocks/generators/positions.ts` - Open positions
- `src/mocks/generators/opportunities.ts` - Trading opportunities

**Agent Type**: javascript-frontend-engineer
**Can Start**: after Stream A completes
**Estimated Hours**: 3 hours
**Dependencies**: Stream A (needs types and seed)

**Test Files**:
- `src/mocks/generators/__tests__/trades.test.ts`
- `src/mocks/generators/__tests__/positions.test.ts`
- `src/mocks/generators/__tests__/opportunities.test.ts`

**Deliverables**:
- 1000+ historical trade records
- Trade data with timestamps, prices, quantities, P&L
- Open positions with unrealized P&L
- Trading opportunities with detection criteria
- Realistic win/loss ratio

## Coordination Points

### Shared Files
**Potential Conflicts**:
- `src/mocks/generators/index.ts` - Streams B & C both need to add exports
  - **Solution**: Stream B exports instruments+candlesticks, Stream C exports trades+positions+opportunities
  - **Risk**: Low - clear separation

- `package.json` - Stream A adds Faker.js
  - **Risk**: None - only Stream A modifies this

### Sequential Requirements
**Critical Path**:
1. **Stream A must complete first** - Provides types and seed needed by B & C
2. **Streams B & C can run in parallel** - Independent after Stream A
3. **Integration/Documentation** - After all streams complete

### Type Dependencies
All generators depend on:
- `Instrument` type (stocks, crypto, forex)
- `Candlestick` type (OHLCV data)
- `Trade` type (trade history)
- `Position` type (open positions)
- `Opportunity` type (trading signals)
- `Seeded RNG` function for reproducibility

## Conflict Risk Assessment
- **Low Risk Overall**: Clear file separation between streams
- **Medium Risk**: `index.ts` barrel export requires coordination
  - Mitigation: Use clear naming conventions, merge carefully
- **No Risk**: Streams B & C work on completely different files

## Parallelization Strategy

**Recommended Approach**: Hybrid (Sequential Stream A, then Parallel B & C)

### Execution Plan:
1. **Phase 1 (Sequential)**: Complete Stream A first
   - Establishes type foundation
   - Installs dependencies
   - Creates seed generator
   - Duration: 2 hours

2. **Phase 2 (Parallel)**: Launch Streams B & C simultaneously
   - Stream B: Instruments + Candlesticks (3 hours)
   - Stream C: Trades + Positions + Opportunities (3 hours)
   - Both run in parallel after Stream A completes
   - Duration: 3 hours (parallel)

3. **Phase 3 (Integration)**: Merge and test
   - Combine barrel exports
   - Integration tests
   - Documentation
   - Duration: included in stream estimates

## Expected Timeline

**With parallel execution:**
- Phase 1 (Stream A): 2 hours
- Phase 2 (Streams B & C in parallel): 3 hours
- **Total wall time: 5 hours**
- Total work: 8 hours
- **Efficiency gain: 37.5%** (3 hours saved)

**Without parallel execution:**
- Sequential execution: 2 + 3 + 3 = 8 hours
- No efficiency gain

## TDD Cycle for Each Stream

All streams follow TDD:
1. 🔴 **RED**: Write failing tests first
2. ✅ **GREEN**: Implement minimal code to pass
3. ♻️ **REFACTOR**: Optimize and clean up

### Stream A TDD:
- RED: Type validation tests, seed tests
- GREEN: Implement types and seed generator
- REFACTOR: Optimize type definitions

### Stream B TDD:
- RED: Instrument/candlestick generation tests
- GREEN: Implement generators with realistic data
- REFACTOR: Extract common patterns, optimize algorithms

### Stream C TDD:
- RED: Trade/position/opportunity generation tests
- GREEN: Implement generators with P&L logic
- REFACTOR: DRY up similar patterns, improve distribution

## Notes

**Important Considerations:**
1. **Faker.js Seed**: All generators must use the same seed for reproducibility
2. **Statistical Realism**: Price movements should follow financial market patterns
3. **Data Volume**: 50+ instruments, 1000+ trades requires efficient generation
4. **Type Safety**: All generators must be strongly typed
5. **Testing Strategy**: Each generator needs comprehensive tests for:
   - Data structure validation
   - Statistical distribution verification
   - Seed reproducibility
   - Edge cases (min/max values)

**Agent Coordination:**
- Stream A sets up the foundation - must complete first
- Streams B & C can work independently once types are ready
- All agents must follow TDD strictly (RED → GREEN → REFACTOR)
- Each stream commits independently with proper TDD commit messages

**Risk Mitigation:**
- Clear file ownership prevents conflicts
- Barrel export coordination handled in final integration
- Types defined upfront prevent API mismatches
- Seed generator ensures consistent results across all generators
