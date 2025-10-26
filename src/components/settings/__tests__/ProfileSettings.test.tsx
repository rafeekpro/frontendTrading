import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ProfileSettings } from '../ProfileSettings';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ProfileSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Form Rendering', () => {
    it('should render profile settings form with all fields', () => {
      render(<ProfileSettings />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    });

    it('should display save and cancel buttons', () => {
      render(<ProfileSettings />);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should disable save button initially when form is not dirty', () => {
      render(<ProfileSettings />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should load user data from localStorage if available', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        timezone: 'America/New_York',
        language: 'en',
        bio: 'Test bio',
      };
      localStorageMock.setItem('userProfile', JSON.stringify(mockUser));

      render(<ProfileSettings />);

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid name (too short)', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should show validation error if bio exceeds 200 characters', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const bioInput = screen.getByLabelText(/bio/i);
      const longBio = 'A'.repeat(201);
      await user.clear(bioInput);
      await user.type(bioInput, longBio);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/bio must be less than 200 characters/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors when form is valid', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should enable save button when form is dirty', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      const saveButton = screen.getByRole('button', { name: /save changes/i });

      expect(saveButton).toBeDisabled();

      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should save profile data to localStorage on submit', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const saveButton = screen.getByRole('button', { name: /save changes/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Smith');
      await user.clear(emailInput);
      await user.type(emailInput, 'jane@example.com');

      await user.click(saveButton);

      await waitFor(() => {
        const savedData = JSON.parse(localStorageMock.getItem('userProfile') || '{}');
        expect(savedData.name).toBe('Jane Smith');
        expect(savedData.email).toBe('jane@example.com');
      });
    });

    it('should show success message after saving', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      const saveButton = screen.getByRole('button', { name: /save changes/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should reset form to original values on cancel', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      const originalValue = nameInput.value;

      await user.clear(nameInput);
      await user.type(nameInput, 'Changed Name');
      expect(nameInput.value).toBe('Changed Name');

      await user.click(cancelButton);

      await waitFor(() => {
        expect(nameInput.value).toBe(originalValue);
      });
    });
  });

  describe('Email Field Behavior', () => {
    it('should display email as read-only', () => {
      render(<ProfileSettings />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('readonly');
    });

    it('should show informational message that email cannot be changed', () => {
      render(<ProfileSettings />);

      expect(screen.getByText(/email cannot be changed/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const timezoneInput = screen.getByLabelText(/timezone/i);
      const languageInput = screen.getByLabelText(/language/i);

      expect(nameInput).toHaveAccessibleName();
      expect(emailInput).toHaveAccessibleName();
      expect(timezoneInput).toHaveAccessibleName();
      expect(languageInput).toHaveAccessibleName();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<ProfileSettings />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/name must be at least 2 characters/i);
        expect(errorMessage).toBeInTheDocument();
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
