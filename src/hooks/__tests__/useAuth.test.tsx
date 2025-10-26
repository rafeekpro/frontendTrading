/**
 * Tests for useAuth hook
 * Custom hook for accessing authentication context
 *
 * RED PHASE: These tests MUST FAIL - no implementation exists yet
 */

import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authHandlers } from '../../mocks/handlers/auth';
import type { ReactNode } from 'react';

// Setup MSW test server
const server = setupServer(...authHandlers);

// Test wrapper with AuthProvider
function createWrapper() {
  return ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
}

describe('useAuth', () => {
  // Start MSW server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => server.close());

  it('should return current auth state (user, token, loading, error)', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Should have all required properties
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('token');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');

    // Initial state
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('should provide login() function that updates state and calls API', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Login function should exist
    expect(typeof result.current.login).toBe('function');

    // Call login
    await result.current.login('user@example.com', 'Password123');

    // Wait for state update
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    expect(result.current.user?.email).toBe('user@example.com');
    expect(result.current.user?.name).toBe('Demo User');
    expect(result.current.token).toBeTruthy();
  });

  it('should provide logout() function that clears state and calls API', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Login first
    await result.current.login('user@example.com', 'Password123');
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    // Logout
    await result.current.logout();

    // Wait for state to clear
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle concurrent login attempts', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Start two login attempts concurrently
    const login1 = result.current.login('user@example.com', 'Password123');
    const login2 = result.current.login('trader@example.com', 'secure123');

    // Both should complete without errors
    await Promise.all([login1, login2]);

    // Should have a user (last login wins)
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });
  });

  it('should clear error on successful operations', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Try to login with invalid credentials to set error
    try {
      await result.current.login('wrong@example.com', 'wrongpass');
    } catch {
      // Expected to fail
    }

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Login with valid credentials
    await result.current.login('user@example.com', 'Password123');

    // Error should be cleared on success
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });
});
