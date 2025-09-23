// src/components/auth/Login.js - UPDATED WITH ADMIN ROUTING
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Restaurant,
  ArrowBack,
  LoginOutlined,
  PersonAdd,
  Security,
  Verified,
  TrendingUp,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login, currentUser, userProfile, loading: authLoading, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || getDashboardRoute();

  // Enhanced redirect when user is fully authenticated with role-based routing
  useEffect(() => {
    if (currentUser && userProfile && !authLoading) {
      const dashboardRoute = getDashboardRoute();
      console.log(`User authenticated with role: ${userProfile.role}, redirecting to: ${dashboardRoute}`);
      
      // Check if account is active
      if (userProfile.status === 'suspended') {
        return; // AuthContext will handle logout
      }
      
      navigate(dashboardRoute, { replace: true });
    }
  }, [currentUser, userProfile, authLoading, navigate, getDashboardRoute]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting login process...');
      await login(formData.email, formData.password);
      console.log('Login function completed, waiting for auth state...');
      // Don't navigate here - let the useEffect handle it after profile is loaded
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to login. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Show loading if auth is still processing
  if (authLoading && currentUser) {
    const role = userProfile?.role;
    const isAdmin = role === 'admin';
    
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: isAdmin 
            ? 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ p: 4, textAlign: 'center', minWidth: 300 }}>
          <CircularProgress 
            size={50} 
            sx={{ 
              mb: 3,
              color: isAdmin ? '#f44336' : '#667eea'
            }} 
          />
          <Typography variant="h6">
            {isAdmin ? 'Loading Admin Console...' : 'Loading your dashboard...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? 'Accessing administrative controls' : 'Setting up your account'}
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)
          `
        }
      }}
    >
      {/* Back to Home Button */}
      <IconButton
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <ArrowBack />
      </IconButton>

      <Container maxWidth="sm" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Main Login Card */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #FFD700 0%, #FF6B6B 50%, #4ECDC4 100%)'
            }
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              {/* Logo/Icon */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                <Restaurant sx={{ fontSize: 50, color: 'white' }} />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2
                }}
              >
                Welcome Back!
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                Sign in to your FoodShare account
              </Typography>

              {/* Trust Indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {[
                  { icon: <Security />, text: 'Secure Login' },
                  { icon: <Verified />, text: 'Verified Platform' },
                  { icon: <TrendingUp />, text: '850+ Members' },
                  { icon: <AdminPanelSettings />, text: 'Admin Access' }
                ].map((item, idx) => (
                  <Chip
                    key={idx}
                    icon={item.icon}
                    label={item.text}
                    size="small"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  background: 'rgba(244, 67, 54, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  color: 'white',
                  '& .MuiAlert-icon': {
                    color: '#ff6b6b'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.8)',
                    '&.Mui-focused': {
                      color: 'white'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                    fontSize: '1.1rem'
                  }
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={loading}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.8)',
                    '&.Mui-focused': {
                      color: 'white'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                    fontSize: '1.1rem'
                  }
                }}
              />

              {/* Sign In Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#667eea' }} /> : <LoginOutlined />}
                sx={{
                  py: 3,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  color: '#667eea',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
                  mb: 3,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(255, 255, 255, 0.4)'
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.7)',
                    color: '#667eea'
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {loading ? 'Signing in...' : 'Sign In to FoodShare'}
              </Button>

              {/* Sign Up Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.1rem',
                    mb: 2
                  }}
                >
                  Don't have an account?
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate('/register')}
                  disabled={loading}
                  sx={{
                    py: 2.5,
                    borderRadius: 4,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderWidth: 2,
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)'
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Create New Account
                </Button>
              </Box>
            </Box>

            {/* Admin Access Notice */}
            <Box
              sx={{
                mt: 4,
                p: 2,
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Admin users will be automatically redirected to the admin console
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;