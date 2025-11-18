import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Studio } from '../Studio';
import { useAuth } from '../../hooks/useAuth';
import { useGenerate } from '../../hooks/useGenerate';
import { generationService } from '../../services/generation';

// Mock the hooks and services
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useGenerate');
vi.mock('../../services/generation');

describe('Studio Component - Prompt and Style Rendering', () => {
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
  const mockLogout = vi.fn();
  const mockGenerate = vi.fn();
  const mockAbort = vi.fn();
  const mockRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth hook
    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    // Mock useGenerate hook
    (useGenerate as any).mockReturnValue({
      generate: mockGenerate,
      abort: mockAbort,
      retry: mockRetry,
      isLoading: false,
      error: null,
      retryCount: 0,
      canRetry: false,
    });

    // Mock generationService
    (generationService.getRecent as any).mockResolvedValue([]);
  });

  describe('Prompt Component', () => {
    it('renders the prompt textarea', () => {
      render(<Studio />);

      const promptLabel = screen.getByText(/^Prompt$/i);
      expect(promptLabel).toBeInTheDocument();

      const promptTextarea = screen.getByLabelText(/generation prompt/i);
      expect(promptTextarea).toBeInTheDocument();
      expect(promptTextarea).toHaveAttribute('placeholder', 'Describe the style transformation...');
      expect(promptTextarea).toHaveAttribute('rows', '3');
    });

    it('allows user to type in the prompt textarea', async () => {
      const user = userEvent.setup();
      render(<Studio />);

      const promptTextarea = screen.getByLabelText(/generation prompt/i) as HTMLTextAreaElement;
      
      await user.type(promptTextarea, 'Transform to vintage style');

      expect(promptTextarea.value).toBe('Transform to vintage style');
    });

    it('clears prompt value', async () => {
      const user = userEvent.setup();
      render(<Studio />);

      const promptTextarea = screen.getByLabelText(/generation prompt/i) as HTMLTextAreaElement;
      
      await user.type(promptTextarea, 'Test prompt');
      expect(promptTextarea.value).toBe('Test prompt');

      await user.clear(promptTextarea);
      expect(promptTextarea.value).toBe('');
    });

    it('disables prompt textarea when loading', () => {
      (useGenerate as any).mockReturnValue({
        generate: mockGenerate,
        abort: mockAbort,
        retry: mockRetry,
        isLoading: true,
        error: null,
        retryCount: 0,
        canRetry: false,
      });

      render(<Studio />);

      const promptTextarea = screen.getByLabelText(/generation prompt/i);
      expect(promptTextarea).toBeDisabled();
    });

    it('enables prompt textarea when not loading', () => {
      render(<Studio />);

      const promptTextarea = screen.getByLabelText(/generation prompt/i);
      expect(promptTextarea).not.toBeDisabled();
    });
  });

  describe('Style Component', () => {
    it('renders the style select dropdown', () => {
      render(<Studio />);

      const styleLabel = screen.getByText(/^Style$/i);
      expect(styleLabel).toBeInTheDocument();

      const styleSelect = screen.getByLabelText(/select style/i);
      expect(styleSelect).toBeInTheDocument();
    });

    it('displays all style options', () => {
      render(<Studio />);

      const styleSelect = screen.getByLabelText(/select style/i);
      const options = Array.from(styleSelect.querySelectorAll('option'));

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveTextContent('Casual');
      expect(options[1]).toHaveTextContent('Formal');
      expect(options[2]).toHaveTextContent('Vintage');
      expect(options[3]).toHaveTextContent('Modern');
      expect(options[4]).toHaveTextContent('Elegant');
    });

    it('has "casual" as the default selected value', () => {
      render(<Studio />);

      const styleSelect = screen.getByLabelText(/select style/i) as HTMLSelectElement;
      expect(styleSelect.value).toBe('casual');
    });

    it('allows user to change the selected style', async () => {
      const user = userEvent.setup();
      render(<Studio />);

      const styleSelect = screen.getByLabelText(/select style/i) as HTMLSelectElement;
      
      await user.selectOptions(styleSelect, 'vintage');
      expect(styleSelect.value).toBe('vintage');

      await user.selectOptions(styleSelect, 'formal');
      expect(styleSelect.value).toBe('formal');
    });

    it('disables style select when loading', () => {
      (useGenerate as any).mockReturnValue({
        generate: mockGenerate,
        abort: mockAbort,
        retry: mockRetry,
        isLoading: true,
        error: null,
        retryCount: 0,
        canRetry: false,
      });

      render(<Studio />);

      const styleSelect = screen.getByLabelText(/select style/i);
      expect(styleSelect).toBeDisabled();
    });

    it('enables style select when not loading', () => {
      render(<Studio />);

      const styleSelect = screen.getByLabelText(/select style/i);
      expect(styleSelect).not.toBeDisabled();
    });

    it('maintains style selection across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Studio />);

      const styleSelect = screen.getByLabelText(/select style/i) as HTMLSelectElement;
      
      await user.selectOptions(styleSelect, 'elegant');
      expect(styleSelect.value).toBe('elegant');

      rerender(<Studio />);
      
      const updatedSelect = screen.getByLabelText(/select style/i) as HTMLSelectElement;
      expect(updatedSelect.value).toBe('elegant');
    });
  });

  describe('Upload, Prompt, and Style Integration', () => {
    it('renders all three components together', () => {
      render(<Studio />);

      // Check Upload component
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();

      // Check Prompt component
      expect(screen.getByLabelText(/generation prompt/i)).toBeInTheDocument();

      // Check Style component
      expect(screen.getByLabelText(/select style/i)).toBeInTheDocument();
    });

    it('disables all form inputs when loading', () => {
      (useGenerate as any).mockReturnValue({
        generate: mockGenerate,
        abort: mockAbort,
        retry: mockRetry,
        isLoading: true,
        error: null,
        retryCount: 0,
        canRetry: false,
      });

      render(<Studio />);

      // Upload should be disabled
      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      expect(uploadButton).toHaveClass('opacity-50');

      // Prompt should be disabled
      expect(screen.getByLabelText(/generation prompt/i)).toBeDisabled();

      // Style should be disabled
      expect(screen.getByLabelText(/select style/i)).toBeDisabled();
    });

    it('enables all form inputs when not loading', () => {
      render(<Studio />);

      // Upload should not be disabled
      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      expect(uploadButton).not.toHaveClass('opacity-50');

      // Prompt should not be disabled
      expect(screen.getByLabelText(/generation prompt/i)).not.toBeDisabled();

      // Style should not be disabled
      expect(screen.getByLabelText(/select style/i)).not.toBeDisabled();
    });

    it('allows user to fill out complete form', async () => {
      const user = userEvent.setup();
      render(<Studio />);

      // Fill prompt
      const promptTextarea = screen.getByLabelText(/generation prompt/i) as HTMLTextAreaElement;
      await user.type(promptTextarea, 'Transform to vintage style');
      expect(promptTextarea.value).toBe('Transform to vintage style');

      // Select style
      const styleSelect = screen.getByLabelText(/select style/i) as HTMLSelectElement;
      await user.selectOptions(styleSelect, 'vintage');
      expect(styleSelect.value).toBe('vintage');

      // Both inputs should have the expected values
      expect(promptTextarea.value).toBe('Transform to vintage style');
      expect(styleSelect.value).toBe('vintage');
    });
  });
});
