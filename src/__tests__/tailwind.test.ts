import { describe, it, expect } from 'vitest';

/**
 * TDD RED PHASE: Tailwind CSS Configuration Tests
 *
 * These tests verify that Tailwind CSS is properly installed and configured.
 * They MUST FAIL initially before Tailwind is installed.
 */

describe('Tailwind CSS Configuration', () => {
  it('should have Tailwind CSS available', () => {
    // Test that we can import the main CSS file without errors
    // This will fail if Tailwind directives are not properly configured
    expect(() => {
      // In a real app, this would be imported in main.tsx
      // For testing, we verify the file exists and can be processed
      require('../index.css');
    }).not.toThrow();
  });

  it('should process Tailwind directives in CSS', async () => {
    // Read the CSS file source and verify it contains Tailwind directives
    const fs = await import('fs');
    const path = await import('path');
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // These directives should be present after Tailwind is configured
    // This test will fail until we add Tailwind directives to index.css
    expect(cssContent).toContain('@tailwind base');
    expect(cssContent).toContain('@tailwind components');
    expect(cssContent).toContain('@tailwind utilities');
  });

  it('should have PostCSS configuration file', async () => {
    // Verify PostCSS config exists
    // This will fail until we create postcss.config.js
    const fs = await import('fs');
    const path = await import('path');
    const postcssConfigPath = path.resolve(process.cwd(), 'postcss.config.js');

    expect(fs.existsSync(postcssConfigPath)).toBe(true);
  });

  it('should have Tailwind configuration file', async () => {
    // Verify Tailwind config exists
    // This will fail until we create tailwind.config.js
    const fs = await import('fs');
    const path = await import('path');
    const tailwindConfigPath = path.resolve(process.cwd(), 'tailwind.config.js');

    expect(fs.existsSync(tailwindConfigPath)).toBe(true);
  });

  it('should have Tailwind configured with correct content paths', async () => {
    // Verify Tailwind config has proper content paths for React/Vite
    // This will fail until we configure content paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tailwindConfig = (await import('../../tailwind.config.js')) as any;

    expect(tailwindConfig.default).toBeDefined();
    expect(tailwindConfig.default.content).toBeDefined();
    expect(Array.isArray(tailwindConfig.default.content)).toBe(true);
    expect(tailwindConfig.default.content.length).toBeGreaterThan(0);

    // Verify it includes src directory
    const contentPaths = tailwindConfig.default.content as string[];
    const hasSrcPath = contentPaths.some((path: string) =>
      path.includes('src') || path.includes('./src')
    );
    expect(hasSrcPath).toBe(true);
  });

  it('should have trading-specific theme colors configured', async () => {
    // Verify custom theme colors for trading (green for profit, red for loss)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tailwindConfig = (await import('../../tailwind.config.js')) as any;

    expect(tailwindConfig.default.theme?.extend?.colors).toBeDefined();

    const colors = tailwindConfig.default.theme.extend.colors;

    // Trading colors should be configured
    expect(colors).toHaveProperty('profit');
    expect(colors).toHaveProperty('loss');
  });
});
