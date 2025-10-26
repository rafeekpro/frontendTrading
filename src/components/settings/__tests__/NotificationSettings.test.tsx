import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { NotificationSettings } from '../NotificationSettings';

describe('NotificationSettings', () => {
  describe('Notification Toggles', () => {
    it('should render notification settings section', () => {
      render(<NotificationSettings />);
      expect(screen.getByText(/notification settings/i)).toBeInTheDocument();
    });

    it('should display email notifications toggle', () => {
      render(<NotificationSettings />);
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });

    it('should display browser notifications toggle', () => {
      render(<NotificationSettings />);
      expect(screen.getByLabelText(/browser notifications/i)).toBeInTheDocument();
    });

    it('should display price alerts toggle', () => {
      render(<NotificationSettings />);
      expect(screen.getByLabelText(/price alerts/i)).toBeInTheDocument();
    });

    it('should display trade alerts toggle', () => {
      render(<NotificationSettings />);
      expect(screen.getByLabelText(/trade alerts/i)).toBeInTheDocument();
    });

    it('should display opportunity alerts toggle', () => {
      render(<NotificationSettings />);
      expect(screen.getByLabelText(/opportunity alerts/i)).toBeInTheDocument();
    });
  });

  describe('Toggle Interaction', () => {
    it('should toggle email notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationSettings />);

      const emailToggle = screen.getByLabelText(/email notifications/i) as HTMLInputElement;
      const initialState = emailToggle.checked;

      await user.click(emailToggle);

      expect(emailToggle.checked).toBe(!initialState);
    });

    it('should toggle browser notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationSettings />);

      const browserToggle = screen.getByLabelText(/browser notifications/i) as HTMLInputElement;
      const initialState = browserToggle.checked;

      await user.click(browserToggle);

      expect(browserToggle.checked).toBe(!initialState);
    });
  });

  describe('Save Functionality', () => {
    it('should display save button', () => {
      render(<NotificationSettings />);
      expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
    });

    it('should persist settings to localStorage on save', async () => {
      const user = userEvent.setup();
      render(<NotificationSettings />);

      const emailToggle = screen.getByLabelText(/email notifications/i);
      await user.click(emailToggle);

      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      const saved = localStorage.getItem('notificationSettings');
      expect(saved).toBeTruthy();
    });
  });
});
