import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ImageUpload } from '../ImageUpload';

describe('ImageUpload Component', () => {
  it('renders the upload component with initial state', () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG up to 10MB/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument();
  });

  it('displays preview when preview prop is provided', () => {
    const mockOnImageSelect = vi.fn();
    const previewUrl = 'data:image/png;base64,iVBORw0KGgo...';
    
    render(<ImageUpload onImageSelect={mockOnImageSelect} preview={previewUrl} />);

    const previewImage = screen.getByAltText('Preview');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', previewUrl);
    expect(screen.getByText(/click to change image/i)).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} disabled />);

    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    expect(uploadButton).toHaveClass('opacity-50');
    expect(uploadButton).toHaveAttribute('tabIndex', '-1');
  });

  it('shows error message for invalid file type', async () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/choose image file/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/please upload a jpeg or png image/i)).toBeInTheDocument();
    });
    expect(mockOnImageSelect).not.toHaveBeenCalled();
  });

  it('shows error message for file size exceeding 10MB', async () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/choose image file/i) as HTMLInputElement;

    await userEvent.upload(input, largeFile);

    expect(screen.getByText(/image size must be less than 10mb/i)).toBeInTheDocument();
    expect(mockOnImageSelect).not.toHaveBeenCalled();
  });

  it('calls onImageSelect with file and preview when valid file is uploaded', async () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/choose image file/i) as HTMLInputElement;

    // Mock FileReader with proper class
    class MockFileReader {
      onloadend: (() => void) | null = null;
      result: string = 'data:image/jpeg;base64,mockbase64';
      
      readAsDataURL() {
        // Simulate async file reading
        setTimeout(() => {
          if (this.onloadend) {
            this.onloadend();
          }
        }, 0);
      }
    }

    vi.stubGlobal('FileReader', MockFileReader);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file, 'data:image/jpeg;base64,mockbase64');
    }, { timeout: 2000 });

    vi.unstubAllGlobals();
  });

  it('allows clicking on the upload area to trigger file input', async () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    const input = screen.getByLabelText(/choose image file/i) as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');

    await userEvent.click(uploadButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('allows keyboard navigation with Enter key', () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    const input = screen.getByLabelText(/choose image file/i) as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');

    uploadButton.focus();
    fireEvent.keyDown(uploadButton, { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('allows keyboard navigation with Space key', () => {
    const mockOnImageSelect = vi.fn();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    const input = screen.getByLabelText(/choose image file/i) as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');

    uploadButton.focus();
    fireEvent.keyDown(uploadButton, { key: ' ' });

    expect(clickSpy).toHaveBeenCalled();
  });
});
