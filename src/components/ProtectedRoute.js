// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Card, CardContent, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireRole = null, 
  requireAdmin = false, 
  requirePermission = null 
}) => {
  const { currentUser, userProfile, loading, isAdmin, hasAdminPermission } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being verified
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Card sx={{ p: 4, textAlign: 'center', minWidth: 300 }}>
          <CircularProgress size={50} sx={{ mb: 3, color: '#667eea' }} />
          <Typography variant="h6">Verifying access...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we check your permissions
          </Typography>
        </Card>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if account is suspended
  if (userProfile.status === 'suspended') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Suspended
              </Typography>
              <Typography variant="body2">
                Your account has been suspended. Please contact support for assistance.
              </Typography>
            </Alert>
            <Button 
              variant="contained" 
              href="mailto:support@foodshare.com"
              sx={{ mr: 2 }}
            >
              Contact Support
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/login'}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Admin Access Required
              </Typography>
              <Typography variant="body2">
                You need administrator privileges to access this page.
              </Typography>
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Check specific admin permission
  if (requirePermission && !hasAdminPermission(requirePermission)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Insufficient Permissions
              </Typography>
              <Typography variant="body2">
                You don't have the required permission: {requirePermission}
              </Typography>
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/admin-dashboard'}
            >
              Back to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Check role requirement
  if (requireRole && userProfile.role !== requireRole) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Role Access Required
              </Typography>
              <Typography variant="body2">
                This page requires {requireRole} role access. Your current role: {userProfile.role}
              </Typography>
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // All checks passed - render the protected component
  return children;
};

// Specific components for common use cases
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requireAdmin={true}>
    {children}
  </ProtectedRoute>
);

export const DonorRoute = ({ children }) => (
  <ProtectedRoute requireRole="donor">
    {children}
  </ProtectedRoute>
);

export const ReceiverRoute = ({ children }) => (
  <ProtectedRoute requireRole="receiver">
    {children}
  </ProtectedRoute>
);

export const VolunteerRoute = ({ children }) => (
  <ProtectedRoute requireRole="volunteer">
    {children}
  </ProtectedRoute>
);

// Permission-based route for specific admin functions
export const AdminPermissionRoute = ({ children, permission }) => (
  <ProtectedRoute requireAdmin={true} requirePermission={permission}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;