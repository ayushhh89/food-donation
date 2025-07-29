import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  Chip
} from '@mui/material';
import {
  Restaurant,
  People,
  LocationOn,
  Schedule,
  EnergySavingsLeaf,
  Favorite
} from '@mui/icons-material';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(129, 199, 132, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(46, 125, 50, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0D4C14 0%, #1B5E20 25%, #2E7D32 50%, #388E3C 75%, #4CAF50 100%)
          `,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite'
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  animation: 'slideInLeft 1s ease-out'
                }}
              >
                <Typography 
                  variant="h1" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
                    fontWeight: 800,
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #ffffff 0%, #E8F5E8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 3
                  }}
                >
                  Share Food,
                  <br />
                  <Box 
                    component="span" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Share Hope
                  </Box>
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 6, 
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    fontWeight: 300,
                    lineHeight: 1.6,
                    maxWidth: '520px',
                    color: 'rgba(255,255,255,0.95)'
                  }}
                >
                  Connect surplus food with people who need it. 
                  Reduce waste, build community, make impact.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      color: '#1B5E20',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      py: 2,
                      px: 5,
                      borderRadius: 50,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        boxShadow: '0 12px 48px rgba(255, 255, 255, 0.4)',
                        transform: 'translateY(-3px) scale(1.02)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    startIcon={<Restaurant />}
                    onClick={() => window.location.href = '/create-donation'}
                  >
                    Donate Food
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.4)', 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      py: 2,
                      px: 5,
                      borderRadius: 50,
                      textTransform: 'none',
                      borderWidth: 2,
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': { 
                        borderColor: 'rgba(255,255,255,0.8)', 
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 2,
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    startIcon={<People />}
                    onClick={() => window.location.href = '/browse'}
                  >
                    Find Food
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  animation: 'slideInRight 1s ease-out'
                }}
              >
                <Box
                  sx={{
                    height: { xs: 320, md: 450 },
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.15) 0%, 
                        rgba(255,255,255,0.05) 100%
                      )
                    `,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      left: -50,
                      width: 100,
                      height: 100,
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      borderRadius: '50%',
                      animation: 'pulse 4s ease-in-out infinite'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -30,
                      right: -30,
                      width: 80,
                      height: 80,
                      background: 'radial-gradient(circle, rgba(129, 199, 132, 0.4) 0%, transparent 70%)',
                      borderRadius: '50%',
                      animation: 'pulse 4s ease-in-out infinite 2s'
                    }
                  }}
                >
                  <Restaurant 
                    sx={{ 
                      fontSize: { xs: 100, md: 140 }, 
                      opacity: 0.8,
                      filter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.3))',
                      animation: 'float 6s ease-in-out infinite'
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
        <style jsx>{`
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }
        `}</style>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: 6,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(46, 125, 50, 0.1)',
                boxShadow: '0 20px 60px rgba(46, 125, 50, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(46, 125, 50, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '3px solid rgba(46, 125, 50, 0.1)'
                }}
              >
                <Restaurant sx={{ fontSize: 40, color: '#2E7D32' }} />
              </Box>
              <Typography 
                variant="h1" 
                sx={{ 
                  background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                1,200+
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '1.3rem'
                }}
              >
                Meals Shared
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: 6,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(123, 31, 162, 0.1)',
                boxShadow: '0 20px 60px rgba(123, 31, 162, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #7B1FA2 0%, #9C27B0 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(123, 31, 162, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '3px solid rgba(123, 31, 162, 0.1)'
                }}
              >
                <People sx={{ fontSize: 40, color: '#7B1FA2' }} />
              </Box>
              <Typography 
                variant="h1" 
                sx={{ 
                  background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                350+
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '1.3rem'
                }}
              >
                Community Members
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: 6,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(56, 142, 60, 0.1)',
                boxShadow: '0 20px 60px rgba(56, 142, 60, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #388E3C 0%, #66BB6A 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(56, 142, 60, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '3px solid rgba(56, 142, 60, 0.1)'
                }}
              >
                <EnergySavingsLeaf sx={{ fontSize: 40, color: '#388E3C' }} />
              </Box>
              <Typography 
                variant="h1" 
                sx={{ 
                  background: 'linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                500kg
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '1.3rem'
                }}
              >
                Waste Prevented
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works */}
      <Box 
        sx={{ 
          background: `
            radial-gradient(circle at 10% 20%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(46, 125, 50, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
          `,
          py: 10,
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2E7D32 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 3
              }}
            >
              How It Works
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.2rem',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                color: '#666',
                lineHeight: 1.6
              }}
            >
              Simple steps to share and receive food
            </Typography>
          </Box>
          
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  p: 8, 
                  height: '100%',
                  borderRadius: 6,
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.9) 0%, 
                      rgba(248,249,250,0.9) 100%
                    )
                  `,
                  border: '1px solid rgba(46, 125, 50, 0.1)',
                  boxShadow: '0 25px 80px rgba(46, 125, 50, 0.1)',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 6,
                    background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)'
                  },
                  '&:hover': {
                    boxShadow: '0 35px 100px rgba(46, 125, 50, 0.15)',
                    transform: 'translateY(-4px)'
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 4,
                      boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)'
                    }}
                  >
                    <Restaurant sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#1a1a1a',
                      fontSize: '2rem'
                    }}
                  >
                    For Donors
                  </Typography>
                </Box>
                <Stack spacing={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="1" 
                      sx={{ 
                        mr: 4,
                        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)'
                      }} 
                    />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333', fontWeight: 500 }}>
                      Post your surplus food with details
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="2" 
                      sx={{ 
                        mr: 4,
                        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)'
                      }} 
                    />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333', fontWeight: 500 }}>
                      Receivers express interest
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="3" 
                      sx={{ 
                        mr: 4,
                        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)'
                      }} 
                    />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333', fontWeight: 500 }}>
                      Coordinate pickup and share!
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 6,
                    py: 2,
                    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                      boxShadow: '0 12px 48px rgba(46, 125, 50, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  startIcon={<Restaurant />}
                  onClick={() => window.location.href = '/create-donation'}
                >
                  Start Donating
                </Button>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  p: 8, 
                  height: '100%',
                  borderRadius: 6,
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.9) 0%, 
                      rgba(248,249,250,0.9) 100%
                    )
                  `,
                  border: '1px solid rgba(123, 31, 162, 0.1)',
                  boxShadow: '0 25px 80px rgba(123, 31, 162, 0.1)',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 6,
                    background: 'linear-gradient(90deg, #7B1FA2 0%, #9C27B0 100%)'
                  },
                  '&:hover': {
                    boxShadow: '0 35px 100px rgba(123, 31, 162, 0.15)',
                    transform: 'translateY(-4px)'
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 4,
                      boxShadow: '0 8px 32px rgba(123, 31, 162, 0.3)'
                    }}
                  >
                    <People sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#1a1a1a',
                      fontSize: '2rem'
                    }}
                  >
                    For Receivers
                  </Typography>
                </Box>
                <Stack spacing={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="1" 
                      sx={{ 
                        mr: 4,
                        background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 16px rgba(123, 31, 162, 0.3)'
                      }} 
                    />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333', fontWeight: 500 }}>
                      Browse available food donations
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="2" 
                      sx={{ 
                        mr: 4,
                        background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 16px rgba(123, 31, 162, 0.3)'
                      }} 
                    />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333', fontWeight: 500 }}>
                      Express interest in items you need
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label="3" 
                      sx={{ 
                        mr: 4,
                        background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 16px rgba(123, 31, 162, 0.3)'
                      }} 
                    />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333', fontWeight: 500 }}>
                      Pick up and enjoy the food!
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 6,
                    py: 2,
                    background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 32px rgba(123, 31, 162, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)',
                      boxShadow: '0 12px 48px rgba(123, 31, 162, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  startIcon={<People />}
                  onClick={() => window.location.href = '/browse'}
                >
                  Find Food
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box textAlign="center" sx={{ mb: 10 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2E7D32 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 3
            }}
          >
            Why Choose FoodShare?
          </Typography>
        </Box>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={6} md={3}>
            <Box 
              textAlign="center"
              sx={{
                '&:hover .feature-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 15px 40px rgba(46, 125, 50, 0.3)'
                },
                '&:hover .feature-content': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box
                className="feature-icon"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '30px',
                  background: `
                    linear-gradient(135deg, 
                      rgba(46, 125, 50, 0.1) 0%, 
                      rgba(76, 175, 80, 0.05) 100%
                    )
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '2px solid rgba(46, 125, 50, 0.1)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 100,
                    height: 100,
                    background: 'radial-gradient(circle, rgba(46, 125, 50, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s ease-in-out infinite'
                  }
                }}
              >
                <LocationOn sx={{ fontSize: 50, color: '#2E7D32', zIndex: 1 }} />
              </Box>
              <Box className="feature-content" sx={{ transition: 'all 0.3s ease' }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 3,
                    fontSize: '1.5rem'
                  }}
                >
                  Local Community
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: '#666',
                    fontWeight: 400
                  }}
                >
                  Connect with neighbors in your area
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box 
              textAlign="center"
              sx={{
                '&:hover .feature-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 15px 40px rgba(46, 125, 50, 0.3)'
                },
                '&:hover .feature-content': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box
                className="feature-icon"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '30px',
                  background: `
                    linear-gradient(135deg, 
                      rgba(46, 125, 50, 0.1) 0%, 
                      rgba(76, 175, 80, 0.05) 100%
                    )
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '2px solid rgba(46, 125, 50, 0.1)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 100,
                    height: 100,
                    background: 'radial-gradient(circle, rgba(46, 125, 50, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s ease-in-out infinite 0.5s'
                  }
                }}
              >
                <Schedule sx={{ fontSize: 50, color: '#2E7D32', zIndex: 1 }} />
              </Box>
              <Box className="feature-content" sx={{ transition: 'all 0.3s ease' }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 3,
                    fontSize: '1.5rem'
                  }}
                >
                  Real-time Updates
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: '#666',
                    fontWeight: 400
                  }}
                >
                  Get instant notifications about new donations
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box 
              textAlign="center"
              sx={{
                '&:hover .feature-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 15px 40px rgba(46, 125, 50, 0.3)'
                },
                '&:hover .feature-content': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box
                className="feature-icon"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '30px',
                  background: `
                    linear-gradient(135deg, 
                      rgba(46, 125, 50, 0.1) 0%, 
                      rgba(76, 175, 80, 0.05) 100%
                    )
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '2px solid rgba(46, 125, 50, 0.1)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 100,
                    height: 100,
                    background: 'radial-gradient(circle, rgba(46, 125, 50, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s ease-in-out infinite 1s'
                  }
                }}
              >
                <EnergySavingsLeaf sx={{ fontSize: 50, color: '#2E7D32', zIndex: 1 }} />
              </Box>
              <Box className="feature-content" sx={{ transition: 'all 0.3s ease' }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 3,
                    fontSize: '1.5rem'
                  }}
                >
                  Reduce Waste
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: '#666',
                    fontWeight: 400
                  }}
                >
                  Help prevent good food from going to waste
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box 
              textAlign="center"
              sx={{
                '&:hover .feature-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 15px 40px rgba(46, 125, 50, 0.3)'
                },
                '&:hover .feature-content': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box
                className="feature-icon"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '30px',
                  background: `
                    linear-gradient(135deg, 
                      rgba(46, 125, 50, 0.1) 0%, 
                      rgba(76, 175, 80, 0.05) 100%
                    )
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  border: '2px solid rgba(46, 125, 50, 0.1)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 100,
                    height: 100,
                    background: 'radial-gradient(circle, rgba(46, 125, 50, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s ease-in-out infinite 1.5s'
                  }
                }}
              >
                <Favorite sx={{ fontSize: 50, color: '#2E7D32', zIndex: 1 }} />
              </Box>
              <Box className="feature-content" sx={{ transition: 'all 0.3s ease' }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 3,
                    fontSize: '1.5rem'
                  }}
                >
                  Build Community
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: '#666',
                    fontWeight: 400
                  }}
                >
                  Create meaningful connections through sharing
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: `
            radial-gradient(circle at 30% 40%, rgba(129, 199, 132, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)
          `,
          color: 'white', 
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20-20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 25s linear infinite'
          }
        }}
      >
        <Container maxWidth="md" textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.2rem', md: '3rem' },
              mb: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #E8F5E8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Ready to Make a Difference?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 8, 
              fontSize: '1.3rem',
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: '600px',
              mx: 'auto',
              color: 'rgba(255,255,255,0.95)'
            }}
          >
            Join our community of food sharers and help reduce waste while helping others.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: '#1B5E20',
                fontWeight: 700,
                fontSize: '1.2rem',
                py: 2.5,
                px: 6,
                borderRadius: 50,
                textTransform: 'none',
                boxShadow: '0 12px 40px rgba(255, 255, 255, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                minWidth: 200,
                '&:hover': { 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  boxShadow: '0 16px 60px rgba(255, 255, 255, 0.4)',
                  transform: 'translateY(-4px) scale(1.05)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => window.location.href = '/register'}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                fontWeight: 600,
                fontSize: '1.2rem',
                py: 2.5,
                px: 6,
                borderRadius: 50,
                textTransform: 'none',
                borderWidth: 2,
                backdropFilter: 'blur(15px)',
                background: 'rgba(255, 255, 255, 0.1)',
                minWidth: 200,
                '&:hover': { 
                  borderColor: 'rgba(255,255,255,0.9)', 
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 2,
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 12px 40px rgba(255, 255, 255, 0.2)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => window.location.href = '/browse'}
            >
              Browse Food
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;