# End-to-End Testing with Playwright

This directory contains E2E tests using Playwright for automated browser testing.

## 🐳 Docker-First Development

All Playwright commands MUST be run inside Docker containers:

```bash
# Run all E2E tests
docker compose run --rm app npx playwright test

# Run specific test file
docker compose run --rm app npx playwright test tests/e2e/auth.spec.ts

# Run tests in UI mode (interactive)
docker compose run --rm app npx playwright test --ui

# Run tests in headed mode (see browser)
docker compose run --rm app npx playwright test --headed

# Debug specific test
docker compose run --rm app npx playwright test --debug

# Update visual snapshots
docker compose run --rm app npx playwright test --update-snapshots

# Show HTML report
docker compose run --rm app npx playwright show-report
```

## ⚠️ Browser Installation Limitation

**Important**: The Alpine-based Docker image does NOT support Playwright browser installation via `npx playwright install`.

**Options**:
1. **Local Development**: Install browsers on your host machine (`npx playwright install chromium`)
2. **CI/CD**: Use `mcr.microsoft.com/playwright:v1.48.0-focal` Docker image
3. **Specialized Container**: Create a separate test container with Debian/Ubuntu base

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

## 🚀 CI/CD Integration (Future)

For GitHub Actions or similar:

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

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Docker + Playwright](https://playwright.dev/docs/docker)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
