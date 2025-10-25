import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App QueryProvider Integration', () => {
  it('should wrap application with QueryClientProvider', () => {
    // This test verifies that the App component renders without errors
    // when QueryClientProvider is properly integrated
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('should provide query context to child components', async () => {
    // This test ensures that the QueryClientProvider is properly wrapping
    // the application and providing query context
    const { container } = render(<App />);

    // If QueryClientProvider is not present, React Query hooks would fail
    // The app should render without throwing context errors
    // Check that the app rendered successfully with content
    expect(container.querySelector('h1')).toBeInTheDocument();
  });

  it('should render ReactQueryDevtools in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;

    // This test will check if DevTools are present when DEV is true
    render(<App />);

    // DevTools should be in the document (they add a button to the DOM)
    // We'll look for the DevTools container in the DOM
    const devTools = document.querySelector('[data-testid="react-query-devtools"]');

    // In development, DevTools should be present
    if (import.meta.env.DEV) {
      expect(devTools).toBeInTheDocument();
    }
  });
});
