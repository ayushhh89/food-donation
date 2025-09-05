// src/components/common/Navbar.js - ENHANCED VERSION
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Stack
} from '@mui/material';
import {
  Restaurant,
  AccountCircle,
  Notifications,
  Menu as MenuIcon,
  Home,
  Add,
  Search,
  LocalDining,
  Assignment,
  Dashboard,
  Logout,
  Settings,
  Person,
  Close,
  Analytics,
  Favorite,
  People
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleMenuClose();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = currentUser ? [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ...(userProfile?.role === 'donor' ? [
      { text: 'Create Donation', icon: <Add />, path: '/create-donation' },
      { text: 'My Donations', icon: <Assignment />, path: '/my-donations' },
      { text: 'Analytics', icon: <Analytics />, path: '/analytics' }
    ] : []),
    ...(userProfile?.role === 'receiver' ? [
      { text: 'Browse Food', icon: <Search />, path: '/browse' },
      { text: 'My Claims', icon: <LocalDining />, path: '/my-claims' },
      // { text: 'Favorites', icon: <Favorite />, path: '/favorites' }
    ] : []),
    { text: 'Community', icon: <People />, path: '/community' }
  ] : [
    { text: 'Browse Food', icon: <Search />, path: '/browse' },
    { text: 'Community', icon: <People />, path: '/community' }
  ];

  const renderMobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 320,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 4,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 3,
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <Restaurant sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: '1.5rem',
                    mb: 0.5
                  }}
                >
                  FoodShare
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.85rem'
                  }}
                >
                  Sharing is caring
                </Typography>
              </Box>
            </Box>
            
            <IconButton
              onClick={handleMobileMenuToggle}
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </Box>

        {/* User Profile Section */}
        {currentUser && (
          <Box
            sx={{
              p: 4,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}
              >
                {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    mb: 0.5
                  }}
                >
                  {userProfile?.name || 'User'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {userProfile?.role || 'Member'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Navigation Items */}
        <Box sx={{ flex: 1, p: 2 }}>
          <List sx={{ p: 0 }}>
            {menuItems.map((item, index) => (
              <ListItem 
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: isActive(item.path) 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'transparent',
                  backdropFilter: isActive(item.path) ? 'blur(10px)' : 'none',
                  border: isActive(item.path) ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    transform: 'translateX(8px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  py: 2,
                  px: 3
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'white',
                    minWidth: 48,
                    '& svg': {
                      fontSize: 24
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      color: 'white',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Bottom Actions */}
        {currentUser && (
          <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Stack spacing={2}>
              <Button
                fullWidth
                startIcon={<Settings />}
                onClick={() => handleNavigation('/profile')}
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 3,
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Settings & Profile
              </Button>
              <Button
                fullWidth
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 3,
                  color: 'white',
                  background: 'rgba(244, 67, 54, 0.2)',
                  border: '1px solid rgba(244, 67, 54, 0.5)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(244, 67, 54, 0.3)',
                    border: '1px solid rgba(244, 67, 54, 0.7)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          color: 'text.primary',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          zIndex: 1300
        }}
      >
        <Toolbar sx={{ py: 1, px: { xs: 2, md: 4 } }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ 
                mr: 2,
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              py: 1,
              px: 2,
              borderRadius: 3,
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.05)',
                transform: 'scale(1.02)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  width: 40,
                  height: 40,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  borderRadius: '50%',
                  animation: 'shimmer 4s ease-in-out infinite'
                }
              }}
            >
              <Restaurant sx={{ color: 'white', fontSize: 28, zIndex: 1 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.4rem', md: '1.6rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                FoodShare
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Sharing is caring
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 6, flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mr: 1,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    color: isActive(item.path) ? 'white' : '#666',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    background: isActive(item.path) 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'transparent',
                    boxShadow: isActive(item.path) ? '0 4px 16px rgba(102, 126, 234, 0.3)' : 'none',
                    '&:hover': {
                      background: isActive(item.path)
                        ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      color: isActive(item.path) ? 'white' : '#667eea',
                      transform: 'translateY(-2px)',
                      boxShadow: isActive(item.path) 
                        ? '0 8px 32px rgba(102, 126, 234, 0.4)'
                        : '0 4px 16px rgba(102, 126, 234, 0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiButton-startIcon': {
                      color: isActive(item.path) ? 'white' : '#888'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && !currentUser && (
              <Stack direction="row" spacing={2}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    color: '#666',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    border: '1px solid transparent',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      color: '#667eea',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 12px 48px rgba(102, 126, 234, 0.5)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
            )}

            {currentUser && (
              <Stack direction="row" spacing={2}>
                {/* Notifications */}
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.08) 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Badge 
                    badgeContent={3} 
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)'
                      }
                    }}
                  >
                    <Notifications sx={{ color: '#667eea', fontSize: 24 }} />
                  </Badge>
                </IconButton>

                {/* Profile Menu */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{
                    p: 0.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.08) 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 42, 
                      height: 42, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Enhanced Desktop Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
            borderRadius: 4,
            mt: 2,
            minWidth: 280,
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 20,
              width: 16,
              height: 16,
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderBottom: 'none',
              borderRight: 'none',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Profile Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: 56,
                height: 56,
                fontWeight: 700,
                fontSize: '1.5rem',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}
            >
              {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0)}
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#1a1a1a',
                  fontSize: '1.1rem',
                  mb: 0.5
                }}
              >
                {userProfile?.name || 'User'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                {userProfile?.role || 'Member'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#888',
                  fontSize: '0.75rem'
                }}
              >
                {currentUser?.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Menu Items */}
        <Box sx={{ py: 2 }}>
          <MenuItem 
            onClick={() => navigate('/dashboard')}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 3,
              py: 1.5,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                transform: 'translateX(4px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Dashboard sx={{ mr: 3, color: '#667eea', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Dashboard</Typography>
          </MenuItem>
          
          <MenuItem 
            onClick={() => navigate('/profile')}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 3,
              py: 1.5,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                transform: 'translateX(4px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Person sx={{ mr: 3, color: '#667eea', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Profile & Settings</Typography>
          </MenuItem>
          
          <Divider sx={{ mx: 2, my: 2 }} />
          
          <MenuItem 
            onClick={handleLogout}
            sx={{
              mx: 2,
              borderRadius: 3,
              py: 1.5,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                transform: 'translateX(4px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Logout sx={{ mr: 3, color: '#f44336', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#f44336' }}>
              Logout
            </Typography>
          </MenuItem>
        </Box>
      </Menu>

      {/* Mobile Menu */}
      {renderMobileMenu}

      <style jsx>{`
        @keyframes shimmer {
          0% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.1) rotate(5deg); }
          100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </>
  );
};

export default Navbar;