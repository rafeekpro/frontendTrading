import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { APISettings } from '../APISettings';

describe('APISettings', () => {
  describe('API Connection Display', () => {
    it('should render API connections section', () => {
      render(<APISettings />);
      expect(screen.getByText(/api connections/i)).toBeInTheDocument();
    });

    it('should display all AI provider options', () => {
      render(<APISettings />);
      expect(screen.getByText(/openai/i)).toBeInTheDocument();
      expect(screen.getByText(/anthropic/i)).toBeInTheDocument();
      expect(screen.getByText(/gemini/i)).toBeInTheDocument();
    });

    it('should show API key input field', () => {
      render(<APISettings />);
      expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
    });

    it('should display save button', () => {
      render(<APISettings />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should show provider selection dropdown', () => {
      render(<APISettings />);
      expect(screen.getByLabelText(/provider/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should allow selecting a provider', async () => {
      const user = userEvent.setup();
      render(<APISettings />);

      const providerSelect = screen.getByLabelText(/provider/i);
      await user.selectOptions(providerSelect, 'anthropic');

      expect((providerSelect as HTMLSelectElement).value).toBe('anthropic');
    });

    it('should allow entering API key', async () => {
      const user = userEvent.setup();
      render(<APISettings />);

      const apiKeyInput = screen.getByLabelText(/api key/i);
      await user.type(apiKeyInput, 'test-api-key-123');

      expect((apiKeyInput as HTMLInputElement).value).toBe('test-api-key-123');
    });

    it('should mask API key input', () => {
      render(<APISettings />);
      const apiKeyInput = screen.getByLabelText(/api key/i);
      expect(apiKeyInput).toHaveAttribute('type', 'password');
    });
  });
});
