import { describe, it, expect } from 'vitest';
import { queryClient } from '../query-client';

describe('QueryClient Configuration', () => {
  it('should have staleTime set to 30 seconds for time-sensitive trading data', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBe(30000); // 30 seconds in milliseconds
  });

  it('should have cacheTime set to 5 minutes', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.gcTime).toBe(300000); // 5 minutes in milliseconds (gcTime is the new name for cacheTime)
  });

  it('should retry failed queries 3 times', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.retry).toBe(3);
  });

  it('should refetch on window focus to keep data fresh', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
  });

  it('should be a valid QueryClient instance', () => {
    expect(queryClient).toBeDefined();
    expect(typeof queryClient.getDefaultOptions).toBe('function');
  });
});
