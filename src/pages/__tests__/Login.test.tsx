/**
 * Tests for Login page with React Hook Form + Zod validation
 *
 * RED PHASE: These tests MUST FAIL - React Hook Form not integrated yet
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { Login } from '../Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { authHandlers } from '../../mocks/handlers/auth';

// Setup MSW test server
const server = setupServer(...authHandlers);

// Helper to render Login with all required providers
function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Login Page - React Hook Form + Zod Validation', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  describe('Form Rendering', () => {
    it('should render login form with all required fields', () => {
      renderLogin();

      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should display demo credentials section', () => {
      renderLogin();

      // Use getAllByText for multiple matches, and check that at least one exists
      expect(screen.getAllByText(/demo credentials/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Password123/)).toBeInTheDocument();
    });
  });

  describe('Email Validation (Zod)', () => {
    it('should show error when email field is empty on blur', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);

      // Focus and blur without entering value
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid on blur', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should clear error when valid email is entered', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);

      // First trigger error
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });

      // Then fix it
      await user.clear(emailInput);
      await user.type(emailInput, 'user@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Validation (Zod)', () => {
    it('should show error when password field is empty on blur', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByPlaceholderText(/password/i);

      // Focus and blur without entering value
      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is less than 8 characters', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(passwordInput, 'Pass1');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when password lacks uppercase letter', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(passwordInput, 'password123'); // lowercase only - should fail validation
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one uppercase/i)).toBeInTheDocument();
      });
    });

    it('should show error when password lacks lowercase letter', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(passwordInput, 'PASSWORD123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one.*lowercase/i)).toBeInTheDocument();
      });
    });

    it('should show error when password lacks number', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(passwordInput, 'Password');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain.*number/i)).toBeInTheDocument();
      });
    });

    it('should clear error when valid password is entered', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByPlaceholderText(/password/i);

      // First trigger error
      await user.type(passwordInput, 'weak');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });

      // Then fix it
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Password123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button while form is loading', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill form with valid demo credentials
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'Password123');

      // Blur to ensure validation passes
      await user.tab();

      // Submit form
      await user.click(submitButton);

      // Button should show loading state (button is disabled during loading)
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 1000 });
    });

    it('should not submit form when validation fails', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');

      // Try to submit
      await user.click(submitButton);

      // Should show validation error, not attempt submission
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });

      // Should not show "Signing in..." text
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });

    it('should submit form with valid credentials', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill form with valid demo credentials
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'Password123');

      // Blur to ensure validation passes
      await user.tab();

      // Submit form
      await user.click(submitButton);

      // Button should be disabled while loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 1000 });
    });

    it('should display backend error messages from AuthContext', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Use credentials that will fail (MSW handler should return error)
      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'WrongPass123');

      await user.click(submitButton);

      // Should display error from backend
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Mode Configuration', () => {
    it('should validate on blur (not on change)', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);

      // Type invalid email but don't blur
      await user.type(emailInput, 'invalid');

      // Error should NOT appear yet (validation on blur only)
      expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();

      // Now blur
      await user.tab();

      // Error should appear after blur
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration with AuthContext', () => {
    it('should maintain existing AuthContext integration', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByPlaceholderText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Submit with demo credentials
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'Password123');

      // Blur to ensure validation passes
      await user.tab();

      await user.click(submitButton);

      // The form should call AuthContext login function
      // We verify this by checking button is disabled during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 1000 });
    });
  });
});
