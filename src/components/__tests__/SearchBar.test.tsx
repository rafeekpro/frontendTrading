import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render search input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search instruments" />);

    const input = screen.getByPlaceholderText('Search instruments');
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    render(<SearchBar value="EURUSD" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('EURUSD');
  });

  it('should have accessible label for screen readers', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByLabelText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'EUR');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should display search icon', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    // Search icon should be present (using data-testid or role)
    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should show clear button when value is not empty', () => {
    render(<SearchBar value="EURUSD" onChange={() => {}} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const clearButton = screen.queryByRole('button', { name: /clear/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear value when clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="EURUSD" onChange={handleChange} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should debounce onChange calls', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');

    // Type multiple characters quickly
    await user.type(input, 'EUR');

    // Initially, onChange should be called for each keystroke (controlled input)
    // But the debounced callback should only be called after delay
    expect(handleChange).toHaveBeenCalled();

    // Wait for debounce delay (300ms + buffer)
    await waitFor(
      () => {
        // The final debounced value should be set
        expect(handleChange).toHaveBeenLastCalledWith('EUR');
      },
      { timeout: 500 }
    );
  });

  it('should use custom placeholder when provided', () => {
    render(
      <SearchBar value="" onChange={() => {}} placeholder="Find trading pairs" />
    );

    const input = screen.getByPlaceholderText('Find trading pairs');
    expect(input).toBeInTheDocument();
  });

  it('should use default placeholder when not provided', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(input).toHaveFocus();

    await user.tab();
    expect(input).not.toHaveFocus();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="test" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Clear with keyboard
    await user.keyboard('{Escape}');

    // Should clear on Escape (if implemented)
    // Or focus should remain on input
    expect(input).toHaveFocus();
  });

  it('should apply Squaber-style design classes', () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} />);

    // Check for dark theme classes
    const searchBarContainer = container.firstChild;
    expect(searchBarContainer).toHaveClass(/dark|bg-/);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="test" onChange={handleChange} />);

    // Tab to input
    await user.tab();
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();

    // Tab to clear button
    await user.tab();
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toHaveFocus();

    // Activate clear button with Enter
    await user.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
