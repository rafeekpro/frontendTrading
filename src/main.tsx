import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Initialize Mock Service Worker in development mode
 */
async function initializeMSW() {
  if (import.meta.env.DEV) {
    const { startMockServiceWorker } = await import('./mocks/browser');
    await startMockServiceWorker();
  }
}

/**
 * Bootstrap the application
 */
async function bootstrap() {
  // Initialize MSW before rendering app
  await initializeMSW();

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Failed to find the root element');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Start the application
bootstrap().catch(error => {
  console.error('[Bootstrap] Failed to start application:', error);
});
