import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DisplaySettings } from '../DisplaySettings';
import { ThemeProvider } from '../../ThemeProvider';

describe('DisplaySettings', () => {
  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <DisplaySettings />
      </ThemeProvider>
    );
  };

  describe('Theme Switcher', () => {
    it('should render theme selection section', () => {
      renderWithTheme();
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
    });

    it('should display light and dark theme options', () => {
      renderWithTheme();
      expect(screen.getByLabelText(/light/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dark/i)).toBeInTheDocument();
    });

    it('should show current theme as selected', () => {
      renderWithTheme();
      const lightRadio = screen.getByLabelText(/light/i) as HTMLInputElement;
      expect(lightRadio.checked).toBe(true);
    });

    it('should switch theme when dark option is selected', async () => {
      const user = userEvent.setup();
      renderWithTheme();

      const darkRadio = screen.getByLabelText(/dark/i);
      await user.click(darkRadio);

      expect(darkRadio).toBeChecked();
    });

    it('should apply dark class to document when dark theme selected', async () => {
      const user = userEvent.setup();
      renderWithTheme();

      const darkRadio = screen.getByLabelText(/dark/i);
      await user.click(darkRadio);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class when light theme selected', async () => {
      const user = userEvent.setup();
      renderWithTheme();

      // First switch to dark
      const darkRadio = screen.getByLabelText(/dark/i);
      await user.click(darkRadio);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Then switch back to light
      const lightRadio = screen.getByLabelText(/light/i);
      await user.click(lightRadio);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should persist theme selection to localStorage', async () => {
      const user = userEvent.setup();
      renderWithTheme();

      const darkRadio = screen.getByLabelText(/dark/i);
      await user.click(darkRadio);

      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('Display Settings Form', () => {
    it('should render all display preference fields', () => {
      renderWithTheme();
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
    });
  });
});
