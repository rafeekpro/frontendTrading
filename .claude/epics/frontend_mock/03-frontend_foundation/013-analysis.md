---
issue: 13
title: Base layout components (Sidebar, Header, Footer)
analyzed: 2025-10-25T21:16:55Z
estimated_hours: 5
parallelization_factor: 2.5
---

# Parallel Work Analysis: Issue #13

## Overview
Implement foundational layout components (Sidebar, Header, Footer, Layout container) for the trading platform with responsive design, accessibility features, and shadcn/ui integration. This task involves creating four distinct components with comprehensive testing following TDD principles.

## Parallel Streams

### Stream A: Sidebar Component with Navigation
**Scope**: Implement collapsible sidebar with navigation menu, mobile drawer, and active state highlighting
**Files**:
- `src/components/layout/Sidebar.tsx` (new)
- `src/tests/components/layout/Sidebar.test.tsx` (new)
**Agent Type**: react-ui-expert
**Can Start**: immediately
**Estimated Hours**: 2.0 hours
**Dependencies**: none
**TDD Cycle**:
1. 🔴 RED: Write failing tests for Sidebar rendering, mobile drawer, navigation items, active state
2. 🟢 GREEN: Implement Sidebar with shadcn Sheet, NavigationMenu, lucide-react icons
3. 🔵 REFACTOR: Extract navigation state logic to custom hook if needed

**Key Implementation Details**:
- Use shadcn/ui Sheet for mobile drawer
- NavigationMenu for desktop layout
- Navigation items: Dashboard, Portfolio, Markets, Orders, Settings
- lucide-react icons for each item
- Active link detection with react-router
- Fixed 240px width on desktop
- Collapsible hamburger menu on mobile (<768px)
- ARIA labels and keyboard navigation

### Stream B: Header and Footer Components
**Scope**: Create Header with branding/profile dropdown and Footer with links
**Files**:
- `src/components/layout/Header.tsx` (new)
- `src/components/layout/Footer.tsx` (new)
- `src/tests/components/layout/Header.test.tsx` (new)
- `src/tests/components/layout/Footer.test.tsx` (new)
**Agent Type**: react-ui-expert
**Can Start**: immediately
**Estimated Hours**: 1.5 hours
**Dependencies**: none
**TDD Cycle**:
1. 🔴 RED: Write failing tests for Header/Footer rendering, responsive behavior
2. 🟢 GREEN: Implement Header with DropdownMenu, Footer with links
3. 🔵 REFACTOR: Clean up layout logic and styling

**Key Implementation Details - Header**:
- Logo/branding section
- Search bar placeholder (non-functional)
- User profile dropdown using shadcn DropdownMenu
- Theme toggle button placeholder
- Responsive: stacks on mobile
- Hamburger button for mobile (triggers Sidebar)

**Key Implementation Details - Footer**:
- Copyright information
- Links: Privacy, Terms, API Docs, Support
- Version number from environment variable
- Responsive flexbox layout with wrapping

### Stream C: Layout Container and Integration
**Scope**: Create Layout container component and integrate all layout parts with App.tsx
**Files**:
- `src/components/layout/Layout.tsx` (new)
- `src/components/layout/index.ts` (new - barrel export)
- `src/tests/components/layout/Layout.test.tsx` (new)
- `src/App.tsx` (update - wrap with Layout)
**Agent Type**: react-ui-expert
**Can Start**: after Stream A and B complete
**Estimated Hours**: 1.5 hours
**Dependencies**: Stream A, Stream B
**TDD Cycle**:
1. 🔴 RED: Write failing tests for Layout composition, children rendering, responsive grid
2. 🟢 GREEN: Implement Layout with CSS Grid, integrate Sidebar/Header/Footer
3. 🔵 REFACTOR: Optimize layout spacing and breakpoint logic

**Key Implementation Details**:
- Composition pattern for children
- CSS Grid for layout structure
- Integrates Sidebar, Header, Footer
- Content area with proper spacing
- Responsive breakpoints:
  - Mobile: <768px
  - Tablet: 768-1024px
  - Desktop: >1024px
- Accessibility: proper landmark roles

## Coordination Points

### Shared Files
None - streams work on completely different files

### Sequential Requirements
1. **Streams A & B can run in parallel** - no dependencies
2. **Stream C depends on A & B** - needs completed components to integrate
3. **All tests must follow TDD cycle** - write failing test first, then implement

### Component Integration Pattern
- Stream C imports from Streams A & B via barrel export (`index.ts`)
- Layout container uses composition pattern to wrap children
- Sidebar communicates collapse state to Layout via React Context (if needed)

## Conflict Risk Assessment
- **Low Risk**: Streams A & B work on entirely different files
- **No Shared Code**: Each component is independent
- **Integration Point**: Stream C handles all integration work after A & B complete
- **Test Independence**: Each component has isolated test files

## Parallelization Strategy

**Recommended Approach**: Hybrid (A & B parallel, then C sequential)

**Execution Plan**:
1. Launch Stream A (Sidebar) and Stream B (Header/Footer) simultaneously
2. Both streams can work independently without coordination
3. Wait for both A & B to complete and pass all tests
4. Launch Stream C (Layout container) to integrate components
5. Final verification with full integration tests

**Coordination Protocol**:
- No mid-stream coordination needed between A & B
- Stream C agent reviews completed A & B components before starting
- All streams follow strict TDD: RED → GREEN → REFACTOR

## Expected Timeline

**With parallel execution**:
- **Stream A**: 2.0 hours
- **Stream B**: 1.5 hours (runs parallel with A)
- **Stream C**: 1.5 hours (starts after A & B)
- **Wall time**: ~3.5 hours (max of A,B = 2h, then C = 1.5h)
- **Total work**: 5.0 hours
- **Efficiency gain**: 30% faster (5.0h → 3.5h)

**Without parallel execution** (sequential):
- Wall time: 5.0 hours (A → B → C)

**Parallelization Factor**: 2.5x
- Two streams (A & B) run simultaneously
- Third stream (C) is dependency-blocked

## Context7 Queries Required

**Before Implementation**:
- `/shadcn-ui/ui` - Sheet, NavigationMenu, DropdownMenu components
- `/testing-library/react-testing-library` - Component testing best practices
- `/facebook/react` - Composition patterns
- `/lucide-react` - Icon library usage

## Quality Checkpoints

**After Each Stream**:
- [ ] All TDD phases complete (RED → GREEN → REFACTOR)
- [ ] Unit tests passing with meaningful assertions
- [ ] Accessibility tests with jest-axe passing
- [ ] Responsive behavior verified at breakpoints (375px, 768px, 1440px)
- [ ] WCAG 2.1 Level AA compliance
- [ ] No ESLint/TypeScript errors
- [ ] Code formatted with Prettier

**Final Integration (Stream C)**:
- [ ] All components integrate cleanly
- [ ] Navigation state flows correctly
- [ ] Mobile drawer triggers work
- [ ] Layout responsive at all breakpoints
- [ ] All accessibility landmarks present
- [ ] Full test suite passing

## Notes

**Component Architecture**:
- Use shadcn/ui primitives (Sheet, DropdownMenu, NavigationMenu)
- Follow composition over configuration pattern
- Keep components pure and testable
- Extract complex logic to custom hooks

**Testing Strategy**:
- Write tests FIRST (TDD enforcement)
- Test user interactions, not implementation
- Use jest-axe for accessibility validation
- Mock react-router hooks for navigation testing
- Test responsive behavior with viewport resizing

**Accessibility Requirements**:
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Focus management for drawer open/close
- Skip navigation links for screen readers
- Color contrast meets WCAG AA standards

**Performance Considerations**:
- Lazy load icons if bundle size grows
- Memoize navigation menu if re-renders are expensive
- Consider virtual scrolling for very long nav lists (future)

**Dependencies Verified**:
- ✅ TailwindCSS configured (Task 001)
- ✅ shadcn/ui initialized (Task 001)
- ⚠️ lucide-react - needs installation before starting
- ⚠️ React Testing Library - needs configuration check
- ⚠️ jest-axe - needs installation for accessibility tests

**Risk Mitigation**:
- If Stream A or B takes longer than estimated, Stream C can still start with partial completion
- Each stream has clear boundaries - no surprise integration issues
- TDD ensures high test coverage from the start
- shadcn/ui components are well-documented and reliable
