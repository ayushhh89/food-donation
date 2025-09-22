// src/components/auth/__tests__/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '../../../contexts/AuthContext';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

const mockNavigate = jest.fn();
const mockLocation = { state: { from: { pathname: '/dashboard' } } };

// Mock useAuth hook
const mockUseAuth = {
  login: jest.fn(),
  currentUser: null,
  userProfile: null,
  loading: false
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue(mockUseAuth);
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    require('react-router-dom').useLocation.mockReturnValue(mockLocation);
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all required fields', () => {
      renderLogin();
      
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your FoodShare account')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in to foodshare/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create new account/i })).toBeInTheDocument();
    });

    it('should render trust indicators', () => {
      renderLogin();
      
      expect(screen.getByText('Secure Login')).toBeInTheDocument();
      expect(screen.getByText('Verified Platform')).toBeInTheDocument();
      expect(screen.getByText('850+ Members')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update form fields when user types', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      // Simulate form submission with empty fields to trigger error
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      await user.click(submitButton);
      
      // Check if error appears
      await waitFor(() => {
        expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
      });
      
      // Start typing in email field
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test');
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Please enter both email and password.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should show validation error for empty fields', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
      });
      expect(mockUseAuth.login).not.toHaveBeenCalled();
    });

    it('should call login function with correct credentials', async () => {
      const user = userEvent.setup();
      mockUseAuth.login.mockResolvedValue();
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUseAuth.login).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveLogin;
      mockUseAuth.login.mockImplementation(() => new Promise(resolve => {
        resolveLogin = resolve;
      }));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
      expect(submitButton).toBeDisabled();
      
      // Resolve the promise to cleanup
      resolveLogin();
      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      mockUseAuth.login.mockRejectedValue(new Error('Login failed'));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to login. Please check your email and password.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page when create account button is clicked', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const registerButton = screen.getByRole('button', { name: /create new account/i });
      await user.click(registerButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Authentication State', () => {
    it('should redirect when user is fully authenticated', () => {
      useAuth.mockReturnValue({
        ...mockUseAuth,
        currentUser: { uid: 'test-uid', email: 'test@example.com' },
        userProfile: { name: 'Test User', role: 'donor' },
        loading: false
      });
      
      renderLogin();
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('should show loading screen when auth is processing', () => {
      useAuth.mockReturnValue({
        ...mockUseAuth,
        currentUser: { uid: 'test-uid' },
        userProfile: null,
        loading: true
      });
      
      renderLogin();
      
      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
      expect(screen.getByText('Setting up your account')).toBeInTheDocument();
    });

    it('should not redirect if user is not fully authenticated', () => {
      useAuth.mockReturnValue({
        ...mockUseAuth,
        currentUser: { uid: 'test-uid' },
        userProfile: null,
        loading: false
      });
      
      renderLogin();
      
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
});