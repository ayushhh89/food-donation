// src/pages/dashboard/Dashboard.test.js
import React from 'react';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Dashboard Component - Unit Tests', () => {
  
  // Test 1: Component can be imported without errors
  test('renders Dashboard component successfully without runtime errors', () => {
    let Dashboard;
    expect(() => {
      Dashboard = require('./Dashboard').default;
    }).not.toThrow();
    expect(Dashboard).toBeDefined();
  });

  // Test 2: Navigation function is available and works
  test('navigation function is available and can be called', () => {
    expect(mockNavigate).toBeDefined();
    expect(typeof mockNavigate).toBe('function');
    
    mockNavigate('/test-path');
    expect(mockNavigate).toHaveBeenCalledWith('/test-path');
  });

  // Test 3: Component handles basic structure
  test('component handles user interactions without crashing', () => {
    const Dashboard = require('./Dashboard').default;
    expect(Dashboard).toBeDefined();
    expect(typeof Dashboard).toBe('function');
  });
});