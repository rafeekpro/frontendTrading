---
issue: 30
title: Instruments list and watchlist management
analyzed: 2025-10-25T22:36:00Z
estimated_hours: 6
parallelization_factor: 2.0
---

# Parallel Work Analysis: Issue #30

## Overview
Create InstrumentsList page with search, filter, sort, and virtualization capabilities. Implement Watchlist page with drag-and-drop reordering and Zustand store for persistence. This provides traders with powerful tools to organize and monitor their preferred instruments.

## Parallel Streams

### Stream A: Zustand Watchlist Store & Data Layer
**Scope**: State management for watchlist, localStorage persistence, and data hooks
**Files**:
- `package.json` - Add zustand dependency
- `src/store/watchlist-store.ts` - Zustand store with persist middleware
- `src/hooks/use-watchlist.ts` - Hook to access watchlist store
- `src/types/watchlist.ts` - TypeScript types for watchlist
- `src/store/__tests__/watchlist-store.test.ts` - Store unit tests
- `src/hooks/__tests__/use-watchlist.test.tsx` - Hook tests

**Agent Type**: react-frontend-engineer
**Can Start**: immediately
**Estimated Hours**: 2 hours
**Dependencies**: none

**Test Files**:
- Store actions (add, remove, reorder)
- Persistence to localStorage
- Hook integration

**Deliverables**:
- Zustand store with:
  - State: `watchlist: string[]` (instrument IDs)
  - Actions: `addToWatchlist(id)`, `removeFromWatchlist(id)`, `reorderWatchlist(from, to)`
  - Persist middleware with localStorage sync
- `useWatchlist()` hook exposing store state and actions
- TypeScript types for watchlist operations
- Unit tests for all store actions
- Tests for localStorage persistence

---

### Stream B: InstrumentsList Page & UI Components
**Scope**: List page with search, filter, sort, virtualization
**Files**:
- `src/pages/InstrumentsList.tsx` - Main list page component
- `src/components/InstrumentRow.tsx` - Individual row component
- `src/components/SearchBar.tsx` - Search input with debounce
- `src/components/FilterDropdown.tsx` - Multi-select filter
- `src/components/SortButtons.tsx` - Column sort controls
- `src/lib/list-utils.ts` - Search/filter/sort utility functions
- `src/pages/__tests__/InstrumentsList.test.tsx` - Page integration tests
- `src/components/__tests__/InstrumentRow.test.tsx` - Row tests
- `src/components/__tests__/SearchBar.test.tsx` - Search tests

**Agent Type**: react-frontend-engineer
**Can Start**: immediately (parallel with Stream A)
**Estimated Hours**: 3 hours
**Dependencies**: none (can use mock watchlist initially)

**Test Files**:
- Search filtering with debounce
- Multi-filter combinations (type, exchange)
- Sort by columns (name, price, volume, change)
- Virtual scrolling with 500+ items
- Row click navigation
- Star icon click (watchlist toggle)

**Deliverables**:
- InstrumentsList page:
  - Fetch instruments via `useInstruments()` hook
  - Search bar with debounced filtering
  - Filter dropdowns (Asset Type, Exchange)
  - Sort controls (ascending/descending)
  - Virtual scrolling with `@tanstack/react-virtual`
  - Pagination fallback
- InstrumentRow component:
  - Display: symbol, name, type, price, 24h change, volume
  - Star icon for watchlist toggle
  - Click handler to navigate to detail page
  - Hover highlight
- SearchBar with debounce (300ms)
- FilterDropdown with multi-select
- SortButtons for column headers
- URL query params for shareable state

---

### Stream C: Watchlist Page & Drag-and-Drop
**Scope**: Watchlist display with reordering capability
**Files**:
- `package.json` - Add @dnd-kit/core dependency
- `src/pages/Watchlist.tsx` - Watchlist page with drag-and-drop
- `src/components/DraggableInstrumentRow.tsx` - Draggable row wrapper
- `src/components/EmptyWatchlist.tsx` - Empty state component
- `src/pages/__tests__/Watchlist.test.tsx` - Page tests
- `src/App.tsx` - Add routes for /instruments and /watchlist

**Agent Type**: react-frontend-engineer
**Can Start**: after Stream A completes (needs watchlist store)
**Estimated Hours**: 2 hours
**Dependencies**: Stream A (needs `useWatchlist` hook and store)

**Test Files**:
- Watchlist data fetching
- Drag-and-drop reordering
- Empty state display
- Persistence after reorder
- Navigation to detail page

**Deliverables**:
- Watchlist page:
  - Fetch watchlist IDs from Zustand store
  - Fetch full instrument data for watchlist items
  - Drag-and-drop with `@dnd-kit/core`
  - Update store on reorder
  - Empty state when watchlist is empty
- DraggableInstrumentRow component
- EmptyWatchlist component
- Route configuration:
  - `/instruments` - InstrumentsList page
  - `/watchlist` - Watchlist page
- Tests for drag-and-drop functionality
- Tests for watchlist persistence

## Coordination Points

### Shared Files
**Low Risk Coordination**:
- `package.json` - Multiple streams add dependencies
  - Stream A: zustand
  - Stream C: @dnd-kit/core
  - Stream B: @tanstack/react-virtual
  - **Risk**: Low - different dependencies, manageable
  - **Solution**: Coordinate timing or use separate commits

- `src/App.tsx` - Stream C adds routes
  - **Risk**: Low - only Stream C modifies
  - **Timing**: After Streams A & B complete

**Minimal Shared Files**:
- Stream B may reuse SearchBar/FilterDropdown if they exist from Task 002
- If not, Stream B creates them (no conflict)

### Sequential Requirements
**Recommended Flow**:
1. **Phase 1 (Parallel)**: Streams A & B run simultaneously
   - Stream A: Build Zustand store (2 hours)
   - Stream B: Build InstrumentsList page (3 hours)
   - Duration: 3 hours (max of both)

2. **Phase 2 (Sequential)**: Stream C after A completes
   - Stream C: Watchlist page (2 hours)
   - Duration: 2 hours
   - **Note**: Stream C needs watchlist store from A

**Why This Works**:
- Streams A & B are mostly independent
- Stream B can mock watchlist toggle during development
- Stream C needs real store from A for drag-and-drop persistence
- Clear dependency: A → C, B independent

### Dependency Chain
```
Stream A (Store) ──────┐
                       ├──> Stream C (Watchlist + Routes)
Stream B (List) ───────┘ (optional integration)
```

## Conflict Risk Assessment
- **Low Risk**: Package.json modifications (different dependencies)
- **Low Risk**: Streams A & B work on different files
- **Low Risk**: Stream C integrates after A completes
- **No Risk**: App.tsx only modified by Stream C at end
- **Minimal Risk**: Potential SearchBar/FilterDropdown reuse (manageable)

## Parallelization Strategy

**Recommended Approach**: Hybrid (Parallel A & B, then Sequential C)

### Execution Plan:

1. **Phase 1 (Parallel)**: Launch Streams A & B simultaneously
   - Stream A: Zustand store (2 hours)
   - Stream B: InstrumentsList page (3 hours)
   - **Duration**: 3 hours (parallel)

2. **Phase 2 (Sequential)**: Stream C after A completes
   - Stream C: Watchlist page + routes (2 hours)
   - **Duration**: 2 hours (sequential)

**Total Timeline**:
- Wall time: 3 + 2 = 5 hours
- Total work: 2 + 3 + 2 = 7 hours
- **Efficiency gain: 29%** (2 hours saved compared to pure sequential 7 hours)
- **Note**: Actual estimate is 6 hours, efficiency brings it to 5 hours

**Alternative (Not Recommended)**:
- Could delay Stream C's route integration to run fully parallel
- Risk: Integration complexity increases
- Not worth the minimal time saving

## Expected Timeline

**With parallel execution (recommended hybrid):**
- Phase 1 (Streams A & B in parallel): 3 hours
- Phase 2 (Stream C sequential): 2 hours
- **Total wall time: 5 hours**
- Total work: 7 hours (includes testing overhead)
- **Efficiency gain: 29%** (2 hours saved)

**Without parallel execution:**
- Sequential execution: 2 + 3 + 2 = 7 hours
- No efficiency gain

## TDD Cycle for Each Stream

All streams follow TDD:
1. 🔴 **RED**: Write failing tests first
2. ✅ **GREEN**: Implement minimal code to pass
3. ♻️ **REFACTOR**: Optimize and clean up

### Stream A TDD:
- RED: Store action tests, persistence tests
- GREEN: Implement Zustand store with actions
- REFACTOR: Optimize store selectors, add memoization

### Stream B TDD:
- RED: Search, filter, sort tests, virtualization tests
- GREEN: Implement InstrumentsList with all features
- REFACTOR: Extract utility functions, optimize re-renders

### Stream C TDD:
- RED: Drag-and-drop tests, persistence tests, route tests
- GREEN: Implement Watchlist page with dnd-kit
- REFACTOR: Optimize drag performance, improve accessibility

## Technical Stack

**Dependencies to Install**:
- `zustand` - State management library
- `@tanstack/react-virtual` - Virtual scrolling for performance
- `@dnd-kit/core` - Drag-and-drop library

**Existing Dependencies**:
- React + TypeScript
- TailwindCSS
- shadcn/ui (Card, Button, Input components)
- TanStack Query (from Issue #27)
- React Router
- MSW (for testing)

**API Endpoints** (existing via MSW):
- GET /api/instruments - List all instruments
- GET /api/instruments/:id - Single instrument details

**localStorage Keys**:
- `watchlist-store` - Persisted watchlist state

## Component Specifications

### 1. Zustand Watchlist Store
```typescript
interface WatchlistState {
  watchlist: string[]; // instrument IDs
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  reorderWatchlist: (fromIndex: number, toIndex: number) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (id) => set((state) => ({
        watchlist: [...state.watchlist, id]
      })),
      removeFromWatchlist: (id) => set((state) => ({
        watchlist: state.watchlist.filter(wId => wId !== id)
      })),
      reorderWatchlist: (from, to) => set((state) => {
        const newList = [...state.watchlist];
        const [moved] = newList.splice(from, 1);
        newList.splice(to, 0, moved);
        return { watchlist: newList };
      }),
      isInWatchlist: (id) => get().watchlist.includes(id),
    }),
    { name: 'watchlist-store' }
  )
);
```

### 2. InstrumentsList Page
```typescript
function InstrumentsList() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: [], exchange: [] });
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });

  const { data: instruments } = useInstruments();

  const filteredInstruments = useMemo(() => {
    return filterAndSortInstruments(instruments, search, filters, sort);
  }, [instruments, search, filters, sort]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      <FilterDropdown filters={filters} onChange={setFilters} />
      <VirtualizedInstrumentList
        instruments={filteredInstruments}
        sort={sort}
        onSortChange={setSort}
      />
    </div>
  );
}
```

### 3. InstrumentRow Component
```typescript
interface InstrumentRowProps {
  instrument: Instrument;
  onNavigate: (id: string) => void;
}

function InstrumentRow({ instrument, onNavigate }: InstrumentRowProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(instrument.id);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(instrument.id);
    } else {
      addToWatchlist(instrument.id);
    }
  };

  return (
    <div onClick={() => onNavigate(instrument.id)}>
      <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(); }}>
        {inWatchlist ? <StarFilled /> : <StarOutline />}
      </button>
      <span>{instrument.symbol}</span>
      <span>{instrument.name}</span>
      <span>{instrument.price}</span>
      <span className={instrument.change24h > 0 ? 'text-green' : 'text-red'}>
        {instrument.change24h}%
      </span>
      <span>{instrument.volume24h}</span>
    </div>
  );
}
```

### 4. Watchlist Page
```typescript
function Watchlist() {
  const { watchlist, reorderWatchlist } = useWatchlist();
  const { data: instruments } = useInstruments();

  const watchlistInstruments = useMemo(() => {
    return watchlist
      .map(id => instruments?.find(i => i.id === id))
      .filter(Boolean);
  }, [watchlist, instruments]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = watchlist.indexOf(active.id as string);
      const newIndex = watchlist.indexOf(over.id as string);
      reorderWatchlist(oldIndex, newIndex);
    }
  };

  if (watchlist.length === 0) {
    return <EmptyWatchlist />;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={watchlist}>
        {watchlistInstruments.map(instrument => (
          <DraggableInstrumentRow key={instrument.id} instrument={instrument} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### 5. SearchBar Component
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  return (
    <Input
      type="text"
      placeholder={placeholder || "Search by symbol, name, or exchange..."}
      defaultValue={value}
      onChange={(e) => debouncedOnChange(e.target.value)}
    />
  );
}
```

## Notes

**Important Considerations:**

1. **Performance with Large Lists**:
   - Use `@tanstack/react-virtual` for virtualization (500+ items)
   - Only render visible rows
   - Memoize filtered/sorted results
   - Debounce search input (300ms)

2. **Zustand Store Best Practices**:
   - Use `persist` middleware for localStorage sync
   - Keep store simple (only IDs, not full objects)
   - Fetch full data via TanStack Query
   - Use selectors for derived state

3. **Drag-and-Drop Implementation**:
   - Use `@dnd-kit/core` (better accessibility than react-beautiful-dnd)
   - Handle touch events for mobile
   - Optimize for smooth animations
   - Update store immediately on drop

4. **Search/Filter/Sort Logic**:
   - Combine all filters with AND logic
   - Search across multiple fields (symbol, name, exchange)
   - Case-insensitive search
   - URL query params for shareable state

5. **Testing Strategy**:
   - Mock Zustand store in component tests
   - Test store actions independently
   - Test persistence with localStorage mock
   - Test drag-and-drop with dnd-kit test utils
   - Test virtualization edge cases

6. **Accessibility**:
   - Keyboard navigation for drag-and-drop
   - ARIA labels for sort buttons
   - Screen reader announcements for watchlist changes
   - Focus management during reorder

7. **Error Handling**:
   - Handle missing instruments gracefully
   - Show error state if fetch fails
   - Validate watchlist IDs
   - Fallback if localStorage unavailable

**Success Metrics**:
- Search responds instantly (debounced)
- List scrolls smoothly with 500+ items
- Watchlist persists across page reloads
- Drag-and-drop works on touch devices
- All tests passing
- No memory leaks in virtualization

**Agent Coordination**:
- Stream A establishes store contract first
- Stream B can mock watchlist during development
- Stream C integrates real store after A completes
- All streams follow TDD strictly
- Each stream commits independently

**Future Enhancements** (not in this task):
- Advanced filters (price range, volume range)
- Custom sort expressions
- Save multiple watchlists
- Watchlist sharing
- Export watchlist to CSV
- Import watchlist from file
- Watchlist comparison view
