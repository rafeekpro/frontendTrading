import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdown, type FilterOption } from '../FilterDropdown';

describe('FilterDropdown', () => {
  const filterOptions: FilterOption[] = ['all', 'favorites', 'forex', 'crypto', 'stocks'];

  it('should render dropdown trigger button', () => {
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button', { name: /filter|all/i });
    expect(button).toBeInTheDocument();
  });

  it('should display the selected filter option', () => {
    render(<FilterDropdown selected="forex" onChange={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/forex/i);
  });

  it('should open menu when trigger button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Menu should be visible
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('should display all filter options in menu', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Check all options are present
    expect(screen.getByRole('menuitem', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /forex/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /crypto/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /stocks/i })).toBeInTheDocument();
  });

  it('should call onChange when option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<FilterDropdown selected="all" onChange={handleChange} />);

    const button = screen.getByRole('button');
    await user.click(button);

    const forexOption = screen.getByRole('menuitem', { name: /forex/i });
    await user.click(forexOption);

    expect(handleChange).toHaveBeenCalledWith('forex');
  });

  it('should close menu after selecting an option', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    const forexOption = screen.getByRole('menuitem', { name: /forex/i });
    await user.click(forexOption);

    // Menu should close after selection
    const menu = screen.queryByRole('menu');
    expect(menu).not.toBeInTheDocument();
  });

  it('should highlight selected option in menu', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown selected="crypto" onChange={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    const cryptoOption = screen.getByRole('menuitem', { name: /crypto/i });
    // Selected item should have aria-selected or special styling
    expect(cryptoOption).toHaveAttribute('aria-selected', 'true');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<FilterDropdown selected="all" onChange={handleChange} />);

    const button = screen.getByRole('button');

    // Open with Enter key
    button.focus();
    await user.keyboard('{Enter}');

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}'); // Move to "forex"
    await user.keyboard('{Enter}');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should close menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    await user.keyboard('{Escape}');

    const menuAfterEscape = screen.queryByRole('menu');
    expect(menuAfterEscape).not.toBeInTheDocument();
  });

  it('should apply Squaber-style design classes', () => {
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    // Check for dark theme classes
    expect(button).toHaveClass(/bg-gray-|dark/);
  });

  it('should be accessible with ARIA labels', () => {
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringMatching(/filter/i));
  });

  it('should display icons for each filter option', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown selected="all" onChange={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Check for icons (using data-testid or aria-hidden="true" on SVGs)
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should update button text when selected option changes', () => {
    const { rerender } = render(<FilterDropdown selected="all" onChange={() => {}} />);

    let button = screen.getByRole('button');
    expect(button).toHaveTextContent(/all/i);

    rerender(<FilterDropdown selected="forex" onChange={() => {}} />);

    button = screen.getByRole('button');
    expect(button).toHaveTextContent(/forex/i);
  });

  it('should handle all filter options correctly', async () => {
    const user = userEvent.setup();

    for (const option of filterOptions) {
      const handleChange = vi.fn();
      const { unmount } = render(<FilterDropdown selected="all" onChange={handleChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const menuItem = screen.getByRole('menuitem', { name: new RegExp(option, 'i') });
      await user.click(menuItem);

      expect(handleChange).toHaveBeenCalledWith(option);

      unmount();
    }
  });
});
