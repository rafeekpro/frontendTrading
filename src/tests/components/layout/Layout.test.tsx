import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Layout', () => {
  describe('Structure', () => {
    it('renders header component', () => {
      renderWithRouter(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('renders footer component', () => {
      renderWithRouter(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('renders sidebar component', () => {
      renderWithRouter(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('renders children content', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="test-content">Custom Content</div>
        </Layout>
      );

      const content = screen.getByTestId('test-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Custom Content');
    });
  });

  describe('Responsive Layout', () => {
    it('has proper content area spacing', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="content">Content</div>
        </Layout>
      );

      const content = screen.getByTestId('content');
      const container = content.parentElement;

      expect(container).toHaveClass('flex-1');
    });

    it('uses flexbox layout structure', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('flex');
      expect(layoutContainer).toHaveClass('min-h-screen');
    });
  });

  describe('Accessibility', () => {
    it('has proper landmark regions', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      // Sidebar renders navigation for desktop and mobile (2 instances)
      const navs = screen.getAllByRole('navigation');
      expect(navs.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      expect(screen.getByRole('main')).toBeInTheDocument(); // main content
    });

    it('main content has proper ARIA label', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Main content');
    });
  });

  describe('Integration', () => {
    it('renders complete layout with all components', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="page-content">Dashboard Page</div>
        </Layout>
      );

      // Verify all parts are present
      expect(screen.getByRole('banner')).toBeInTheDocument();
      const navs = screen.getAllByRole('navigation');
      expect(navs.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });

    it('applies correct layout hierarchy', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Check that main content is properly nested
      const main = screen.getByRole('main');
      expect(main.parentElement).toHaveClass('flex-1');
    });
  });
});
