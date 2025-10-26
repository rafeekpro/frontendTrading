/**
 * E2E Tests: Authentication Flows
 *
 * Tests authentication workflows including:
 * - Login with valid/invalid credentials
 * - Logout flow
 * - Protected route redirects
 * - Session persistence
 */

import { test, expect } from '@playwright/test';

// Use unauthenticated context for auth tests
// Override the global authenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('/login');

      // Verify we're on the login page
      await expect(page).toHaveTitle(/Login/i);

      // Fill login form
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');

      // Verify dashboard content is visible
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill login form with invalid credentials
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'WrongPassword');

      // Submit form
      await page.click('button[type="submit"]');

      // Should stay on login page
      await expect(page).toHaveURL('/login');

      // Should show error message (MSW returns 401 with "Invalid credentials")
      await expect(page.locator('text=/Invalid credentials/i')).toBeVisible();
    });

    test('should show validation error with missing email', async ({ page }) => {
      await page.goto('/login');

      // Only fill password
      await page.fill('input[name="password"]', 'Password123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should stay on login page with validation error
      await expect(page).toHaveURL('/login');
    });

    test('should show validation error with missing password', async ({ page }) => {
      await page.goto('/login');

      // Only fill email
      await page.fill('input[name="email"]', 'user@example.com');

      // Submit form
      await page.click('button[type="submit"]');

      // Should stay on login page with validation error
      await expect(page).toHaveURL('/login');
    });

    test('should navigate to register page from login', async ({ page }) => {
      await page.goto('/login');

      // Click register link
      await page.click('text=/Register|Sign up|Create account/i');

      // Should navigate to register page
      await expect(page).toHaveURL('/register');
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout user', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');

      // Click user menu
      await page.click('button[aria-label="Profile menu"]');

      // Click logout
      await page.click('role=menuitem[name=/Logout/i]');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should clear session after logout', async ({ page, context }) => {
      // First login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');

      // Logout
      await page.click('button[aria-label="Profile menu"]');
      await page.click('role=menuitem[name=/Logout/i]');

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect back to login
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing instruments unauthenticated', async ({ page }) => {
      await page.goto('/instruments');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing watchlist unauthenticated', async ({ page }) => {
      await page.goto('/watchlist');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should allow access to dashboard after login', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL('/dashboard');

      // Dashboard content should be visible
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');

      // Reload page
      await page.reload();

      // Should still be on dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });

    test('should maintain session across navigation', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');

      // Navigate to different protected routes
      await page.goto('/instruments');
      await expect(page).toHaveURL('/instruments');

      await page.goto('/watchlist');
      await expect(page).toHaveURL('/watchlist');

      // Should maintain authentication throughout
      await page.goto('/dashboard');
      await expect(page.getByTestId('dashboard-container')).toBeVisible();
    });
  });

  test.describe('Registration', () => {
    test('should successfully register new user', async ({ page }) => {
      await page.goto('/register');

      // Fill registration form with new email
      const timestamp = Date.now();
      await page.fill('input[name="name"]', 'New User');
      await page.fill('input[name="email"]', `newuser${timestamp}@example.com`);
      await page.fill('input[name="password"]', 'NewPassword123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL('/dashboard');
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register');

      // Fill registration form with existing email
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Password123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should stay on register page with error
      await expect(page).toHaveURL('/register');
      await expect(page.locator('text=/Email already exists/i')).toBeVisible();
    });

    test('should navigate to login page from register', async ({ page }) => {
      await page.goto('/register');

      // Click login link
      await page.click('text=/Login|Sign in|Already have an account/i');

      // Should navigate to login page
      await expect(page).toHaveURL('/login');
    });
  });
});
