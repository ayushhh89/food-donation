// src/App.js - Complete version with admin integration
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/Profile';
import CreateDonation from './pages/CreateDonation';
import MyDonations from './pages/MyDonations';
import MyClaims from './pages/MyClaims';
import DonationDetails from './pages/DonationDetails';
import DonationFeed from './components/receiver/DonationFeed';
import MapContainer from './components/maps/MapContainer';
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard';

// Chat Components
import ChatInterface from './components/chat/ChatInterface';

// *** ADD ADMIN DASHBOARD IMPORT ***
import AdminDashboard from './pages/AdminDashboard';

// *** ADD NGO PARTNERSHIP IMPORT ***
import NGOPartnershipHub from './components/ngo/NGOPartnershipHub';
import { GamificationService } from './services/gamificationService';

// Role-based redirect component
const RoleBasedRedirect = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return children;

  if (currentUser && userProfile) {
    // Redirect based on role
    switch (userProfile.role) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'volunteer':
        return <Navigate to="/volunteer-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Admin Route Protection Component
const AdminRoute = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

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
              <Route path="/" element={
                <RoleBasedRedirect>
                  <Home />
                </RoleBasedRedirect>
              } />

              <Route path="/login" element={
                <RoleBasedRedirect>
                  <Login />
                </RoleBasedRedirect>
              } />

              <Route path="/register" element={
                <RoleBasedRedirect>
                  <Register />
                </RoleBasedRedirect>
              } />

              {/* Public browsing (login required for actions) */}
              <Route path="/browse" element={<DonationFeed />} />
              <Route path="/map" element={<MapContainer />} />
              <Route path="/donation/:id" element={<DonationDetails />} />

              {/* *** ADMIN ROUTES *** */}
              <Route path="/admin-dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

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

              <Route path="/volunteer-dashboard" element={
                <ProtectedRoute requireRole="volunteer">
                  <VolunteerDashboard />
                </ProtectedRoute>
              } />

              {/* Chat Routes - Available to all authenticated users */}
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatInterface standalone={true} />
                </ProtectedRoute>
              } />

              <Route path="/chat/:conversationId" element={
                <ProtectedRoute>
                  <ChatInterface standalone={true} />
                </ProtectedRoute>
              } />

              {/* Donor-Only Routes */}
              <Route path="/create-donation" element={
                <ProtectedRoute requireRole="donor">
                  <CreateDonation />
                </ProtectedRoute>
              } />

              <Route path="/achievements" element={
                <ProtectedRoute>
                  <GamificationService />
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

              <Route path="/ngo" element={
                <ProtectedRoute>
                  <NGOPartnershipHub />
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