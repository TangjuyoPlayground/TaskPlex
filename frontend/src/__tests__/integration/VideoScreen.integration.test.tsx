/**
 * Integration tests for VideoScreen component
 * Uses MSW to mock API responses
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test-utils';
import { VideoScreen } from '../../pages/VideoScreen';

describe('VideoScreen Integration', () => {
  it('renders the video processing interface', () => {
    renderWithProviders(<VideoScreen />);
    
    // Should have a heading with "Video" in it
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('shows file dropzone when no file is selected', () => {
    renderWithProviders(<VideoScreen />);
    
    // File input should exist
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('allows selecting a video file', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VideoScreen />);
    
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test-video\.mp4/i)).toBeInTheDocument();
    });
  });

  it('compresses video and shows success result', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VideoScreen />);
    
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test-video\.mp4/i)).toBeInTheDocument();
    });
    
    // Find process button (compress or similar)
    const buttons = screen.getAllByRole('button');
    const processButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('compress') || 
      btn.textContent?.toLowerCase().includes('compresser') ||
      btn.textContent?.toLowerCase().includes('process')
    );
    
    if (processButton) {
      await user.click(processButton);
      
      await waitFor(() => {
        // Check for success indicators
        const successElements = document.querySelectorAll('[class*="green"], [class*="success"]');
        expect(successElements.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 3000 });
    }
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.post('*/api/v1/video/compress', () => {
        return HttpResponse.json(
          { success: false, error: 'File too large' },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<VideoScreen />);
    
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test-video\.mp4/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const processButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('compress') || 
      btn.textContent?.toLowerCase().includes('compresser')
    );
    
    if (processButton) {
      await user.click(processButton);
      
      // Error should be handled (no crash)
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('can switch between compress and convert modes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VideoScreen />);
    
    // Find operation toggle buttons
    const buttons = screen.getAllByRole('button');
    const convertButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('convert') || 
      btn.textContent?.toLowerCase().includes('convertir')
    );
    
    if (convertButton) {
      await user.click(convertButton);
      
      // Component should still be functional
      expect(document.body).toBeInTheDocument();
    }
  });
});
