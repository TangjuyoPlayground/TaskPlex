import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFMerge } from './PDFMerge';
import { ApiService } from '../../services/api';
import { renderWithProviders } from '../../test-utils';

// Mock ApiService
vi.mock('../../services/api', () => ({
  ApiService: {
    mergePDFs: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

describe('PDFMerge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<PDFMerge />);
    expect(screen.getByText('Merge PDF')).toBeInTheDocument();
    // Le texte initial quand aucun fichier n'est sélectionné
    expect(screen.getByText('Select PDF files')).toBeInTheDocument();
  });
});

