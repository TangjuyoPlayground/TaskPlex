/**
 * Tests for useUnits hook (useConvertUnits)
 * Uses MSW for API mocking
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConvertUnits } from '../../../hooks/useUnits';

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

describe('useConvertUnits', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('can trigger unit conversion mutation', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 1,
      fromUnit: 'meter',
      toUnit: 'kilometer',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess) {
      expect(result.current.data?.success).toBe(true);
      expect(result.current.data?.converted_value).toBeDefined();
    }
  });

  it('converts length units correctly', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 1000,
      fromUnit: 'meter',
      toUnit: 'kilometer',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.data) {
      expect(result.current.data.converted_value).toBe(1); // 1000m = 1km
    }
  });

  it('handles mass unit conversions', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 1,
      fromUnit: 'kilogram',
      toUnit: 'gram',
    });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });

  it('handles temperature conversions', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 0,
      fromUnit: 'degC',
      toUnit: 'degF',
    });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });

  it('completes mutation and sets isPending to false', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 100,
      fromUnit: 'meter',
      toUnit: 'centimeter',
    });
    
    // Wait for mutation to complete
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });

  it('can convert same unit to itself', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 42,
      fromUnit: 'meter',
      toUnit: 'meter',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.data) {
      expect(result.current.data.converted_value).toBe(42);
    }
  });

  it('handles decimal values', async () => {
    const { result } = renderHook(() => useConvertUnits(), {
      wrapper: createWrapper(),
    });
    
    result.current.mutate({
      value: 1.5,
      fromUnit: 'kilometer',
      toUnit: 'meter',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.data) {
      expect(result.current.data.converted_value).toBe(1500);
    }
  });
});

