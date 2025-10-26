/**
 * Tests for AuthContext
 * Authentication state management with localStorage persistence
 *
 * RED PHASE: These tests MUST FAIL - no implementation exists yet
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { AuthProvider, useAuth } from '../AuthContext';
import { authHandlers } from '../../mocks/handlers/auth';

// Setup MSW test server
const server = setupServer(...authHandlers);

// Test component that uses the auth context
function TestComponent() {
  const { user, token, loading, error, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">
        {loading && <span>Loading...</span>}
        {error && <span>Error: {error}</span>}
        {user ? (
          <>
            <span data-testid="user-name">{user.name}</span>
            <span data-testid="user-email">{user.email}</span>
            <span data-testid="user-role">{user.role}</span>
          </>
        ) : (
          <span>Not authenticated</span>
        )}
        {token && <span data-testid="token">{token}</span>}
      </div>
      <button
        onClick={() => login('user@example.com', 'password123')}
        data-testid="login-button"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
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

  it('should provide auth state to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should render test component (provider doesn't crash)
    expect(screen.getByTestId('auth-state')).toBeInTheDocument();
  });

  it('should initialize with null user and no token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    expect(screen.queryByTestId('token')).not.toBeInTheDocument();
  });

  it('should update state on successful login', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByText('Not authenticated')).toBeInTheDocument();

    // Click login button
    await user.click(screen.getByTestId('login-button'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('trader');
    expect(screen.getByTestId('token')).toBeInTheDocument();
  });

  it('should clear state on logout', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    await user.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toBeInTheDocument();
    });

    // Logout
    await user.click(screen.getByTestId('logout-button'));

    // Should be back to unauthenticated state
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('token')).not.toBeInTheDocument();
  });

  it('should persist token to localStorage on login', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      const savedToken = localStorage.getItem('auth_token');
      expect(savedToken).toBeTruthy();
      expect(savedToken).toMatch(/^mock-jwt-/);
    });
  });

  it('should load token from localStorage on mount', async () => {
    // Pre-set a valid token in localStorage
    localStorage.setItem('auth_token', 'valid-token-123');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should automatically validate token and load user
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User');
    });

    expect(screen.getByTestId('token')).toHaveTextContent('valid-token-123');
  });

  it('should validate token on mount by calling GET /api/auth/me', async () => {
    // Track if /api/auth/me was called
    let meCalled = false;

    server.use(
      http.get('http://localhost/api/auth/me', async ({ request }) => {
        meCalled = true;
        const authHeader = request.headers.get('Authorization');

        if (authHeader === 'Bearer valid-token-123') {
          return HttpResponse.json({
            user: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'Demo User',
              role: 'trader',
            },
          });
        }

        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    localStorage.setItem('auth_token', 'valid-token-123');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(meCalled).toBe(true);
    });
  });

  it('should handle invalid token gracefully', async () => {
    localStorage.setItem('auth_token', 'invalid-token');

    server.use(
      http.get('http://localhost/api/auth/me', () => {
        return HttpResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should clear invalid token and show not authenticated
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should handle network errors during login', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('http://localhost/api/auth/login', () => {
        return HttpResponse.json(
          { error: 'Network error' },
          { status: 500 }
        );
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should handle network errors during logout', async () => {
    const user = userEvent.setup();

    // Login first
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toBeInTheDocument();
    });

    // Mock logout to fail
    server.use(
      http.post('http://localhost/api/auth/logout', () => {
        return HttpResponse.json(
          { error: 'Network error' },
          { status: 500 }
        );
      })
    );

    await user.click(screen.getByTestId('logout-button'));

    // Should still clear local state even if API fails
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });
});
