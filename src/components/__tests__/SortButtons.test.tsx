/**
 * Tests for SortButtons component
 * Column header sort controls with ascending/descending toggle
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortButtons, type SortButtonsProps } from '../SortButtons';
import type { SortColumn, SortDirection } from '../../lib/list-utils';

describe('SortButtons', () => {
  const columns: Array<{ key: SortColumn; label: string }> = [
    { key: 'symbol', label: 'Symbol' },
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'change', label: '24h Change' },
    { key: 'volume', label: '24h Volume' },
  ];

  const defaultProps: SortButtonsProps = {
    columns,
    sortColumn: 'symbol',
    sortDirection: 'asc',
    onSortChange: vi.fn(),
  };

  it('should render all column header buttons', () => {
    render(<SortButtons {...defaultProps} />);

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('24h Change')).toBeInTheDocument();
    expect(screen.getByText('24h Volume')).toBeInTheDocument();
  });

  it('should display ascending icon for active sort column', () => {
    render(<SortButtons {...defaultProps} sortColumn="symbol" sortDirection="asc" />);

    // Look for ascending icon (ChevronUp or ArrowUp)
    const symbolButton = screen.getByRole('button', { name: /symbol/i });
    const svg = symbolButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display descending icon for active sort column', () => {
    render(<SortButtons {...defaultProps} sortColumn="symbol" sortDirection="desc" />);

    // Look for descending icon (ChevronDown or ArrowDown)
    const symbolButton = screen.getByRole('button', { name: /symbol/i });
    const svg = symbolButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should not display icon for inactive columns', () => {
    render(<SortButtons {...defaultProps} sortColumn="symbol" sortDirection="asc" />);

    const nameButton = screen.getByRole('button', { name: /sort by name/i });
    const priceButton = screen.getByRole('button', { name: /sort by price/i });

    // Inactive columns should not have sort icons
    expect(nameButton.querySelector('svg')).not.toBeInTheDocument();
    expect(priceButton.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should call onSortChange with ascending when clicking inactive column', async () => {
    const user = userEvent.setup();
    const handleSortChange = vi.fn();

    render(<SortButtons {...defaultProps} onSortChange={handleSortChange} />);

    const nameButton = screen.getByRole('button', { name: /sort by name/i });
    await user.click(nameButton);

    expect(handleSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('should toggle to descending when clicking active ascending column', async () => {
    const user = userEvent.setup();
    const handleSortChange = vi.fn();

    render(
      <SortButtons
        {...defaultProps}
        sortColumn="symbol"
        sortDirection="asc"
        onSortChange={handleSortChange}
      />
    );

    const symbolButton = screen.getByRole('button', { name: /symbol/i });
    await user.click(symbolButton);

    expect(handleSortChange).toHaveBeenCalledWith('symbol', 'desc');
  });

  it('should toggle to ascending when clicking active descending column', async () => {
    const user = userEvent.setup();
    const handleSortChange = vi.fn();

    render(
      <SortButtons
        {...defaultProps}
        sortColumn="symbol"
        sortDirection="desc"
        onSortChange={handleSortChange}
      />
    );

    const symbolButton = screen.getByRole('button', { name: /symbol/i });
    await user.click(symbolButton);

    expect(handleSortChange).toHaveBeenCalledWith('symbol', 'asc');
  });

  it('should apply active styling to sorted column', () => {
    render(<SortButtons {...defaultProps} sortColumn="price" sortDirection="asc" />);

    const priceButton = screen.getByRole('button', { name: /price/i });

    // Active button should have distinct styling (check for text color or background)
    expect(priceButton).toHaveClass(/text-blue-|bg-blue-/);
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleSortChange = vi.fn();

    render(<SortButtons {...defaultProps} onSortChange={handleSortChange} />);

    // Tab to first button
    await user.tab();
    const symbolButton = screen.getByRole('button', { name: /symbol/i });
    expect(symbolButton).toHaveFocus();

    // Press Enter to sort
    await user.keyboard('{Enter}');
    expect(handleSortChange).toHaveBeenCalled();
  });

  it('should be accessible with ARIA labels', () => {
    render(<SortButtons {...defaultProps} sortColumn="price" sortDirection="asc" />);

    const priceButton = screen.getByRole('button', { name: /price/i });

    // Should have aria-label or accessible name describing sort state
    expect(priceButton).toHaveAttribute('aria-label');
    expect(priceButton.getAttribute('aria-label')).toMatch(/sort|price/i);
  });

  it('should indicate sort direction in ARIA label', () => {
    render(<SortButtons {...defaultProps} sortColumn="price" sortDirection="desc" />);

    const priceButton = screen.getByRole('button', { name: /price/i });
    const ariaLabel = priceButton.getAttribute('aria-label') || '';

    expect(ariaLabel).toMatch(/descending|desc/i);
  });

  it('should handle rapid clicks without duplicate calls', async () => {
    const user = userEvent.setup();
    const handleSortChange = vi.fn();

    render(<SortButtons {...defaultProps} onSortChange={handleSortChange} />);

    const nameButton = screen.getByRole('button', { name: /sort by name/i });

    // Click twice rapidly
    await user.click(nameButton);
    await user.click(nameButton);

    // Should be called twice (once per click)
    expect(handleSortChange).toHaveBeenCalledTimes(2);
  });

  it('should apply Squaber-style dark theme design', () => {
    render(<SortButtons {...defaultProps} />);

    const symbolButton = screen.getByRole('button', { name: /symbol/i });

    // Check for dark theme classes
    expect(symbolButton).toHaveClass(/bg-gray-|dark/);
  });

  it('should show hover effect on buttons', () => {
    render(<SortButtons {...defaultProps} />);

    const nameButton = screen.getByRole('button', { name: /sort by name/i });

    // Should have hover styles
    expect(nameButton).toHaveClass(/hover:/);
  });
});
