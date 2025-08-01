// src/pages/MyClaims.js
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Stack,
  Badge,
  Fade,
  Slide,
  TextField
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Cancel,
  CheckCircle,
  Schedule,
  LocationOn,
  Person,
  Restaurant,
  Phone,
  DirectionsWalk,
  Star,
  RateReview,
  AccessTime,
  LocalDining,
  TrendingUp,
  Verified,
  Map,
  ContactPhone,
  Assignment,
  Search,
  FilterList
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

const MyClaims = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [animationTrigger, setAnimationTrigger] = useState(false);

  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch donations where user has shown interest
    const claimsQuery = query(
      collection(db, 'donations'),
      where('interestedReceivers', 'array-contains', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(claimsQuery, (snapshot) => {
      const claimsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date()
      }));
      setClaims(claimsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleMenuOpen = (event, claim) => {
    setMenuAnchor(event.currentTarget);
    setSelectedClaim(claim);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedClaim(null);
  };

  const handleCancelClaim = async () => {
    if (!selectedClaim) return;

    setCancelling(true);
    try {
      const donationRef = doc(db, 'donations', selectedClaim.id);
      await updateDoc(donationRef, {
        interestedReceivers: arrayRemove(currentUser.uid)
      });
      
      toast.success('Interest cancelled successfully');
      setCancelDialog(false);
      handleMenuClose();
    } catch (error) {
      console.error('Error cancelling claim:', error);
      toast.error('Error cancelling interest');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedClaim) return;

    try {
      await addDoc(collection(db, 'reviews'), {
        donationId: selectedClaim.id,
        donorId: selectedClaim.donorId,
        receiverId: currentUser.uid,
        rating: review.rating,
        comment: review.comment,
        createdAt: serverTimestamp()
      });

      toast.success('Review submitted successfully!');
      setReviewDialog(false);
      setReview({ rating: 5, comment: '' });
      handleMenuClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    }
  };

  const getStatusInfo = (donation) => {
    // Add null check to prevent the error
    if (!donation || !donation.expiryDate) {
      return { status: 'unknown', color: 'default', text: 'Unknown' };
    }

    const now = new Date();
    const expiry = donation.expiryDate;
    const hoursRemaining = (expiry - now) / (1000 * 60 * 60);
    
    if (donation.status === 'completed') {
      return { status: 'completed', color: 'success', text: 'Completed' };
    } else if (donation.status === 'claimed' && donation.claimedBy === currentUser.uid) {
      return { status: 'claimed', color: 'warning', text: 'Claimed by You' };
    } else if (donation.status === 'claimed') {
      return { status: 'claimed_other', color: 'error', text: 'Claimed by Others' };
    } else if (hoursRemaining < 0) {
      return { status: 'expired', color: 'error', text: 'Expired' };
    } else {
      return { status: 'active', color: 'primary', text: 'Available' };
    }
  };

  const filterClaims = (status) => {
    switch (status) {
      case 'active':
        return claims.filter(c => {
          const statusInfo = getStatusInfo(c);
          return statusInfo.status === 'active';
        });
      case 'claimed':
        return claims.filter(c => {
          const statusInfo = getStatusInfo(c);
          return statusInfo.status === 'claimed';
        });
      case 'completed':
        return claims.filter(c => c.status === 'completed');
      case 'other':
        return claims.filter(c => {
          const statusInfo = getStatusInfo(c);
          return statusInfo.status === 'claimed_other' || statusInfo.status === 'expired';
        });
      default:
        return claims;
    }
  };

  const getTabData = () => {
    const all = claims.length;
    const active = claims.filter(c => getStatusInfo(c).status === 'active').length;
    const claimed = claims.filter(c => getStatusInfo(c).status === 'claimed').length;
    const completed = claims.filter(c => c.status === 'completed').length;
    const other = claims.filter(c => {
      const status = getStatusInfo(c).status;
      return status === 'claimed_other' || status === 'expired';
    }).length;

    return { all, active, claimed, completed, other };
  };

  const tabData = getTabData();
  const filteredClaims = filterClaims(['all', 'active', 'claimed', 'completed', 'other'][tabValue]);

  if (userProfile?.role !== 'receiver') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Card
          sx={{
            p: 4,
            maxWidth: 500,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            textAlign: 'center'
          }}
        >
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Access Restricted
            </Typography>
            <Typography variant="body2">
              This page is only available for food receivers.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 3 }}
          >
            Go Home
          </Button>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={80} 
            sx={{ 
              color: 'white',
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }} 
          />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Loading your claims...
          </Typography>
        </Box>
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
        {/* Enhanced Header */}
        <Fade in={animationTrigger} timeout={800}>
          <Card
            sx={{
              p: 6,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
                }}
              >
                <LocalDining sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                My Claims
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(0,0,0,0.7)',
                  fontSize: '1.2rem',
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Track your food requests and pickup status
              </Typography>
            </Box>
          </Card>
        </Fade>

        {/* Enhanced Stats Cards */}
        <Slide direction="up" in={animationTrigger} timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                title: 'Total Claims', 
                value: tabData.all, 
                icon: Restaurant, 
                color: '#667eea',
                gradient: 'linear-gradient(135deg, #667eea 0%, #9C9EFE 100%)'
              },
              { 
                title: 'Available', 
                value: tabData.active, 
                icon: Schedule, 
                color: '#00C853',
                gradient: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)'
              },
              { 
                title: 'Claimed', 
                value: tabData.claimed, 
                icon: CheckCircle, 
                color: '#FF9800',
                gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
              },
              { 
                title: 'Completed', 
                value: tabData.completed, 
                icon: Star, 
                color: '#E91E63',
                gradient: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
                      '& .stat-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: stat.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: `0 12px 30px ${stat.color}40`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <stat.icon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: 1,
                      background: stat.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {stat.value}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(0,0,0,0.7)', 
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    {stat.title}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Slide>

        {/* Enhanced Tabs */}
        <Slide direction="up" in={animationTrigger} timeout={1200}>
          <Card
            sx={{
              mb: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 3,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    color: '#667eea'
                  }
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  height: 4,
                  borderRadius: 2
                }
              }}
            >
              <Tab label={`All (${tabData.all})`} />
              <Tab label={`Available (${tabData.active})`} />
              <Tab label={`Claimed (${tabData.claimed})`} />
              <Tab label={`Completed (${tabData.completed})`} />
              <Tab label={`Other (${tabData.other})`} />
            </Tabs>
          </Card>
        </Slide>

        {/* Enhanced Claims Grid */}
        <Fade in={animationTrigger} timeout={1400}>
          <Box>
            {filteredClaims.length === 0 ? (
              <Card
                sx={{
                  p: 8,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4
                  }}
                >
                  <Restaurant sx={{ fontSize: 60, color: 'rgba(102, 126, 234, 0.5)' }} />
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {tabValue === 0 ? 'No claims yet' : 'No claims in this category'}
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.7)', mb: 4, fontSize: '1.1rem' }}>
                  {tabValue === 0 
                    ? 'Start exploring available food donations!'
                    : 'Check other tabs to see your claims'
                  }
                </Typography>
                
                {tabValue === 0 && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Restaurant />}
                    onClick={() => navigate('/browse')}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Browse Donations
                  </Button>
                )}
              </Card>
            ) : (
              <Grid container spacing={4}>
                {filteredClaims.map((claim, index) => {
                  const statusInfo = getStatusInfo(claim);
                  const timeRemaining = claim.expiryDate && claim.expiryDate > new Date() 
                    ? formatDistanceToNow(claim.expiryDate, { addSuffix: true })
                    : 'Expired';

                  return (
                    <Grid item xs={12} sm={6} lg={4} key={claim.id}>
                      <Slide direction="up" in={animationTrigger} timeout={1400 + (index * 100)}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 4,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: '0 25px 80px rgba(0,0,0,0.15)'
                            },
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {/* Enhanced Status Badge */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              zIndex: 2
                            }}
                          >
                            <Chip
                              label={statusInfo.text}
                              sx={{
                                background: statusInfo.color === 'success' 
                                  ? 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)'
                                  : statusInfo.color === 'warning'
                                  ? 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
                                  : statusInfo.color === 'error'
                                  ? 'linear-gradient(135deg, #f44336 0%, #E57373 100%)'
                                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                              }}
                            />
                          </Box>

                          {/* Enhanced Menu Button */}
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              background: 'rgba(255,255,255,0.9)',
                              backdropFilter: 'blur(10px)',
                              zIndex: 2,
                              '&:hover': {
                                background: 'rgba(255,255,255,1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                            onClick={(e) => handleMenuOpen(e, claim)}
                          >
                            <MoreVert />
                          </IconButton>

                          {/* Enhanced Image */}
                          {claim.images && claim.images.length > 0 ? (
                            <CardMedia
                              component="img"
                              height="220"
                              image={claim.images[0]}
                              alt={claim.title}
                              sx={{ 
                                objectFit: 'cover',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                },
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 220,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                              }}
                            >
                              <Restaurant sx={{ fontSize: 60, color: 'rgba(102, 126, 234, 0.5)' }} />
                            </Box>
                          )}

                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                            {/* Enhanced Title */}
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 700, 
                                mb: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                lineHeight: 1.3
                              }}
                            >
                              {claim.title}
                            </Typography>

                            {/* Enhanced Category and Quantity */}
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                              <Chip 
                                label={claim.category} 
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                              {claim.servingSize && (
                                <Chip 
                                  label={claim.servingSize} 
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Stack>

                            {/* Enhanced Info Grid */}
                            <Stack spacing={2} sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ fontSize: 18, color: '#667eea' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>
                                  {claim.donorName}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ fontSize: 18, color: '#E91E63' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                                  {claim.pickupAddress?.length > 35 
                                    ? `${claim.pickupAddress.substring(0, 35)}...` 
                                    : claim.pickupAddress
                                  }
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime sx={{ fontSize: 18, color: '#FF9800' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                                  Expires {timeRemaining}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Enhanced Contact info for claimed items */}
                            {statusInfo.status === 'claimed' && claim.donorContact && (
                              <Box sx={{ 
                                mb: 2, 
                                p: 2, 
                                borderRadius: 2, 
                                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(3, 218, 198, 0.1) 100%)',
                                border: '1px solid rgba(33, 150, 243, 0.2)'
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2196F3' }}>
                                  📞 {claim.donorContact}
                                </Typography>
                              </Box>
                            )}

                            {/* Enhanced Pickup instructions */}
                            {claim.pickupInstructions && statusInfo.status === 'claimed' && (
                              <Box sx={{ 
                                mb: 2, 
                                p: 2, 
                                borderRadius: 2, 
                                background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(105, 240, 174, 0.1) 100%)',
                                border: '1px solid rgba(0, 200, 83, 0.2)'
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#00C853' }}>
                                  📝 {claim.pickupInstructions}
                                </Typography>
                              </Box>
                            )}

                            {/* Interest date */}
                            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', mt: 'auto', mb: 2 }}>
                              Interested {formatDistanceToNow(claim.createdAt, { addSuffix: true })}
                            </Typography>

                            {/* Enhanced Actions */}
                            <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => navigate(`/donation/${claim.id}`)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  '&:hover': {
                                    background: 'rgba(102, 126, 234, 0.08)'
                                  }
                                }}
                              >
                                View
                              </Button>
                              {statusInfo.status === 'claimed' && (
                                <Button
                                  size="small"
                                  startIcon={<Map />}
                                  variant="outlined"
                                  onClick={() => window.open(`https://www.google.com/maps/search/${claim.pickupAddress}`, '_blank')}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: '#00C853',
                                    color: '#00C853',
                                    '&:hover': {
                                      borderColor: '#00B248',
                                      background: 'rgba(0, 200, 83, 0.08)'
                                    }
                                  }}
                                >
                                  Directions
                                </Button>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Slide>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Fade>

        {/* Enhanced Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              minWidth: 200
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              navigate(`/donation/${selectedClaim?.id}`);
              handleMenuClose();
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Visibility sx={{ mr: 2, color: '#667eea' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              View Details
            </Typography>
          </MenuItem>
          
          {getStatusInfo(selectedClaim).status === 'claimed' && (
            <MenuItem 
              onClick={() => {
                window.open(`tel:${selectedClaim?.donorContact}`, '_blank');
                handleMenuClose();
              }}
              sx={{ py: 1.5, px: 2 }}
            >
              <ContactPhone sx={{ mr: 2, color: '#00C853' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Call Donor
              </Typography>
            </MenuItem>
          )}

          {selectedClaim?.status === 'completed' && (
            <MenuItem 
              onClick={() => {
                setReviewDialog(true);
                handleMenuClose();
              }}
              sx={{ py: 1.5, px: 2 }}
            >
              <RateReview sx={{ mr: 2, color: '#FF9800' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Leave Review
              </Typography>
            </MenuItem>
          )}

          {(getStatusInfo(selectedClaim).status === 'active' || getStatusInfo(selectedClaim).status === 'claimed') && (
            <MenuItem 
              onClick={() => {
                setCancelDialog(true);
              }}
              sx={{ py: 1.5, px: 2, color: '#f44336' }}
            >
              <Cancel sx={{ mr: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Cancel Interest
              </Typography>
            </MenuItem>
          )}
        </Menu>

        {/* Enhanced Cancel Dialog */}
        <Dialog
          open={cancelDialog}
          onClose={() => setCancelDialog(false)}
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
            background: 'linear-gradient(135deg, #f44336 0%, #E57373 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            Cancel Interest
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
              Are you sure you want to cancel your interest in "{selectedClaim?.title}"?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setCancelDialog(false)}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              Keep Interest
            </Button>
            <Button
              onClick={handleCancelClaim}
              variant="contained"
              disabled={cancelling}
              startIcon={cancelling ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Cancel />}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f44336 0%, #E57373 100%)',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #EF5350 100%)'
                }
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Interest'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Review Dialog */}
        <Dialog
          open={reviewDialog}
          onClose={() => setReviewDialog(false)}
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            Leave a Review
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)', mb: 3 }}>
              Share your experience with this donation
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Rating:</Typography>
              <Stack direction="row" spacing={0.5}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                    sx={{
                      color: star <= review.rating ? '#FFD700' : 'rgba(0,0,0,0.3)',
                      '&:hover': {
                        transform: 'scale(1.2)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Star />
                  </IconButton>
                ))}
              </Stack>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your review here..."
              value={review.comment}
              onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: 2
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setReviewDialog(false)}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              startIcon={<RateReview />}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Submit Review
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

export default MyClaims;