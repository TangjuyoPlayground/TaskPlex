import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFOCR } from '../../../pages/pdf/PDFOCR';
import { renderWithProviders } from '../../../test-utils';

// Mock ApiService
vi.mock('../../../services/api', () => ({
  ApiService: {
    extractTextOCR: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

describe('PDFOCR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    const { container } = renderWithProviders(<PDFOCR />);
    // Check that the component renders (OCR title should be present)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // Check for file input
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });
});

