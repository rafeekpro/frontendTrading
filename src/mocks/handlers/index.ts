/**
 * MSW Handlers Registry
 * Central export point for all MSW request handlers
 */

import { instrumentsHandlers } from './instruments';
import { tradingHandlers } from './trading';
import { authHandlers } from './auth';

/**
 * Combined array of all MSW handlers
 * Add new handler arrays here as they are created
 */
export const handlers = [
  ...instrumentsHandlers,
  ...tradingHandlers,
  ...authHandlers,
  // Add more handler arrays here:
  // ...ordersHandlers,
  // ...accountHandlers,
];
