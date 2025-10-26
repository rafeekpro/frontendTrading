---
issue: 14
title: React Router v6 setup with lazy loading
analyzed: 2025-10-26T11:30:00Z
estimated_hours: 3
parallelization_factor: 1.0
---

# Task Analysis: Issue #14 - React Router v6 Setup

## Overview
Configure React Router v6 with code splitting and lazy loading for optimal bundle size and performance. Set up the complete route structure for the trading application with proper loading states and error boundaries.

## Current State Assessment

### Existing Routes (Already Implemented)
From previous tasks, we already have these routes working:
- ✅ `/dashboard` - Dashboard page (Task #28)
- ✅ `/instrument/:id` - Instrument detail page (Task #29)
- ✅ `/instruments` - Instruments list (Task #30)
- ✅ `/watchlist` - Watchlist page (Task #30)

### What Needs to Be Done
1. **Formalize Router Structure**:
   - Replace ad-hoc routes with proper React Router v6 configuration
   - Add lazy loading for code splitting
   - Add Suspense boundaries with loading fallbacks
   - Add error boundaries for route failures

2. **Create Missing Pages** (placeholders):
   - `/` - Redirect to `/dashboard`
   - `/portfolio` - Portfolio view (placeholder)
   - `/markets` - Markets overview (placeholder)
   - `/orders` - Order management (placeholder)
   - `/settings` - User settings (placeholder)
   - `*` - 404 Not Found page

3. **Create Loading/Error Components**:
   - LoadingSpinner with skeleton UI
   - ErrorFallback for error boundaries

4. **Update Sidebar**:
   - Use NavLink for active route highlighting
   - Integrate with new route structure

## Parallel Streams

### Single Stream Approach
**Why Sequential**: This is a foundational architectural change that touches many files. No parallelization needed.

**Estimated Time**: 3 hours

## Implementation Plan

### Phase 1: Router Configuration (1 hour)
**Files to create:**
- `src/router/index.tsx` - Router configuration with lazy loading
- `src/router/routes.ts` - Route constants and config
- `src/components/common/LoadingSpinner.tsx` - Loading fallback
- `src/components/common/ErrorFallback.tsx` - Error boundary component

**Tasks:**
1. Install react-router-dom v6 (if not already installed)
2. Create route configuration with React.lazy()
3. Define route constants for maintainability
4. Create loading and error fallback components

### Phase 2: Page Placeholders (1 hour)
**Files to create:**
- `src/pages/Portfolio.tsx` - Placeholder page
- `src/pages/Markets.tsx` - Placeholder page
- `src/pages/Orders.tsx` - Placeholder page
- `src/pages/Settings.tsx` - Placeholder page
- `src/pages/NotFound.tsx` - 404 page

**Tasks:**
1. Create simple placeholder pages with coming soon message
2. Add basic layout and styling
3. Ensure each page is lazy-loadable
4. Create 404 page with navigation back to dashboard

### Phase 3: Integration & Testing (1 hour)
**Files to update:**
- `src/App.tsx` - Replace current routes with new router config
- `src/components/layout/Sidebar.tsx` - Update to use NavLink
- `src/router/__tests__/routes.test.tsx` - Route navigation tests
- `src/router/__tests__/lazy-loading.test.tsx` - Code splitting tests

**Tasks:**
1. Integrate router into App.tsx
2. Update Sidebar with NavLink for active highlighting
3. Write comprehensive routing tests
4. Verify code splitting in build output
5. Test all navigation flows

## Technical Specifications

### Route Configuration Structure
```typescript
// src/router/routes.ts
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  INSTRUMENT: '/instrument/:id',
  INSTRUMENTS: '/instruments',
  WATCHLIST: '/watchlist',
  PORTFOLIO: '/portfolio',
  MARKETS: '/markets',
  ORDERS: '/orders',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
} as const;

export type RouteKey = keyof typeof ROUTES;
```

### Router Setup with Lazy Loading
```typescript
// src/router/index.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { ROUTES } from './routes';

// Lazy load pages (existing)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const InstrumentDetail = lazy(() => import('@/pages/InstrumentDetail'));
const InstrumentsList = lazy(() => import('@/pages/InstrumentsList'));
const Watchlist = lazy(() => import('@/pages/Watchlist'));

// Lazy load pages (new placeholders)
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Markets = lazy(() => import('@/pages/Markets'));
const Orders = lazy(() => import('@/pages/Orders'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.INSTRUMENT} element={<InstrumentDetail />} />
            <Route path={ROUTES.INSTRUMENTS} element={<InstrumentsList />} />
            <Route path={ROUTES.WATCHLIST} element={<Watchlist />} />
            <Route path={ROUTES.PORTFOLIO} element={<Portfolio />} />
            <Route path={ROUTES.MARKETS} element={<Markets />} />
            <Route path={ROUTES.ORDERS} element={<Orders />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
```

### LoadingSpinner Component
```typescript
// src/components/common/LoadingSpinner.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
```

### ErrorFallback Component
```typescript
// src/components/common/ErrorFallback.tsx
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={resetErrorBoundary} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Placeholder Page Template
```typescript
// src/pages/Portfolio.tsx (example)
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Portfolio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="text-center max-w-md mx-auto mt-20">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Portfolio
        </h1>
        <p className="text-gray-400 mb-6">
          Coming soon! This page is under construction.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
```

### 404 Page
```typescript
// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <SearchX className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-2xl text-gray-400 mb-6">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Sidebar Update (NavLink)
```typescript
// src/components/layout/Sidebar.tsx (update)
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/router/routes';

// ... existing code ...

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Instruments', href: ROUTES.INSTRUMENTS, icon: TrendingUp },
  { name: 'Watchlist', href: ROUTES.WATCHLIST, icon: Star },
  { name: 'Portfolio', href: ROUTES.PORTFOLIO, icon: Package },
  { name: 'Markets', href: ROUTES.MARKETS, icon: Globe },
  { name: 'Orders', href: ROUTES.ORDERS, icon: FileText },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

// Replace <a> with <NavLink>
{navigation.map((item) => (
  <NavLink
    key={item.name}
    to={item.href}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      )
    }
  >
    <item.icon className="w-5 h-5" />
    <span>{item.name}</span>
  </NavLink>
))}
```

## Testing Strategy

### Unit Tests
1. **Route Configuration Tests**:
   - Test all routes are defined
   - Test route constants match paths
   - Test lazy loading components

2. **Navigation Tests**:
   - Test navigation between pages
   - Test redirect from `/` to `/dashboard`
   - Test 404 page for unknown routes
   - Test back navigation

3. **Loading State Tests**:
   - Test Suspense fallback displays
   - Test error boundary catches errors
   - Test error recovery

4. **Active Link Tests**:
   - Test NavLink active class
   - Test current route highlighting

### Integration Tests
1. Full navigation flow
2. Deep linking (direct URL access)
3. Browser back/forward buttons
4. Code splitting verification

### Performance Tests
1. Bundle size analysis (build output)
2. Lazy chunk sizes (<50KB each)
3. Initial bundle size (<100KB)

## TDD Cycle

### Phase 1: Route Configuration
1. **RED**: Write failing tests for route navigation
2. **GREEN**: Implement router with lazy loading
3. **REFACTOR**: Extract route config to separate file

### Phase 2: Placeholder Pages
1. **RED**: Write failing tests for page rendering
2. **GREEN**: Create placeholder pages
3. **REFACTOR**: Extract common placeholder template

### Phase 3: Integration
1. **RED**: Write failing tests for Sidebar NavLink
2. **GREEN**: Update Sidebar with NavLink
3. **REFACTOR**: Optimize route structure

## Dependencies

### Existing Dependencies
- ✅ React 18 (with Suspense support)
- ✅ Layout components (Task #13)
- ✅ TailwindCSS (Task #12)
- ✅ shadcn/ui components
- ✅ Existing pages (Dashboard, InstrumentDetail, InstrumentsList, Watchlist)

### New Dependencies
- react-router-dom v6 (may need to install or upgrade)
- react-error-boundary (for ErrorBoundary component)

## Success Criteria

- ✅ All routes working with lazy loading
- ✅ Code splitting verified (separate chunks)
- ✅ Suspense fallback displays during load
- ✅ Error boundary catches route errors
- ✅ 404 page for unknown routes
- ✅ Active route highlighting in Sidebar
- ✅ All navigation tests passing
- ✅ Bundle size optimized (<100KB initial, <50KB chunks)
- ✅ TDD cycle followed strictly

## Expected Outcomes

**Files Created**: ~10 files
- 1 router config
- 1 routes constants
- 2 common components (LoadingSpinner, ErrorFallback)
- 5 placeholder pages
- 1 404 page
- Test files

**Tests Created**: ~30 tests
- Route navigation tests (~10)
- Lazy loading tests (~5)
- Error boundary tests (~5)
- NavLink tests (~5)
- Integration tests (~5)

**Code Splitting**:
- Initial bundle: ~80KB (with existing pages lazy)
- Lazy chunks: ~30-40KB each
- Total improvement: ~40% smaller initial load

## Notes

**Important Considerations:**

1. **Existing Routes**: We already have working routes in App.tsx. This task formalizes them with proper lazy loading and error handling.

2. **Backward Compatibility**: Must not break existing navigation. All current routes must continue working.

3. **Placeholder Pages**: Keep them simple. They're just for structure, not functionality yet.

4. **Performance**: Focus on code splitting and lazy loading. This is the main goal.

5. **Testing**: Comprehensive routing tests are critical. Router is foundational infrastructure.

6. **Error Handling**: Error boundaries prevent entire app crashes from route failures.

**Future Enhancements** (not in scope):
- Protected routes with authentication
- Route-based permissions
- Breadcrumb navigation
- Route transitions/animations
- Deep linking with state
- Query params handling (already done in some pages)

---

**Analysis Complete**: Ready for implementation with clear single-stream approach.
