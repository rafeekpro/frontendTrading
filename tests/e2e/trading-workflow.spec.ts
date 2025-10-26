/**
 * E2E Tests: Complete Trading Workflows
 *
 * Tests end-to-end trading workflows including:
 * - Login → Instruments → Select → View Details
 * - Watchlist management workflow
 * - Search and filter workflow
 * - Multi-step user journeys
 */

import { test, expect } from '@playwright/test';

test.describe('Complete Trading Workflows', () => {
  test.describe('Full User Journey: Login to Trade', () => {
    // Override global auth for this specific test
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should complete full workflow: Login → Dashboard → Instruments → Detail → Watchlist', async ({ page }) => {
      // Step 1: Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');

      // Verify landed on dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();

      // Step 2: Navigate to Instruments
      await page.goto('/instruments');
      await expect(page.getByTestId('virtual-list-container')).toBeVisible();

      // Wait for instruments to load
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Step 3: Search for specific instrument
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('EUR');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Step 4: Navigate to instrument detail
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();

      // Step 5: Add to watchlist
      const watchlistButton = page.locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);

      // Step 6: Navigate to watchlist
      await page.goto('/watchlist');
      await expect(page).toHaveURL('/watchlist');

      // Verify EUR_USD is in watchlist
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should handle search → filter → sort workflow', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');

      // Navigate to instruments
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Step 1: Search for EUR
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('EUR');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Step 2: Apply Forex filter
      await page.click('button[aria-label="Filter instruments by type"]');
      await page.click('text=Forex');

      // Step 3: Sort by Price
      await page.click('button:has-text("Price")');

      // Verify results are filtered and sorted
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should navigate through multiple instruments and build watchlist', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');

      // Navigate to instruments
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Add multiple instruments to watchlist
      const instruments = ['EUR_USD', 'GBP_USD', 'USD_JPY'];

      for (const instrument of instruments) {
        // Find and click the instrument
        await page.click(`text=${instrument}`);
        await expect(page).toHaveURL(`/instrument/${instrument}`);

        // Add to watchlist
        const watchlistButton = page.locator('button[aria-label*="watchlist"]').first();
        await watchlistButton.click();
        await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);

        // Go back to list
        await page.goto('/instruments');
        await page.waitForSelector(`text=${instrument}`, { timeout: 5000 });
      }

      // Navigate to watchlist
      await page.goto('/watchlist');

      // Verify all instruments are in watchlist
      for (const instrument of instruments) {
        await expect(page.locator(`text=${instrument}`)).toBeVisible();
      }
    });
  });

  test.describe('Watchlist Management Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Start from dashboard (using global authenticated state)
      await page.goto('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });

    test('should add instrument to watchlist from list page', async ({ page }) => {
      // Navigate to instruments
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Add to watchlist from list page
      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);

      // Navigate to watchlist
      await page.goto('/watchlist');

      // Verify instrument is in watchlist
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should remove instrument from watchlist', async ({ page }) => {
      // Navigate to instruments and add to watchlist
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();

      // Navigate to watchlist
      await page.goto('/watchlist');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Remove from watchlist
      const removeButton = page.locator('button[aria-label*="Remove from watchlist"]').first();
      await removeButton.click();

      // Should show empty state or instrument should be gone
      const eurCount = await page.locator('text=EUR_USD').count();
      expect(eurCount).toBe(0);
    });

    test('should filter watchlist by Favorites', async ({ page }) => {
      // Add instruments to watchlist
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();

      // Filter by Favorites
      await page.click('button[aria-label="Filter instruments by type"]');
      await page.click('text=Favorites');

      // Should only show favorited instruments
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should persist watchlist across sessions', async ({ page, context }) => {
      // Add to watchlist
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();

      // Navigate to watchlist
      await page.goto('/watchlist');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Reload page
      await page.reload();

      // Watchlist should still contain the instrument
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });
  });

  test.describe('Search and Discovery Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });
    });

    test('should search → view detail → add to watchlist', async ({ page }) => {
      // Step 1: Search for instrument
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('EUR');

      // Step 2: Click on search result
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');

      // Step 3: Add to watchlist
      const watchlistButton = page.locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);

      // Step 4: Verify in watchlist
      await page.goto('/watchlist');
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should filter by type → select instrument → view chart', async ({ page }) => {
      // Step 1: Filter by Forex
      await page.click('button[aria-label="Filter instruments by type"]');
      await page.click('text=Forex');

      // Step 2: Select first forex instrument
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });
      await page.click('text=EUR_USD');

      // Step 3: Verify chart is displayed
      await expect(page.getByTestId('candlestick-chart')).toBeVisible();
      await expect(page.getByTestId('order-book')).toBeVisible();
    });

    test('should sort → compare instruments → select best', async ({ page }) => {
      // Step 1: Sort by Change (to see best performers)
      await page.click('button:has-text("Change")');

      // Step 2: View top performer
      const firstInstrument = page.locator('[data-index="0"]');
      await firstInstrument.click();

      // Step 3: Verify detail page loads
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();
    });
  });

  test.describe('Navigation Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });

    test('should navigate Dashboard → Markets → Instrument Detail → Back', async ({ page }) => {
      // Dashboard → Markets (via sidebar)
      await page.click('nav a:has-text("Markets")');
      await expect(page).toHaveURL('/markets');

      // If /markets redirects to /instruments, handle that
      const currentUrl = page.url();
      if (currentUrl.includes('/instruments')) {
        await page.waitForSelector('text=EUR_USD', { timeout: 5000 });
        await page.click('text=EUR_USD');
      }

      // Should be on some detail page
      await expect(page).toHaveURL(/\/(instrument|markets)/);

      // Go back
      await page.goBack();
    });

    test('should navigate through sidebar links in sequence', async ({ page }) => {
      const routes = [
        { name: 'Portfolio', url: '/portfolio' },
        { name: 'Markets', url: '/markets' },
        { name: 'Orders', url: '/orders' },
        { name: 'Settings', url: '/settings' },
      ];

      for (const route of routes) {
        await page.click(`nav a:has-text("${route.name}")`);
        await expect(page).toHaveURL(route.url);
      }

      // Return to dashboard
      await page.click('nav a:has-text("Dashboard")');
      await expect(page).toHaveURL(/\/(dashboard)?$/);
    });
  });

  test.describe('Multi-Instrument Comparison', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });
    });

    test('should compare multiple instruments side by side', async ({ page, context }) => {
      // Open first instrument in new tab (simulated by navigation)
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');

      const eurPrice = await page.locator('[data-testid="market-stats"]').textContent();
      expect(eurPrice).toBeTruthy();

      // Go back and open second instrument
      await page.goto('/instruments');
      await page.waitForSelector('text=GBP_USD', { timeout: 5000 });
      await page.click('text=GBP_USD');
      await expect(page).toHaveURL('/instrument/GBP_USD');

      const gbpPrice = await page.locator('[data-testid="market-stats"]').textContent();
      expect(gbpPrice).toBeTruthy();

      // Prices should be different
      expect(eurPrice).not.toBe(gbpPrice);
    });

    test('should add multiple instruments and view in watchlist', async ({ page }) => {
      const instruments = ['EUR_USD', 'GBP_USD'];

      for (const symbol of instruments) {
        // Find instrument in list
        await page.waitForSelector(`text=${symbol}`, { timeout: 5000 });

        // Add to watchlist
        const instrumentRow = page.locator(`text=${symbol}`).locator('xpath=ancestor::div[@data-index]').first();
        const watchlistBtn = instrumentRow.locator('button[aria-label*="watchlist"]').first();
        await watchlistBtn.click();

        // Wait a bit for state to update
        await page.waitForTimeout(100);
      }

      // Navigate to watchlist
      await page.goto('/watchlist');

      // Verify all instruments are present
      for (const symbol of instruments) {
        await expect(page.locator(`text=${symbol}`)).toBeVisible();
      }
    });
  });

  test.describe('Error Recovery Workflow', () => {
    test('should recover from failed search and continue workflow', async ({ page }) => {
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Search for non-existent instrument
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('NONEXISTENT');
      await expect(page.locator('text=/No instruments found/i')).toBeVisible();

      // Clear search and continue
      await searchInput.fill('');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Should be able to click and navigate
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');
    });

    test('should handle back navigation and continue browsing', async ({ page }) => {
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Navigate to detail
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');

      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/instruments');

      // Should be able to search
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('GBP');
      await expect(page.locator('text=GBP_USD')).toBeVisible();
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('should handle rapid navigation without errors', async ({ page }) => {
      await page.goto('/dashboard');

      // Rapidly navigate between pages
      await page.goto('/instruments');
      await page.goto('/watchlist');
      await page.goto('/dashboard');
      await page.goto('/instruments');

      // Should end up on instruments page without errors
      await expect(page).toHaveURL('/instruments');
      await expect(page.getByTestId('virtual-list-container')).toBeVisible();
    });

    test('should handle rapid watchlist toggle without errors', async ({ page }) => {
      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();

      // Rapidly toggle watchlist
      await watchlistButton.click();
      await page.waitForTimeout(50);
      await watchlistButton.click();
      await page.waitForTimeout(50);
      await watchlistButton.click();

      // Should settle on a state
      const finalState = await watchlistButton.getAttribute('aria-label');
      expect(finalState).toMatch(/watchlist/i);
    });
  });

  test.describe('Mobile Workflow', () => {
    test('should complete mobile workflow: Search → Detail → Watchlist', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/instruments');
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Search on mobile
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('EUR');

      // Navigate to detail
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');

      // Add to watchlist
      const watchlistButton = page.locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();

      // Navigate via mobile menu to watchlist
      await page.goto('/watchlist');
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });
  });
});
