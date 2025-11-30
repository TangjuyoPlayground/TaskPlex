import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QRCodeScreen } from '../../pages/QRCodeScreen';
import { ApiService } from '../../services/api';
import { renderWithProviders } from '../../test-utils';
import '@testing-library/jest-dom/vitest';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    generateQRCode: vi.fn(),
    getDownloadUrl: vi.fn((url) => `http://localhost:8000${url}`),
  },
}));

// Mock useDownload hook
vi.mock('../../hooks/useDownload', () => ({
  useDownload: () => ({
    downloadDirect: vi.fn(),
  }),
}));

describe('QRCodeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<QRCodeScreen />);
    expect(screen.getByText('QR Code Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter text, URL, or any data to encode/i)).toBeInTheDocument();
  });

  it('displays data input and controls', () => {
    renderWithProviders(<QRCodeScreen />);
    expect(screen.getByLabelText(/Data to Encode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Box Size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Border/i)).toBeInTheDocument();
    expect(screen.getByText(/Error Correction Level/i)).toBeInTheDocument();
  });

  it('calls API when generate button is clicked', async () => {
    const mockResponse = {
      success: true,
      message: 'QR code generated successfully',
      qr_code_url: '/api/v1/download/qrcode_123.png',
      filename: 'qrcode_123.png',
    };
    vi.mocked(ApiService.generateQRCode).mockResolvedValue(mockResponse);

    renderWithProviders(<QRCodeScreen />);
    
    const dataInput = screen.getByPlaceholderText(/Enter text, URL, or any data to encode/i);
    const generateButton = screen.getByTestId('generate-qrcode-button');

    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(ApiService.generateQRCode).toHaveBeenCalledWith(
        'https://example.com',
        10,
        4,
        'M'
      );
    });
  });

  it('displays QR code preview on success', async () => {
    const mockResponse = {
      success: true,
      message: 'QR code generated successfully',
      qr_code_url: '/api/v1/download/qrcode_123.png',
      filename: 'qrcode_123.png',
    };
    vi.mocked(ApiService.generateQRCode).mockResolvedValue(mockResponse);

    renderWithProviders(<QRCodeScreen />);
    
    const dataInput = screen.getByPlaceholderText(/Enter text, URL, or any data to encode/i);
    const generateButton = screen.getByTestId('generate-qrcode-button');

    fireEvent.change(dataInput, { target: { value: 'Test data' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const mockResponse = {
      success: false,
      message: 'Error generating QR code',
    };
    vi.mocked(ApiService.generateQRCode).mockResolvedValue(mockResponse);

    renderWithProviders(<QRCodeScreen />);
    
    const dataInput = screen.getByPlaceholderText(/Enter text, URL, or any data to encode/i);
    const generateButton = screen.getByTestId('generate-qrcode-button');

    fireEvent.change(dataInput, { target: { value: 'Test' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error generating QR code/i)).toBeInTheDocument();
    });
  });

  it('disables generate button when data is empty', () => {
    renderWithProviders(<QRCodeScreen />);
    
    const generateButton = screen.getByTestId('generate-qrcode-button');
    expect(generateButton).toBeDisabled();
  });

  it('updates size slider value', () => {
    renderWithProviders(<QRCodeScreen />);
    
    const sizeSlider = screen.getByLabelText(/Box Size/i);
    fireEvent.change(sizeSlider, { target: { value: '20' } });
    
    expect(screen.getByText(/20px/i)).toBeInTheDocument();
  });

  it('updates border slider value', () => {
    renderWithProviders(<QRCodeScreen />);
    
    const borderSlider = screen.getByLabelText(/Border/i);
    fireEvent.change(borderSlider, { target: { value: '2' } });
    
    expect(screen.getByText(/\(2\)/i)).toBeInTheDocument();
  });

  it('allows changing error correction level', () => {
    renderWithProviders(<QRCodeScreen />);
    
    const highLevel = screen.getByLabelText(/High \(H\)/i);
    fireEvent.click(highLevel);
    
    expect(highLevel).toBeChecked();
  });

  it('shows download button after successful generation', async () => {
    const mockResponse = {
      success: true,
      message: 'QR code generated successfully',
      qr_code_url: '/api/v1/download/qrcode_123.png',
      filename: 'qrcode_123.png',
    };
    vi.mocked(ApiService.generateQRCode).mockResolvedValue(mockResponse);

    renderWithProviders(<QRCodeScreen />);
    
    const dataInput = screen.getByPlaceholderText(/Enter text, URL, or any data to encode/i);
    const generateButton = screen.getByTestId('generate-qrcode-button');

    fireEvent.change(dataInput, { target: { value: 'Test' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Download QR Code/i)).toBeInTheDocument();
    });
  });

  it('shows reset button after generation', async () => {
    const mockResponse = {
      success: true,
      message: 'QR code generated successfully',
      qr_code_url: '/api/v1/download/qrcode_123.png',
      filename: 'qrcode_123.png',
    };
    vi.mocked(ApiService.generateQRCode).mockResolvedValue(mockResponse);

    renderWithProviders(<QRCodeScreen />);
    
    const dataInput = screen.getByPlaceholderText(/Enter text, URL, or any data to encode/i);
    const generateButton = screen.getByTestId('generate-qrcode-button');

    fireEvent.change(dataInput, { target: { value: 'Test' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Reset/i)).toBeInTheDocument();
    });
  });
});

