
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/dashboard/Dashboard'; // Updated path
import Profile from './pages/Profile';
import CreateDonation from './pages/CreateDonation';
import MyDonations from './pages/MyDonations';
import MyClaims from './pages/MyClaims';
import DonationDetails from './pages/DonationDetails';
import DonationFeed from './components/receiver/DonationFeed';
import MapContainer from './components/maps/MapContainer';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public browsing (login required for actions) */}
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
              
              {/* Catch-all route - redirect to home */}
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
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
