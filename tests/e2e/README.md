# End-to-End Testing with Playwright

This directory contains E2E tests using Playwright for automated browser testing.

## 🐳 Docker vs Local Execution

### ⚠️ Important Limitation: Alpine Linux + Playwright

**The Alpine-based Docker container cannot run Playwright browsers.** Alpine Linux lacks the system dependencies required by Chromium/Firefox/WebKit.

### Option 1: Run Tests Locally (Recommended for Development)

Install Playwright browsers on your host machine and run tests directly:

```bash
# Install browsers once (outside Docker)
npx playwright install --with-deps chromium

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test by grep
npx playwright test --grep "should login"

# Debug specific test
npx playwright test --debug

# Show HTML report
npx playwright show-report
```

### Option 2: Use Playwright Docker Image (CI/CD)

For CI/CD pipelines, use the official Playwright Docker image:

```bash
# Using official Playwright image
docker run --rm \
  -v $(pwd):/work \
  -w /work \
  --ipc=host \
  mcr.microsoft.com/playwright:v1.48.0-focal \
  npx playwright test
```

Or in GitHub Actions:

```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.48.0-focal
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Run E2E tests
        run: npx playwright test
```

### Why Not Docker Compose?

The development Docker container uses Alpine Linux for smaller image size. While this works great for development, Playwright requires a full Linux distribution (Ubuntu/Debian) with system libraries. Running tests locally is the fastest and simplest approach for development.

## 📁 Directory Structure

```
tests/e2e/
├── README.md                    # This file
├── setup/
│   ├── global-setup.ts         # Global authentication setup (runs once)
│   └── auth.setup.ts           # Authentication helpers (future)
├── .auth/
│   ├── .gitkeep                # Directory marker
│   └── user.json               # Generated auth state (gitignored)
├── auth.spec.ts                # Authentication flow tests (Stream B)
├── trading-workflow.spec.ts    # Trading workflow tests (Stream B)
├── navigation.spec.ts          # Navigation tests (Stream B)
├── instruments.spec.ts         # Instruments tests (Stream B)
└── visual/
    ├── pages.visual.spec.ts    # Page visual regression (Stream C)
    └── components.visual.spec.ts # Component visual regression (Stream C)
```

## 🔐 Authentication Setup

The `global-setup.ts` script runs ONCE before all tests to:
1. Navigate to `/login`
2. Fill credentials: `user@example.com` / `Password123`
3. Submit login form (mocked by MSW)
4. Wait for redirect to `/dashboard`
5. Save authentication state to `tests/e2e/.auth/user.json`

All tests automatically load this authenticated state, so they don't need to log in individually.

## 🎯 Configuration

See `playwright.config.ts` in the project root for:
- Base URL: `http://localhost:5173`
- Projects: chromium (firefox/webkit available)
- Reporters: html, json, list
- Screenshots/videos on failure
- Trace on retry

## 📊 Test Reports

After running tests, view the HTML report:

```bash
docker compose run --rm app npx playwright show-report
```

Reports are generated in:
- `playwright-report/` - HTML report (gitignored)
- `test-results/` - JSON results, screenshots, videos (gitignored)

## 🧪 Writing Tests

Tests should follow Playwright best practices:

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to instruments page', async ({ page }) => {
  // Navigate using baseURL
  await page.goto('/dashboard');

  // Click navigation link
  await page.click('a[href="/instruments"]');

  // Assert navigation succeeded
  await expect(page).toHaveURL('/instruments');

  // Assert page content loaded
  await expect(page.locator('h1')).toContainText('Instruments');
});
```

## 📋 Test Coverage

### auth.spec.ts (16 tests)

**Authentication Flow Tests:**
- ✅ Login with valid credentials
- ✅ Login with invalid credentials (error handling)
- ✅ Validation errors (missing email, missing password)
- ✅ Navigation to register page
- ✅ Logout flow
- ✅ Session clearing after logout
- ✅ Protected route redirects (dashboard, instruments, watchlist)
- ✅ Session persistence across page reloads
- ✅ Session persistence across navigation
- ✅ Registration with new user
- ✅ Registration error for existing email
- ✅ Navigation to login from register

### navigation.spec.ts (22 tests)

**Navigation and Routing Tests:**
- ✅ Sidebar navigation (Portfolio, Markets, Orders, Settings, Dashboard)
- ✅ Active navigation item highlighting
- ✅ Header profile menu display
- ✅ Profile dropdown menu items
- ✅ Profile menu closing behavior
- ✅ Platform logo display
- ✅ Mobile menu functionality
- ✅ Direct URL navigation (dashboard, instruments, watchlist, detail)
- ✅ 404 handling
- ✅ Browser back button support
- ✅ Browser forward button support
- ✅ State maintenance across navigation
- ✅ Link navigation flows
- ✅ Keyboard navigation (tab, enter)
- ✅ Navigation performance
- ✅ No page flicker during navigation

### instruments.spec.ts (26 tests)

**Instruments List Tests:**
- ✅ Data loading and display
- ✅ Page title, search bar, filter dropdown
- ✅ Sort controls display
- ✅ Search by symbol (case-insensitive)
- ✅ Search by name
- ✅ No results message
- ✅ Clear search functionality
- ✅ Filter dropdown options (All, Favorites, Forex, Crypto, Stocks)
- ✅ Filter by type
- ✅ Sort by Symbol (asc/desc)
- ✅ Sort by Price, Change, Volume
- ✅ Watchlist add/remove
- ✅ Filter by Favorites
- ✅ Navigation to detail page
- ✅ Virtual scrolling

**Instrument Detail Tests:**
- ✅ Display instrument details
- ✅ Candlestick chart display
- ✅ Order book display
- ✅ Correct instrument name
- ✅ Navigation back to list
- ✅ Navigation between instruments
- ✅ Non-existent instrument handling
- ✅ Watchlist integration from detail
- ✅ Real-time price data display
- ✅ Bid/ask spread display
- ✅ Chart dimensions validation

### trading-workflow.spec.ts (17 tests)

**Complete Trading Workflows:**
- ✅ Full journey: Login → Dashboard → Instruments → Detail → Watchlist
- ✅ Search → Filter → Sort workflow
- ✅ Multi-instrument watchlist building
- ✅ Add instrument from list page
- ✅ Remove instrument from watchlist
- ✅ Filter watchlist by Favorites
- ✅ Watchlist persistence across sessions
- ✅ Search → Detail → Watchlist workflow
- ✅ Filter → Select → View chart workflow
- ✅ Sort → Compare → Select workflow
- ✅ Dashboard → Markets → Detail → Back navigation
- ✅ Sequential sidebar navigation
- ✅ Multi-instrument comparison
- ✅ Error recovery from failed search
- ✅ Back navigation and continue browsing
- ✅ Rapid navigation handling
- ✅ Mobile workflow

**Total: 81 E2E Tests** (excluding 31 visual regression tests)

## 🎯 Test Patterns and Best Practices

### Page Object Pattern (Inline)

Tests use inline selectors with data-testid for stability:

```typescript
// Good: Semantic selector
await page.getByTestId('dashboard-container');

// Good: ARIA role
await page.getByRole('button', { name: 'Submit' });

// Good: Text content
await page.locator('text=EUR_USD');

// Avoid: CSS selectors (fragile)
await page.locator('.some-class-name');
```

### MSW Integration

All tests use MSW for API mocking:

```typescript
// MSW automatically provides mock data
await page.goto('/instruments');
await expect(page.locator('text=EUR_USD')).toBeVisible(); // From MSW
```

### Test Independence

Each test is independent and can run in any order:

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/instruments');
  // Clean state for each test
});
```

### Authentication Override

Most tests use global auth, but can override:

```typescript
// Use global auth (default)
test('should access dashboard', async ({ page }) => {
  // Already logged in
});

// Override for auth tests
test.use({ storageState: { cookies: [], origins: [] } });
test('should login', async ({ page }) => {
  // Not logged in
});
```

## 🚀 CI/CD Integration

For GitHub Actions:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: npx playwright test

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🐛 Debugging

### Debug Mode

```bash
# Open Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test --debug --grep "should login"
```

### Trace Viewer

```bash
# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Screenshots and Videos

Automatically captured on failure:
- Screenshots: `test-results/**/*.png`
- Videos: `test-results/**/*.webm`
- Traces: `test-results/**/*.zip`

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Docker + Playwright](https://playwright.dev/docs/docker)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
