// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-router-dom for this test
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>
}));

// Mock AuthProvider
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock ToastContainer
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />
}));

test('renders app without crashing', () => {
  render(<App />);
  
  // Check that the main app components are rendered
  expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  expect(screen.getByTestId('browser-router')).toBeInTheDocument();
  expect(screen.getByTestId('toast-container')).toBeInTheDocument();
});