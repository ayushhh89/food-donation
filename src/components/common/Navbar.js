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
  useTheme
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
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      { text: 'My Donations', icon: <Assignment />, path: '/my-donations' }
    ] : []),
    ...(userProfile?.role === 'receiver' ? [
      { text: 'Browse Food', icon: <Search />, path: '/browse' },
      { text: 'My Claims', icon: <LocalDining />, path: '/my-claims' }
    ] : []),
    ...(userProfile?.role === null ? [
      { text: 'Browse Food', icon: <Search />, path: '/browse' }
    ] : [])
  ] : [
    { text: 'Browse Food', icon: <Search />, path: '/browse' }
  ];

  const renderMobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          background: `
            linear-gradient(135deg, 
              rgba(255,255,255,0.95) 0%, 
              rgba(248,249,250,0.98) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(46, 125, 50, 0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ width: 280, pt: 3 }}>
        <List>
          <ListItem sx={{ mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 2,
                py: 1,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.1)'
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)'
                }}
              >
                <Restaurant sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '1.3rem'
                }}
              >
                FoodShare
              </Typography>
            </Box>
          </ListItem>
          
          {menuItems.map((item, index) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 3,
                background: isActive(item.path) 
                  ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                  : 'transparent',
                border: isActive(item.path) ? '1px solid rgba(46, 125, 50, 0.2)' : '1px solid transparent',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                py: 1.5
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isActive(item.path) ? '#2E7D32' : '#666',
                  minWidth: 40,
                  '& svg': {
                    fontSize: 22
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    color: isActive(item.path) ? '#2E7D32' : '#333',
                    fontWeight: isActive(item.path) ? 600 : 500,
                    fontSize: '0.95rem'
                  }
                }}
              />
            </ListItem>
          ))}

          {currentUser && (
            <>
              <Box sx={{ mx: 2, my: 2, height: 1, bgcolor: 'rgba(0,0,0,0.08)' }} />
              <ListItem 
                button 
                onClick={handleLogout}
                sx={{
                  mx: 2,
                  mb: 1,
                  borderRadius: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.03) 100%)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 20px rgba(244, 67, 54, 0.1)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{
                    sx: {
                      color: '#f44336',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          background: `
            linear-gradient(135deg, 
              rgba(255,255,255,0.95) 0%, 
              rgba(248,249,250,0.98) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(46, 125, 50, 0.08)',
          color: 'text.primary',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
        }}
      >
        <Toolbar sx={{ py: { xs: 1, md: 1.5 } }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ 
                mr: 2,
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.12) 0%, rgba(76, 175, 80, 0.06) 100%)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <MenuIcon sx={{ color: '#2E7D32' }} />
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
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
                transform: 'scale(1.02)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  width: 20,
                  height: 20,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  borderRadius: '50%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }
              }}
            >
              <Restaurant sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.3rem', md: '1.4rem' },
                letterSpacing: '-0.02em'
              }}
            >
              FoodShare
            </Typography>
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
                    color: isActive(item.path) ? '#2E7D32' : '#666',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    background: isActive(item.path) 
                      ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                      : 'transparent',
                    border: isActive(item.path) ? '1px solid rgba(46, 125, 50, 0.2)' : '1px solid transparent',
                    '&:hover': {
                      background: isActive(item.path)
                        ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(46, 125, 50, 0.15)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiButton-startIcon': {
                      color: isActive(item.path) ? '#2E7D32' : '#888'
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
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    color: '#666',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                      color: '#2E7D32',
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
                    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 8px 30px rgba(46, 125, 50, 0.4)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}

            {currentUser && (
              <>
                {/* Notifications */}
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                    border: '1px solid rgba(46, 125, 50, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.12) 0%, rgba(76, 175, 80, 0.06) 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Badge 
                    badgeContent={0} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
                      }
                    }}
                  >
                    <Notifications sx={{ color: '#2E7D32' }} />
                  </Badge>
                </IconButton>

                {/* Profile Menu */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{
                    p: 0.5,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                    border: '1px solid rgba(46, 125, 50, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.12) 0%, rgba(76, 175, 80, 0.06) 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 38, 
                      height: 38, 
                      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)'
                    }}
                  >
                    {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0)}
                  </Avatar>
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            background: `
              linear-gradient(135deg, 
                rgba(255,255,255,0.95) 0%, 
                rgba(248,249,250,0.98) 100%
              )
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(46, 125, 50, 0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            borderRadius: 3,
            mt: 2,
            minWidth: 220,
            '& .MuiMenuItem-root': {
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              px: 2,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)',
                transform: 'translateX(4px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 16,
              width: 12,
              height: 12,
              background: `
                linear-gradient(135deg, 
                  rgba(255,255,255,0.95) 0%, 
                  rgba(248,249,250,0.98) 100%
                )
              `,
              border: '1px solid rgba(46, 125, 50, 0.1)',
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
        <MenuItem onClick={() => navigate('/dashboard')}>
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
              width: 36,
              height: 36,
              mr: 2,
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)'
            }}
          >
            {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0)}
          </Avatar>
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: '#1a1a1a',
                fontSize: '0.9rem'
              }}
            >
              {userProfile?.name || 'User'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                fontSize: '0.8rem',
                fontWeight: 500
              }}
            >
              {userProfile?.role || 'Member'}
            </Typography>
          </Box>
        </MenuItem>
        <Box sx={{ mx: 2, my: 1, height: 1, bgcolor: 'rgba(0,0,0,0.08)' }} />
        <MenuItem onClick={() => navigate('/dashboard')}>
          <Dashboard sx={{ mr: 2, color: '#2E7D32', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>Dashboard</Typography>
        </MenuItem>
        <MenuItem onClick={() => navigate('/profile')}>
          <AccountCircle sx={{ mr: 2, color: '#2E7D32', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>Profile</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.03) 100%) !important'
            }
          }}
        >
          <Logout sx={{ mr: 2, color: '#f44336', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', color: '#f44336' }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      {renderMobileMenu}

      <style jsx>{`
        @keyframes shimmer {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Navbar;