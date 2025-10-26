---
issue: 37
title: E2E testing
analyzed: 2025-10-26T13:11:21Z
estimated_hours: 6
parallelization_factor: 2.0
---

# Parallel Work Analysis: Issue #37

## Overview
Set up Playwright for end-to-end testing with complete trading workflow tests and visual regression testing. This task focuses on **Playwright configuration in Docker** (not Playwright MCP which we already used for manual testing).

## Current State Assessment

### Existing E2E Testing Experience
We already successfully used **Playwright MCP** for manual E2E testing in issue #17:
- ✅ Tested authentication flow (login, logout, protected routes)
- ✅ Created 5 screenshots documenting auth flow
- ✅ Verified MSW integration works with browser
- ✅ Manual browser automation experience gained

### What's Missing for Automated E2E Tests
- ❌ Playwright npm package not installed
- ❌ No `playwright.config.ts` configuration file
- ❌ No automated test files (`*.spec.ts` or `*.e2e.ts`)
- ❌ No CI/CD integration for automated runs
- ❌ No visual regression baseline images
- ❌ No Docker configuration for Playwright

### Dependencies to Install
```json
{
  "@playwright/test": "^1.48.0",
  "playwright": "^1.48.0"
}
```

### Context7 Best Practices Applied
From `/microsoft/playwright` documentation:
- Use Playwright Docker images for consistency
- Run tests in containers with `--ipc=host` for Chromium
- Configure visual regression with `toHaveScreenshot()`
- Use global setup for authentication state
- Store auth in `storageState` file
- Configure `playwright.config.ts` for baseURL, projects, and reporters

## Parallel Streams

### Stream A: Playwright Configuration & Docker Setup
**Scope**: Install Playwright, configure for Docker-first development, set up test infrastructure

**Files**:
- `package.json` (MODIFY) - Add @playwright/test, playwright
- `playwright.config.ts` (NEW) - Main Playwright configuration
- `.gitignore` (MODIFY) - Add test-results/, playwright-report/
- `docker-compose.yml` (MODIFY) - Add playwright service (optional)
- `tests/e2e/setup/global-setup.ts` (NEW) - Global auth setup
- `tests/e2e/setup/auth.setup.ts` (NEW) - Authentication storage state

**Agent Type**: `docker-containerization-expert`
**Can Start**: immediately
**Estimated Hours**: 2h
**Dependencies**: none

**Tasks**:
1. Install Playwright in Docker: `docker compose run --rm app npm install -D @playwright/test`
2. Install browsers: `docker compose run --rm app npx playwright install --with-deps chromium`
3. Create `playwright.config.ts`:
   - baseURL: `http://localhost:5173`
   - Use Docker-compatible paths
   - Configure projects (chromium, firefox, webkit)
   - Set up reporters (html, json)
   - Configure screenshots/videos on failure
4. Create global setup for auth:
   - Login with demo credentials
   - Save storageState to `tests/e2e/.auth/user.json`
5. Update .gitignore for test artifacts
6. Document Docker commands for running tests

**Acceptance Criteria**:
- [ ] Playwright installed and configured
- [ ] Can run `docker compose run --rm app npx playwright test --help`
- [ ] Global auth setup working
- [ ] Config file validates (`npx playwright test --list`)

---

### Stream B: Trading Workflow E2E Tests
**Scope**: Write automated E2E tests for complete trading workflow

**Files**:
- `tests/e2e/auth.spec.ts` (NEW) - Authentication flow tests
- `tests/e2e/trading-workflow.spec.ts` (NEW) - Complete trading workflow
- `tests/e2e/navigation.spec.ts` (NEW) - Navigation and routing tests
- `tests/e2e/instruments.spec.ts` (NEW) - Instruments list and detail tests

**Agent Type**: `frontend-testing-engineer`
**Can Start**: after Stream A completes (needs Playwright config)
**Estimated Hours**: 2.5h
**Dependencies**: Stream A (needs playwright.config.ts and global setup)

**Tasks**:
1. **Auth Flow Tests** (`auth.spec.ts`):
   - Login with valid credentials
   - Login with invalid credentials (error handling)
   - Logout flow
   - Protected route redirect
   - Session persistence

2. **Trading Workflow Tests** (`trading-workflow.spec.ts`):
   - Login → Navigate to instruments → Select instrument → View details
   - Add instrument to watchlist
   - Remove from watchlist
   - Search instruments
   - Filter instruments by type

3. **Navigation Tests** (`navigation.spec.ts`):
   - Sidebar navigation works
   - Header links work
   - Mobile menu (if implemented)
   - Breadcrumbs (if implemented)

4. **Instruments Tests** (`instruments.spec.ts`):
   - List loads with data
   - Search filters work
   - Sorting works
   - Pagination (if implemented)
   - Detail page shows correct data

**Acceptance Criteria**:
- [ ] All test scenarios implemented
- [ ] Tests use Page Object Model pattern
- [ ] Tests pass in headless mode
- [ ] Tests work in Docker environment

---

### Stream C: Visual Regression Tests
**Scope**: Implement visual regression testing for key pages

**Files**:
- `tests/e2e/visual/pages.visual.spec.ts` (NEW) - Page screenshots
- `tests/e2e/visual/components.visual.spec.ts` (NEW) - Component screenshots
- `tests/e2e/visual/__screenshots__/` (DIR) - Baseline images
- `playwright.config.ts` (MODIFY) - Add visual regression settings

**Agent Type**: `frontend-testing-engineer`
**Can Start**: after Stream A completes (needs Playwright config)
**Estimated Hours**: 1.5h
**Dependencies**: Stream A (needs playwright.config.ts)

**Tasks**:
1. Configure visual regression in `playwright.config.ts`:
   - Set `maxDiffPixels` threshold
   - Configure screenshot options
   - Set up update snapshots mode

2. Create visual tests for pages:
   - Login page (different states: empty, error, loading)
   - Register page
   - Dashboard
   - Instruments list
   - Instrument detail
   - Watchlist

3. Create visual tests for components:
   - PasswordStrengthIndicator (all strength levels)
   - Header (authenticated vs unauthenticated)
   - Sidebar
   - InstrumentCard

4. Generate baseline screenshots:
   - Run tests with `--update-snapshots`
   - Commit baseline images to repo

**Acceptance Criteria**:
- [ ] Visual tests for all key pages
- [ ] Visual tests for key components
- [ ] Baseline screenshots generated
- [ ] Tests detect visual changes correctly

---

## Coordination Points

### Shared Files
- `package.json` - Stream A (add Playwright dependencies)
- `playwright.config.ts` - Stream A creates, Stream C modifies for visual settings
- `.gitignore` - Stream A (add test artifacts)

### Sequential Requirements
1. **Stream A first**: Must complete Playwright setup before B & C can start
2. **Streams B & C in parallel**: Once A is done, B and C can work independently
3. **No conflicts**: B works on workflow tests, C works on visual tests (different directories)

### Docker Integration
All Playwright commands must run in Docker:
```bash
# Install Playwright
docker compose run --rm app npm install -D @playwright/test

# Install browsers
docker compose run --rm app npx playwright install --with-deps chromium

# Run tests
docker compose run --rm app npx playwright test

# Run tests in headed mode (for debugging)
docker compose run --rm app npx playwright test --headed

# Update visual snapshots
docker compose run --rm app npx playwright test --update-snapshots

# Show HTML report
docker compose run --rm app npx playwright show-report
```

## Conflict Risk Assessment
- **Low Risk**: Streams work on different directories
  - Stream A: config files
  - Stream B: `tests/e2e/*.spec.ts` (workflow tests)
  - Stream C: `tests/e2e/visual/*.spec.ts` (visual tests)
- **No Conflicts**: Clear separation of responsibilities

## Parallelization Strategy

**Recommended Approach**: Sequential-then-Parallel (Hybrid)

**Phase 1 (Sequential)**:
- Complete Stream A (Playwright setup in Docker)
- Time: 2 hours

**Phase 2 (Parallel)**:
- Launch Streams B & C simultaneously after A completes
- Time: max(2.5h, 1.5h) = 2.5 hours

## Expected Timeline

### With parallel execution:
- **Wall time**: 2h (Stream A) + 2.5h (max of B & C in parallel) = **4.5 hours**
- **Total work**: 2h + 2.5h + 1.5h = 6 hours
- **Efficiency gain**: 25% time savings

### Without parallel execution:
- **Wall time**: 2h + 2.5h + 1.5h = **6 hours**

## TDD Workflow

Since this is about **test infrastructure setup**, the TDD approach is slightly different:

### Stream A (Infrastructure)
```bash
# 1. Install Playwright
docker compose run --rm app npm install -D @playwright/test

# 2. Verify installation
docker compose run --rm app npx playwright --version

# 3. Create config
touch playwright.config.ts

# 4. Validate config
docker compose run --rm app npx playwright test --list

# 5. Install browsers
docker compose run --rm app npx playwright install --with-deps chromium

# 6. Create global setup
mkdir -p tests/e2e/setup
touch tests/e2e/setup/global-setup.ts

# 7. Test global setup works
docker compose run --rm app npx playwright test --global-setup
```

### Stream B & C (Test Files)
Follow standard TDD but for **test code**:
1. Write E2E test scenario
2. Run test (should interact with app)
3. Refine selectors and assertions
4. Add waits and error handling
5. Verify test passes consistently

## Integration with Existing Work

### Leverage Previous E2E Testing (Issue #17)
We already tested these flows manually with Playwright MCP:
- ✅ Login flow
- ✅ Protected routes
- ✅ Logout flow
- ✅ Instruments list navigation

**Reuse Strategy**: Convert manual MCP tests to automated Playwright tests in Stream B.

### MSW Integration
All E2E tests will use existing MSW handlers:
- `src/mocks/handlers/auth.ts` - Authentication endpoints
- `src/mocks/handlers/instruments.ts` - Instruments data
- `src/mocks/handlers/trading.ts` - Trading operations

MSW will intercept network requests in the browser during E2E tests.

## Notes

### Docker-First Development
**CRITICAL**: All Playwright commands MUST run inside Docker container.

Example workflow:
```bash
# Run all E2E tests
docker compose run --rm app npx playwright test

# Run specific test file
docker compose run --rm app npx playwright test tests/e2e/auth.spec.ts

# Run tests in UI mode (for development)
docker compose run --rm app npx playwright test --ui

# Debug specific test
docker compose run --rm app npx playwright test --debug

# Update visual snapshots
docker compose run --rm app npx playwright test --update-snapshots
```

### Playwright vs Playwright MCP
- **Playwright MCP**: Manual browser automation tool (used in issue #17 for exploration)
- **Playwright @playwright/test**: Automated test framework (this issue)
- Both use same Playwright core but different purposes

### Visual Regression Best Practices
- Mask dynamic content (timestamps, IDs)
- Disable animations for consistency
- Use `fullPage: true` for page screenshots
- Set reasonable `maxDiffPixels` threshold (e.g., 100)
- Commit baseline screenshots to version control
- Update snapshots only when UI changes are intentional

### CI/CD Considerations (Future)
While not part of this issue, the setup should enable:
- GitHub Actions integration
- Parallel test execution across multiple workers
- Test result artifacts (videos, screenshots, traces)
- HTML report publishing

### Files Created/Modified Summary

**New Files (11+)**:
- `playwright.config.ts`
- `tests/e2e/setup/global-setup.ts`
- `tests/e2e/setup/auth.setup.ts`
- `tests/e2e/auth.spec.ts`
- `tests/e2e/trading-workflow.spec.ts`
- `tests/e2e/navigation.spec.ts`
- `tests/e2e/instruments.spec.ts`
- `tests/e2e/visual/pages.visual.spec.ts`
- `tests/e2e/visual/components.visual.spec.ts`
- `tests/e2e/.auth/user.json` (generated)
- Baseline screenshots (multiple files)

**Modified Files (3)**:
- `package.json` (add Playwright dependencies)
- `.gitignore` (add test artifacts)
- `docker-compose.yml` (optional: add playwright service)

### Success Criteria
- [ ] All 3 streams completed
- [ ] Playwright configured for Docker-first development
- [ ] Complete trading workflow tested
- [ ] Visual regression tests for key pages/components
- [ ] All tests passing in Docker environment
- [ ] HTML test report generated
- [ ] Documentation for running tests

---
**Analysis completed**: 2025-10-26T13:11:21Z
**Ready for**: `/pm:issue-start 37`
