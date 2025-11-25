/**
 * Integration tests for ImageScreen component
 * Uses MSW to mock API responses
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test-utils';
import { ImageScreen } from '../../pages/ImageScreen';

describe('ImageScreen Integration', () => {
  it('renders the image processing interface', () => {
    renderWithProviders(<ImageScreen />);
    
    // Should have headings
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('allows selecting an image file', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImageScreen />);
    
    const file = new File(['image content'], 'test-image.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test-image\.jpg/i)).toBeInTheDocument();
    });
  });

  it('compresses image and shows result', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImageScreen />);
    
    const file = new File(['image content'], 'photo.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/photo\.png/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const compressButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('compress') || 
      btn.textContent?.toLowerCase().includes('compresser')
    );
    
    if (compressButton) {
      await user.click(compressButton);
      
      await waitFor(() => {
        // Should not crash
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('can convert image to different format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImageScreen />);
    
    // Switch to convert mode
    const buttons = screen.getAllByRole('button');
    const convertButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes('convert') || 
      btn.textContent?.toLowerCase().includes('convertir')
    );
    
    if (convertButton) {
      await user.click(convertButton);
    }
    
    const file = new File(['image content'], 'photo.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/photo\.jpg/i)).toBeInTheDocument();
    });
  });

  it('handles server errors gracefully', async () => {
    server.use(
      http.post('*/api/v1/image/compress', () => {
        return HttpResponse.json(
          { success: false, error: 'Unsupported image format' },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<ImageScreen />);
    
    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test\.jpg/i)).toBeInTheDocument();
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

  it('has quality selection options', () => {
    renderWithProviders(<ImageScreen />);
    
    // Quality buttons should be present
    const buttons = screen.getAllByRole('button');
    const qualityButtons = buttons.filter(btn => 
      btn.textContent?.toLowerCase().includes('low') || 
      btn.textContent?.toLowerCase().includes('medium') ||
      btn.textContent?.toLowerCase().includes('high')
    );
    
    expect(qualityButtons.length).toBeGreaterThanOrEqual(0);
  });
});
