// src/pages/DonationDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Stack,
  Badge,
  Fade,
  Slide
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Schedule,
  Person,
  Phone,
  Email,
  Favorite,
  FavoriteBorder,
  Share,
  DirectionsWalk,
  Restaurant,
  Warning,
  CheckCircle,
  Edit,
  Delete,
  MoreVert,
  AccessTime,
  Groups,
  Verified,
  Star,
  TrendingUp,
  LocalDining,
  SafetyCheck,
  Map
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import { Chat, ChatBubble } from '@mui/icons-material';
import { useChatActions } from '../hooks/useChat';


const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [contactDialog, setContactDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const { startConversation } = useChatActions();
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  // ADD THIS NEW useEffect - Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  useEffect(() => {
    if (!id) return;

    // Fetch donation details
    const donationRef = doc(db, 'donations', id);
    const unsubscribe = onSnapshot(donationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          expiryDate: docSnap.data().expiryDate?.toDate() || new Date()
        };
        setDonation(data);

        // Fetch interested users' details
        if (data.interestedReceivers && data.interestedReceivers.length > 0) {
          fetchInterestedUsers(data.interestedReceivers);
        }
      } else {
        toast.error('Donation not found');
        navigate('/');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id, navigate]);

  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userProfile?.role !== 'receiver') {
      toast.error('Only food receivers can start chats with donors');
      return;
    }

    if (!isInterested) {
      toast.error('Please show interest in this donation first to start chatting');
      return;
    }

    setStartingChat(true);
    try {
      const conversationId = await startConversation(
        donation.id,
        donation.donorId,
        currentUser.uid,
        donation.title
      );

      // Open chat in a new window or navigate to chat
      window.open(`/chat/${conversationId}`, '_blank', 'width=800,height=600');

      // Alternative: Navigate to full chat interface
      // navigate(`/chat/${conversationId}`);

      toast.success('Chat started! You can now message the donor.');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setStartingChat(false);
    }
  };



  const fetchInterestedUsers = async (userIds) => {
    try {
      const users = await Promise.all(
        userIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
        })
      );
      setInterestedUsers(users.filter(user => user !== null));
    } catch (error) {
      console.error('Error fetching interested users:', error);
    }
  };

  const handleShowInterest = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userProfile?.role !== 'receiver') {
      toast.error('Only food receivers can show interest in donations');
      return;
    }

    setClaiming(true);
    try {
      const donationRef = doc(db, 'donations', donation.id);
      const isInterested = donation.interestedReceivers?.includes(currentUser.uid);

      if (isInterested) {
        // Remove interest
        await updateDoc(donationRef, {
          interestedReceivers: arrayRemove(currentUser.uid)
        });
        toast.success('Interest removed');
      } else {
        // Add interest
        await updateDoc(donationRef, {
          interestedReceivers: arrayUnion(currentUser.uid)
        });
        toast.success('Interest registered! The donor will be notified.');
      }
    } catch (error) {
      console.error('Error updating interest:', error);
      toast.error('Error updating interest');
    } finally {
      setClaiming(false);
    }
  };

  const handleContactDonor = () => {
    setContactDialog(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: donation.title,
          text: `Check out this food donation: ${donation.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        setShareDialog(true);
      }
    } else {
      setShareDialog(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShareDialog(false);
  };

  const getTimeRemaining = () => {
    if (!donation?.expiryDate) return null;

    const now = new Date();
    const expiry = donation.expiryDate;
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

  const isOwner = donation?.donorId === currentUser?.uid;
  const isInterested = donation?.interestedReceivers?.includes(currentUser?.uid);
  const canShowInterest = userProfile?.role === 'receiver' && !isOwner && donation?.status === 'available';
  const timeRemaining = getTimeRemaining();

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
            Loading donation details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!donation) {
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
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Donation Not Found
            </Typography>
            <Typography variant="body2">
              This donation may have been removed or the link is invalid.
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
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                mb: 3,
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(-4px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back
            </Button>

            {/* Title Section */}
            <Card
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 2,
                      fontSize: { xs: '2rem', md: '3rem' }
                    }}
                  >
                    {donation.title}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <Chip
                      label={donation.status}
                      color={donation.status === 'available' ? 'success' : 'warning'}
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                    <Chip
                      label={donation.category}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                    {donation.isVegetarian && (
                      <Chip
                        label="🌱 Vegetarian"
                        sx={{
                          background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                    {donation.isVegan && (
                      <Chip
                        label="🌿 Vegan"
                        sx={{
                          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                    {donation.isHalal && (
                      <Chip
                        label="☪️ Halal"
                        sx={{
                          background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.7)', fontSize: '1.1rem' }}>
                    Posted {formatDistanceToNow(donation.createdAt)} ago
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Share />
                  </IconButton>
                  {isOwner && (
                    <>
                      <IconButton
                        onClick={() => navigate(`/edit-donation/${donation.id}`)}
                        sx={{
                          background: 'rgba(255, 152, 0, 0.1)',
                          color: '#FF9800',
                          '&:hover': {
                            background: 'rgba(255, 152, 0, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        sx={{
                          background: 'rgba(244, 67, 54, 0.1)',
                          color: '#f44336',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </Box>
            </Card>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {/* Left Column - Enhanced Images and Description */}
          <Grid item xs={12} lg={8}>
            <Slide direction="right" in={animationTrigger} timeout={1000}>
              <Box>
                {/* Enhanced Image Gallery */}
                {donation.images && donation.images.length > 0 && (
                  <Card sx={{
                    mb: 4,
                    overflow: 'hidden',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                  }}>
                    <CardMedia
                      component="img"
                      height="500"
                      image={donation.images[0]}
                      alt={donation.title}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    />
                    {donation.images.length > 1 && (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          More Photos
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                          {donation.images.slice(1).map((image, index) => (
                            <Box
                              key={index}
                              sx={{
                                minWidth: 120,
                                height: 120,
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  borderColor: '#667eea'
                                },
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                src={image}
                                alt={`${donation.title} ${index + 2}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Card>
                )}

                {/* Enhanced Description Card */}
                <Card sx={{
                  p: 4,
                  mb: 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                      <Restaurant sx={{ color: 'white', fontSize: 24 }} />
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
                      About This Donation
                    </Typography>
                  </Box>

                  <Typography
                    variant="h6"
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      color: 'rgba(0,0,0,0.8)',
                      fontSize: '1.1rem',
                      mb: 4
                    }}
                  >
                    {donation.description}
                  </Typography>

                  {/* Enhanced Details Grid */}
                  <Grid container spacing={3}>
                    {donation.quantity && (
                      <Grid item xs={6} md={4}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(102, 126, 234, 0.08)',
                          border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: '#667eea', fontWeight: 600, mb: 1 }}
                          >
                            Quantity
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {donation.quantity} {donation.unit}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {donation.servingSize && (
                      <Grid item xs={6} md={4}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(0, 200, 83, 0.08)',
                          border: '1px solid rgba(0, 200, 83, 0.2)'
                        }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: '#00C853', fontWeight: 600, mb: 1 }}
                          >
                            Serving Size
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {donation.servingSize}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12} md={4}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 3,
                        background: timeRemaining?.urgent ? 'rgba(244, 67, 54, 0.08)' : 'rgba(255, 152, 0, 0.08)',
                        border: `1px solid ${timeRemaining?.urgent ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 152, 0, 0.2)'}`
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: timeRemaining?.urgent ? '#f44336' : '#FF9800',
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          Best Before
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: timeRemaining?.urgent ? '#f44336' : 'rgba(0,0,0,0.8)'
                          }}
                        >
                          {format(donation.expiryDate, 'MMM d, yyyy HH:mm')}
                          {timeRemaining && (
                            <Box component="span" sx={{ display: 'block', fontSize: '0.9em', mt: 0.5 }}>
                              ⏰ {timeRemaining.text} remaining
                            </Box>
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                {/* Enhanced Allergen Information */}
                {donation.allergens && donation.allergens.length > 0 && (
                  <Card sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '2px solid rgba(255, 193, 7, 0.3)',
                    boxShadow: '0 8px 32px rgba(255, 193, 7, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Warning sx={{ color: '#FFC107', fontSize: 28 }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: '#F57C00' }}
                      >
                        ⚠️ Allergen Information
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0,0,0,0.7)' }}>
                      This donation contains the following allergens:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {donation.allergens.map(allergen => (
                        <Chip
                          key={allergen}
                          label={allergen}
                          sx={{
                            background: 'linear-gradient(135deg, #f44336 0%, #E57373 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 2 }
                          }}
                        />
                      ))}
                    </Stack>
                  </Card>
                )}

                {/* Enhanced Pickup Instructions */}
                {donation.pickupInstructions && (
                  <Card sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                        <LocalDining sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        Pickup Instructions
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(0,0,0,0.8)',
                        lineHeight: 1.7,
                        fontSize: '1.1rem'
                      }}
                    >
                      {donation.pickupInstructions}
                    </Typography>
                  </Card>
                )}
              </Box>
            </Slide>
          </Grid>

          {/* Right Column - Enhanced Sidebar */}
          <Grid item xs={12} lg={4}>
            <Slide direction="left" in={animationTrigger} timeout={1200}>
              <Box>
                {/* Enhanced Time Warning */}
                {timeRemaining?.urgent && (
                  <Card sx={{
                    p: 3,
                    mb: 3,
                    background: timeRemaining.expired
                      ? 'linear-gradient(135deg, #f44336 0%, #E57373 100%)'
                      : 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    color: 'white',
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(244, 67, 54, 0.3)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <AccessTime sx={{ fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {timeRemaining.expired ? "⚠️ Expired" : "⏰ Expires Soon!"}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {timeRemaining.text} {timeRemaining.expired ? "" : "remaining"}
                    </Typography>
                  </Card>
                )}

                {/* Enhanced Action Buttons */}
                {canShowInterest && (
                  <Card sx={{
                    p: 4,
                    mb: 3,
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          mb: 2
                        }}
                      >
                        Interested in this donation?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                        Show your interest to connect with the donor
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleShowInterest}
                      disabled={claiming}
                      startIcon={
                        claiming ? (
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : isInterested ? (
                          <CheckCircle />
                        ) : (
                          <Favorite />
                        )
                      }
                      sx={{
                        mb: 2,
                        py: 2,
                        borderRadius: 3,
                        background: isInterested
                          ? 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          background: isInterested
                            ? 'linear-gradient(135deg, #00B248 0%, #4CAF50 100%)'
                            : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)'
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {claiming ? 'Processing...' : (isInterested ? 'Already Interested ✓' : 'Show Interest')}
                    </Button>

                    {/* Chat Button - Only show if interested */}
                    {isInterested && (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={startingChat ? <CircularProgress size={20} /> : <Chat />}
                        onClick={handleStartChat}
                        disabled={startingChat}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          borderColor: '#667eea',
                          color: '#667eea',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            background: 'rgba(102, 126, 234, 0.04)',
                            borderWidth: 2,
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {startingChat ? 'Starting Chat...' : 'Chat with Donor'}
                      </Button>
                    )}

                    {/* Contact info - Only show if interested and has contact */}
                    {isInterested && donation.donorContact && (
                      <Button
                        variant="text"
                        fullWidth
                        startIcon={<Phone />}
                        onClick={handleContactDonor}
                        sx={{
                          mt: 1,
                          py: 1.5,
                          borderRadius: 3,
                          color: '#667eea',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.04)'
                          }
                        }}
                      >
                        View Contact Info
                      </Button>
                    )}
                  </Card>
                )}

                {/* Enhanced Donor Information */}

                {isOwner && donation.interestedReceivers && donation.interestedReceivers.length > 0 && (
                  <Card sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ChatBubble sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        Interested Receivers
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)', mb: 3 }}>
                      {donation.interestedReceivers.length} receiver(s) are interested in this donation.
                      You can chat with them to coordinate pickup.
                    </Typography>

                    <List dense>
                      {interestedUsers.map((user) => (
                        <ListItem
                          key={user.id}
                          sx={{
                            px: 0,
                            py: 1,
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 2,
                            mb: 1,
                            background: 'rgba(33, 150, 243, 0.04)'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 700
                              }}
                            >
                              {user.name?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {user.name}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                {user.organizationType || 'Individual Receiver'}
                              </Typography>
                            }
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Chat />}
                            onClick={async () => {
                              setStartingChat(true);
                              try {
                                const conversationId = await startConversation(
                                  donation.id,
                                  donation.donorId,
                                  user.id,
                                  donation.title
                                );
                                window.open(`/chat/${conversationId}`, '_blank', 'width=800,height=600');
                              } catch (error) {
                                toast.error('Failed to start chat');
                              } finally {
                                setStartingChat(false);
                              }
                            }}
                            sx={{
                              borderColor: '#2196F3',
                              color: '#2196F3',
                              '&:hover': {
                                borderColor: '#1976D2',
                                background: 'rgba(33, 150, 243, 0.04)'
                              }
                            }}
                          >
                            Chat
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                )}
                <Card sx={{
                  p: 4,
                  mb: 3,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                      <Person sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Donor Information
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}
                    >
                      {donation.donorName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {donation.donorName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', mb: 0.5 }}>
                        {donation.organization || 'Individual Donor'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Verified sx={{ color: '#00C853', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: '#00C853', fontWeight: 600 }}>
                          Verified Member
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(102, 126, 234, 0.08)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    mb: 2
                  }}>
                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                      📅 Member since {format(donation.createdAt, 'MMM yyyy')}
                    </Typography>
                  </Box>

                  {/* Enhanced Contact info */}
                  {isInterested && donation.donorContact && (
                    <Box sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(105, 240, 174, 0.1) 100%)',
                      borderRadius: 3,
                      border: '1px solid rgba(0, 200, 83, 0.2)'
                    }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#00C853', fontWeight: 700, mb: 2 }}
                      >
                        🔐 Contact Information
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                        📞 {donation.donorContact}
                      </Typography>
                      {donation.donorEmail && (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ✉️ {donation.donorEmail}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Card>

                {/* Enhanced Pickup Location */}
                <Card sx={{
                  p: 4,
                  mb: 3,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                      <LocationOn sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Pickup Location
                    </Typography>
                  </Box>

                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(233, 30, 99, 0.08)',
                    border: '1px solid rgba(233, 30, 99, 0.2)',
                    mb: 3
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.6 }}>
                      📍 {donation.pickupAddress}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Map />}
                    onClick={() => window.open(`https://www.google.com/maps/search/${donation.pickupAddress}`, '_blank')}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(233, 30, 99, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #C2185B 0%, #EC407A 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(233, 30, 99, 0.6)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Get Directions
                  </Button>
                </Card>

                {/* Enhanced Interest Stats */}
                {donation.interestedReceivers && donation.interestedReceivers.length > 0 && (
                  <Card sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Badge
                        badgeContent={donation.interestedReceivers.length}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 700
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Groups sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                      </Badge>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        Community Interest
                      </Typography>
                    </Box>

                    {isOwner ? (
                      <List dense>
                        {interestedUsers.map((user) => (
                          <ListItem key={user.id} sx={{ px: 0, py: 1 }}>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  fontWeight: 700
                                }}
                              >
                                {user.name?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {user.name}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                  {user.organizationType || 'Individual Receiver'}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'rgba(33, 150, 243, 0.08)',
                        border: '1px solid rgba(33, 150, 243, 0.2)',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>
                          {donation.interestedReceivers.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                          receiver{donation.interestedReceivers.length > 1 ? 's' : ''} interested
                        </Typography>
                      </Box>
                    )}
                  </Card>
                )}
              </Box>
            </Slide>
          </Grid>
        </Grid>

        {/* Enhanced Contact Dialog */}
        <Dialog
          open={contactDialog}
          onClose={() => setContactDialog(false)}
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
            Contact Donor
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)', mb: 3 }}>
              Send a message to the donor about this donation
            </Typography>

            <TextField
              autoFocus
              margin="dense"
              label="Message"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in your donation..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
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

            <Box sx={{
              mt: 3,
              p: 3,
              background: 'rgba(102, 126, 234, 0.08)',
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#667eea' }}>
                Donor Contact Information:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                📞 {donation.donorContact}
              </Typography>
              {donation.donorEmail && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ✉️ {donation.donorEmail}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setContactDialog(false)}
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => window.open(`tel:${donation.donorContact}`, '_blank')}
              variant="contained"
              startIcon={<Phone />}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Call Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Share Dialog */}
        <Dialog
          open={shareDialog}
          onClose={() => setShareDialog(false)}
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
            Share Donation
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)', mb: 3 }}>
              Share this donation with others to help spread the word
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              value={window.location.href}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShareDialog(false)}
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="contained"
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Copy Link
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

export default DonationDetails;