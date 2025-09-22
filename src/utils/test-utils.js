// src/utils/test-utils.js
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock AuthProvider for testing
const MockAuthProvider = ({ children, value = {} }) => {
  const defaultValue = {
    currentUser: null,
    userProfile: null,
    loading: false,
    profileLoading: false,
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    updateUserProfile: jest.fn(),
    changePassword: jest.fn(),
    fetchUserProfile: jest.fn(),
    hasRole: jest.fn(),
    isDonor: jest.fn(),
    isReceiver: jest.fn(),
    updateUserLocation: jest.fn(),
    ...value
  };

  return React.createElement(
    'div',
    { 'data-testid': 'mock-auth-provider' },
    children
  );
};

// Custom render function that includes providers
function render(
  ui,
  {
    authValue = {},
    routerProps = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter {...routerProps}>
        <MockAuthProvider value={authValue}>
          {children}
        </MockAuthProvider>
      </BrowserRouter>
    );
  }
  
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper function to create mock user
export const createMockUser = (overrides = {}) => ({
  uid: 'mock-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  ...overrides
});

// Helper function to create mock user profile
export const createMockUserProfile = (overrides = {}) => ({
  uid: 'mock-uid',
  email: 'test@example.com',
  name: 'Test User',
  role: 'donor',
  phone: '1234567890',
  location: null,
  profileComplete: true,
  isActive: true,
  ...overrides
});

// Helper function to wait for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn(index => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
})();

// Mock fetch for API calls
export const mockFetch = (mockResponse) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  );
};

// Helper to create form data for testing
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  return formData;
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { render };