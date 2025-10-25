/**
 * MSW Handlers Registry
 * Central export point for all MSW request handlers
 */

import { instrumentsHandlers } from './instruments';

/**
 * Combined array of all MSW handlers
 * Add new handler arrays here as they are created
 */
export const handlers = [
  ...instrumentsHandlers
  // Add more handler arrays here:
  // ...ordersHandlers,
  // ...accountHandlers,
  // ...authHandlers,
];
