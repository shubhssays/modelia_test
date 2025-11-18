import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenerationHistory } from '../GenerationHistory';
import type { Generation } from '../../types';

// Mock the imageHelper
vi.mock('../../utils/imageHelper', () => ({
  getImageUrl: (path: string) => `http://localhost:3000${path}`,
}));

describe('GenerationHistory Component', () => {
  const mockOnRestore = vi.fn();

  const mockGenerations: Generation[] = [
    {
      id: 1,
      prompt: 'A vintage style photo',
      style: 'vintage',
      imageUrl: '/v1/files/1/image1.jpg',
      status: 'completed',
      createdAt: '2025-11-18T10:00:00Z',
    },
    {
      id: 2,
      prompt: 'A modern cityscape',
      style: 'modern',
      imageUrl: '/v1/files/2/image2.jpg',
      status: 'completed',
      createdAt: '2025-11-17T15:30:00Z',
    },
    {
      id: 3,
      prompt: 'An elegant portrait',
      style: 'elegant',
      imageUrl: '/v1/files/3/image3.jpg',
      status: 'failed',
      createdAt: '2025-11-16T09:15:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('renders empty state when no generations', () => {
      render(<GenerationHistory generations={[]} onRestore={mockOnRestore} />);

      expect(screen.getByText('Recent Generations')).toBeInTheDocument();
      expect(screen.getByText('No generations yet')).toBeInTheDocument();
    });

    it('does not render generation count when empty', () => {
      render(<GenerationHistory generations={[]} onRestore={mockOnRestore} />);

      expect(screen.queryByText(/Recent Generations \(\d+\)/)).not.toBeInTheDocument();
    });
  });

  describe('With Generations', () => {
    it('renders generation count correctly', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      expect(screen.getByText('Recent Generations (3)')).toBeInTheDocument();
    });

    it('renders all generation items', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      expect(screen.getByText('A vintage style photo')).toBeInTheDocument();
      expect(screen.getByText('A modern cityscape')).toBeInTheDocument();
      expect(screen.getByText('An elegant portrait')).toBeInTheDocument();
    });

    it('displays generation images with correct src', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute('src', 'http://localhost:3000/v1/files/1/image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'http://localhost:3000/v1/files/2/image2.jpg');
      expect(images[2]).toHaveAttribute('src', 'http://localhost:3000/v1/files/3/image3.jpg');
    });

    it('displays style for each generation', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      expect(screen.getByText('vintage')).toBeInTheDocument();
      expect(screen.getByText('modern')).toBeInTheDocument();
      expect(screen.getByText('elegant')).toBeInTheDocument();
    });

    it('displays formatted dates', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('displays status badge for completed generations', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const completedBadges = screen.getAllByText('completed');
      expect(completedBadges).toHaveLength(2);
      completedBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('displays status badge for failed generations', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const failedBadge = screen.getByText('failed');
      expect(failedBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('displays status badge for pending generations', () => {
      const pendingGen: Generation = {
        id: 4,
        prompt: 'Pending generation',
        style: 'casual',
        imageUrl: '/v1/files/4/image4.jpg',
        status: 'pending',
        createdAt: '2025-11-18T12:00:00Z',
      };

      render(<GenerationHistory generations={[pendingGen]} onRestore={mockOnRestore} />);

      const pendingBadge = screen.getByText('pending');
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('User Interactions', () => {
    it('calls onRestore when generation is clicked', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const firstGeneration = screen.getByLabelText('Restore generation: A vintage style photo');
      fireEvent.click(firstGeneration);

      expect(mockOnRestore).toHaveBeenCalledTimes(1);
      expect(mockOnRestore).toHaveBeenCalledWith(mockGenerations[0]);
    });

    it('calls onRestore when Enter key is pressed', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const firstGeneration = screen.getByLabelText('Restore generation: A vintage style photo');
      fireEvent.keyDown(firstGeneration, { key: 'Enter' });

      expect(mockOnRestore).toHaveBeenCalledTimes(1);
      expect(mockOnRestore).toHaveBeenCalledWith(mockGenerations[0]);
    });

    it('calls onRestore when Space key is pressed', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const firstGeneration = screen.getByLabelText('Restore generation: A vintage style photo');
      fireEvent.keyDown(firstGeneration, { key: ' ' });

      expect(mockOnRestore).toHaveBeenCalledTimes(1);
      expect(mockOnRestore).toHaveBeenCalledWith(mockGenerations[0]);
    });

    it('does not call onRestore for other keys', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const firstGeneration = screen.getByLabelText('Restore generation: A vintage style photo');
      fireEvent.keyDown(firstGeneration, { key: 'Tab' });
      fireEvent.keyDown(firstGeneration, { key: 'Escape' });

      expect(mockOnRestore).not.toHaveBeenCalled();
    });

    it('all generation items are keyboard accessible', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for each generation', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      expect(screen.getByLabelText('Restore generation: A vintage style photo')).toBeInTheDocument();
      expect(screen.getByLabelText('Restore generation: A modern cityscape')).toBeInTheDocument();
      expect(screen.getByLabelText('Restore generation: An elegant portrait')).toBeInTheDocument();
    });

    it('has proper role attributes', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('images have alt text', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('alt', 'A vintage style photo');
      expect(images[1]).toHaveAttribute('alt', 'A modern cityscape');
      expect(images[2]).toHaveAttribute('alt', 'An elegant portrait');
    });
  });

  describe('CSS Classes', () => {
    it('applies hover and focus styles', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const firstGeneration = screen.getByLabelText('Restore generation: A vintage style photo');
      expect(firstGeneration).toHaveClass('hover:border-indigo-500');
      expect(firstGeneration).toHaveClass('focus:ring-2');
      expect(firstGeneration).toHaveClass('focus:ring-indigo-500');
    });

    it('applies cursor-pointer class', () => {
      render(<GenerationHistory generations={mockGenerations} onRestore={mockOnRestore} />);

      const firstGeneration = screen.getByLabelText('Restore generation: A vintage style photo');
      expect(firstGeneration).toHaveClass('cursor-pointer');
    });
  });

  describe('Edge Cases', () => {
    it('handles generation without status', () => {
      const genWithoutStatus: Generation = {
        id: 5,
        prompt: 'No status generation',
        style: 'casual',
        imageUrl: '/v1/files/5/image5.jpg',
        status: undefined as any,
        createdAt: '2025-11-18T12:00:00Z',
      };

      render(<GenerationHistory generations={[genWithoutStatus]} onRestore={mockOnRestore} />);

      expect(screen.getByText('No status generation')).toBeInTheDocument();
      expect(screen.queryByText('completed')).not.toBeInTheDocument();
      expect(screen.queryByText('failed')).not.toBeInTheDocument();
      expect(screen.queryByText('pending')).not.toBeInTheDocument();
    });

    it('truncates long prompts', () => {
      const longPromptGen: Generation = {
        id: 6,
        prompt: 'This is a very long prompt that should be truncated to prevent layout issues when displayed in the generation history component',
        style: 'formal',
        imageUrl: '/v1/files/6/image6.jpg',
        status: 'completed',
        createdAt: '2025-11-18T12:00:00Z',
      };

      render(<GenerationHistory generations={[longPromptGen]} onRestore={mockOnRestore} />);

      const promptElement = screen.getByText(longPromptGen.prompt);
      expect(promptElement).toHaveClass('truncate');
    });

    it('handles single generation', () => {
      render(<GenerationHistory generations={[mockGenerations[0]]} onRestore={mockOnRestore} />);

      expect(screen.getByText('Recent Generations (1)')).toBeInTheDocument();
      expect(screen.getByText('A vintage style photo')).toBeInTheDocument();
    });
  });
});
