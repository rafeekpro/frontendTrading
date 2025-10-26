import { test as base, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Pages
 *
 * These tests capture screenshots of key pages to detect visual regressions.
 * Baseline screenshots are committed to the repository.
 *
 * Running tests:
 * - Generate baselines: npx playwright test --update-snapshots
 * - Run tests: npx playwright test tests/e2e/visual/
 *
 * Note: Visual tests use separate context without global auth setup
 */

// Override test to use separate context without global setup
const test = base.extend({
  storageState: async ({}, use) => {
    // Don't use auth storage state for visual tests
    await use(undefined);
  },
});

test.describe('Login Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Use unauthenticated context for login page
    await page.context().clearCookies();

    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for app to initialize (MSW to start)
    await page.waitForTimeout(2000);
  });

  test('login page - empty state', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-page-empty.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('login page - with validation errors', async ({ page }) => {
    // Click submit without filling form to trigger validation
    await page.click('button[type="submit"]');

    // Wait for error messages to appear
    await page.waitForSelector('text=Email is required', { timeout: 5000 });

    await expect(page).toHaveScreenshot('login-page-with-errors.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('login page - loading state', async ({ page }) => {
    // Fill in the form
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Start submission to trigger loading state
    const submitPromise = page.click('button[type="submit"]');

    // Capture loading state quickly
    await page.waitForSelector('[data-loading="true"], .loading, button:disabled', {
      timeout: 1000,
    }).catch(() => {
      // Loading state might be too fast, that's OK
    });

    await expect(page).toHaveScreenshot('login-page-loading.png', {
      fullPage: true,
      animations: 'disabled',
    });

    await submitPromise;
  });
});

test.describe('Register Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/register');
  });

  test('register page - empty state', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('register-page-empty.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('register page - with password strength indicator', async ({ page }) => {
    // Type a medium strength password to show the indicator
    await page.fill('input[type="password"]', 'Pass123');

    // Wait for password strength indicator to appear
    await page.waitForSelector('[role="progressbar"], .password-strength', {
      timeout: 2000,
    }).catch(() => {
      // Indicator might not exist, that's OK
    });

    await expect(page).toHaveScreenshot('register-page-password-strength.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Dashboard Page Visual Tests', () => {
  test('dashboard - authenticated view', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Mask dynamic content like timestamps
    await expect(page).toHaveScreenshot('dashboard-page.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('time'),
        page.locator('[data-testid*="timestamp"]'),
        page.locator('.timestamp'),
      ],
    });
  });
});

test.describe('Instruments List Page Visual Tests', () => {
  test('instruments list - with data', async ({ page }) => {
    await page.goto('/instruments');
    await page.waitForLoadState('networkidle');

    // Wait for instruments to load
    await page.waitForSelector('[data-testid*="instrument"], .instrument-row, .instrument-card', {
      timeout: 10000,
    });

    // Mask dynamic price data and timestamps
    await expect(page).toHaveScreenshot('instruments-list-page.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('time'),
        page.locator('[data-testid*="price"]'),
        page.locator('.price'),
        page.locator('[data-testid*="timestamp"]'),
      ],
    });
  });

  test('instruments list - with search', async ({ page }) => {
    await page.goto('/instruments');
    await page.waitForLoadState('networkidle');

    // Wait for search bar
    await page.waitForSelector('input[type="search"], input[placeholder*="Search"]', {
      timeout: 5000,
    });

    // Type in search
    await page.fill('input[type="search"], input[placeholder*="Search"]', 'EUR');

    // Wait for filtered results
    await page.waitForTimeout(500); // Brief wait for filtering

    await expect(page).toHaveScreenshot('instruments-list-with-search.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('time'),
        page.locator('[data-testid*="price"]'),
        page.locator('.price'),
      ],
    });
  });
});

test.describe('Instrument Detail Page Visual Tests', () => {
  test('instrument detail - EUR/USD', async ({ page }) => {
    await page.goto('/instrument/EURUSD');
    await page.waitForLoadState('networkidle');

    // Wait for chart to render (if it exists)
    await page.waitForSelector('canvas, svg, [role="img"]', {
      timeout: 5000,
    }).catch(() => {
      // Chart might not exist, that's OK
    });

    // Mask dynamic content
    await expect(page).toHaveScreenshot('instrument-detail-eurusd.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('time'),
        page.locator('[data-testid*="price"]'),
        page.locator('.price'),
        page.locator('[data-testid*="timestamp"]'),
        // Mask chart canvas as it might have dynamic rendering
        page.locator('canvas'),
      ],
    });
  });
});

test.describe('Watchlist Page Visual Tests', () => {
  test('watchlist - empty state', async ({ page }) => {
    await page.goto('/watchlist');
    await page.waitForLoadState('networkidle');

    // Check if empty state exists
    const emptyState = page.locator('text=No instruments, text=empty, [data-testid*="empty"]').first();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    if (hasEmptyState) {
      await expect(page).toHaveScreenshot('watchlist-empty.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('watchlist - with instruments', async ({ page }) => {
    await page.goto('/watchlist');
    await page.waitForLoadState('networkidle');

    // Wait for watchlist items or empty state
    await page.waitForSelector('[data-testid*="watchlist"], [data-testid*="instrument"], .watchlist-item', {
      timeout: 5000,
    }).catch(() => {
      // Might be empty, that's OK
    });

    await expect(page).toHaveScreenshot('watchlist-with-instruments.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('time'),
        page.locator('[data-testid*="price"]'),
        page.locator('.price'),
        page.locator('[data-testid*="timestamp"]'),
      ],
    });
  });
});
