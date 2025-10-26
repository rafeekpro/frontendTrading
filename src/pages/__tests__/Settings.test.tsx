import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../../components/ThemeProvider';
import { Settings } from '../Settings';

describe('Settings Page', () => {
  const renderSettings = (initialPath = '/settings') => {
    return render(
      <ThemeProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  describe('Layout and Navigation', () => {
    it('should render settings page with heading', () => {
      renderSettings();
      expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
    });

    it('should display all navigation tabs', () => {
      renderSettings();
      expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /api connections/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /display/i })).toBeInTheDocument();
    });

    it('should highlight active tab based on route', () => {
      renderSettings('/settings/profile');
      const profileTab = screen.getByRole('tab', { name: /profile/i });
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate to correct tab when clicked', async () => {
      const user = userEvent.setup();
      renderSettings('/settings/profile');

      const apiTab = screen.getByRole('tab', { name: /api connections/i });
      await user.click(apiTab);

      expect(apiTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should default to profile tab when visiting /settings', () => {
      renderSettings('/settings');
      const profileTab = screen.getByRole('tab', { name: /profile/i });
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render tab navigation container', () => {
      renderSettings();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for accessibility', () => {
      renderSettings();
      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveAttribute('aria-label', 'Settings navigation');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through tabs', async () => {
      const user = userEvent.setup();
      renderSettings('/settings/profile');

      const profileTab = screen.getByRole('tab', { name: /profile/i });
      profileTab.focus();
      expect(profileTab).toHaveFocus();

      await user.keyboard('{Tab}');
      const apiTab = screen.getByRole('tab', { name: /api connections/i });
      expect(apiTab).toHaveFocus();
    });
  });

  describe('Tab Content', () => {
    it('should display profile content when profile tab is active', () => {
      renderSettings('/settings/profile');
      expect(screen.getByTestId('profile-settings')).toBeInTheDocument();
    });

    it('should display API content when API tab is active', () => {
      renderSettings('/settings/api');
      expect(screen.getByTestId('api-settings')).toBeInTheDocument();
    });

    it('should display notifications content when notifications tab is active', () => {
      renderSettings('/settings/notifications');
      expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    });

    it('should display display settings content when display tab is active', () => {
      renderSettings('/settings/display');
      expect(screen.getByTestId('display-settings')).toBeInTheDocument();
    });
  });
});
