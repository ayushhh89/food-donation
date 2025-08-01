import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  Fade,
  Slide,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Schedule,
  LocationOn,
  Person,
  TrendingUp,
  CheckCircle,
  Warning,
  Restaurant,
  Star,
  Timeline,
  Analytics,
  EmojiEvents,
  Image as ImageIcon,
  AccessTime,
  Groups,
  Favorite,
  Share,
  VisibilityOff
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

// Remove mock data and mock hooks
const navigate = (path) => {
  window.location.href = path;
};

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setAnimationTrigger(true);
    
    // Load real Firebase data
    const donationsQuery = query(
      collection(db, 'donations'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(donationsQuery, (snapshot) => {
      const donationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date()
      }));
      setDonations(donationsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleMenuOpen = (event, donation) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDonation(donation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDonation(null);
  };

  const handleDelete = async () => {
    if (!selectedDonation) return;

    setDeleting(true);
    try {
      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDonations(prev => prev.filter(d => d.id !== selectedDonation.id));
      setDeleteDialog(false);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting donation:', error);
    } finally {
      setDeleting(false);
    }
  };

  const markAsCompleted = async (donationId) => {
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 500));
      setDonations(prev => prev.map(d => 
        d.id === donationId ? { ...d, status: 'completed' } : d
      ));
      handleMenuClose();
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };

  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const hoursRemaining = (expiry - now) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return { text: 'Expired', urgent: true, expired: true };
    } else if (hoursRemaining < 1) {
      return { text: 'Less than 1 hour', urgent: true };
    } else if (hoursRemaining < 6) {
      return { text: `${Math.round(hoursRemaining)} hours`, urgent: true };
    } else if (hoursRemaining < 24) {
      return { text: `${Math.round(hoursRemaining)} hours`, urgent: false };
    } else {
      const daysRemaining = Math.round(hoursRemaining / 24);
      return { text: `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`, urgent: false };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'claimed': return 'warning';
      case 'completed': return 'primary';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'available': return 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)';
      case 'claimed': return 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)';
      case 'completed': return 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)';
      case 'expired': return 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)';
      default: return 'linear-gradient(135deg, #616161 0%, #9E9E9E 100%)';
    }
  };

  const filterDonations = (status) => {
    switch (status) {
      case 'active':
        return donations.filter(d => d.status === 'available' || d.status === 'claimed');
      case 'completed':
        return donations.filter(d => d.status === 'completed');
      case 'expired':
        return donations.filter(d => {
          if (d.status === 'expired') return true;
          const timeRemaining = getTimeRemaining(d.expiryDate);
          return timeRemaining?.expired;
        });
      default:
        return donations;
    }
  };

  const getTabData = () => {
    const all = donations.length;
    const active = donations.filter(d => d.status === 'available' || d.status === 'claimed').length;
    const completed = donations.filter(d => d.status === 'completed').length;
    const expired = donations.filter(d => {
      if (d.status === 'expired') return true;
      const timeRemaining = getTimeRemaining(d.expiryDate);
      return timeRemaining?.expired;
    }).length;

    return { all, active, completed, expired };
  };

  const tabData = getTabData();
  const filteredDonations = filterDonations(['all', 'active', 'completed', 'expired'][tabValue]);

  const StatCard = ({ icon: Icon, title, value, color, gradient, description }) => (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        border: 'none',
        borderRadius: 4,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${color}30`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
        </Stack>
        
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: '2.2rem',
            mb: 1,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          {value}
        </Typography>
        
        <Typography
          variant="subtitle1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 600,
            fontSize: '1rem',
            mb: 0.5
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.8rem'
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `
          }
        }}
      >
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
            p: 6,
            textAlign: 'center'
          }}
        >
          <CircularProgress 
            size={60} 
            sx={{ 
              color: 'white',
              mb: 3
            }} 
          />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Loading your donations...
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
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
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
              🍽️ My Donations
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
              Manage your food donations and track their impact on the community
            </Typography>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Slide direction="up" in={animationTrigger} timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={Restaurant}
                title="Total Donations"
                value={tabData.all}
                color="#667eea"
                gradient={{ from: '#667eea', to: '#764ba2' }}
                description="Food items shared"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={Schedule}
                title="Active Donations"
                value={tabData.active}
                color="#00C853"
                gradient={{ from: '#00C853', to: '#4CAF50' }}
                description="Currently available"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={CheckCircle}
                title="Completed"
                value={tabData.completed}
                color="#1976D2"
                gradient={{ from: '#1976D2', to: '#2196F3' }}
                description="Successfully shared"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={EmojiEvents}
                title="Impact Score"
                value={tabData.completed * 10}
                color="#FF9800"
                gradient={{ from: '#FF9800', to: '#FFB74D' }}
                description="Community impact points"
              />
            </Grid>
          </Grid>
        </Slide>

        {/* Tabs */}
        <Slide direction="up" in={animationTrigger} timeout={1200}>
          <Card
            sx={{
              mb: 4,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 3,
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                  },
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(90deg, #00C853 0%, #4CAF50 100%)',
                  height: 4,
                  borderRadius: 2,
                },
                '& .MuiTabs-flexContainer': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>All</span>
                    <Badge 
                      badgeContent={tabData.all} 
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600
                        }
                      }}
                    >
                      <Box sx={{ width: 8 }} />
                    </Badge>
                  </Stack>
                } 
              />
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Active</span>
                    <Badge 
                      badgeContent={tabData.active} 
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                          color: 'white',
                          fontWeight: 600
                        }
                      }}
                    >
                      <Box sx={{ width: 8 }} />
                    </Badge>
                  </Stack>
                } 
              />
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Completed</span>
                    <Badge 
                      badgeContent={tabData.completed} 
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                          color: 'white',
                          fontWeight: 600
                        }
                      }}
                    >
                      <Box sx={{ width: 8 }} />
                    </Badge>
                  </Stack>
                } 
              />
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Expired</span>
                    <Badge 
                      badgeContent={tabData.expired} 
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
                          color: 'white',
                          fontWeight: 600
                        }
                      }}
                    >
                      <Box sx={{ width: 8 }} />
                    </Badge>
                  </Stack>
                } 
              />
            </Tabs>
          </Card>
        </Slide>

        {/* Donations Grid */}
        <Slide direction="up" in={animationTrigger} timeout={1400}>
          <Box>
            {filteredDonations.length === 0 ? (
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4,
                  p: 8,
                  textAlign: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    border: '2px dashed rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <Restaurant sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.7)' }} />
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 2 
                  }}
                >
                  {tabValue === 0 ? 'No donations yet' : 'No donations in this category'}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    mb: 4,
                    maxWidth: 500,
                    mx: 'auto'
                  }}
                >
                  {tabValue === 0 
                    ? 'Start sharing your surplus food with the community and make a difference!'
                    : 'Check other tabs to see your donations or create a new one'
                  }
                </Typography>
                
                {tabValue === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/create-donation')}
                    size="large"
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 200, 83, 0.6)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Your First Donation
                  </Button>
                )}
              </Card>
            ) : (
              <Grid container spacing={3}>
                {filteredDonations.map((donation, index) => {
                  const timeRemaining = getTimeRemaining(donation.expiryDate);
                  const interestedCount = donation.interestedReceivers?.length || 0;

                  return (
                    <Grid item xs={12} sm={6} lg={4} key={donation.id}>
                      <Fade in={animationTrigger} timeout={800 + index * 100}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                              '& .donation-image': {
                                transform: 'scale(1.1)',
                              }
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: getStatusGradient(donation.status)
                            }
                          }}
                        >
                          {/* Status badge */}
                          <Chip
                            label={donation.status}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              zIndex: 2,
                              textTransform: 'capitalize',
                              fontWeight: 700,
                              background: getStatusGradient(donation.status),
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              backdropFilter: 'blur(10px)',
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />

                          {/* Menu button */}
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              background: 'rgba(255, 255, 255, 0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              zIndex: 2,
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.3)',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.3s ease'
                            }}
                            onClick={(e) => handleMenuOpen(e, donation)}
                          >
                            <MoreVert sx={{ color: 'white' }} />
                          </IconButton>

                          {/* Image */}
                          {donation.images && donation.images.length > 0 ? (
                            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                              <CardMedia
                                className="donation-image"
                                component="img"
                                height="200"
                                image={donation.images[0]}
                                alt={donation.title}
                                sx={{ 
                                  objectFit: 'cover',
                                  transition: 'transform 0.4s ease'
                                }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '50%',
                                  background: 'linear-gradient(transparent, rgba(0,0,0,0.3))'
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                                border: '2px dashed rgba(255, 255, 255, 0.3)'
                              }}
                            >
                              <Stack alignItems="center" spacing={2}>
                                <ImageIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.5)' }} />
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                                  No image
                                </Typography>
                              </Stack>
                            </Box>
                          )}

                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                            {/* Title */}
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              sx={{ 
                                color: 'white',
                                fontWeight: 700,
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {donation.title}
                            </Typography>

                            {/* Category and quantity */}
                            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                              <Chip 
                                label={donation.category} 
                                size="small" 
                                sx={{
                                  background: 'rgba(102, 126, 234, 0.2)',
                                  color: 'white',
                                  border: '1px solid rgba(102, 126, 234, 0.5)',
                                  fontWeight: 600
                                }}
                              />
                              <Chip 
                                label={`${donation.quantity} ${donation.unit}`} 
                                size="small" 
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  fontWeight: 600
                                }}
                              />
                            </Stack>

                            {/* Location */}
                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                              <LocationOn sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.8)' }} />
                              <Typography 
                                variant="body2" 
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1
                                }}
                              >
                                {donation.pickupLocation?.length > 30 
                                  ? `${donation.pickupLocation.substring(0, 30)}...` 
                                  : donation.pickupLocation || 'Location not specified'
                                }
                              </Typography>
                            </Stack>

                            {/* Time remaining */}
                            {timeRemaining && (
                              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                <AccessTime 
                                  sx={{ 
                                    fontSize: 18, 
                                    color: timeRemaining.urgent ? '#FF5722' : 'rgba(255, 255, 255, 0.8)' 
                                  }} 
                                />
                                <Typography 
                                  variant="body2" 
                                  sx={{
                                    color: timeRemaining.urgent ? '#FF5722' : 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: timeRemaining.urgent ? 700 : 500
                                  }}
                                >
                                  {timeRemaining.text} remaining
                                </Typography>
                              </Stack>
                            )}

                            {/* Interested users */}
                            {interestedCount > 0 && (
                              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Groups sx={{ fontSize: 18, color: '#00C853' }} />
                                <Typography variant="body2" sx={{ color: '#00C853', fontWeight: 600 }}>
                                  {interestedCount} interested receiver{interestedCount > 1 ? 's' : ''}
                                </Typography>
                              </Stack>
                            )}

                            <Divider sx={{ background: 'rgba(255, 255, 255, 0.2)', my: 2 }} />

                            {/* Posted date */}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                mb: 2,
                                fontWeight: 500
                              }}
                            >
                              Posted {donation.createdAt.toLocaleDateString()}
                            </Typography>

                            {/* Actions */}
                            <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => navigate(`/donation/${donation.id}`)}
                                sx={{
                                  flex: 1,
                                  borderRadius: 2,
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  color: 'white',
                                  fontWeight: 600,
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.5)',
                                    transform: 'translateY(-1px)',
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                View
                              </Button>
                              {donation.status === 'available' && (
                                <Button
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => navigate(`/edit-donation/${donation.id}`)}
                                  sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  Edit
                                </Button>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Slide>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              mt: 1,
              '& .MuiMenuItem-root': {
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
                '&:last-child': {
                  mb: 1,
                }
              }
            }
          }}
        >
          <MenuItem onClick={() => {
            navigate(`/donation/${selectedDonation?.id}`);
            handleMenuClose();
          }}>
            <Visibility sx={{ mr: 2 }} />
            View Details
          </MenuItem>
          
          {selectedDonation?.status === 'available' && (
            <MenuItem onClick={() => {
              navigate(`/edit-donation/${selectedDonation?.id}`);
              handleMenuClose();
            }}>
              <Edit sx={{ mr: 2 }} />
              Edit Donation
            </MenuItem>
          )}

          {selectedDonation?.status === 'claimed' && (
            <MenuItem onClick={() => markAsCompleted(selectedDonation?.id)}>
              <CheckCircle sx={{ mr: 2 }} />
              Mark as Completed
            </MenuItem>
          )}

          {(selectedDonation?.status === 'available' || selectedDonation?.status === 'expired') && (
            <MenuItem 
              onClick={() => {
                setDeleteDialog(true);
              }}
              sx={{ 
                color: '#FF5722 !important',
                '&:hover': {
                  background: 'rgba(255, 87, 34, 0.1) !important',
                }
              }}
            >
              <Delete sx={{ mr: 2 }} />
              Delete Donation
            </MenuItem>
          )}
        </Menu>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              color: 'white'
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            fontSize: '1.5rem',
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            pb: 2
          }}>
            🗑️ Delete Donation
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
              Are you sure you want to delete "{selectedDonation?.title}"? This action cannot be undone.
            </Typography>
            {selectedDonation?.interestedReceivers?.length > 0 && (
              <Alert 
                severity="warning" 
                sx={{ 
                  background: 'rgba(255, 193, 7, 0.15)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  color: 'white',
                  borderRadius: 3,
                  '& .MuiAlert-icon': {
                    color: '#FFC107'
                  }
                }}
              >
                ⚠️ {selectedDonation.interestedReceivers.length} user(s) have shown interest in this donation.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setDeleteDialog(false)}
              sx={{
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Delete />}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #C62828 0%, #E53935 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fade in={animationTrigger} timeout={1600}>
          <Fab
            color="primary"
            aria-label="add donation"
            onClick={() => navigate('/create-donation')}
            sx={{ 
              position: 'fixed', 
              bottom: 32, 
              right: 32,
              background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
              width: 64,
              height: 64,
              boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 40px rgba(0, 200, 83, 0.6)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Add sx={{ fontSize: 32 }} />
          </Fab>
        </Fade>
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

export default MyDonations;