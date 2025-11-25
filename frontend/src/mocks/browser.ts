/**
 * MSW Browser Worker for development
 * Uncomment the initialization in main.tsx to use mock APIs in development
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the MSW browser worker
export const worker = setupWorker(...handlers);

