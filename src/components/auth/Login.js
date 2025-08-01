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
  Link,
  CircularProgress,
  Fade,
  Slide,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
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
  TrendingUp
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login, currentUser, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  // Handle navigation after successful login and auth state update
  useEffect(() => {
    if (loginSuccess && currentUser && userProfile && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [loginSuccess, currentUser, userProfile, authLoading, navigate, from]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoginSuccess(false);

    try {
      await login(formData.email, formData.password);
      setLoginSuccess(true);
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
      setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

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
          `,
          animation: 'float 20s ease-in-out infinite'
        }
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          '& > div': {
            position: 'absolute',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            animation: 'pulse 4s ease-in-out infinite'
          }
        }}
      >
        <Box
          sx={{
            top: '10%',
            left: '10%',
            width: 300,
            height: 300,
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            animationDelay: '0s'
          }}
        />
        <Box
          sx={{
            top: '20%',
            right: '20%',
            width: 250,
            height: 250,
            background: 'linear-gradient(45deg, #45B7D1, #96CEB4)',
            animationDelay: '2s'
          }}
        />
        <Box
          sx={{
            bottom: '30%',
            left: '30%',
            width: 200,
            height: 200,
            background: 'linear-gradient(45deg, #FFEAA7, #DDA0DD)',
            animationDelay: '4s'
          }}
        />
      </Box>

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
        <Fade in={animationTrigger} timeout={1000}>
          <Box>
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
                  <Slide direction="down" in={animationTrigger} timeout={800}>
                    <Box>
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
                          border: '3px solid rgba(255,255,255,0.3)',
                          animation: 'float 6s ease-in-out infinite'
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
                          { icon: <TrendingUp />, text: '850+ Members' }
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
                  </Slide>
                </Box>

                {/* Error Alert */}
                {error && (
                  <Fade in={!!error}>
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
                  </Fade>
                )}

                {/* Login Form */}
                <Slide direction="up" in={animationTrigger} timeout={1000}>
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
                      disabled={loading || (loginSuccess && authLoading)}
                      startIcon={loading ? null : <LoginOutlined />}
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
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={24} sx={{ color: '#667eea' }} />
                          <span>Signing in...</span>
                        </Box>
                      ) : loginSuccess && authLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={20} sx={{ color: '#667eea' }} />
                          <span>Loading Dashboard...</span>
                        </Box>
                      ) : (
                        'Sign In to FoodShare'
                      )}
                    </Button>

                    {/* Divider */}
                    <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                      <Chip 
                        label="or" 
                        size="small" 
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }} 
                      />
                    </Divider>

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
                </Slide>
              </CardContent>
            </Card>

            {/* Additional Info Cards */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: '🔒', title: 'Secure', desc: 'Your data is protected' },
                { icon: '⚡', title: 'Fast', desc: 'Quick and responsive' },
                { icon: '🌟', title: 'Trusted', desc: 'By 850+ members' }
              ].map((item, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    textAlign: 'center',
                    minWidth: 120,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>{item.icon}</Typography>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {item.desc}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Fade>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
};

export default Login;