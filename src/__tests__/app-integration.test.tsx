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

  it('should render without errors when DevTools are conditionally included', () => {
    // This test verifies that the App renders successfully with DevTools
    // conditional logic in place. The DevTools component itself may not
    // render in the DOM in test mode, but the conditional should not break anything.
    const { container } = render(<App />);

    // The app should render successfully regardless of DevTools presence
    expect(container).toBeDefined();

    // Verify that QueryClientProvider is working (no context errors)
    // and content is rendered
    expect(container.querySelector('h1')).toBeInTheDocument();
  });
});
