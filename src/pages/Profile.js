import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Fade,
  Slide,
  Badge
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Security,
  Notifications,
  Save,
  Cancel,
  Star,
  TrendingUp,
  Verified,
  Dashboard,
  Timeline,
  LocalDining,
  EmojiEvents,
  CalendarToday,
  Lock,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile, changePassword } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    organization: userProfile?.organization || '',
    organizationType: userProfile?.organizationType || '',
    beneficiaryCount: userProfile?.beneficiaryCount || '',
    location: userProfile?.location || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setAnimationTrigger(true);
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      organization: userProfile?.organization || '',
      organizationType: userProfile?.organizationType || '',
      beneficiaryCount: userProfile?.beneficiaryCount || '',
      location: userProfile?.location || ''
    });
    setEditing(false);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
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
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in={animationTrigger} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Profile Settings
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1.2rem',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Manage your account information and preferences
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {/* Enhanced Profile Header */}
          <Grid item xs={12}>
            <Slide direction="up" in={animationTrigger} timeout={1000}>
              <Card
                sx={{
                  p: 5,
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid white',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <PhotoCamera sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                      }
                    >
                      <Avatar
                        sx={{ 
                          width: 140, 
                          height: 140, 
                          fontSize: '3rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 700,
                          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                          border: '4px solid rgba(255, 255, 255, 0.5)'
                        }}
                      >
                        {getInitials(userProfile?.name)}
                      </Avatar>
                    </Badge>
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        mb: 1,
                        fontSize: { xs: '1.8rem', md: '2.5rem' }
                      }}
                    >
                      {userProfile?.name}
                    </Typography>
                    
                    <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.7)', mb: 3, fontSize: '1.1rem' }}>
                      {userProfile?.email}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      <Chip 
                        label={userProfile?.role} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          fontSize: '0.9rem',
                          '& .MuiChip-label': { px: 2 }
                        }}
                      />
                      <Chip 
                        icon={<Verified sx={{ color: 'white !important' }} />}
                        label={userProfile?.verificationStatus || 'Verified'} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      />
                      <Chip 
                        icon={<CalendarToday sx={{ color: 'white !important' }} />}
                        label={`Member since ${userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).getFullYear() : new Date().getFullYear()}`} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      />
                    </Stack>
                  </Box>

                  <Button
                    variant={editing ? "outlined" : "contained"}
                    startIcon={editing ? <Cancel /> : <Edit />}
                    onClick={editing ? handleCancel : () => setEditing(true)}
                    disabled={loading}
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      ...(editing ? {
                        borderColor: '#f44336',
                        color: '#f44336',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#d32f2f',
                          background: 'rgba(244, 67, 54, 0.04)',
                          borderWidth: 2
                        }
                      } : {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)'
                        }
                      }),
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>
              </Card>
            </Slide>
          </Grid>

          {/* Enhanced Basic Information */}
          <Grid item xs={12}>
            <Slide direction="up" in={animationTrigger} timeout={1200}>
              <Card
                sx={{
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Person sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Basic Information
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Person sx={{ color: '#667eea', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: editing ? 'rgba(102, 126, 234, 0.04)' : 'rgba(0,0,0,0.02)',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea'
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        disabled={true}
                        helperText="Email cannot be changed"
                        InputProps={{
                          startAdornment: <Email sx={{ color: '#667eea', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Phone sx={{ color: '#667eea', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: editing ? 'rgba(102, 126, 234, 0.04)' : 'rgba(0,0,0,0.02)',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea'
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={formData.location}
                        onChange={handleInputChange('location')}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ color: '#667eea', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: editing ? 'rgba(102, 126, 234, 0.04)' : 'rgba(0,0,0,0.02)',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Enhanced Role-specific Information */}
          <Grid item xs={12}>
            <Slide direction="up" in={animationTrigger} timeout={1400}>
              <Card
                sx={{
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 183, 77, 0.1) 100%)',
                    borderBottom: '1px solid rgba(255, 152, 0, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Business sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {userProfile?.role === 'donor' ? 'Donor Information' : 'Organization Information'}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {userProfile?.role === 'donor' ? (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Organization/Business Name"
                          value={formData.organization}
                          onChange={handleInputChange('organization')}
                          disabled={!editing}
                          helperText="Optional - leave blank if you're an individual donor"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: editing ? 'rgba(255, 152, 0, 0.04)' : 'rgba(0,0,0,0.02)',
                              '&.Mui-focused fieldset': {
                                borderColor: '#FF9800',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#FF9800'
                            }
                          }}
                        />
                      </Grid>
                    ) : (
                      <>
                        <Grid item xs={12} sm={6}>
                          <FormControl 
                            fullWidth 
                            disabled={!editing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: editing ? 'rgba(255, 152, 0, 0.04)' : 'rgba(0,0,0,0.02)',
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FF9800',
                                  borderWidth: 2
                                }
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FF9800'
                              }
                            }}
                          >
                            <InputLabel>Organization Type</InputLabel>
                            <Select
                              value={formData.organizationType}
                              onChange={handleInputChange('organizationType')}
                              label="Organization Type"
                            >
                              <MenuItem value="charity">Charity</MenuItem>
                              <MenuItem value="shelter">Shelter</MenuItem>
                              <MenuItem value="community">Community Group</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Number of Beneficiaries"
                            type="number"
                            value={formData.beneficiaryCount}
                            onChange={handleInputChange('beneficiaryCount')}
                            disabled={!editing}
                            helperText="Approximate number of people you serve"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: editing ? 'rgba(255, 152, 0, 0.04)' : 'rgba(0,0,0,0.02)',
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FF9800',
                                  borderWidth: 2
                                }
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FF9800'
                              }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Enhanced Account Statistics */}
          <Grid item xs={12}>
            <Slide direction="up" in={animationTrigger} timeout={1600}>
              <Card
                sx={{
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(105, 240, 174, 0.1) 100%)',
                    borderBottom: '1px solid rgba(0, 200, 83, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Dashboard sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Account Statistics
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {[
                      {
                        value: userProfile?.totalDonations || 0,
                        label: userProfile?.role === 'donor' ? 'Donations Made' : 'Claims Made',
                        icon: LocalDining,
                        color: '#667eea',
                        gradient: 'linear-gradient(135deg, #667eea 0%, #9C9EFE 100%)'
                      },
                      {
                        value: userProfile?.successfulDonations || 0,
                        label: 'Completed',
                        icon: EmojiEvents,
                        color: '#00C853',
                        gradient: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)'
                      },
                      {
                        value: userProfile?.rating || '5.0',
                        label: 'Rating',
                        icon: Star,
                        color: '#FF9800',
                        gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
                      },
                      {
                        value: userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).getFullYear() : new Date().getFullYear(),
                        label: 'Member Since',
                        icon: Timeline,
                        color: '#E91E63',
                        gradient: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)'
                      }
                    ].map((stat, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Card
                          sx={{
                            textAlign: 'center',
                            p: 3,
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-4px) scale(1.02)',
                              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                              '& .stat-icon': {
                                transform: 'scale(1.1) rotate(5deg)'
                              }
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: stat.gradient
                            }
                          }}
                        >
                          <Box
                            className="stat-icon"
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              background: stat.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <stat.icon sx={{ fontSize: 28, color: 'white' }} />
                          </Box>
                          
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontWeight: 900,
                              mb: 1,
                              background: stat.gradient,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              fontSize: '2.5rem'
                            }}
                          >
                            {stat.value}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(0,0,0,0.7)',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Enhanced Security Settings */}
          <Grid item xs={12}>
            <Slide direction="up" in={animationTrigger} timeout={1800}>
              <Card
                sx={{
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(244, 143, 177, 0.1) 100%)',
                    borderBottom: '1px solid rgba(233, 30, 99, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Security sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Security Settings
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        onClick={() => setPasswordDialog(true)}
                        startIcon={<Lock />}
                        fullWidth
                        size="large"
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          borderColor: '#E91E63',
                          color: '#E91E63',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: '#C2185B',
                            background: 'rgba(233, 30, 99, 0.04)',
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(233, 30, 99, 0.2)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Change Password
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        fullWidth
                        size="large"
                        onClick={() => toast.info('Notification settings coming soon!')}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          borderColor: '#667eea',
                          color: '#667eea',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            background: 'rgba(102, 126, 234, 0.04)',
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Notification Settings
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Enhanced Save Button */}
          {editing && (
            <Grid item xs={12}>
              <Fade in={editing} timeout={500}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 3, 
                    justifyContent: 'center',
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                    size="large"
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      borderColor: '#f44336',
                      color: '#f44336',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#d32f2f',
                        background: 'rgba(244, 67, 54, 0.04)',
                        borderWidth: 2
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Save />}
                    size="large"
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00B248 0%, #4CAF50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 200, 83, 0.6)'
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Fade>
            </Grid>
          )}
        </Grid>

        {/* Enhanced Change Password Dialog */}
        <Dialog 
          open={passwordDialog} 
          onClose={() => setPasswordDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: '1.8rem',
            textAlign: 'center'
          }}>
            Change Password
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': {
                      borderColor: '#E91E63',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#E91E63'
                  }
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                helperText="Password must be at least 6 characters"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': {
                      borderColor: '#E91E63',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#E91E63'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': {
                      borderColor: '#E91E63',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#E91E63'
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 4, gap: 2 }}>
            <Button 
              onClick={() => setPasswordDialog(false)} 
              disabled={loading}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordUpdate} 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Lock />}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                fontWeight: 600,
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #C2185B 0%, #EC407A 100%)'
                }
              }}
            >
              Update Password
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }
      `}</style>
    </Box>
  );
};

export default Profile;