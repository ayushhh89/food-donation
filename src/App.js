// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateDonation from './pages/CreateDonation';
import MyDonations from './pages/MyDonations';
import MyClaims from './pages/MyClaims';
import DonationDetails from './pages/DonationDetails';
import DonationFeed from './components/receiver/DonationFeed';
import MapContainer from './components/maps/MapContainer';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green theme for food/nature
    },
    secondary: {
      main: '#FF6F00', // Orange for warmth/community
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF'
    },
    success: {
      main: '#4CAF50'
    },
    warning: {
      main: '#FF9800'
    },
    error: {
      main: '#F44336'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px'
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public browsing (but login required for actions) */}
              <Route path="/browse" element={<DonationFeed />} />
              <Route path="/map" element={<MapContainer />} />
              <Route path="/donation/:id" element={<DonationDetails />} />

              {/* Protected Routes - Require Authentication */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Donor-Only Routes */}
              <Route path="/create-donation" element={
                <ProtectedRoute requireRole="donor">
                  <CreateDonation />
                </ProtectedRoute>
              } />
              
              <Route path="/my-donations" element={
                <ProtectedRoute requireRole="donor">
                  <MyDonations />
                </ProtectedRoute>
              } />

              <Route path="/edit-donation/:id" element={
                <ProtectedRoute requireRole="donor">
                  <CreateDonation />
                </ProtectedRoute>
              } />

              {/* Receiver-Only Routes */}
              <Route path="/my-claims" element={
                <ProtectedRoute requireRole="receiver">
                  <MyClaims />
                </ProtectedRoute>
              } />

              <Route path="/feed" element={
                <ProtectedRoute requireRole="receiver">
                  <DonationFeed />
                </ProtectedRoute>
              } />

              {/* Redirect old routes */}
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast notifications */}
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;