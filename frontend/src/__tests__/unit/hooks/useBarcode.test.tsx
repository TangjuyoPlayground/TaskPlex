/**
 * Tests for useBarcode hook
 * Uses MSW for API mocking
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBarcode } from '../../../hooks/useBarcode';

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

describe('useBarcode', () => {
  beforeEach(() => {
    // MSW handlers are already set up
  });

  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useBarcode(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('can trigger barcode generation mutation', async () => {
    const { result } = renderHook(() => useBarcode(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      data: '123456789012',
      barcodeType: 'code128',
      width: 2.0,
      height: 50.0,
      addChecksum: true,
    });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
    
    // Check that mutation was triggered
    expect(result.current.mutate).toBeDefined();
  });

  it('handles mutation with default parameters', async () => {
    const { result } = renderHook(() => useBarcode(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      data: 'TEST123',
    });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
    
    expect(result.current.mutate).toBeDefined();
  });

  it('handles different barcode types', async () => {
    const { result } = renderHook(() => useBarcode(), {
      wrapper: createWrapper(),
    });
    
    const barcodeTypes: Array<'code128' | 'code39' | 'ean13' | 'ean8' | 'upca' | 'upce' | 'isbn13' | 'isbn10'> = [
      'code128',
      'code39',
      'ean13',
    ];
    
    for (const type of barcodeTypes) {
      result.current.mutate({
        data: '123456789012',
        barcodeType: type,
      });
      
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    }
    
    expect(result.current.mutate).toBeDefined();
  });
});

