// src/setupTests.js
import '@testing-library/jest-dom';

// Mock Firebase with proper returns
jest.mock('./services/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {}
}));

// Mock Firebase Auth functions
global.mockFirebaseAuth = {
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
};

// Mock Firebase Firestore functions
global.mockFirebaseFirestore = {
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
};

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  },
  ToastContainer: () => null
}));

// Mock window.matchMedia (often needed for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Suppress console errors in tests (you can remove this if you want to see all console output)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: An invalid form control') ||
       args[0].includes('Consider adding an error boundary') ||
       args[0].includes('Email already in use') ||
       args[0].includes('Wrong password'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
global.createMockUser = (overrides = {}) => ({
  uid: 'mock-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  ...overrides
});

global.createMockUserProfile = (overrides = {}) => ({
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

// Helper to wait for async operations
global.waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));