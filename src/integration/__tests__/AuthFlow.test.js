// src/integration/__tests__/AuthFlow.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';

// Mock Firebase
jest.mock('../../services/firebase', () => ({
  auth: {},
  db: {}
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()), // Always return unsubscribe function
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn()
  },
  reauthenticateWithCredential: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({
    state: { from: { pathname: '/dashboard' } },
    pathname: '/login'
  }))
}));

// Mock Dashboard component
const MockDashboard = () => <div data-testid="dashboard">Dashboard</div>;

// App component for integration testing
const TestApp = ({ initialRoute = '/login' }) => {
  // Set initial route
  React.useEffect(() => {
    window.history.pushState({}, '', initialRoute);
  }, [initialRoute]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<MockDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock navigate and location hooks
    const mockNavigate = jest.fn();
    const mockLocation = { state: { from: { pathname: '/dashboard' } }, pathname: '/login' };
    
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    require('react-router-dom').useLocation.mockReturnValue(mockLocation);
    
    // Ensure onAuthStateChanged always returns a proper unsubscribe function
    require('firebase/auth').onAuthStateChanged.mockImplementation((callback) => {
      if (typeof callback === 'function') {
        // Simulate no user initially
        setTimeout(() => callback(null), 0);
      }
      return jest.fn(); // Return unsubscribe function
    });
  });

  describe('User Registration Flow', () => {
    it('should complete full registration flow successfully', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com'
      };
      
      require('firebase/auth').createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      require('firebase/auth').updateProfile.mockResolvedValue();
      require('firebase/firestore').setDoc.mockResolvedValue();
      
      render(<TestApp initialRoute="/register" />);
      
      // Wait for register page to load
      await waitFor(() => {
        expect(screen.getByText('Join FoodShare')).toBeInTheDocument();
      });
      
      // Fill out registration form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');
      
      // Select role
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      await waitFor(() => {
        const donorOption = screen.getByText('🤝 Food Donor');
        user.click(donorOption);
      });
      
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      // Verify Firebase functions were called
      await waitFor(() => {
        expect(require('firebase/auth').createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'john@example.com',
          'password123'
        );
      });
      
      expect(require('firebase/auth').updateProfile).toHaveBeenCalledWith(
        mockUser,
        { displayName: 'John Doe' }
      );
      
      expect(require('firebase/firestore').setDoc).toHaveBeenCalled();
    });

    it('should handle registration errors appropriately', async () => {
      const user = userEvent.setup();
      
      // Mock registration failure
      const mockError = new Error('Email already in use');
      mockError.code = 'auth/email-already-in-use';
      require('firebase/auth').createUserWithEmailAndPassword.mockRejectedValue(mockError);
      
      render(<TestApp initialRoute="/register" />);
      
      await waitFor(() => {
        expect(screen.getByText('Join FoodShare')).toBeInTheDocument();
      });
      
      // Fill out form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');
      
      const roleSelect = screen.getByLabelText(/i am a/i);
      await user.click(roleSelect);
      await waitFor(() => {
        const donorOption = screen.getByText('🤝 Food Donor');
        user.click(donorOption);
      });
      
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('This email address is already in use by another account.')).toBeInTheDocument();
      });
    });
  });

  describe('User Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      const user = userEvent.setup();
      
      // Mock successful login
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com'
      };
      
      const mockProfile = {
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        role: 'donor'
      };
      
      require('firebase/auth').signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      require('firebase/firestore').getDoc.mockResolvedValue({
        exists: () => true,
        id: 'test-uid',
        data: () => mockProfile
      });
      
      render(<TestApp initialRoute="/login" />);
      
      // Should start on login page
      await waitFor(() => {
        expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
      });
      
      // Fill login form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      await user.click(submitButton);
      
      // Verify login was called
      await waitFor(() => {
        expect(require('firebase/auth').signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });
    });

    it('should handle login errors appropriately', async () => {
      const user = userEvent.setup();
      
      // Mock login failure
      const mockError = new Error('Wrong password');
      mockError.code = 'auth/wrong-password';
      require('firebase/auth').signInWithEmailAndPassword.mockRejectedValue(mockError);
      
      render(<TestApp initialRoute="/login" />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
      });
      
      // Fill login form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      
      const submitButton = screen.getByRole('button', { name: /sign in to foodshare/i });
      await user.click(submitButton);
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText('Failed to login. Please check your email and password.')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Integration', () => {
    it('should validate password requirements across forms', async () => {
      const user = userEvent.setup();
      
      // Test on register page
      render(<TestApp initialRoute="/register" />);
      
      await waitFor(() => {
        expect(screen.getByText('Join FoodShare')).toBeInTheDocument();
      });
      
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
      
      await user.type(screen.getByLabelText(/^password$/i), '123');
      await user.type(screen.getByLabelText(/confirm password/i), '123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
      });
    });

    it('should validate password mismatch', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/register" />);
      
      await waitFor(() => {
        expect(screen.getByText('Join FoodShare')).toBeInTheDocument();
      });
      
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
      await user.type(screen.getByLabelText(/confirm password/i), 'different123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });
});