import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomeDashboard } from '../../pages/HomeDashboard';
import { renderWithProviders } from '../../test-utils';

describe('HomeDashboard', () => {
  it('renders the welcome message', () => {
    renderWithProviders(<HomeDashboard />);
    expect(screen.getByText(/Your Universal/i)).toBeInTheDocument();
    expect(screen.getByText(/TaskPlex/i)).toBeInTheDocument();
  });

  it('renders tool categories', () => {
    renderWithProviders(<HomeDashboard />);
    expect(screen.getByText(/All Tools/i)).toBeInTheDocument();
    expect(screen.getByText(/Media/i)).toBeInTheDocument();
    // Documents appears in both button and description, so use getAllByText
    expect(screen.getAllByText(/Documents/i).length).toBeGreaterThan(0);
  });

  it('filters tools when clicking a category', () => {
    renderWithProviders(<HomeDashboard />);
    
    // At the start, all tools are there (ex: Compress Video from Media and Regex Tester from Developer)
    expect(screen.getByText(/Compress Video/i)).toBeInTheDocument();
    expect(screen.getByText(/Regex Tester/i)).toBeInTheDocument();

    // Click on "Media"
    fireEvent.click(screen.getByText(/Media/i));

    // Compress Video (Media tool) should still be there
    expect(screen.getByText(/Compress Video/i)).toBeInTheDocument();
    // Regex Tester (Developer tool) should no longer be visible
    expect(screen.queryByText(/Regex Tester/i)).not.toBeInTheDocument();
  });
});

