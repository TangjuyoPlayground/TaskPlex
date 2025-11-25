import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import './i18n/config'; // Initialize i18n for tests

// ============================================
// MSW Server Setup
// ============================================
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});

// ============================================
// Browser Mocks
// ============================================

// Mock window.matchMedia for UI components (theme detection, etc.)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)' ? false : false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL.createObjectURL for file handling tests
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock-url'),
  });
}

// Mock URL.revokeObjectURL for file handling tests
if (typeof URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
  });
}

// Mock IntersectionObserver for lazy loading tests
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver for responsive components
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
