// src/contexts/__tests__/AuthContext.test.js
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock Firebase
jest.mock('../../services/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {}
}));

// Mock Firebase Auth functions with proper returns
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

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="current-user">{auth.currentUser?.email || 'No user'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="user-profile">{auth.userProfile?.name || 'No profile'}</div>
      <button 
        data-testid="test-login" 
        onClick={() => auth.login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button 
        data-testid="test-register" 
        onClick={() => auth.register('test@example.com', 'password123', {
          name: 'Test User',
          role: 'donor'
        })}
      >
        Register
      </button>
      <button 
        data-testid="test-logout" 
        onClick={() => auth.logout()}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Ensure onAuthStateChanged always returns a proper unsubscribe function
    const mockOnAuthStateChanged = require('firebase/auth').onAuthStateChanged;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      // Simulate no user initially
      if (typeof callback === 'function') {
        setTimeout(() => callback(null), 0);
      }
      return jest.fn(); // Return unsubscribe function
    });
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial auth state
      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('No user');
      });

      expect(screen.getByTestId('user-profile')).toHaveTextContent('No profile');
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });
    });

    it('should throw error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });

  describe('register function', () => {
    it('should create user and profile successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com'
      };

      const mockCreateUser = require('firebase/auth').createUserWithEmailAndPassword;
      const mockUpdateProfile = require('firebase/auth').updateProfile;
      const mockSetDoc = require('firebase/firestore').setDoc;

      mockCreateUser.mockResolvedValue({ user: mockUser });
      mockUpdateProfile.mockResolvedValue();
      mockSetDoc.mockResolvedValue();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByTestId('test-register');

      await act(async () => {
        registerButton.click();
      });

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User'
      });
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      const mockError = new Error('Email already in use');
      mockError.code = 'auth/email-already-in-use';

      require('firebase/auth').createUserWithEmailAndPassword.mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByTestId('test-register');

      await act(async () => {
        registerButton.click();
      });

      // Wait for error to be processed
      await waitFor(() => {
        expect(require('react-toastify').toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('login function', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com'
      };

      require('firebase/auth').signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('test-login');

      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(require('firebase/auth').signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Wrong password');
      mockError.code = 'auth/wrong-password';

      require('firebase/auth').signInWithEmailAndPassword.mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('test-login');

      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(require('react-toastify').toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('logout function', () => {
    it('should logout user successfully', async () => {
      require('firebase/auth').signOut.mockResolvedValue();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByTestId('test-logout');

      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(require('firebase/auth').signOut).toHaveBeenCalled();
      });
    });
  });

  describe('utility functions', () => {
    it('should check user roles correctly', async () => {
      // Mock user with auth state change
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      const mockProfile = { role: 'donor', name: 'Test User' };

      require('firebase/auth').onAuthStateChanged.mockImplementation((callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback(mockUser), 0);
        }
        return jest.fn();
      });

      require('firebase/firestore').getDoc.mockResolvedValue({
        exists: () => true,
        id: 'test-uid',
        data: () => mockProfile
      });

      let authContext;
      const TestRoleComponent = () => {
        authContext = useAuth();
        return (
          <div>
            <div data-testid="is-donor">{authContext.isDonor() ? 'true' : 'false'}</div>
            <div data-testid="is-receiver">{authContext.isReceiver() ? 'true' : 'false'}</div>
            <div data-testid="has-donor-role">{authContext.hasRole('donor') ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestRoleComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-donor-role')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('is-donor')).toHaveTextContent('true');
      expect(screen.getByTestId('is-receiver')).toHaveTextContent('false');
    });
  });
});