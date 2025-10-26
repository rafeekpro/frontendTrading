import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { Register } from '../Register';
import { AuthProvider } from '../../contexts/AuthContext';
import { authHandlers } from '../../mocks/handlers/auth';

// Setup MSW test server
const server = setupServer(...authHandlers);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render Register page with necessary providers
function renderRegister() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Register Page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  describe('Form rendering', () => {
    it('should render register form with all required fields', () => {
      renderRegister();

      expect(screen.getByRole('heading', { name: /create.*account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up|register/i })).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      renderRegister();

      const loginLink = screen.getByRole('link', { name: /sign in|login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should render password strength indicator', () => {
      renderRegister();

      // Password strength indicator should be visible
      expect(screen.getByRole('region', { name: /password strength/i })).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show validation error for empty name', async () => {
      const user = userEvent.setup();
      renderRegister();

      const nameInput = screen.getByLabelText(/name/i);
      await user.click(nameInput);
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for weak password', async () => {
      const user = userEvent.setup();
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'weak');
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        // Look for the error message specifically (not the password strength requirement)
        const errorMessage = screen.getByText(/^Password must be at least 8 characters$/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    it('should show validation error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Different123');
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password strength indicator', () => {
    it('should update password strength indicator in real-time', async () => {
      const user = userEvent.setup();
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);

      // Initially weak
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      // Type a strong password
      await user.type(passwordInput, 'StrongPass123');

      // Should show strong
      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeInTheDocument();
      });
    });

    it('should show password requirements checklist', async () => {
      const user = userEvent.setup();
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);

      // Should show all requirements
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one number/i)).toBeInTheDocument();

      // Type a strong password
      await user.type(passwordInput, 'StrongPass123');

      // Requirements should be checked
      await waitFor(() => {
        const checkmarks = screen.getAllByText(/✓/);
        expect(checkmarks.length).toBeGreaterThanOrEqual(4); // All requirements met
      });
    });
  });

  describe('Form submission', () => {
    it('should successfully register with valid data and navigate to login', async () => {
      const user = userEvent.setup();
      renderRegister();

      // Fill out form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      // Should navigate to login page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should show error message for duplicate email', async () => {
      const user = userEvent.setup();
      renderRegister();

      // Fill out form with existing email
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'user@example.com'); // Existing email
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      renderRegister();

      // Fill out form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });
});
