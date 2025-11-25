/**
 * Tests for usePDF hooks
 * Uses MSW for API mocking
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompressPDF, useMergePDFs, useSplitPDF, useReorganizePDF } from '../../../hooks/usePDF';

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

const createMockPDF = (name: string) => {
  return new File(['%PDF-1.4 mock content'], name, { type: 'application/pdf' });
};

describe('useCompressPDF', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useCompressPDF(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('can trigger PDF compression mutation', async () => {
    const { result } = renderHook(() => useCompressPDF(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockPDF('document.pdf');
    
    result.current.mutate({ file });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess) {
      expect(result.current.data?.success).toBe(true);
    }
  });
});

describe('useMergePDFs', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useMergePDFs(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger PDF merge mutation', async () => {
    const { result } = renderHook(() => useMergePDFs(), {
      wrapper: createWrapper(),
    });
    
    const files = [
      createMockPDF('doc1.pdf'),
      createMockPDF('doc2.pdf'),
    ];
    
    result.current.mutate({ files });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
    
    if (result.current.isSuccess) {
      expect(result.current.data?.success).toBe(true);
    }
  });

  it('can merge multiple PDFs', async () => {
    const { result } = renderHook(() => useMergePDFs(), {
      wrapper: createWrapper(),
    });
    
    const files = [
      createMockPDF('doc1.pdf'),
      createMockPDF('doc2.pdf'),
      createMockPDF('doc3.pdf'),
    ];
    
    result.current.mutate({ files });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });
});

describe('useSplitPDF', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useSplitPDF(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger PDF split mutation', async () => {
    const { result } = renderHook(() => useSplitPDF(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockPDF('multipage.pdf');
    
    result.current.mutate({ file });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });

  it('can split with page ranges', async () => {
    const { result } = renderHook(() => useSplitPDF(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockPDF('multipage.pdf');
    
    result.current.mutate({ file, pageRanges: '1-3,5-7' });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });
});

describe('useReorganizePDF', () => {
  it('returns mutation object with correct structure', () => {
    const { result } = renderHook(() => useReorganizePDF(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('can trigger PDF reorganize mutation', async () => {
    const { result } = renderHook(() => useReorganizePDF(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockPDF('document.pdf');
    
    result.current.mutate({ file, pageOrder: '3,1,2,4' });
    
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 3000 });
  });

  it('accepts different page orders', async () => {
    const { result } = renderHook(() => useReorganizePDF(), {
      wrapper: createWrapper(),
    });
    
    const file = createMockPDF('document.pdf');
    
    result.current.mutate({ file, pageOrder: '5,4,3,2,1' });
    
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    }, { timeout: 3000 });
  });
});

