---
issue: 17
title: Authentication context and hooks
analyzed: 2025-10-26T10:33:22Z
estimated_hours: 5
parallelization_factor: 2.0
---

# Parallel Work Analysis: Issue #17

## Overview
Create React context and hooks for authentication state management. This task builds on top of the existing MSW auth handlers (task 001) and follows the same pattern as the existing ThemeProvider. The work can be split into two parallel streams: tests and implementation, following TDD principles.

## Parallel Streams

### Stream A: Test Suite for Authentication Context
**Scope**: Write comprehensive test suite for AuthContext, useAuth hook, and ProtectedRoute wrapper
**Files**:
- `src/contexts/__tests__/AuthContext.test.tsx` (create)
- `src/hooks/__tests__/useAuth.test.tsx` (create)
- `src/components/__tests__/ProtectedRoute.test.tsx` (create)

**Agent Type**: frontend-testing-engineer
**Can Start**: immediately
**Estimated Hours**: 2.5
**Dependencies**: none

**Test Coverage**:
1. AuthContext provider tests
   - Provides auth state to children
   - Initializes with null user
   - Updates state on login
   - Clears state on logout
   - Persists token to localStorage

2. useAuth hook tests
   - Returns current auth state
   - Throws error when used outside provider
   - login() function updates state and calls API
   - logout() function clears state and calls API
   - Token refresh on mount (if token exists)

3. ProtectedRoute wrapper tests
   - Renders children when authenticated
   - Redirects to /login when not authenticated
   - Preserves return URL in redirect
   - Shows loading state during auth check

### Stream B: Implementation of Authentication Context
**Scope**: Implement AuthContext provider, useAuth hook, login/logout functions, and ProtectedRoute wrapper
**Files**:
- `src/contexts/AuthContext.tsx` (create)
- `src/hooks/useAuth.ts` (create)
- `src/components/ProtectedRoute.tsx` (create)
- `src/types/auth.ts` (create - if needed for types)

**Agent Type**: react-frontend-engineer
**Can Start**: after Stream A creates failing tests (TDD RED phase)
**Estimated Hours**: 2.5
**Dependencies**: Stream A (must have failing tests first)

**Implementation Requirements**:
1. AuthContext with state:
   - `user: User | null`
   - `token: string | null`
   - `loading: boolean`
   - `error: string | null`

2. AuthProvider component:
   - Initialize from localStorage token
   - Validate token on mount (call GET /api/auth/me)
   - Provide login function (POST /api/auth/login)
   - Provide logout function (POST /api/auth/logout)
   - Store token in localStorage
   - Clear token on logout

3. useAuth custom hook:
   - Return auth state and functions
   - Throw error if used outside provider

4. ProtectedRoute component:
   - Check authentication status
   - Redirect to /login if not authenticated
   - Render children if authenticated
   - Show loading spinner during check

## Coordination Points

### Shared Files
None - streams work on different files

### Sequential Requirements (TDD Cycle)
**CRITICAL: This task MUST follow TDD cycle**

1. **RED Phase** (Stream A): Write failing tests first
   - All test files must be created
   - All tests must FAIL initially
   - Commit: "test(#17): add failing tests for AuthContext"

2. **GREEN Phase** (Stream B): Implement to pass tests
   - Write MINIMUM code to make tests pass
   - Run tests continuously
   - Commit: "feat(#17): implement AuthContext and useAuth hook"

3. **REFACTOR Phase** (Stream B): Clean up code
   - Optimize performance (useMemo/useCallback)
   - Improve code structure
   - Extract reusable logic
   - All tests must stay GREEN
   - Commit: "refactor(#17): optimize AuthContext performance"

### Integration Points
- Uses existing MSW auth handlers from `src/mocks/handlers/auth.ts`
- Follows pattern from `ThemeProvider.tsx` for context structure
- Token format must match MSW handler expectations
- API endpoints:
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/me

## Conflict Risk Assessment
- **Low Risk**: Streams work on different files initially
- **No conflicts**: Stream B cannot start until Stream A completes (TDD enforcement)
- **Clean coordination**: Tests define the contract, implementation follows

## Parallelization Strategy

**Recommended Approach**: Sequential (TDD-enforced)

**Execution Plan**:
1. Launch Stream A (testing-engineer) to write failing tests
2. Wait for Stream A to complete and commit failing tests
3. Verify tests FAIL when run
4. Launch Stream B (react-frontend-engineer) to implement
5. Stream B makes tests GREEN
6. Stream B refactors while keeping tests GREEN

**Why Sequential?**
- TDD requires tests BEFORE implementation
- No parallelization possible while maintaining TDD discipline
- This ensures quality and prevents "code without tests"

## Expected Timeline

With TDD sequential execution:
- Stream A (Tests): 2.5 hours
- Stream B (Implementation): 2.5 hours
- **Total wall time**: 5 hours
- **Total work**: 5 hours
- **Efficiency gain**: None (TDD prevents parallelization, but ensures quality)

## Notes

### Pattern Reference
Follow the exact same pattern as `ThemeProvider.tsx`:
- Context creation with `createContext`
- Provider component with state management
- Custom hook with error checking
- Export both provider and hook

### Type Safety
Use TypeScript strictly:
- Define User interface (from MSW handlers)
- Define AuthContextType interface
- Define all function signatures
- No `any` types

### Error Handling
Implement robust error handling:
- Network errors during login/logout
- Invalid tokens
- Token expiration
- API errors from MSW handlers

### Testing Requirements
- Use React Testing Library (already available)
- Use MSW handlers (already implemented)
- Test all user interactions
- Test error states
- Test loading states
- Achieve >90% coverage

### localStorage Keys
- Token: `auth_token`
- User: `auth_user` (optional, can reconstruct from token)

### Security Notes
- This is a MOCK implementation for frontend development
- Real production app would need:
  - HTTPS only
  - HttpOnly cookies
  - CSRF protection
  - Token refresh mechanism
  - Secure token storage
