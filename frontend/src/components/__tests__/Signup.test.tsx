import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Signup } from '../Signup';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook
vi.mock('../../hooks/useAuth');

describe('Signup Component', () => {
  const mockSignup = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as typeof vi.fn).mockReturnValue({
      signup: mockSignup,
    });
  });

  describe('Rendering', () => {
    it('renders signup form with all elements', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Full name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument();
    });

    it('has name input with correct attributes', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('name', 'name');
      expect(nameInput).toHaveAttribute('placeholder', 'Full name');
      expect(nameInput).toBeRequired();
    });

    it('has email input with correct attributes', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Email address');
      expect(emailInput).toBeRequired();
    });

    it('has password input with correct attributes', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Password (min 6 characters)');
      expect(passwordInput).toHaveAttribute('minLength', '6');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('User Input', () => {
    it('allows typing in name field', async () => {
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
      await user.type(nameInput, 'John Doe');

      expect(nameInput.value).toBe('John Doe');
    });

    it('allows typing in email field', async () => {
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
      await user.type(emailInput, 'john@example.com');

      expect(emailInput.value).toBe('john@example.com');
    });

    it('allows typing in password field', async () => {
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('clears input fields', async () => {
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
      await user.type(nameInput, 'John Doe');
      await user.clear(nameInput);

      expect(nameInput.value).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('calls signup with correct data on submit', async () => {
      mockSignup.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
        expect(mockSignup).toHaveBeenCalledTimes(1);
      });
    });




  });

  describe('Loading State', () => {
    it('shows loading text when submitting', async () => {
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });

    it('disables submit button when loading', async () => {
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    it('disables all input fields when loading', async () => {
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(screen.getByLabelText('Full name')).toBeDisabled();
      expect(screen.getByLabelText('Email address')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });

    it('re-enables form after successful signup', async () => {
      mockSignup.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign up/i })).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when signup fails', async () => {
      mockSignup.mockRejectedValue(new Error('Email already exists'));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'existing@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error objects', async () => {
      mockSignup.mockRejectedValue('Something went wrong');
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText('Signup failed')).toBeInTheDocument();
      });
    });

    it('clears previous error on new submission', async () => {
      mockSignup.mockRejectedValueOnce(new Error('First error'));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      // First submission with error
      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'short');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission
      mockSignup.mockResolvedValue(undefined);
      await user.clear(screen.getByLabelText('Password'));
      await user.type(screen.getByLabelText('Password'), 'validpassword');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('re-enables form after error', async () => {
      mockSignup.mockRejectedValue(new Error('Signup failed'));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText('Signup failed')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /sign up/i })).not.toBeDisabled();
      expect(screen.getByLabelText('Full name')).not.toBeDisabled();
      expect(screen.getByLabelText('Email address')).not.toBeDisabled();
      expect(screen.getByLabelText('Password')).not.toBeDisabled();
    });
  });

  describe('Password Validation', () => {
    it('enforces minimum password length of 6 characters', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('displays password requirements in placeholder', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Password (min 6 characters)');
    });
  });

  describe('Navigation', () => {
    it('calls onSwitchToLogin when login link is clicked', async () => {
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.click(screen.getByText('Already have an account? Sign in'));

      expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    });

    it('login link is a button type', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const loginLink = screen.getByText('Already have an account? Sign in');
      expect(loginLink).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const heading = screen.getByRole('heading', { name: /create your account/i });
      expect(heading.tagName).toBe('H2');
    });

    it('has screen reader only labels for inputs', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const nameLabel = document.querySelector('label[for="name"]');
      const emailLabel = document.querySelector('label[for="email"]');
      const passwordLabel = document.querySelector('label[for="password"]');

      expect(nameLabel).toHaveClass('sr-only');
      expect(emailLabel).toHaveClass('sr-only');
      expect(passwordLabel).toHaveClass('sr-only');
    });

    it('error message has alert role', async () => {
      mockSignup.mockRejectedValue(new Error('Error'));
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), 'John Doe');
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes', () => {
    it('applies proper styling to submit button', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      expect(submitButton).toHaveClass('bg-indigo-600');
      expect(submitButton).toHaveClass('hover:bg-indigo-700');
      expect(submitButton).toHaveClass('disabled:opacity-50');
    });

    it('applies focus styles to inputs', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const nameInput = screen.getByLabelText('Full name');
      expect(nameInput).toHaveClass('focus:ring-indigo-500');
      expect(nameInput).toHaveClass('focus:border-indigo-500');
    });
  });

  describe('Form Field Order', () => {
    it('renders fields in correct order: name, email, password', () => {
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const textboxInputs = screen.getAllByRole('textbox');
      const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));
      const inputs = [...textboxInputs, ...passwordInputs];

      expect(inputs[0]).toHaveAttribute('name', 'name');
      expect(inputs[1]).toHaveAttribute('name', 'email');
      expect(inputs[2]).toHaveAttribute('name', 'password');
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in name', async () => {
      mockSignup.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.type(screen.getByLabelText('Full name'), "John O'Brien-Smith");
      await user.type(screen.getByLabelText('Email address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'password123', "John O'Brien-Smith");
      });
    });

    it('handles whitespace in inputs', async () => {
      mockSignup.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<Signup onSwitchToLogin={mockOnSwitchToLogin} />);

      const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;

      await user.type(nameInput, '  John Doe  ');
      await user.type(emailInput, 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      // Name field preserves spaces, email input type may auto-trim
      expect(nameInput.value).toBe('  John Doe  ');
      expect(emailInput.value).toBe('john@example.com');
    });
  });
});
