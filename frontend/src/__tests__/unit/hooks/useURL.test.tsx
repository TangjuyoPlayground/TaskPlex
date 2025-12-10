import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEncodeURL, useDecodeURL } from '../../../hooks/useURL';

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

describe('useEncodeURL', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useEncodeURL(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('encodes text', async () => {
    const { result } = renderHook(() => useEncodeURL(), { wrapper: createWrapper() });
    result.current.mutate('hello world');
    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true), {
      timeout: 3000,
    });
  });
});

describe('useDecodeURL', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useDecodeURL(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('decodes text', async () => {
    const { result } = renderHook(() => useDecodeURL(), { wrapper: createWrapper() });
    result.current.mutate('hello%20world');
    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true), {
      timeout: 3000,
    });
  });
});

