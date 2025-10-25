---
issue: 21
stream: Trading Activity Generators
agent: javascript-frontend-engineer
started: 2025-10-25T22:06:00Z
status: in_progress
---

# Stream C: Trading Activity Generators

## Scope
Generate trades, positions, and trading opportunities with realistic P&L and detection strategies.

## Files
- `src/mocks/generators/trades.ts` - Trade history with P&L
- `src/mocks/generators/positions.ts` - Open positions
- `src/mocks/generators/opportunities.ts` - Trading opportunities

## Test Files
- `src/mocks/generators/__tests__/trades.test.ts`
- `src/mocks/generators/__tests__/positions.test.ts`
- `src/mocks/generators/__tests__/opportunities.test.ts`

## Deliverables
- 1000+ historical trade records
- Trade data with timestamps, prices, quantities, P&L
- Open positions with unrealized P&L
- Trading opportunities with detection criteria
- Realistic win/loss ratio

## Dependencies
- ✅ Stream A completed (types and seed available)

## Progress
- Starting implementation
- Following TDD cycle: RED → GREEN → REFACTOR
