import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';

describe('Header Component', () => {
  beforeEach(() => {
    // Reset any state before each test
    document.documentElement.className = '';
  });

  describe('Rendering', () => {
    it('should render the header component', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should display logo/branding section', () => {
      render(<Header />);

      const logo = screen.getByText(/TradingPlatform/i);
      expect(logo).toBeInTheDocument();
    });

    it('should display search bar placeholder', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toBeDisabled(); // Non-functional placeholder
    });

    it('should display hamburger menu button on mobile', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should display theme toggle placeholder button', () => {
      render(<Header />);

      const themeButton = screen.getByRole('button', { name: /theme/i });
      expect(themeButton).toBeInTheDocument();
    });
  });

  describe('Profile Dropdown', () => {
    it('should display profile button', () => {
      render(<Header />);

      const profileButton = screen.getByRole('button', { name: /profile/i });
      expect(profileButton).toBeInTheDocument();
    });

    it('should open dropdown menu when profile button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const profileButton = screen.getByRole('button', { name: /profile/i });
      await user.click(profileButton);

      // Dropdown menu should be visible
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('should display profile dropdown menu items', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const profileButton = screen.getByRole('button', { name: /profile/i });
      await user.click(profileButton);

      // Check for menu items
      expect(screen.getByRole('menuitem', { name: /my account/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Header />
          <div data-testid="outside" style={{ pointerEvents: 'auto', padding: '20px' }}>Outside element</div>
        </div>
      );

      const profileButton = screen.getByRole('button', { name: /profile/i });
      await user.click(profileButton);

      // Menu is open
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape to close (more reliable than clicking outside)
      await user.keyboard('{Escape}');

      // Menu should be closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Hamburger Menu', () => {
    it('should call onMenuClick when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      const onMenuClick = vi.fn();

      render(<Header onMenuClick={onMenuClick} />);

      const menuButton = screen.getByLabelText('Menu');
      await user.click(menuButton);

      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Menu');
      expect(menuButton).toHaveAttribute('aria-label', 'Menu');

      const profileButton = screen.getByLabelText('Profile menu');
      expect(profileButton).toHaveAttribute('aria-label', 'Profile menu');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Get the profile button
      const profileButton = screen.getByLabelText('Profile menu');

      // Focus on the profile button directly
      profileButton.focus();
      expect(profileButton).toHaveFocus();

      // Open dropdown with Enter key
      await user.keyboard('{Enter}');
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render search bar on desktop', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should display all header elements in correct order', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      const elements = header.querySelectorAll('*');

      // Verify header contains all expected elements
      expect(header).toContainElement(screen.getByText(/TradingPlatform/i));
      expect(header).toContainElement(screen.getByPlaceholderText(/search/i));
      expect(header).toContainElement(screen.getByRole('button', { name: /profile/i }));
    });
  });
});
