import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook
vi.mock('../../hooks/useAuth');

describe('Login Component', () => {
  const mockLogin = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
    });
  });

  describe('Rendering', () => {
    it('renders login form with all elements', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      expect(screen.getByText('Sign in to AI Studio')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
    });

    it('has email input with correct attributes', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Email address');
      expect(emailInput).toBeRequired();
    });

    it('has password input with correct attributes', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('User Input', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('allows typing in password field', async () => {
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('clears input fields', async () => {
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');
      await user.clear(emailInput);

      expect(emailInput.value).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('calls login with correct credentials on submit', async () => {
      mockLogin.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });




  });

  describe('Loading State', () => {
    it('shows loading text when submitting', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    it('disables submit button when loading', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('disables input fields when loading', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByLabelText('Email address')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });

    it('re-enables form after successful login', async () => {
      mockLogin.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when login fails', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error objects', async () => {
      mockLogin.mockRejectedValue('Something went wrong');
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('clears previous error on new submission', async () => {
      mockLogin.mockRejectedValueOnce(new Error('First error'));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      // First submission with error
      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission
      mockLogin.mockResolvedValue(undefined);
      await user.clear(screen.getByLabelText('Password'));
      await user.type(screen.getByLabelText('Password'), 'correct');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('re-enables form after error', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
      expect(screen.getByLabelText('Email address')).not.toBeDisabled();
      expect(screen.getByLabelText('Password')).not.toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('calls onSwitchToSignup when signup link is clicked', async () => {
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.click(screen.getByText("Don't have an account? Sign up"));

      expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
    });

    it('signup link is a button type', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const signupLink = screen.getByText("Don't have an account? Sign up");
      expect(signupLink).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const heading = screen.getByRole('heading', { name: /sign in to ai studio/i });
      expect(heading.tagName).toBe('H2');
    });

    it('has screen reader only labels for inputs', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const emailLabel = document.querySelector('label[for="email"]');
      const passwordLabel = document.querySelector('label[for="password"]');

      expect(emailLabel).toHaveClass('sr-only');
      expect(passwordLabel).toHaveClass('sr-only');
    });

    it('error message has alert role', async () => {
      mockLogin.mockRejectedValue(new Error('Error'));
      const user = userEvent.setup();
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes', () => {
    it('applies proper styling to submit button', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveClass('bg-indigo-600');
      expect(submitButton).toHaveClass('hover:bg-indigo-700');
      expect(submitButton).toHaveClass('disabled:opacity-50');
    });

    it('applies focus styles to inputs', () => {
      render(<Login onSwitchToSignup={mockOnSwitchToSignup} />);

      const emailInput = screen.getByLabelText('Email address');
      expect(emailInput).toHaveClass('focus:ring-indigo-500');
      expect(emailInput).toHaveClass('focus:border-indigo-500');
    });
  });
});
