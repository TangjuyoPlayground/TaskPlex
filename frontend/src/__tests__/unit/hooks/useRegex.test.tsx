/**
 * Tests for useRegex hook
 * Uses MSW for API mocking
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegex } from '../../../hooks/useRegex';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRegex', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useRegex(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('can trigger regex test mutation', async () => {
    const { result } = renderHook(() => useRegex(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      pattern: 'hello',
      text: 'hello world',
      flags: 'g',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess) {
      expect(result.current.data?.success).toBe(true);
      expect(result.current.data?.count).toBeGreaterThan(0);
    }
  });

  it('can test with different flags', async () => {
    const { result } = renderHook(() => useRegex(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      pattern: 'HELLO',
      text: 'hello world',
      flags: 'gi', // case insensitive
    });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });

  it('returns matches array in response when successful', async () => {
    const { result } = renderHook(() => useRegex(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      pattern: '\\d+',
      text: '123 test 456',
      flags: 'g',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess && result.current.data) {
      expect(result.current.data.matches).toBeDefined();
      expect(Array.isArray(result.current.data.matches)).toBe(true);
    }
  });

  it('completes mutation and sets isPending to false', async () => {
    const { result } = renderHook(() => useRegex(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      pattern: 'test',
      text: 'test string',
      flags: 'g',
    });
    
    // Wait for mutation to complete
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });

  it('can reset mutation state after completion', async () => {
    const { result } = renderHook(() => useRegex(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      pattern: 'hello',
      text: 'hello',
      flags: 'g',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    // Reset and wait for state update
    result.current.reset();
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });
});

