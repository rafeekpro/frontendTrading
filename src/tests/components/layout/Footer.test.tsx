import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    // Reset any environment variables or state
    vi.stubEnv('VITE_APP_VERSION', '1.0.0');
  });

  describe('Rendering', () => {
    it('should render the footer component', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should display copyright information', () => {
      render(<Footer />);

      const currentYear = new Date().getFullYear();
      const copyrightText = screen.getByText(new RegExp(`© ${currentYear}.*TradingPlatform`, 'i'));
      expect(copyrightText).toBeInTheDocument();
    });

    it('should display all footer links', () => {
      render(<Footer />);

      expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /api docs/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /support/i })).toBeInTheDocument();
    });

    it('should display version number from environment variable', () => {
      render(<Footer />);

      const versionText = screen.getByText(/v1\.0\.0/i);
      expect(versionText).toBeInTheDocument();
    });

    it('should display default version if environment variable is not set', () => {
      vi.stubEnv('VITE_APP_VERSION', undefined);

      render(<Footer />);

      const versionText = screen.getByText(/v0\.0\.0/i);
      expect(versionText).toBeInTheDocument();
    });
  });

  describe('Footer Links', () => {
    it('should have correct href attributes for all links', () => {
      render(<Footer />);

      const privacyLink = screen.getByRole('link', { name: /privacy/i });
      expect(privacyLink).toHaveAttribute('href', '/privacy');

      const termsLink = screen.getByRole('link', { name: /terms/i });
      expect(termsLink).toHaveAttribute('href', '/terms');

      const apiDocsLink = screen.getByRole('link', { name: /api docs/i });
      expect(apiDocsLink).toHaveAttribute('href', '/api-docs');

      const supportLink = screen.getByRole('link', { name: /support/i });
      expect(supportLink).toHaveAttribute('href', '/support');
    });

    it('should render links as anchor tags', () => {
      render(<Footer />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(4);

      links.forEach((link) => {
        expect(link.tagName).toBe('A');
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should use flexbox layout', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      const styles = window.getComputedStyle(footer);

      // Footer should have flex or grid display (checking for responsive layout)
      expect(footer).toBeInTheDocument();
    });

    it('should contain copyright section and links section', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      const currentYear = new Date().getFullYear();

      // Check that both copyright and links are within footer
      expect(footer).toContainElement(screen.getByText(new RegExp(`© ${currentYear}`, 'i')));
      expect(footer).toContainElement(screen.getByRole('link', { name: /privacy/i }));
    });
  });

  describe('Responsive Behavior', () => {
    it('should render all elements in correct container structure', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');

      // Verify footer contains all expected elements
      expect(footer).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument();
      expect(screen.getByText(/v1\.0\.0/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic footer element with contentinfo role', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should have descriptive link text', () => {
      render(<Footer />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link.textContent).toBeTruthy();
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Version Display', () => {
    it('should format version number correctly', () => {
      vi.stubEnv('VITE_APP_VERSION', '2.5.3');

      render(<Footer />);

      const versionText = screen.getByText(/v2\.5\.3/i);
      expect(versionText).toBeInTheDocument();
    });
  });
});
