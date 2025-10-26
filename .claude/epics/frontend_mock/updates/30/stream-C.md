---
issue: 30
stream: Watchlist Page & Drag-and-Drop
agent: react-frontend-engineer
started: 2025-10-26T09:50:00Z
status: in_progress
---

# Stream C: Watchlist Page & Drag-and-Drop

## Scope
Watchlist display with drag-and-drop reordering capability

## Files
- `package.json` - Add @dnd-kit/core dependency
- `src/pages/Watchlist.tsx` - Watchlist page with drag-and-drop
- `src/components/DraggableInstrumentRow.tsx` - Draggable row wrapper
- `src/components/EmptyWatchlist.tsx` - Empty state component
- `src/pages/__tests__/Watchlist.test.tsx` - Page tests
- `src/App.tsx` - Add routes for /instruments and /watchlist

## Dependencies
- Stream A completed ✅ (useWatchlist hook available)
- Stream B partially completed (InstrumentRow component available)

## Progress
- Starting implementation with TDD
- Following RED-GREEN-REFACTOR cycle
- Using real Zustand store from Stream A
