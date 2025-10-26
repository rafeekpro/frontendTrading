/**
 * MSW Handlers Registry
 * Central export point for all MSW request handlers
 */

import { instrumentsHandlers } from './instruments';
import { tradingHandlers } from './trading';
import { authHandlers } from './auth';
import { opportunitiesHandlers } from './opportunities';
import { resultsHandlers } from './results';

/**
 * Combined array of all MSW handlers
 * Add new handler arrays here as they are created
 */
export const handlers = [
  ...instrumentsHandlers,
  ...tradingHandlers,
  ...authHandlers,
  ...opportunitiesHandlers,
  ...resultsHandlers,
  // Add more handler arrays here:
  // ...ordersHandlers,
  // ...accountHandlers,
];
