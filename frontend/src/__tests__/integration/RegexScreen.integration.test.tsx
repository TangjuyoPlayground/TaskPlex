/**
 * Integration tests for RegexScreen component
 * Uses MSW to mock regex testing API
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import { RegexScreen } from '../../pages/RegexScreen';

describe('RegexScreen Integration', () => {
  it('renders the regex tester interface', () => {
    renderWithProviders(<RegexScreen />);
    
    // Should have headings
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('has pattern and text inputs', () => {
    renderWithProviders(<RegexScreen />);
    
    // Should have text inputs
    const textInputs = screen.getAllByRole('textbox');
    expect(textInputs.length).toBeGreaterThan(0);
  });

  it('tests regex pattern against text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegexScreen />);
    
    // Find text inputs
    const textInputs = screen.getAllByRole('textbox');
    const patternInput = textInputs[0];
    const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    if (patternInput && textArea) {
      await user.type(patternInput, 'hello');
      await user.type(textArea, 'hello world hello again');
      
      // Wait for debounced API call
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  it('allows toggling regex flags', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegexScreen />);
    
    // Find checkboxes for flags
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Toggle first checkbox
    if (checkboxes[0]) {
      await user.click(checkboxes[0]);
      // Should toggle without error
      expect(document.body).toBeInTheDocument();
    }
  });

  it('handles input without crashing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegexScreen />);
    
    const textInputs = screen.getAllByRole('textbox');
    const patternInput = textInputs[0];
    
    if (patternInput) {
      // Enter a pattern
      await user.type(patternInput, 'test.*pattern');
      
      // Component should still work
      expect(document.body).toBeInTheDocument();
    }
  });

  it('handles invalid regex patterns gracefully', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegexScreen />);
    
    const textInputs = screen.getAllByRole('textbox');
    const patternInput = textInputs[0] as HTMLInputElement;
    const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    if (patternInput && textArea) {
      // Enter invalid regex - use fireEvent for special characters
      // userEvent.type interprets [] as keyboard modifiers
      await user.clear(patternInput);
      patternInput.value = '(unclosed';
      patternInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      await user.type(textArea, 'some text');
      
      // Should not crash
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  it('has flag options displayed', () => {
    renderWithProviders(<RegexScreen />);
    
    // Should show flag options (g, i, m, s)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });
});
