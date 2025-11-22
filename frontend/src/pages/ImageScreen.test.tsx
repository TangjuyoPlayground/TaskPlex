import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageScreen } from './ImageScreen';
import { ApiService } from '../services/api';
import { renderWithProviders } from '../test-utils';

// Mock ApiService
vi.mock('../services/api', () => ({
  ApiService: {
    compressImage: vi.fn(),
    convertImage: vi.fn(),
    getDownloadUrl: vi.fn((path) => path),
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn();

describe('ImageScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    renderWithProviders(<ImageScreen />);
    expect(screen.getByText('Image Processing')).toBeInTheDocument();
    expect(screen.getByText('Operation')).toBeInTheDocument();
  });
});

