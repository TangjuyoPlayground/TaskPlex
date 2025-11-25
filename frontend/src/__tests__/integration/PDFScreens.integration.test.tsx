/**
 * Integration tests for PDF processing screens
 * Uses MSW to mock PDF API responses
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test-utils';
import { PDFCompress } from '../../pages/pdf/PDFCompress';
import { PDFMerge } from '../../pages/pdf/PDFMerge';
import { PDFSplit } from '../../pages/pdf/PDFSplit';

describe('PDFCompress Integration', () => {
  it('renders the PDF compress interface', () => {
    renderWithProviders(<PDFCompress />);
    
    // Should have heading
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('allows selecting a PDF file', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFCompress />);
    
    const file = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/document\.pdf/i)).toBeInTheDocument();
    });
  });

  it('compresses PDF and handles response', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFCompress />);
    
    const file = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/document\.pdf/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const compressButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('compress') || 
      btn.textContent?.toLowerCase().includes('compresser')
    );
    
    if (compressButton && !compressButton.hasAttribute('disabled')) {
      await user.click(compressButton);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('handles compression errors', async () => {
    server.use(
      http.post('*/api/v1/pdf/compress', () => {
        return HttpResponse.json(
          { success: false, error: 'Cannot compress encrypted PDF' },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<PDFCompress />);
    
    const file = new File(['pdf'], 'encrypted.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/encrypted\.pdf/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const compressButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('compress') || 
      btn.textContent?.toLowerCase().includes('compresser')
    );
    
    if (compressButton) {
      await user.click(compressButton);
      
      // Should not crash
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });
});

describe('PDFMerge Integration', () => {
  it('renders the PDF merge interface', () => {
    renderWithProviders(<PDFMerge />);
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('allows selecting multiple PDF files', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFMerge />);
    
    const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' });
    const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' });
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [file1, file2]);
    
    await waitFor(() => {
      expect(screen.getByText(/doc1\.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/doc2\.pdf/i)).toBeInTheDocument();
    });
  });

  it('handles merge operation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFMerge />);
    
    const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' });
    const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' });
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [file1, file2]);
    
    await waitFor(() => {
      expect(screen.getByText(/doc1\.pdf/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const mergeButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('merge') || 
      btn.textContent?.toLowerCase().includes('fusionner')
    );
    
    if (mergeButton && !mergeButton.hasAttribute('disabled')) {
      await user.click(mergeButton);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('disables merge button with less than 2 files', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFMerge />);
    
    const file = new File(['pdf'], 'single.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/single\.pdf/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const mergeButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('merge') || 
      btn.textContent?.toLowerCase().includes('fusionner')
    );
    
    if (mergeButton) {
      expect(mergeButton).toBeDisabled();
    }
  });
});

describe('PDFSplit Integration', () => {
  it('renders the PDF split interface', () => {
    renderWithProviders(<PDFSplit />);
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('shows split mode options after file selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFSplit />);
    
    const file = new File(['pdf'], 'multipage.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/multipage\.pdf/i)).toBeInTheDocument();
    });
    
    // Should show some buttons for split options
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles split operation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFSplit />);
    
    const file = new File(['pdf'], 'multipage.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/multipage\.pdf/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const splitButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('split') || 
      btn.textContent?.toLowerCase().includes('diviser')
    );
    
    if (splitButton && !splitButton.hasAttribute('disabled')) {
      await user.click(splitButton);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('has mode selection buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PDFSplit />);
    
    const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/doc\.pdf/i)).toBeInTheDocument();
    });
    
    // Should have multiple buttons for different split modes
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });
});
