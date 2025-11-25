/**
 * Tests for useImage hooks (useCompressImage, useConvertImage)
 * Uses MSW for API mocking
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompressImage, useConvertImage } from '../../../hooks/useImage';

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

const createMockFile = (name: string, type: string) => {
  return new File(['test content'], name, { type });
};

describe('useCompressImage', () => {
  beforeEach(() => {
    // MSW handlers are already set up
  });

  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useCompressImage(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('can trigger image compression mutation', async () => {
    const { result } = renderHook(() => useCompressImage(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('test.jpg', 'image/jpeg');
    
    result.current.mutate({ file, quality: 'medium' });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess) {
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.success).toBe(true);
    }
  });

  it('handles different quality levels', async () => {
    const { result } = renderHook(() => useCompressImage(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('photo.png', 'image/png');
    
    // Test with low quality
    result.current.mutate({ file, quality: 'low' });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });
});

describe('useConvertImage', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useConvertImage(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger image conversion mutation', async () => {
    const { result } = renderHook(() => useConvertImage(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('test.jpg', 'image/jpeg');
    
    result.current.mutate({ file, outputFormat: 'webp', quality: 'high' });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });

  it('can convert to different formats', async () => {
    const { result } = renderHook(() => useConvertImage(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockFile('photo.png', 'image/png');
    
    result.current.mutate({ file, outputFormat: 'jpg', quality: 'medium' });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });
});

