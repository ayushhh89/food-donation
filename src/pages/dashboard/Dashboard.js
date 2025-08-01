import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  Alert,
  Fab,
  Badge,
  Skeleton,
  Stack,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  Notifications,
  Add,
  Visibility,
  Schedule,
  CheckCircle,
  LocalDining,
  EnergySavingsLeaf,
  Star,
  ArrowForward,
  Warning,
  Dashboard as DashboardIcon,
  Analytics,
  Favorite,
  Group,
  EmojiEvents,
  Timeline,
  NotificationsActive,
  ChevronRight,
  Speed,
  Eco,
  People,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalReceived: 0,
    impactScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingExpiry, setUpcomingExpiry] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        let donationsQuery;
        if (userProfile?.role === 'donor') {
          donationsQuery = query(
            collection(db, 'donations'),
            where('donorId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        } else {
          donationsQuery = query(
            collection(db, 'donations'),
            where('interestedReceivers', 'array-contains', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        }

        const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
          const donations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const newStats = {
            totalDonations: donations.length,
            activeDonations: donations.filter(d => d.status === 'available').length,
            completedDonations: donations.filter(d => d.status === 'completed').length,
            totalReceived: userProfile?.role === 'receiver' ? donations.length : 0,
            impactScore: donations.filter(d => d.status === 'completed').length * 10
          };
          setStats(newStats);

          setRecentActivity(donations.slice(0, 5));

          if (userProfile?.role === 'donor') {
            const now = new Date();
            const expiringSoon = donations.filter(donation => {
              if (donation.status !== 'available') return false;
              const expiryDate = donation.expiryDate?.toDate();
              const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);
              return hoursUntilExpiry <= 12 && hoursUntilExpiry > 0;
            });
            setUpcomingExpiry(expiringSoon);
          }

          setLoading(false);
        });

        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotifications(notifs);
        });

        return () => {
          unsubscribeDonations();
          unsubscribeNotifications();
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, userProfile]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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

  const StatCard = ({ icon: Icon, title, value, color, gradient, progress }) => (
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
          boxShadow: `0 20px 40px ${color}20`
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
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          {progress && (
            <Box sx={{ width: 40, height: 40 }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={40}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }}
              />
            </Box>
          )}
        </Stack>
        
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: '2.5rem',
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
            fontSize: '1rem'
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ item, index }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateX(8px)',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }
      }}
      onClick={() => navigate(`/donation/${item.id}`)}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${
                getStatusColor(item.status) === 'success' ? '#00C853 0%, #4CAF50 100%' :
                getStatusColor(item.status) === 'warning' ? '#FF8F00 0%, #FFC107 100%' :
                getStatusColor(item.status) === 'primary' ? '#1976D2 0%, #2196F3 100%' :
                getStatusColor(item.status) === 'error' ? '#D32F2F 0%, #F44336 100%' : '#616161 0%, #9E9E9E 100%'
              })`
            }}
          >
            <Restaurant sx={{ fontSize: 28 }} />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                color: '#1a1a1a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.title}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {format(item.createdAt?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
              </Typography>
              <Chip
                label={item.status}
                size="small"
                color={getStatusColor(item.status)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  height: 24
                }}
              />
            </Stack>
          </Box>
          
          <ChevronRight
            sx={{
              color: 'text.secondary',
              transition: 'transform 0.3s ease',
              '.MuiCard-root:hover &': {
                transform: 'translateX(4px)'
              }
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {/* Header Skeleton */}
            <Grid item xs={12}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            </Grid>

            {/* Stats Skeletons */}
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={160}
                  sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                />
              </Grid>
            ))}

            {/* Content Skeletons */}
            <Grid item xs={12} lg={8}>
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          `,
          animation: 'float 20s ease-in-out infinite'
        }
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Hero Header */}
        <Card
          sx={{
            mb: 4,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
              borderRadius: '50% 0 0 50%'
            }}
          />
          
          <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
            <Grid container alignItems="center" spacing={4}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2rem', md: '3rem' },
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {getGreeting()}, {userProfile?.name?.split(' ')[0]}! 👋
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      maxWidth: '600px'
                    }}
                  >
                    {userProfile?.role === 'donor'
                      ? 'Transform lives through the power of food sharing 🌟'
                      : 'Discover fresh opportunities to nourish your community 🍽️'}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 60, color: 'white' }} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Expiry Alert */}
        {upcomingExpiry.length > 0 && userProfile?.role === 'donor' && (
          <Alert
            severity="warning"
            sx={{
              mb: 4,
              borderRadius: 3,
              background: 'rgba(255, 193, 7, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#FFC107'
              }
            }}
            action={
              <Button
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
                variant="outlined"
                size="small"
                onClick={() => navigate('/my-donations')}
              >
                View Details
              </Button>
            }
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ⚠️ {upcomingExpiry.length} donation{upcomingExpiry.length > 1 ? 's' : ''} expiring within 12 hours!
            </Typography>
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={Restaurant}
              title={userProfile?.role === 'donor' ? 'Total Donations' : 'Total Claims'}
              value={stats.totalDonations}
              color="#00C853"
              gradient={{ from: '#00C853', to: '#4CAF50' }}
              progress={75}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={Schedule}
              title="Active"
              value={stats.activeDonations}
              color="#FF8F00"
              gradient={{ from: '#FF8F00', to: '#FFC107' }}
              progress={60}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={CheckCircle}
              title="Completed"
              value={stats.completedDonations}
              color="#1976D2"
              gradient={{ from: '#1976D2', to: '#2196F3' }}
              progress={85}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={EmojiEvents}
              title="Impact Score"
              value={stats.impactScore}
              color="#7B1FA2"
              gradient={{ from: '#7B1FA2', to: '#9C27B0' }}
              progress={90}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card
          sx={{
            mb: 4,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Speed sx={{ fontSize: 32 }} />
              Quick Actions
            </Typography>
            
            <Grid container spacing={2}>
              {userProfile?.role === 'donor' ? (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/create-donation')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(0, 200, 83, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0, 200, 83, 0.4)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Create Donation
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Assignment />}
                      onClick={() => navigate('/my-donations')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      My Donations
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Analytics />}
                      onClick={() => navigate('/analytics')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Analytics
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<People />}
                      onClick={() => navigate('/community')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Community
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Restaurant />}
                      onClick={() => navigate('/browse')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(0, 200, 83, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0, 200, 83, 0.4)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Browse Donations
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LocalDining />}
                      onClick={() => navigate('/my-claims')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      My Claims
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Favorite />}
                      onClick={() => navigate('/favorites')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Favorites
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Group />}
                      onClick={() => navigate('/community')}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Community
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Recent Activity */}
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4
              }}
            >
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Timeline sx={{ fontSize: 32 }} />
                    Recent Activity
                  </Typography>
                  
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate(userProfile?.role === 'donor' ? '/my-donations' : '/my-claims')}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    View All
                  </Button>
                </Stack>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {recentActivity.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        borderRadius: 3,
                        border: '2px dashed rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <Restaurant
                        sx={{
                          fontSize: 80,
                          color: 'rgba(255, 255, 255, 0.4)',
                          mb: 3
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 3,
                          fontWeight: 500
                        }}
                      >
                        No recent activity yet
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
                        sx={{
                          px: 4,
                          py: 2,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 32px rgba(0, 200, 83, 0.3)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {userProfile?.role === 'donor' ? 'Create First Donation' : 'Browse Donations'}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {recentActivity.map((item) => (
                        <ActivityCard key={item.id} item={item} />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4
              }}
            >
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <NotificationsActive sx={{ fontSize: 32 }} />
                    Notifications
                  </Typography>
                  
                  <Badge
                    badgeContent={notifications.length}
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                        color: 'white',
                        fontWeight: 700
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Notifications sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </Badge>
                </Stack>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {notifications.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        borderRadius: 3,
                        border: '2px dashed rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <Notifications
                        sx={{
                          fontSize: 60,
                          color: 'rgba(255, 255, 255, 0.4)',
                          mb: 3
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500
                        }}
                      >
                        All caught up! 🎉
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          mt: 1
                        }}
                      >
                        No new notifications
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {notifications.map((notification) => (
                        <Card
                          key={notification.id}
                          sx={{
                            mb: 2,
                            borderRadius: 3,
                            background: notification.read
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(255, 193, 7, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${
                              notification.read
                                ? 'rgba(255, 255, 255, 0.2)'
                                : 'rgba(255, 193, 7, 0.4)'
                            }`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              background: notification.read
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'rgba(255, 193, 7, 0.25)'
                            },
                            '&::before': notification.read
                              ? {}
                              : {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
                                  borderRadius: '4px 0 0 4px'
                                }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="flex-start" spacing={2}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: notification.read
                                    ? 'rgba(255, 255, 255, 0.2)'
                                    : 'rgba(255, 193, 7, 0.3)',
                                  fontSize: 20
                                }}
                              >
                                <Notifications />
                              </Avatar>
                              
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: notification.read ? 500 : 700,
                                    color: 'white',
                                    mb: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {notification.title || 'New Notification'}
                                </Typography>
                                
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 500
                                  }}
                                >
                                  {format(notification.createdAt?.toDate() || new Date(), 'MMM d, HH:mm')}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
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
            boxShadow: '0 12px 40px rgba(0, 200, 83, 0.5)'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
      >
        <Add sx={{ fontSize: 32 }} />
      </Fab>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;