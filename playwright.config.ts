import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Docker-First Development
 *
 * This configuration is optimized for running in Docker containers.
 * Browsers must be installed on the host or in a specialized CI/CD container.
 *
 * Note: Alpine-based Docker images don't support Playwright browser installation.
 * For CI/CD, use mcr.microsoft.com/playwright:v1.48.0-focal or similar.
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Output directory for test results
  outputDir: 'test-results',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI (can be adjusted)
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Console output
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like await page.goto('/')
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying failed tests
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Maximum time each action (like click()) can take
    actionTimeout: 10000,

    // Maximum time navigation can take
    navigationTimeout: 30000,
  },

  // Configure global setup (only for non-visual tests)
  globalSetup: process.env.SKIP_AUTH_SETUP ? undefined : './tests/e2e/setup/global-setup.ts',

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load authenticated state for all tests (except visual tests which override this)
        storageState: process.env.SKIP_AUTH_SETUP ? undefined : 'tests/e2e/.auth/user.json',
      },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'tests/e2e/.auth/user.json',
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: 'tests/e2e/.auth/user.json',
    //   },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
