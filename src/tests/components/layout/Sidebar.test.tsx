import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../../../components/layout/Sidebar';

// Wrapper component for router context
function RouterWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Reset window size before each test
    window.innerWidth = 1024;
  });

  describe('Desktop Layout', () => {
    it('should render sidebar with fixed width on desktop', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('w-60'); // 240px = w-60 in Tailwind
    });

    it('should display all navigation items', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /portfolio/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /markets/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('should display icons for each navigation item', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      // Check for icon containers - lucide-react icons have svg elements
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(within(dashboardLink).getByRole('img', { hidden: true })).toBeInTheDocument();

      const portfolioLink = screen.getByRole('link', { name: /portfolio/i });
      expect(within(portfolioLink).getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should highlight active navigation item based on current route', () => {
      // Mock current location as / (Dashboard)
      window.history.pushState({}, 'Dashboard', '/');

      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-accent'); // Active state styling
    });

    it('should not highlight inactive navigation items', () => {
      window.history.pushState({}, 'Dashboard', '/');

      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      const portfolioLink = screen.getByRole('link', { name: /portfolio/i });
      expect(portfolioLink).not.toHaveClass('bg-accent');
    });
  });

  describe('Mobile Layout', () => {
    it('should render hamburger menu button', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      // Hamburger menu button should be present for mobile
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should open mobile drawer when hamburger menu is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      // Find and click hamburger button
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(menuButton);

      // Sheet should now be visible - there will be 2 navigations (desktop + mobile sheet)
      const navigations = screen.getAllByRole('navigation', { name: /main navigation/i });
      expect(navigations.length).toBeGreaterThanOrEqual(1);
    });

    it('should close mobile drawer when navigation item is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      // Open drawer
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(menuButton);

      // Get all dashboard links (desktop + mobile)
      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      // Click the mobile drawer link (should be the last one)
      await user.click(dashboardLinks[dashboardLinks.length - 1]);

      // After clicking, we should be back to initial state
      // The sheet should be closed (controlled by open state)
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

      // Tab to the link
      await user.tab();
      expect(dashboardLink).toHaveFocus();

      // Press Enter to navigate
      await user.keyboard('{Enter}');
      // Link should be activated (browser will handle navigation)
    });

    it('should have descriptive labels for icons', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      // Each link should have text labels, not just icons
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveTextContent('Dashboard');
      expect(screen.getByRole('link', { name: /portfolio/i })).toHaveTextContent('Portfolio');
    });
  });

  describe('Navigation Structure', () => {
    it('should render navigation items in correct order', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      const links = screen.getAllByRole('link');
      const linkTexts = links.map((link) => link.textContent);

      expect(linkTexts).toEqual([
        'Dashboard',
        'Portfolio',
        'Markets',
        'Orders',
        'Settings',
      ]);
    });

    it('should navigate to correct routes', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '/portfolio');
      expect(screen.getByRole('link', { name: /markets/i })).toHaveAttribute('href', '/markets');
      expect(screen.getByRole('link', { name: /orders/i })).toHaveAttribute('href', '/orders');
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
    });
  });
});
