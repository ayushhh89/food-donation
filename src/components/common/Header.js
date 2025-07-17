import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  Restaurant,
  Person,
  Add,
  Search,
  Dashboard,
  ExitToApp,
  AccountCircle
} from '@mui/icons-material';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isLoggedIn = false; // Change this to true to test logged in state

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Toolbar>
        {/* Logo */}
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigateTo('/')}
        >
          <Restaurant sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            FoodShare
          </Typography>
        </Box>

        {/* Center Navigation */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 4 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<Search />}
              onClick={() => navigateTo('/browse')}
            >
              Browse Food
            </Button>
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => navigateTo('/create-donation')}
            >
              Donate Food
            </Button>
            <Button
              color="inherit"
              startIcon={<Dashboard />}
              onClick={() => navigateTo('/my-donations')}
            >
              My Donations
            </Button>
          </Box>
        </Box>

        {/* Right Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isLoggedIn ? (
            <>
              <Chip 
                label="Donor" 
                color="primary" 
                size="small" 
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              <IconButton
                onClick={handleMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { navigateTo('/dashboard'); handleMenuClose(); }}>
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => { navigateTo('/profile'); handleMenuClose(); }}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { navigateTo('/my-donations'); handleMenuClose(); }}>
                  My Donations
                </MenuItem>
                <MenuItem onClick={() => { navigateTo('/my-claims'); handleMenuClose(); }}>
                  My Claims
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigateTo('/login')}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigateTo('/register')}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;