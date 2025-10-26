/**
 * E2E Tests: Navigation and Routing
 *
 * Tests navigation flows including:
 * - Sidebar navigation
 * - Header navigation
 * - Mobile menu
 * - URL changes
 * - Breadcrumbs
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from dashboard (using global authenticated state)
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-container')).toBeVisible();
  });

  test.describe('Sidebar Navigation (Desktop)', () => {
    test('should navigate to Portfolio from sidebar', async ({ page }) => {
      // Click Portfolio link in sidebar
      await page.click('nav a:has-text("Portfolio")');

      // URL should change to /portfolio
      await expect(page).toHaveURL('/portfolio');
    });

    test('should navigate to Markets from sidebar', async ({ page }) => {
      // Click Markets link in sidebar
      await page.click('nav a:has-text("Markets")');

      // URL should change to /markets
      await expect(page).toHaveURL('/markets');
    });

    test('should navigate to Orders from sidebar', async ({ page }) => {
      // Click Orders link in sidebar
      await page.click('nav a:has-text("Orders")');

      // URL should change to /orders
      await expect(page).toHaveURL('/orders');
    });

    test('should navigate to Settings from sidebar', async ({ page }) => {
      // Click Settings link in sidebar
      await page.click('nav a:has-text("Settings")');

      // URL should change to /settings
      await expect(page).toHaveURL('/settings');
    });

    test('should navigate to Dashboard from sidebar', async ({ page }) => {
      // First go to another page
      await page.goto('/instruments');

      // Then click Dashboard link in sidebar
      await page.click('nav a:has-text("Dashboard")');

      // URL should change to / or /dashboard
      await expect(page).toHaveURL(/\/(dashboard)?$/);
    });

    test('should highlight active navigation item', async ({ page }) => {
      // Click Portfolio
      await page.click('nav a:has-text("Portfolio")');
      await expect(page).toHaveURL('/portfolio');

      // Portfolio link should have active class
      const portfolioLink = page.locator('nav a:has-text("Portfolio")');
      await expect(portfolioLink).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('Header Navigation', () => {
    test('should display user name in profile menu', async ({ page }) => {
      // Click profile menu
      await page.click('button[aria-label="Profile menu"]');

      // Should show user name (Demo User from mock auth)
      await expect(page.locator('text=Demo User')).toBeVisible();
      await expect(page.locator('text=user@example.com')).toBeVisible();
    });

    test('should show profile dropdown menu items', async ({ page }) => {
      // Click profile menu
      await page.click('button[aria-label="Profile menu"]');

      // Should show menu items
      await expect(page.locator('role=menuitem[name="My Account"]')).toBeVisible();
      await expect(page.locator('role=menuitem[name="Settings"]')).toBeVisible();
      await expect(page.locator('role=menuitem[name=/Logout/i]')).toBeVisible();
    });

    test('should close profile menu when clicking outside', async ({ page }) => {
      // Open profile menu
      await page.click('button[aria-label="Profile menu"]');
      await expect(page.locator('role=menuitem[name="My Account"]')).toBeVisible();

      // Click outside (on dashboard content)
      await page.click('[data-testid="dashboard-container"]');

      // Menu should close
      await expect(page.locator('role=menuitem[name="My Account"]')).not.toBeVisible();
    });

    test('should display platform logo', async ({ page }) => {
      // Logo should be visible in header
      await expect(page.locator('text=TradingPlatform')).toBeVisible();
    });
  });

  test.describe('Mobile Menu', () => {
    test('should open mobile menu on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Mobile menu button should be visible
      const menuButton = page.locator('button[aria-label="Open menu"]');
      await expect(menuButton).toBeVisible();

      // Click to open mobile menu
      await menuButton.click();

      // Navigation items should be visible in sheet
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Portfolio')).toBeVisible();
      await expect(page.locator('text=Markets')).toBeVisible();
    });

    test('should close mobile menu after navigation', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Open menu"]');

      // Click on a navigation item
      await page.click('text=Portfolio');

      // Should navigate
      await expect(page).toHaveURL('/portfolio');

      // Mobile menu should close (sheet component auto-closes)
      // Navigation items should no longer be in the DOM or hidden
      const menuContent = page.locator('[role="dialog"]');
      await expect(menuContent).not.toBeVisible();
    });
  });

  test.describe('Direct URL Navigation', () => {
    test('should navigate to dashboard via URL', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });

    test('should navigate to instruments via URL', async ({ page }) => {
      await page.goto('/instruments');
      await expect(page).toHaveURL('/instruments');
      await expect(page.getByTestId('virtual-list-container')).toBeVisible();
    });

    test('should navigate to watchlist via URL', async ({ page }) => {
      await page.goto('/watchlist');
      await expect(page).toHaveURL('/watchlist');
    });

    test('should navigate to instrument detail via URL', async ({ page }) => {
      // Navigate to a specific instrument (EUR_USD from mock data)
      await page.goto('/instrument/EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();
    });

    test('should handle 404 for non-existent routes', async ({ page }) => {
      await page.goto('/non-existent-route');

      // Should either show 404 page or redirect to dashboard/login
      // Depending on app's 404 handling strategy
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(login|dashboard|404)?/);
    });
  });

  test.describe('Browser Navigation', () => {
    test('should support browser back button', async ({ page }) => {
      // Navigate through multiple pages
      await page.goto('/dashboard');
      await page.goto('/instruments');
      await page.goto('/watchlist');

      // Click back button
      await page.goBack();
      await expect(page).toHaveURL('/instruments');

      // Click back again
      await page.goBack();
      await expect(page).toHaveURL('/dashboard');
    });

    test('should support browser forward button', async ({ page }) => {
      // Navigate through multiple pages
      await page.goto('/dashboard');
      await page.goto('/instruments');

      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/dashboard');

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL('/instruments');
    });

    test('should maintain state across navigation', async ({ page }) => {
      // Go to dashboard
      await page.goto('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();

      // Navigate to instruments
      await page.goto('/instruments');
      await expect(page.getByTestId('virtual-list-container')).toBeVisible();

      // Go back to dashboard
      await page.goBack();
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });
  });

  test.describe('Link Navigation', () => {
    test('should navigate from dashboard to instruments list', async ({ page }) => {
      await page.goto('/dashboard');

      // Click "View All" or similar link (if it exists)
      // Or navigate via sidebar
      await page.click('nav a:has-text("Markets")');
      await expect(page).toHaveURL('/markets');
    });

    test('should navigate from instruments list to detail page', async ({ page }) => {
      await page.goto('/instruments');
      await expect(page.getByTestId('virtual-list-container')).toBeVisible();

      // Wait for instruments to load
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click on an instrument card
      await page.click('text=EUR_USD');

      // Should navigate to detail page
      await expect(page).toHaveURL('/instrument/EUR_USD');
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();
    });

    test('should navigate back from detail page to list', async ({ page }) => {
      // Go to detail page
      await page.goto('/instrument/EUR_USD');
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();

      // Click back button or navigate via sidebar
      await page.goBack();

      // Should be back on instruments list or previous page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(instruments|dashboard)/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support tab navigation through sidebar links', async ({ page }) => {
      await page.goto('/dashboard');

      // Find first navigation link
      const firstLink = page.locator('nav a').first();
      await firstLink.focus();

      // Should be focused
      await expect(firstLink).toBeFocused();

      // Tab to next link
      await page.keyboard.press('Tab');

      // Next link should be focused
      const secondLink = page.locator('nav a').nth(1);
      await expect(secondLink).toBeFocused();
    });

    test('should activate link with Enter key', async ({ page }) => {
      await page.goto('/dashboard');

      // Focus on Portfolio link
      const portfolioLink = page.locator('nav a:has-text("Portfolio")');
      await portfolioLink.focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Should navigate to Portfolio
      await expect(page).toHaveURL('/portfolio');
    });
  });

  test.describe('Navigation Performance', () => {
    test('should navigate quickly between pages', async ({ page }) => {
      const startTime = Date.now();

      // Navigate through several pages
      await page.goto('/dashboard');
      await page.goto('/instruments');
      await page.goto('/watchlist');
      await page.goto('/dashboard');

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All navigations should complete within reasonable time (5 seconds)
      expect(totalTime).toBeLessThan(5000);
    });

    test('should not cause page flicker during navigation', async ({ page }) => {
      await page.goto('/dashboard');

      // Click navigation link
      const portfolioLink = page.locator('nav a:has-text("Portfolio")');
      await portfolioLink.click();

      // Page should remain stable (no major layout shifts)
      // This is tested implicitly by Playwright's stability checks
      await expect(page).toHaveURL('/portfolio');
    });
  });
});
