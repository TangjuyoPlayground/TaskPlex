/**
 * MSW Mocks - Entry point
 * 
 * For tests: import { server } from './mocks/server'
 * For browser dev: import { worker } from './mocks/browser'
 */

// Re-export handlers for custom test scenarios
export { 
  handlers, 
  videoHandlers, 
  imageHandlers, 
  pdfHandlers, 
  regexHandlers, 
  unitsHandlers,
  errorHandlers,
} from './handlers';

