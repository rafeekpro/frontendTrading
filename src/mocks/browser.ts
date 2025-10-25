/**
 * MSW Browser Worker Setup
 * Configures Mock Service Worker for browser environment
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Create MSW browser worker with all handlers
 * This worker will intercept browser fetch requests and return mocked responses
 */
export const worker = setupWorker(...handlers);

/**
 * Start MSW worker with configuration
 * Only call this in development mode
 */
export async function startMockServiceWorker(): Promise<void> {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'warn', // Warn for unhandled requests in development
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    // eslint-disable-next-line no-console
    console.log('[MSW] Mock Service Worker started successfully');
    // eslint-disable-next-line no-console
    console.log('[MSW] Intercepting API requests for development');
  }
}
