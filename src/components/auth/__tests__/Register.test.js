// src/components/auth/__tests__/Register.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import { useAuth } from '../../../contexts/AuthContext';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

const mockNavigate = jest.fn();

const mockUseAuth = {
  register: jest.fn()
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue(mockUseAuth);
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render registration form with all required fields', () => {
      renderRegister();
      
      expect(screen.getByText('Join FoodShare')).toBeInTheDocument();
      expect(screen.getByText('Create your account to start sharing or receiving food')).toBeInTheDocument();
      
      // Check all form fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render role selection dropdown with correct options', async () => {
      const user = userEvent.setup();
      renderRegister();
      
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      
      await waitFor(() => {
        expect(screen.getByText('🤝 Food Donor')).toBeInTheDocument();
        expect(screen.getByText('🍽️ Food Receiver')).toBeInTheDocument();
      });
    });

    it('should render sign in link', () => {
      renderRegister();
      
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByText('Sign in here')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update form fields when user types', async () => {
      const user = userEvent.setup();
      renderRegister();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(phoneInput, '1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(phoneInput).toHaveValue('1234567890');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('should select role from dropdown', async () => {
      const user = userEvent.setup();
      renderRegister();
      
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      
      await waitFor(() => {
        const donorOption = screen.getByText('🤝 Food Donor');
        expect(donorOption).toBeInTheDocument();
      });
      
      const donorOption = screen.getByText('🤝 Food Donor');
      await user.click(donorOption);
      
      // Check that the select closes (role is selected)
      await waitFor(() => {
        expect(screen.queryByText('🍽️ Food Receiver')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error for password less than 6 characters', async () => {
      const user = userEvent.setup();
      renderRegister();
      
      // Fill form with short password
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');
      
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      await waitFor(() => {
        const donorOption = screen.getByText('🤝 Food Donor');
        user.click(donorOption);
      });
      
      await user.type(screen.getByLabelText(/^password$/i), '12345');
      await user.type(screen.getByLabelText(/confirm password/i), '12345');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegister();
      
      // Fill form with mismatched passwords
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');
      
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      await waitFor(() => {
        const donorOption = screen.getByText('🤝 Food Donor');
        user.click(donorOption);
      });
      
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user) => {
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');
      
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      await waitFor(() => {
        const donorOption = screen.getByText('🤝 Food Donor');
        user.click(donorOption);
      });
      
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    };

    it('should call register function with correct data', async () => {
      const user = userEvent.setup();
      mockUseAuth.register.mockResolvedValue();
      
      renderRegister();
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUseAuth.register).toHaveBeenCalledWith(
          'john@example.com',
          'password123',
          {
            name: 'John Doe',
            role: 'donor',
            phone: '1234567890'
          }
        );
      });
    });

    it('should navigate to dashboard on successful registration', async () => {
      const user = userEvent.setup();
      mockUseAuth.register.mockResolvedValue();
      
      renderRegister();
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveRegister;
      mockUseAuth.register.mockImplementation(() => new Promise(resolve => {
        resolveRegister = resolve;
      }));
      
      renderRegister();
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      });
      expect(submitButton).toBeDisabled();
      
      // Resolve the promise to cleanup
      resolveRegister();
      await waitFor(() => {
        expect(screen.queryByText('Creating Account...')).not.toBeInTheDocument();
      });
    });

    it('should handle registration errors', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Registration failed');
      mockError.code = 'auth/email-already-in-use';
      mockUseAuth.register.mockRejectedValue(mockError);
      
      renderRegister();
      
      await fillValidForm(user);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('This email address is already in use by another account.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when sign in link is clicked', async () => {
      const user = userEvent.setup();
      renderRegister();
      
      const signInLink = screen.getByText('Sign in here');
      await user.click(signInLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and required attributes', () => {
      renderRegister();
      
      const requiredFields = [
        /full name/i,
        /email address/i,
        /phone number/i,
        /i am a/i,
        /^password$/i,
        /confirm password/i
      ];

      requiredFields.forEach(labelRegex => {
        const field = screen.getByLabelText(labelRegex);
        expect(field).toHaveAttribute('required');
      });
    });
  });
});