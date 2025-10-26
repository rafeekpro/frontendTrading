import { chromium, FullConfig } from '@playwright/test';
import * as path from 'node:path';

/**
 * Global Setup for Playwright Tests
 *
 * This function runs ONCE before all tests to establish authenticated state.
 * It logs in with demo credentials and saves the authentication state
 * for reuse across all tests.
 *
 * Benefits:
 * - Faster test execution (login once, not per test)
 * - Consistent authentication state
 * - Reduces flakiness from repeated login attempts
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.use?.baseURL || 'http://localhost:5173';
  const authFile = path.join(__dirname, '../.auth/user.json');

  console.log('🔐 Setting up authentication for Playwright tests...');
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   Auth file: ${authFile}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('   Navigating to login page...');
    await page.goto(`${baseURL}/login`);

    // Wait for the login form to be visible
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    // Fill login form with demo credentials
    // These credentials are mocked by MSW handlers
    console.log('   Filling login credentials...');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'Password123');

    // Submit the form
    console.log('   Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard (successful login)
    // MSW will intercept the API call and return mock data
    console.log('   Waiting for successful authentication...');
    await page.waitForURL(`${baseURL}/dashboard`, { timeout: 15000 });

    // Verify we're authenticated by checking for dashboard content
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 });

    // Save authenticated state to file
    console.log('   Saving authentication state...');
    await context.storageState({ path: authFile });

    console.log('✅ Authentication setup complete!');
    console.log(`   Saved to: ${authFile}`);
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
