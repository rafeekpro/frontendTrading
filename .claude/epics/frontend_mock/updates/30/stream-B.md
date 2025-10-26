---
issue: 30
stream: InstrumentsList Page & UI Components
agent: react-frontend-engineer
started: 2025-10-26T09:36:07Z
status: in_progress
---

# Stream B: InstrumentsList Page & UI Components

## Scope
List page with search, filter, sort, virtualization

## Files
- `src/pages/InstrumentsList.tsx` - Main list page component
- `src/components/InstrumentRow.tsx` - Individual row component
- `src/components/SortButtons.tsx` - Column sort controls
- `src/lib/list-utils.ts` - Search/filter/sort utility functions
- `src/pages/__tests__/InstrumentsList.test.tsx` - Page integration tests
- `src/components/__tests__/InstrumentRow.test.tsx` - Row tests
- `src/components/__tests__/SortButtons.test.tsx` - Sort tests

## Progress
- Starting implementation with TDD
- Following RED-GREEN-REFACTOR cycle
- Can use existing SearchBar and FilterDropdown from Issue #28
