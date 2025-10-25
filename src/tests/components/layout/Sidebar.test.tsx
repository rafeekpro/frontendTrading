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
      // Mock current location as /dashboard
      window.history.pushState({}, 'Dashboard', '/dashboard');

      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-accent'); // Active state styling
    });

    it('should not highlight inactive navigation items', () => {
      window.history.pushState({}, 'Dashboard', '/dashboard');

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
    beforeEach(() => {
      // Set mobile viewport
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));
    });

    it('should not display sidebar by default on mobile', () => {
      render(
        <RouterWrapper>
          <Sidebar />
        </RouterWrapper>
      );

      // On mobile, sidebar should be hidden behind Sheet (drawer)
      const navigation = screen.queryByRole('navigation', { name: /main navigation/i });
      expect(navigation).not.toBeVisible();
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

      // Sheet should now be visible
      const navigation = screen.getByRole('navigation', { name: /main navigation/i });
      expect(navigation).toBeVisible();
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

      // Click a navigation item
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      // Drawer should close
      const navigation = screen.queryByRole('navigation', { name: /main navigation/i });
      expect(navigation).not.toBeVisible();
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
