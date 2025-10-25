import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes with default delay (300ms)', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });

    // Value should NOT change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 299ms (still not debounced)
    vi.advanceTimersByTime(299);
    expect(result.current).toBe('initial');

    // Fast-forward time by 1ms more (total 300ms - should debounce)
    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should debounce value changes with custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    // Fast-forward by 499ms
    vi.advanceTimersByTime(499);
    expect(result.current).toBe('initial');

    // Fast-forward by 1ms more (total 500ms)
    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous timeout when value changes rapidly', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // First change
    rerender({ value: 'first' });
    vi.advanceTimersByTime(100);

    // Second change (should cancel first timeout)
    rerender({ value: 'second' });
    vi.advanceTimersByTime(100);

    // Third change (should cancel second timeout)
    rerender({ value: 'third' });

    // Still initial because we haven't waited 300ms since last change
    expect(result.current).toBe('initial');

    // Now wait full 300ms from last change
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe('third');
    });
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebounce('value', 300));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should work with different data types (number)', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('should work with different data types (object)', async () => {
    const initialObj = { id: 1, name: 'initial' };
    const updatedObj = { id: 2, name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } }
    );

    rerender({ value: updatedObj });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toEqual(updatedObj);
    });
  });

  it('should work with different data types (array)', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: [1, 2, 3] } }
    );

    rerender({ value: [4, 5, 6] });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toEqual([4, 5, 6]);
    });
  });

  it('should handle delay changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // Change value and delay
    rerender({ value: 'updated', delay: 100 });

    // Should use new delay (100ms)
    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});
