import { chromium, FullConfig } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging for debugging
  page.on('console', msg => console.log(`   [Browser] ${msg.text()}`));
  page.on('pageerror', error => console.error(`   [Page Error] ${error.message}`));

  try {
    // Navigate to login page
    console.log('   Navigating to login page...');
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for MSW to initialize
    await page.waitForTimeout(2000);

    // Wait for the login form to be visible
    await page.waitForSelector('#email', { timeout: 20000 });

    // Fill login form with demo credentials
    // These credentials are mocked by MSW handlers
    console.log('   Filling login credentials...');
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'Password123');

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
