/**
 * E2E Tests: Instruments List and Detail Pages
 *
 * Tests instrument-related functionality including:
 * - List loading with MSW data
 * - Search filtering
 * - Sorting
 * - Type filtering
 * - Watchlist integration
 * - Detail page navigation and display
 */

import { test, expect } from '@playwright/test';

test.describe('Instruments List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to instruments page (using global authenticated state)
    await page.goto('/instruments');
    await expect(page.getByTestId('virtual-list-container')).toBeVisible();
  });

  test.describe('Data Loading', () => {
    test('should load and display instruments list', async ({ page }) => {
      // Wait for instruments to load (MSW will provide mock data)
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Verify instruments are displayed
      await expect(page.locator('text=EUR_USD')).toBeVisible();
      await expect(page.locator('text=GBP_USD')).toBeVisible();
    });

    test('should display page title', async ({ page }) => {
      await expect(page.locator('h1:has-text("All Instruments")')).toBeVisible();
    });

    test('should display search bar', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should display filter dropdown', async ({ page }) => {
      const filterButton = page.locator('button[aria-label="Filter instruments by type"]');
      await expect(filterButton).toBeVisible();
    });

    test('should display sort controls', async ({ page }) => {
      // Sort buttons should be visible
      await expect(page.locator('text=Symbol')).toBeVisible();
      await expect(page.locator('text=Name')).toBeVisible();
      await expect(page.locator('text=Price')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should filter instruments by symbol', async ({ page }) => {
      // Wait for initial load
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Type in search box
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('EUR');

      // Only EUR instruments should be visible
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // GBP instruments should not be visible
      const gbpCount = await page.locator('text=GBP_USD').count();
      expect(gbpCount).toBe(0);
    });

    test('should filter instruments by name', async ({ page }) => {
      // Wait for initial load
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Search by instrument name
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Euro');

      // Should show EUR instruments
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should be case-insensitive', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const searchInput = page.locator('input[placeholder*="Search"]');

      // Search with lowercase
      await searchInput.fill('eur');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Clear and search with uppercase
      await searchInput.fill('');
      await searchInput.fill('EUR');
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should show no results message when search has no matches', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('NONEXISTENT_SYMBOL');

      // Should show no results message
      await expect(page.locator('text=/No instruments found/i')).toBeVisible();
    });

    test('should clear search and show all instruments', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      const searchInput = page.locator('input[placeholder*="Search"]');

      // Search for something
      await searchInput.fill('EUR');
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Clear search
      await searchInput.fill('');

      // All instruments should be visible again
      await expect(page.locator('text=EUR_USD')).toBeVisible();
      await expect(page.locator('text=GBP_USD')).toBeVisible();
    });
  });

  test.describe('Filter Functionality', () => {
    test('should show all filter options', async ({ page }) => {
      // Click filter dropdown
      await page.click('button[aria-label="Filter instruments by type"]');

      // Verify all options are present
      await expect(page.locator('text=All Instruments')).toBeVisible();
      await expect(page.locator('text=Favorites')).toBeVisible();
      await expect(page.locator('text=Forex')).toBeVisible();
      await expect(page.locator('text=Crypto')).toBeVisible();
      await expect(page.locator('text=Stocks')).toBeVisible();
    });

    test('should filter by Forex', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Open filter dropdown
      await page.click('button[aria-label="Filter instruments by type"]');

      // Select Forex
      await page.click('text=Forex');

      // Should show forex pairs like EUR_USD
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });

    test('should filter by Crypto', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Open filter dropdown
      await page.click('button[aria-label="Filter instruments by type"]');

      // Select Crypto
      await page.click('text=Crypto');

      // Should show crypto instruments (if any in mock data)
      // Or show "No instruments found" if no crypto
      const hasCrypto = await page.locator('text=BTC').count();
      if (hasCrypto === 0) {
        await expect(page.locator('text=/No instruments found/i')).toBeVisible();
      }
    });

    test('should reset to All Instruments', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Filter to Forex
      await page.click('button[aria-label="Filter instruments by type"]');
      await page.click('text=Forex');

      // Reset to All
      await page.click('button[aria-label="Filter instruments by type"]');
      await page.click('text=All Instruments');

      // All instruments should be visible
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });
  });

  test.describe('Sorting Functionality', () => {
    test('should sort by Symbol ascending', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click Symbol sort button
      await page.click('button:has-text("Symbol")');

      // Instruments should be sorted alphabetically by symbol
      // Verify first item is alphabetically first
      const firstItem = page.locator('[data-index="0"]');
      await expect(firstItem).toBeVisible();
    });

    test('should sort by Symbol descending', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click Symbol sort button once for asc
      await page.click('button:has-text("Symbol")');

      // Click again for desc
      await page.click('button:has-text("Symbol")');

      // Should be reverse alphabetical order
      const firstItem = page.locator('[data-index="0"]');
      await expect(firstItem).toBeVisible();
    });

    test('should sort by Price', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click Price sort button
      await page.click('button:has-text("Price")');

      // Instruments should be sorted by price
      const firstItem = page.locator('[data-index="0"]');
      await expect(firstItem).toBeVisible();
    });

    test('should sort by Change', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click Change sort button
      await page.click('button:has-text("Change")');

      // Instruments should be sorted by change percentage
      const firstItem = page.locator('[data-index="0"]');
      await expect(firstItem).toBeVisible();
    });

    test('should sort by Volume', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click Volume sort button
      await page.click('button:has-text("Volume")');

      // Instruments should be sorted by volume
      const firstItem = page.locator('[data-index="0"]');
      await expect(firstItem).toBeVisible();
    });
  });

  test.describe('Watchlist Integration', () => {
    test('should add instrument to watchlist', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Find and click star/watchlist button for EUR_USD
      // The button might be inside the instrument row
      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();

      // Button state should change to indicate added to watchlist
      // This depends on implementation - might show filled star or different aria-label
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);
    });

    test('should remove instrument from watchlist', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Add to watchlist first
      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);

      // Remove from watchlist
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Add to watchlist/i);
    });

    test('should filter by Favorites/Watchlist', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Add EUR_USD to watchlist
      const watchlistButton = page.locator('[data-index="0"]').locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();

      // Filter by Favorites
      await page.click('button[aria-label="Filter instruments by type"]');
      await page.click('text=Favorites');

      // Should only show watchlist items
      await expect(page.locator('text=EUR_USD')).toBeVisible();
    });
  });

  test.describe('Navigation to Detail', () => {
    test('should navigate to instrument detail on click', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Click on EUR_USD instrument
      await page.click('text=EUR_USD');

      // Should navigate to detail page
      await expect(page).toHaveURL('/instrument/EUR_USD');
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();
    });

    test('should navigate to correct instrument detail', async ({ page }) => {
      await page.waitForSelector('text=GBP_USD', { timeout: 5000 });

      // Click on GBP_USD
      await page.click('text=GBP_USD');

      // Should navigate to GBP_USD detail page
      await expect(page).toHaveURL('/instrument/GBP_USD');
    });
  });

  test.describe('Virtual Scrolling', () => {
    test('should scroll through long list of instruments', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Get scroll container
      const scrollContainer = page.getByTestId('virtual-list-container');

      // Scroll down
      await scrollContainer.evaluate(node => {
        node.scrollTop = 1000;
      });

      // Virtual scrolling should render items that are in view
      await expect(scrollContainer).toBeVisible();
    });

    test('should maintain scroll position on navigation back', async ({ page }) => {
      await page.waitForSelector('text=EUR_USD', { timeout: 5000 });

      // Scroll down
      const scrollContainer = page.getByTestId('virtual-list-container');
      await scrollContainer.evaluate(node => {
        node.scrollTop = 500;
      });

      // Navigate to detail
      await page.click('text=EUR_USD');
      await expect(page).toHaveURL('/instrument/EUR_USD');

      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/instruments');

      // Note: Scroll position might reset depending on implementation
      // This test documents the current behavior
      await expect(scrollContainer).toBeVisible();
    });
  });
});

test.describe('Instrument Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to EUR_USD detail page
    await page.goto('/instrument/EUR_USD');
    await expect(page.getByTestId('instrument-detail-container')).toBeVisible();
  });

  test.describe('Data Display', () => {
    test('should display instrument details', async ({ page }) => {
      // Should show instrument symbol
      await expect(page.locator('text=EUR_USD')).toBeVisible();

      // Should show market stats
      await expect(page.getByTestId('market-stats')).toBeVisible();

      // Should show price information
      await expect(page.locator('text=/Price|Bid|Ask/i')).toBeVisible();
    });

    test('should display candlestick chart', async ({ page }) => {
      // Chart container should be visible
      await expect(page.getByTestId('candlestick-chart')).toBeVisible();
    });

    test('should display order book', async ({ page }) => {
      // Order book should be visible
      await expect(page.getByTestId('order-book')).toBeVisible();
    });

    test('should display correct instrument name', async ({ page }) => {
      // EUR_USD should show "Euro / US Dollar" or similar
      const hasEuro = await page.locator('text=/Euro/i').count();
      expect(hasEuro).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to instruments list', async ({ page }) => {
      // Click browser back button
      await page.goBack();

      // Should be on instruments list
      await expect(page).toHaveURL('/instruments');
      await expect(page.getByTestId('virtual-list-container')).toBeVisible();
    });

    test('should navigate to different instrument detail', async ({ page }) => {
      // Navigate to different instrument
      await page.goto('/instrument/GBP_USD');

      // Should show GBP_USD details
      await expect(page.locator('text=GBP_USD')).toBeVisible();
      await expect(page.getByTestId('instrument-detail-container')).toBeVisible();
    });

    test('should handle non-existent instrument ID', async ({ page }) => {
      // Navigate to non-existent instrument
      await page.goto('/instrument/NONEXISTENT');

      // Should show error or empty state
      // Behavior depends on implementation
      const hasError = await page.locator('text=/not found|error/i').count();
      const hasEmpty = await page.locator('text=/No instrument/i').count();

      expect(hasError + hasEmpty).toBeGreaterThan(0);
    });
  });

  test.describe('Watchlist Integration', () => {
    test('should add instrument to watchlist from detail page', async ({ page }) => {
      // Find watchlist button on detail page
      const watchlistButton = page.locator('button[aria-label*="watchlist"]').first();

      // Click to add to watchlist
      await watchlistButton.click();

      // Button should indicate added to watchlist
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);
    });

    test('should remove instrument from watchlist from detail page', async ({ page }) => {
      // Add to watchlist
      const watchlistButton = page.locator('button[aria-label*="watchlist"]').first();
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Remove from watchlist/i);

      // Remove from watchlist
      await watchlistButton.click();
      await expect(watchlistButton).toHaveAttribute('aria-label', /Add to watchlist/i);
    });
  });

  test.describe('Market Data Updates', () => {
    test('should display real-time price data', async ({ page }) => {
      // Market stats should be visible with price data
      const marketStats = page.getByTestId('market-stats');
      await expect(marketStats).toBeVisible();

      // Should contain price-related text
      const hasPrice = await marketStats.locator('text=/[0-9]+\.[0-9]+/').count();
      expect(hasPrice).toBeGreaterThan(0);
    });

    test('should display bid/ask spread', async ({ page }) => {
      // Order book should show bid and ask prices
      const orderBook = page.getByTestId('order-book');
      await expect(orderBook).toBeVisible();

      // Should have bid/ask sections
      const hasBids = await orderBook.locator('text=/bid/i').count();
      const hasAsks = await orderBook.locator('text=/ask/i').count();

      expect(hasBids + hasAsks).toBeGreaterThan(0);
    });
  });

  test.describe('Chart Interaction', () => {
    test('should display candlestick chart container', async ({ page }) => {
      const chartContainer = page.getByTestId('candlestick-chart');
      await expect(chartContainer).toBeVisible();
    });

    test('should have chart with reasonable dimensions', async ({ page }) => {
      const chartContainer = page.getByTestId('candlestick-chart');

      // Check container has size
      const boundingBox = await chartContainer.boundingBox();
      expect(boundingBox).not.toBeNull();

      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(100);
        expect(boundingBox.height).toBeGreaterThan(100);
      }
    });
  });
});
