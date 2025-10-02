// src/pages/dashboard/VolunteerDashboard.js - COMPLETE ENHANCED VERSION
import React, { useEffect, useState } from 'react';
// At the top of src/pages/dashboard/VolunteerDashboard.js
// REPLACE the entire import section with this:
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Fade,
  Slide,
  Zoom,
  Grow  // <-- ADD THIS
} from '@mui/material';
import {
  VolunteerActivism,
  LocalShipping,
  EmojiEvents,
  TrendingUp,
  Restaurant,
  LocationOn,
  Schedule,
  CheckCircle,
  Star,
  Timeline,
  DirectionsBike,
  Speed,
  AccountBalance,
  Assignment,
  PlayArrow,
  Done,
  Cancel,
  Info,
  Map,
  Phone,
  Navigation,
  AccessTime,
  FlashOn,
  Verified,
  CardGiftcard
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { createTestRideForVolunteer } from '../../../src/utils/createTestRides';
import { getDocs } from 'firebase/firestore'; 


const VolunteerDashboard = () => {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();

  // State management
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalRides: 0,
    completedRides: 0,
    activeRides: 0,
    totalDistance: 0,
    avgRating: 0
  });
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [completeDialog, setCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [animationTrigger, setAnimationTrigger] = useState(false);

  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  // Load volunteer status and data
  // REPLACE the entire useEffect that loads volunteer data with this:
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeRides = null;

    const loadVolunteerData = async () => {
      try {
        setLoading(true);

        // Load user profile data
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsActive(data.isActive === 1 || data.isActive === true);

          // Set stats from user profile
          setStats({
            totalCredits: data.credits || 0,
            totalRides: data.totalRides || 0,
            completedRides: data.completedRides || 0,
            activeRides: data.activeRides || 0,
            totalDistance: data.totalDistance || 0,
            avgRating: data.avgRating || 0
          });
        }

        // Set up real-time listener for rides
        const ridesQuery = query(
          collection(db, 'volunteerRides'),
          where('volunteerId', '==', currentUser.uid),
          orderBy('assignedAt', 'desc')
        );

        console.log('Setting up rides listener for volunteer:', currentUser.uid);

        unsubscribeRides = onSnapshot(
          ridesQuery,
          (snapshot) => {
            console.log('Rides snapshot received. Count:', snapshot.docs.length);

            const ridesData = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Ride data:', data);

              return {
                id: doc.id,
                ...data,
                // Handle both Timestamp and Date objects
                assignedAt: data.assignedAt?.toDate ? data.assignedAt.toDate() : data.assignedAt || new Date(),
                startedAt: data.startedAt?.toDate ? data.startedAt.toDate() : data.startedAt,
                completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt
              };
            });

            console.log('Processed rides:', ridesData);
            setRides(ridesData);

            // Find active ride
            const active = ridesData.find(r => r.status === 'in_progress');
            setActiveRide(active || null);

            // Update active rides count
            const activeCount = ridesData.filter(r =>
              r.status === 'assigned' || r.status === 'in_progress'
            ).length;

            setStats(prev => ({ ...prev, activeRides: activeCount }));
          },
          (error) => {
            console.error('Error in rides listener:', error);
            toast.error('Error loading rides');
          }
        );

        setLoading(false);
      } catch (error) {
        console.error('Error loading volunteer data:', error);
        toast.error('Error loading data');
        setLoading(false);
      }
    };

    loadVolunteerData();

    // Cleanup function
    return () => {
      if (unsubscribeRides) {
        console.log('Cleaning up rides listener');
        unsubscribeRides();
      }
    };
  }, [currentUser]);

  // Toggle active status
  const handleToggle = async () => {
    if (!currentUser) return;

    setUpdating(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newStatus = !isActive;
      await updateDoc(userRef, { isActive: newStatus ? 1 : 0 });
      setIsActive(newStatus);

      toast.success(newStatus ? 'You are now active! 🚀' : 'Status set to inactive');
      if (fetchUserProfile) fetchUserProfile(currentUser.uid);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  // Start a ride
  const handleStartRide = async (ride) => {
    try {
      const rideRef = doc(db, 'volunteerRides', ride.id);
      await updateDoc(rideRef, {
        status: 'in_progress',
        startedAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        activeRides: increment(1)
      });

      toast.success('Ride started! 🚴');
    } catch (error) {
      console.error('Error starting ride:', error);
      toast.error('Error starting ride');
    }
  };

  // Complete a ride
  const handleCompleteRide = async () => {
    if (!selectedRide) return;

    try {
      const rideRef = doc(db, 'volunteerRides', selectedRide.id);
      const creditsEarned = selectedRide.credits || 10;

      await updateDoc(rideRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completionNotes: completionNotes
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        credits: increment(creditsEarned),
        completedRides: increment(1),
        activeRides: increment(-1),
        totalDistance: increment(selectedRide.distance || 0)
      });

      setCompletionNotes('');
      setCompleteDialog(false);
      setSelectedRide(null);

      toast.success(`Ride completed! +${creditsEarned} credits 🎉`);
    } catch (error) {
      console.error('Error completing ride:', error);
      toast.error('Error completing ride');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Get status gradient
  const getStatusGradient = (status) => {
    switch (status) {
      case 'assigned': return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
      case 'in_progress': return 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)';
      case 'completed': return 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)';
      case 'cancelled': return 'linear-gradient(135deg, #F44336 0%, #E57373 100%)';
      default: return 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)';
    }
  };

  // Enhanced Stat Card Component
  const EnhancedStatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    gradient,
    delay = 0
  }) => (
    <Grow in={animationTrigger} timeout={800 + delay}>
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          borderRadius: 4,
          transition: 'all 0.4s ease',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${color}40`
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
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
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
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 900,
              fontSize: '2.2rem',
              mb: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              mb: subtitle ? 0.5 : 0
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.85rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );

  // Ride Card Component
  const RideCard = ({ ride, index }) => (
    <Slide direction="left" in={animationTrigger} timeout={600 + index * 100}>
      <Card
        sx={{
          mb: 2,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateX(8px) translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: getStatusGradient(ride.status)
          }
        }}
        onClick={() => {
          setSelectedRide(ride);
          setDetailsDialog(true);
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: getStatusGradient(ride.status),
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Restaurant sx={{ fontSize: 28, color: 'white' }} />
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {ride.foodItem}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={ride.status}
                  size="small"
                  sx={{
                    background: getStatusGradient(ride.status),
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                />
                <Chip
                  label={`${ride.credits || 10} credits`}
                  size="small"
                  icon={<Star sx={{ fontSize: 16 }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn sx={{ fontSize: 18, color: '#FF5722' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ride.pickupLocation}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Navigation sx={{ fontSize: 18, color: '#4CAF50' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ride.deliveryLocation}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Schedule sx={{ fontSize: 16, color: '#666' }} />
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {formatDistanceToNow(ride.assignedAt)} ago
                </Typography>
              </Stack>
            </Grid>
            {ride.distance && (
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DirectionsBike sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {ride.distance} km
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>

          {ride.status === 'assigned' && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={(e) => {
                e.stopPropagation();
                handleStartRide(ride);
              }}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Start Ride
            </Button>
          )}

          {ride.status === 'in_progress' && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<Done />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRide(ride);
                setCompleteDialog(true);
              }}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Complete Ride
            </Button>
          )}
        </CardContent>
      </Card>
    </Slide>
  );

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
        <CircularProgress size={60} sx={{ color: 'white' }} />
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
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite'
        }
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in={animationTrigger} timeout={600}>
          <Card
            sx={{
              mb: 4,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Grid container alignItems="center" spacing={4}>
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                          boxShadow: '0 8px 32px rgba(255, 152, 0, 0.4)'
                        }}
                      >
                        <VolunteerActivism sx={{ fontSize: 40, color: 'white' }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 900,
                            color: 'white',
                            mb: 1,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                          }}
                        >
                          Volunteer Dashboard
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Welcome {userProfile?.name || 'Volunteer'}! 🚀
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isActive}
                            onChange={handleToggle}
                            disabled={updating}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#4CAF50'
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#4CAF50'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>
                            {isActive ? '🟢 Active - Ready for Rides' : '⚫ Inactive'}
                          </Typography>
                        }
                      />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedStatCard
              icon={EmojiEvents}
              title="Total Credits"
              value={stats.totalCredits}
              subtitle="Lifetime earnings"
              color="#FFD700"
              gradient={{ from: '#FFD700', to: '#FFA500' }}
              delay={0}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedStatCard
              icon={DirectionsBike}
              title="Total Rides"
              value={stats.totalRides}
              subtitle="All deliveries"
              color="#2196F3"
              gradient={{ from: '#2196F3', to: '#64B5F6' }}
              delay={100}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedStatCard
              icon={CheckCircle}
              title="Completed"
              value={stats.completedRides}
              subtitle="Successful deliveries"
              color="#4CAF50"
              gradient={{ from: '#4CAF50', to: '#81C784' }}
              delay={200}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedStatCard
              icon={LocalShipping}
              title="Active Rides"
              value={stats.activeRides}
              subtitle="In progress now"
              color="#FF9800"
              gradient={{ from: '#FF9800', to: '#FFB74D' }}
              delay={300}
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Active Ride */}
          {activeRide && (
            <Grid item xs={12}>
              <Slide direction="down" in={animationTrigger} timeout={800}>
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    '& .MuiAlert-icon': {
                      color: 'white',
                      fontSize: '2rem'
                    }
                  }}
                  action={
                    <Button
                      onClick={() => {
                        setSelectedRide(activeRide);
                        setCompleteDialog(true);
                      }}
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        fontWeight: 600
                      }}
                      variant="outlined"
                    >
                      Complete
                    </Button>
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    🚴 Active Ride: {activeRide.foodItem}
                  </Typography>
                  <Typography>
                    {activeRide.pickupLocation} → {activeRide.deliveryLocation}
                  </Typography>
                </Alert>
              </Slide>
            </Grid>
          )}

          {/* Rides List */}
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 6,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Assignment sx={{ fontSize: 32 }} />
                  My Rides
                </Typography>

                {rides.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      borderRadius: 4,
                      border: '2px dashed rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <LocalShipping sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      No rides yet
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {isActive ? 'Waiting for assignments...' : 'Set your status to active to receive rides'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {rides.map((ride, index) => (
                      <RideCard key={ride.id} ride={ride} index={index} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Credits Info Card */}
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <CardGiftcard sx={{ fontSize: 32, color: 'white' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                      Credit System
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                    Earn credits for every completed delivery:
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>Short distance (&lt;5km)</Typography>
                      <Chip label="10 credits" size="small" sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>Medium distance (5-10km)</Typography>
                      <Chip label="15 credits" size="small" sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>Long distance (&gt;10km)</Typography>
                      <Chip label="25 credits" size="small" sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 600 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Performance Card */}
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                    📊 Performance
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                          Completion Rate
                        </Typography>
                        <Typography sx={{ color: 'white', fontWeight: 700 }}>
                          {stats.totalRides > 0
                            ? Math.round((stats.completedRides / stats.totalRides) * 100)
                            : 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.totalRides > 0 ? (stats.completedRides / stats.totalRides) * 100 : 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    <Divider sx={{ background: 'rgba(255,255,255,0.2)' }} />


                    <Button
                      variant="outlined"
                      onClick={() => createTestRideForVolunteer(currentUser.uid)}
                      sx={{ mb: 2 }}
                    >
                      Create Test Ride (For Testing)
                    </Button>


                    <Button
                      variant="outlined"
                      onClick={async () => {
                        const ridesQuery = query(
                          collection(db, 'volunteerRides'),
                          where('volunteerId', '==', currentUser.uid)
                        );
                        const snapshot = await getDocs(ridesQuery);
                        console.log('Manual query - Total rides found:', snapshot.docs.length);
                        snapshot.docs.forEach(doc => {
                          console.log('Ride:', doc.id, doc.data());
                        });
                        toast.info(`Found ${snapshot.docs.length} rides in database`);
                      }}
                      sx={{ mb: 2, ml: 2 }}
                    >
                      Debug: Check Rides
                    </Button>
                    <Box>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Total Distance
                        </Typography>
                        <Typography sx={{ color: 'white', fontWeight: 700 }}>
                          {stats.totalDistance.toFixed(1)} km
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Average Rating
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Star sx={{ fontSize: 18, color: '#FFD700' }} />
                          <Typography sx={{ color: 'white', fontWeight: 700 }}>
                            {stats.avgRating.toFixed(1)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Ride Details Dialog */}
        <Dialog
          open={detailsDialog}
          onClose={() => setDetailsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          {selectedRide && (
            <>
              <DialogTitle sx={{
                background: getStatusGradient(selectedRide.status),
                color: 'white',
                fontWeight: 700
              }}>
                Ride Details
              </DialogTitle>
              <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {selectedRide.foodItem}
                    </Typography>
                    <Chip
                      label={selectedRide.status}
                      sx={{
                        background: getStatusGradient(selectedRide.status),
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Pickup Location
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOn sx={{ color: '#FF5722' }} />
                        <Typography fontWeight={600}>{selectedRide.pickupLocation}</Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Delivery Location
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Navigation sx={{ color: '#4CAF50' }} />
                        <Typography fontWeight={600}>{selectedRide.deliveryLocation}</Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Quantity
                      </Typography>
                      <Typography fontWeight={600}>{selectedRide.quantity}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Credits
                      </Typography>
                      <Chip
                        icon={<Star />}
                        label={`${selectedRide.credits || 10} credits`}
                        sx={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Grid>

                    {selectedRide.distance && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Distance
                        </Typography>
                        <Typography fontWeight={600}>{selectedRide.distance} km</Typography>
                      </Grid>
                    )}

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Assigned
                      </Typography>
                      <Typography fontWeight={600}>
                        {format(selectedRide.assignedAt, 'MMM d, yyyy HH:mm')}
                      </Typography>
                    </Grid>

                    {selectedRide.completedAt && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Completed
                        </Typography>
                        <Typography fontWeight={600}>
                          {format(selectedRide.completedAt, 'MMM d, yyyy HH:mm')}
                        </Typography>
                      </Grid>
                    )}

                    {selectedRide.notes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Notes
                        </Typography>
                        <Paper sx={{ p: 2, background: '#f5f5f5' }}>
                          <Typography>{selectedRide.notes}</Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setDetailsDialog(false)}>Close</Button>
                <Button
                  variant="contained"
                  startIcon={<Map />}
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/${encodeURIComponent(selectedRide.pickupLocation)}/${encodeURIComponent(selectedRide.deliveryLocation)}`,
                      '_blank'
                    );
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    fontWeight: 600
                  }}
                >
                  Get Directions
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Complete Ride Dialog */}
        <Dialog
          open={completeDialog}
          onClose={() => setCompleteDialog(false)}
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
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            Complete Ride
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Mark this ride as completed? You'll earn <strong>{selectedRide?.credits || 10} credits</strong>! 🎉
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Completion Notes (Optional)"
              placeholder="Any additional notes about the delivery..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCompleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCompleteRide}
              startIcon={<CheckCircle />}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                fontWeight: 600,
                px: 4
              }}
            >
              Complete Ride
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
};

export default VolunteerDashboard;