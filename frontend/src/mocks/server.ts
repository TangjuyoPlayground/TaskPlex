/**
 * MSW Server for Node.js (tests)
 * This server intercepts HTTP requests during testing
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the MSW server with all handlers
export const server = setupServer(...handlers);

// Export handlers for dynamic manipulation in tests
export { handlers };

