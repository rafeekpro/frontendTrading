---
issue: 28
title: Dashboard page with instrument cards
analyzed: 2025-10-25T23:06:48Z
estimated_hours: 8
parallelization_factor: 2.5
---

# Parallel Work Analysis: Issue #28

## Overview
Create main Dashboard page featuring Squaber-style instrument cards with real-time trading data, QuickStats panel (P&L, positions, alerts), and search/filtering capabilities. This is the primary landing page for authenticated users.

## Parallel Streams

### Stream A: Core UI Components (InstrumentCard & QuickStats)
**Scope**: Visual components for displaying instruments and quick statistics
**Files**:
- `src/components/InstrumentCard.tsx` - Instrument card with sparkline
- `src/components/QuickStats.tsx` - P&L, positions, alerts panel
- `src/components/__tests__/InstrumentCard.test.tsx` - Card tests
- `src/components/__tests__/QuickStats.test.tsx` - Stats tests
- `src/lib/chart-utils.ts` - Sparkline utilities (if needed)

**Agent Type**: react-frontend-engineer
**Can Start**: immediately
**Estimated Hours**: 3 hours
**Dependencies**: none (can use mock data initially)

**Test Files**:
- InstrumentCard rendering with data
- Card click navigation
- Favorite toggle
- Sparkline chart display
- QuickStats calculations
- Responsive layout

**Deliverables**:
- InstrumentCard component:
  - Display: symbol, name, price, 24h change %
  - Mini sparkline chart (Recharts or lightweight-charts)
  - Hover effects and animations
  - Favorite star icon (watchlist toggle)
  - Click handler for navigation
  - Squaber-style design (dark theme, glassmorphism)
- QuickStats component:
  - Total P&L card
  - Open Positions count card
  - Active Alerts count card
  - Icons from lucide-react
  - Card grid layout
- Tests for both components

---

### Stream B: Search & Filter Infrastructure
**Scope**: Search bar, filter dropdown, and debounce hook
**Files**:
- `src/components/SearchBar.tsx` - Search input component
- `src/components/FilterDropdown.tsx` - Filter dropdown (All, Favorites, Forex, Crypto, Stocks)
- `src/hooks/use-debounce.ts` - Debounce hook (300ms)
- `src/components/__tests__/SearchBar.test.tsx` - Search tests
- `src/components/__tests__/FilterDropdown.test.tsx` - Filter tests
- `src/hooks/__tests__/use-debounce.test.ts` - Debounce hook tests

**Agent Type**: react-frontend-engineer
**Can Start**: immediately (parallel with Stream A)
**Estimated Hours**: 2 hours
**Dependencies**: none

**Test Files**:
- Search input with debounce
- Filter dropdown selection
- URL query params integration
- Debounce hook timing

**Deliverables**:
- SearchBar component:
  - Input field with icon
  - Debounced onChange (300ms)
  - Clear button
  - Accessible (ARIA labels)
- FilterDropdown component:
  - Multi-select or single-select dropdown
  - Options: All, Favorites, Forex, Crypto, Stocks
  - URL query params sync
  - Squaber-style design
- useDebounce hook:
  - Generic debounce utility
  - Configurable delay
  - Cleanup on unmount
- Tests for all components

---

### Stream C: Dashboard Page Integration
**Scope**: Main Dashboard page with layout, data fetching, and integration
**Files**:
- `src/pages/Dashboard.tsx` - Main dashboard page
- `src/pages/__tests__/Dashboard.test.tsx` - Page integration tests
- `src/App.tsx` - Add /dashboard route
- `src/lib/filter-utils.ts` - Filter and search logic utilities

**Agent Type**: react-frontend-engineer
**Can Start**: after Streams A & B complete (needs all components)
**Estimated Hours**: 3 hours
**Dependencies**: Streams A & B (needs InstrumentCard, QuickStats, SearchBar, FilterDropdown)

**Test Files**:
- Page rendering with data
- Search filtering integration
- Filter dropdown integration
- Grid layout responsive
- Loading states (skeleton cards)
- Empty states
- Error boundary
- Navigation on card click

**Deliverables**:
- Dashboard page:
  - Layout structure (QuickStats top, cards grid below)
  - Fetch instruments via `useInstruments()` from Issue #27
  - Search and filter logic
  - URL query params for filters (shareable links)
  - Grid layout (1 col mobile, 2 col tablet, 3-4 col desktop)
  - Loading states with skeleton cards
  - Empty state when no matches
  - Error boundary
- Route configuration at `/dashboard`
- Filter utilities (combine search + filters)
- Integration tests
- Responsive design

## Coordination Points

### Shared Files
**Low Risk Coordination**:
- `src/App.tsx` - Stream C adds route
  - **Risk**: None - only Stream C modifies
  - **Timing**: After Streams A & B complete

**No Shared Files**:
- All component files have single-stream ownership
- Stream A: InstrumentCard, QuickStats
- Stream B: SearchBar, FilterDropdown, useDebounce
- Stream C: Dashboard page, integration

### Sequential Requirements
**Recommended Flow**:
1. **Phase 1 (Parallel)**: Streams A & B run simultaneously
   - Stream A: Build card components (3 hours)
   - Stream B: Build search/filter components (2 hours)
   - Duration: 3 hours (max of both)

2. **Phase 2 (Integration)**: Stream C after A & B complete
   - Stream C: Dashboard page integration (3 hours)
   - Duration: 3 hours

**Why This Works**:
- Streams A & B are completely independent
- Stream C needs components from both A & B
- Clear dependency chain: (A & B) → C

### Dependency Chain
```
Stream A (Cards) ──────┐
                       ├──> Stream C (Dashboard Page)
Stream B (Search) ─────┘
```

## Conflict Risk Assessment
- **No Risk**: Complete file separation between A & B
- **No Risk**: Only Stream C integrates components
- **Low Risk**: App.tsx only modified by Stream C
- **No Risk**: All components have single-stream ownership

## Parallelization Strategy

**Recommended Approach**: Hybrid (Parallel A & B, then Sequential C)

### Execution Plan:

1. **Phase 1 (Parallel)**: Launch Streams A & B simultaneously
   - Stream A: Card components (3 hours)
   - Stream B: Search/filter components (2 hours)
   - **Duration**: 3 hours (parallel)

2. **Phase 2 (Sequential)**: Stream C after A & B complete
   - Stream C: Dashboard integration (3 hours)
   - **Duration**: 3 hours (sequential)

**Total Timeline**:
- Wall time: 3 + 3 = 6 hours
- Total work: 3 + 2 + 3 = 8 hours
- **Efficiency gain: 25%** (2 hours saved)

**Alternative (Not Recommended)**:
- Could start Stream C early with mock components
- Risk: Need to refactor when real components arrive
- Not worth the coordination overhead

## Expected Timeline

**With parallel execution (recommended hybrid):**
- Phase 1 (Streams A & B in parallel): 3 hours
- Phase 2 (Stream C sequential): 3 hours
- **Total wall time: 6 hours**
- Total work: 8 hours
- **Efficiency gain: 25%** (2 hours saved)

**Without parallel execution:**
- Sequential execution: 3 + 2 + 3 = 8 hours
- No efficiency gain

## TDD Cycle for Each Stream

All streams follow TDD:
1. 🔴 **RED**: Write failing tests first
2. ✅ **GREEN**: Implement minimal code to pass
3. ♻️ **REFACTOR**: Optimize and clean up

### Stream A TDD:
- RED: InstrumentCard tests, QuickStats tests
- GREEN: Implement components with Squaber design
- REFACTOR: Extract reusable styles, optimize renders

### Stream B TDD:
- RED: SearchBar tests, FilterDropdown tests, debounce tests
- GREEN: Implement search/filter components
- REFACTOR: Extract filter logic, optimize debounce

### Stream C TDD:
- RED: Dashboard integration tests, routing tests
- GREEN: Implement page with all components
- REFACTOR: Optimize data flow, prevent re-renders

## Technical Stack

**Dependencies** (may need to install):
- `recharts` OR `lightweight-charts` - For sparkline charts
- `lucide-react` - Icons (if not already installed)

**Existing Dependencies** (already in project):
- React + TypeScript
- TailwindCSS (for Squaber-style design)
- shadcn/ui (Card, Button, Input components)
- TanStack Query (useInstruments from Issue #27)
- React Router
- MSW (for testing)

**API Endpoints** (existing via MSW from Issue #27):
- GET /api/instruments - List all instruments (via useInstruments hook)

**Design Style**:
- **Squaber-inspired**: Dark theme, glassmorphism, subtle animations
- TailwindCSS classes for styling
- Responsive grid layout

## Component Specifications

### 1. InstrumentCard Component
```typescript
interface InstrumentCardProps {
  instrument: Instrument;
  onNavigate: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

function InstrumentCard({ instrument, onNavigate, onToggleFavorite }: InstrumentCardProps) {
  // Display:
  // - Symbol (large, bold)
  // - Name (smaller, gray)
  // - Current price (prominent)
  // - 24h change % (green/red with arrow)
  // - Sparkline chart (mini chart showing price history)
  // - Favorite star icon (top-right corner)
  //
  // Interactions:
  // - Click card → navigate to detail page
  // - Click star → toggle watchlist
  // - Hover → subtle scale animation
}
```

**Features**:
- Glassmorphism effect (backdrop-blur, semi-transparent background)
- Dark theme colors
- Sparkline chart (last 24h price data)
- Responsive padding and sizing
- Skeleton loader variant

### 2. QuickStats Component
```typescript
interface QuickStatsProps {
  totalPnL: number;
  openPositions: number;
  activeAlerts: number;
}

function QuickStats({ totalPnL, openPositions, activeAlerts }: QuickStatsProps) {
  // Display 3 cards:
  // 1. Total P&L (green/red based on value)
  // 2. Open Positions count
  // 3. Active Alerts count
  //
  // Each card has:
  // - Icon (lucide-react)
  // - Label
  // - Value (formatted)
  // - Optional subtitle
}
```

### 3. SearchBar Component
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const debouncedValue = useDebounce(value, 300);

  // Features:
  // - Input field with search icon
  // - Clear button (X) when value exists
  // - Debounced onChange (300ms)
  // - ARIA labels for accessibility
}
```

### 4. FilterDropdown Component
```typescript
type FilterOption = 'all' | 'favorites' | 'forex' | 'crypto' | 'stocks';

interface FilterDropdownProps {
  selected: FilterOption;
  onChange: (option: FilterOption) => void;
}

function FilterDropdown({ selected, onChange }: FilterDropdownProps) {
  // Options:
  // - All
  // - Favorites (from watchlist)
  // - Forex
  // - Crypto
  // - Stocks
  //
  // Features:
  // - Dropdown menu (shadcn/ui Select)
  // - URL query param sync
  // - Keyboard navigation
}
```

### 5. useDebounce Hook
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### 6. Dashboard Page
```typescript
function Dashboard() {
  const { data: instruments, isLoading, error } = useInstruments();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') || '');
    setFilter((params.get('filter') as FilterOption) || 'all');
  }, []);

  // Filter logic
  const filteredInstruments = useMemo(() => {
    return filterInstruments(instruments, search, filter);
  }, [instruments, search, filter]);

  // Layout:
  // 1. QuickStats (top)
  // 2. Search & Filter row
  // 3. InstrumentCard grid (responsive)
  //    - Loading: skeleton cards
  //    - Empty: "No instruments found"
  //    - Error: error boundary
}
```

## Notes

**Important Considerations:**

1. **Squaber Design Style**:
   - Dark theme (bg-gray-900, bg-gray-800)
   - Glassmorphism (backdrop-blur-md, bg-opacity-10)
   - Subtle animations (hover:scale-105, transition-all)
   - Gradient accents for highlights
   - Rounded corners (rounded-lg, rounded-xl)

2. **Sparkline Charts**:
   - Use Recharts `<Sparkline>` or lightweight-charts
   - Show last 24h price movement
   - Minimal axis (no labels, just line)
   - Green/red color based on direction

3. **Responsive Grid**:
   - Mobile: 1 column (grid-cols-1)
   - Tablet: 2 columns (md:grid-cols-2)
   - Desktop: 3-4 columns (lg:grid-cols-3 xl:grid-cols-4)
   - Gap between cards (gap-4, gap-6)

4. **Search & Filter Logic**:
   - Combine with AND logic (search AND filter)
   - Case-insensitive search
   - Search in: symbol, name
   - Filter by: instrument type OR favorites
   - Update URL query params for shareable links

5. **Testing Strategy**:
   - Component tests with React Testing Library
   - Test user interactions (click, search, filter)
   - Test responsive behavior (viewport changes)
   - Test loading/error states
   - Integration test for full dashboard flow

6. **Accessibility (a11y)**:
   - Keyboard navigation (Tab, Enter, Escape)
   - ARIA labels for search, filters, cards
   - Screen reader friendly
   - Focus indicators
   - Color contrast (WCAG AA)

7. **Performance**:
   - Memoize filtered instruments
   - Virtual scrolling for large lists (future enhancement)
   - Lazy load sparkline charts
   - Debounce search (300ms)
   - Prevent unnecessary re-renders (React.memo)

**Success Metrics**:
- Dashboard renders with live data
- Search filters instantly (debounced)
- Filter dropdown works
- Cards navigate to detail page
- Favorite toggle works
- Responsive on all screen sizes
- Loading states smooth
- All tests passing
- Matches Squaber design aesthetics

**Agent Coordination**:
- Streams A & B work independently on separate components
- Both follow TDD strictly
- Stream C integrates after A & B complete
- Each stream commits independently
- All commits follow TDD phase naming (RED/GREEN/REFACTOR)

**Future Enhancements** (not in this task):
- Virtual scrolling for performance
- Infinite scroll pagination
- Advanced filters (price range, volume range)
- Sort by: price, change %, volume
- Card size toggle (compact/expanded)
- Dark/light theme toggle
- Customizable dashboard layout (drag-and-drop)
