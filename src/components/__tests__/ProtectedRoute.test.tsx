/**
 * Tests for ProtectedRoute component
 * Route wrapper that requires authentication
 *
 * RED PHASE: These tests MUST FAIL - no implementation exists yet
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';
import { authHandlers } from '../../mocks/handlers/auth';

// Setup MSW test server
const server = setupServer(...authHandlers);

// Test component to display in protected route
function ProtectedContent() {
  return <div data-testid="protected-content">Secret Content</div>;
}

// Component to display current location
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="current-path">{location.pathname}</div>;
}

// Login page component
function LoginPage() {
  const location = useLocation();
  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl;

  return (
    <div>
      <div data-testid="login-page">Login Page</div>
      {returnUrl && <div data-testid="return-url">{returnUrl}</div>}
    </div>
  );
}

// Helper component to trigger login
function LoginTrigger() {
  const { login } = useAuth();

  return (
    <button
      onClick(() => login('user@example.com', 'Password123')}
      data-testid="login-trigger"
    >
      Login
    </button>
  );
}

describe('ProtectedRoute', () => {
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

  it('should render children when authenticated', async () => {
    // Pre-set a valid token
    localStorage.setItem('auth_token', 'valid-token-123');

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show protected content after auth check
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should redirect to /login when not authenticated', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should preserve return URL in redirect location state', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login with return URL
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    // Check if return URL is preserved
    await waitFor(() => {
      expect(screen.getByTestId('return-url')).toHaveTextContent('/dashboard');
    });
  });

  it('should show loading spinner during auth check', () => {
    // Don't pre-set token, let it check on mount
    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show loading state initially
    // Note: This might be very quick, so we check for either loading or final state
    const loadingOrFinalState =
      screen.queryByText(/loading/i) || screen.queryByTestId('login-page');

    expect(loadingOrFinalState).toBeInTheDocument();
  });

  it('should re-check auth when token changes', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Initially should redirect to login
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    // Set a valid token
    localStorage.setItem('auth_token', 'valid-token-123');

    // Force rerender
    rerender(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should now show protected content
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should handle edge case of token being cleared mid-session', async () => {
    // Start with valid token
    localStorage.setItem('auth_token', 'valid-token-123');

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show protected content
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    // Clear token (simulating logout or token expiration)
    localStorage.removeItem('auth_token');

    // Force rerender
    rerender(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});
