import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../components/ThemeProvider';
import ComponentShowcase from './ComponentShowcase';

describe('ComponentShowcase', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should render the page title', () => {
    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    expect(screen.getByRole('heading', { name: /component showcase/i })).toBeInTheDocument();
  });

  it('should render theme toggle button', () => {
    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /toggle.*theme/i })).toBeInTheDocument();
  });

  it('should toggle theme when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle.*theme/i });

    // Initially light mode (no dark class)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle to dark mode
    await user.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click to toggle back to light mode
    await user.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should display current theme status', () => {
    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    expect(screen.getByText(/current theme:/i)).toBeInTheDocument();
    expect(screen.getByText(/light/i)).toBeInTheDocument();
  });

  it('should have responsive container', () => {
    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    const container = screen.getByRole('main');
    expect(container).toHaveClass('container');
  });

  it('should render placeholder for Button section', () => {
    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    expect(screen.getByRole('heading', { name: /buttons/i })).toBeInTheDocument();
  });

  it('should render placeholder for Card section', () => {
    render(
      <ThemeProvider>
        <ComponentShowcase />
      </ThemeProvider>
    );

    expect(screen.getByRole('heading', { name: /cards/i })).toBeInTheDocument();
  });
});
