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
        borderRadius: 6,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateZ(0)', // Hardware acceleration
        willChange: 'transform',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          boxShadow: `0 32px 64px -12px ${color}40, 0 0 0 1px rgba(255,255,255,0.1)`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)
          `,
          backdropFilter: 'blur(20px)'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          opacity: 0,
          transition: 'opacity 0.6s ease',
        },
        '&:hover::after': {
          opacity: 1
        }
      }}
    >
      <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.4s ease',
              '&:hover': {
                transform: 'rotate(10deg) scale(1.1)',
                background: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            <Icon sx={{ fontSize: 36, color: 'white', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }} />
          </Box>
          {progress && (
            <Box sx={{ position: 'relative', width: 48, height: 48 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={48}
                sx={{
                  color: 'rgba(255, 255, 255, 0.2)',
                  position: 'absolute'
                }}
              />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={48}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  position: 'absolute',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                    filter: 'drop-shadow(0 2px 6px rgba(255,255,255,0.3))'
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white'
                }}
              >
                {progress}%
              </Box>
            </Box>
          )}
        </Stack>
        
        <Typography
          variant="h2"
          sx={{
            color: 'white',
            fontWeight: 900,
            fontSize: '3rem',
            mb: 2,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1
          }}
        >
          {value}
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 600,
            fontSize: '1.1rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
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
        mb: 3,
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateX(12px) translateY(-4px)',
          background: 'rgba(255, 255, 255, 1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8)',
          '& .activity-arrow': {
            transform: 'translateX(8px)',
            color: '#1976D2'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: `linear-gradient(135deg, ${
            getStatusColor(item.status) === 'success' ? '#00C853, #4CAF50' :
            getStatusColor(item.status) === 'warning' ? '#FF8F00, #FFC107' :
            getStatusColor(item.status) === 'primary' ? '#1976D2, #2196F3' :
            getStatusColor(item.status) === 'error' ? '#D32F2F, #F44336' : '#616161, #9E9E9E'
          })`,
          borderRadius: '0 2px 2px 0'
        }
      }}
      onClick={() => navigate(`/donation/${item.id}`)}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" alignItems="center" spacing={4}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${
                getStatusColor(item.status) === 'success' ? '#00C853 0%, #4CAF50 100%' :
                getStatusColor(item.status) === 'warning' ? '#FF8F00 0%, #FFC107 100%' :
                getStatusColor(item.status) === 'primary' ? '#1976D2 0%, #2196F3 100%' :
                getStatusColor(item.status) === 'error' ? '#D32F2F 0%, #F44336 100%' : '#616161 0%, #9E9E9E 100%'
              })`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
              }
            }}
          >
            <Restaurant sx={{ fontSize: 32, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: '#1a1a1a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '1.2rem'
              }}
            >
              {item.title}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={3}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              >
                {format(item.createdAt?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
              </Typography>
              <Chip
                label={item.status}
                size="small"
                color={getStatusColor(item.status)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'capitalize',
                  height: 28,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Stack>
          </Box>
          
          <ChevronRight
            className="activity-arrow"
            sx={{
              color: 'text.secondary',
              fontSize: 28,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
          background: `
            linear-gradient(135deg, #667eea 0%, #764ba2 100%),
            radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.2) 0%, transparent 50%)
          `,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
            animation: 'shimmer 3s ease-in-out infinite'
          }
        }}
      >
        <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {/* Header Skeleton */}
            <Grid item xs={12}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{ 
                  borderRadius: 6, 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)'
                }}
              />
            </Grid>

            {/* Stats Skeletons */}
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={180}
                  sx={{ 
                    borderRadius: 6, 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(20px)'
                  }}
                />
              </Grid>
            ))}

            {/* Content Skeletons */}
            <Grid item xs={12} lg={8}>
              <Skeleton
                variant="rectangular"
                height={500}
                sx={{ 
                  borderRadius: 6, 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)'
                }}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton
                variant="rectangular"
                height={500}
                sx={{ 
                  borderRadius: 6, 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)'
                }}
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
        background: `
          linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.2) 0%, transparent 50%)
        `,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
          `,
          animation: 'float 25s ease-in-out infinite'
        }
      }}
    >
      <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header */}
        <Card
          sx={{
            mb: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60%',
              height: '100%',
              background: `
                radial-gradient(ellipse at top right, rgba(255,255,255,0.2) 0%, transparent 70%),
                linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)
              `,
              borderRadius: '0 6px 6px 0'
            }}
          />
          
          <CardContent sx={{ p: 8, position: 'relative', zIndex: 1 }}>
            <Grid container alignItems="center" spacing={6}>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      lineHeight: 1.1
                    }}
                  >
                    {getGreeting()}, {userProfile?.name?.split(' ')[0]}! 👋
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 500,
                      maxWidth: '600px',
                      fontSize: '1.4rem',
                      lineHeight: 1.4,
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: `
                      linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%),
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(5deg)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 70, color: 'white', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} />
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
              mb: 6,
              borderRadius: 4,
              background: 'rgba(255, 193, 7, 0.2)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 193, 7, 0.4)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(255, 193, 7, 0.2)',
              '& .MuiAlert-icon': {
                color: '#FFC107',
                fontSize: '2rem'
              },
              '& .MuiAlert-message': {
                fontSize: '1.1rem'
              }
            }}
            action={
              <Button
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.4)',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
                variant="outlined"
                size="medium"
                onClick={() => navigate('/my-donations')}
              >
                View Details
              </Button>
            }
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ⚠️ {upcomingExpiry.length} donation{upcomingExpiry.length > 1 ? 's' : ''} expiring within 12 hours!
            </Typography>
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
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
            mb: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 6,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 4,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              <Speed sx={{ fontSize: 40 }} />
              Quick Actions
            </Typography>
            
            <Grid container spacing={3}>
              {userProfile?.role === 'donor' ? (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/create-donation')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 12px 40px rgba(0, 200, 83, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 20px 60px rgba(0, 200, 83, 0.5)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Create Donation
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Assignment sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/my-donations')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      My Donations
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Analytics sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/analytics')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Analytics
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<People sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/community')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
                      startIcon={<Restaurant sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/browse')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 12px 40px rgba(0, 200, 83, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 20px 60px rgba(0, 200, 83, 0.5)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Browse Donations
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LocalDining sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/my-claims')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      My Claims
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Favorite sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/favorites')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Favorites
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Group sx={{ fontSize: '1.5rem' }} />}
                      onClick={() => navigate('/community')}
                      sx={{
                        py: 3,
                        borderRadius: 4,
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          border: '2px solid white',
                          background: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 6,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent sx={{ p: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Timeline sx={{ fontSize: 40 }} />
                    Recent Activity
                  </Typography>
                  
                  <Button
                    endIcon={<ArrowForward sx={{ fontSize: '1.2rem' }} />}
                    onClick={() => navigate(userProfile?.role === 'donor' ? '/my-donations' : '/my-claims')}
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      textTransform: 'none',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '2px solid rgba(255, 255, 255, 0.7)',
                        transform: 'translateX(8px) translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    View All
                  </Button>
                </Stack>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  {recentActivity.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        borderRadius: 4,
                        border: '2px dashed rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <Restaurant
                        sx={{
                          fontSize: 100,
                          color: 'rgba(255, 255, 255, 0.5)',
                          mb: 4,
                          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                        }}
                      />
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          mb: 4,
                          fontWeight: 600
                        }}
                      >
                        No recent activity yet
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
                        sx={{
                          px: 6,
                          py: 3,
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          textTransform: 'none',
                          boxShadow: '0 12px 40px rgba(0, 200, 83, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 20px 60px rgba(0, 200, 83, 0.5)'
                          },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {userProfile?.role === 'donor' ? 'Create First Donation' : 'Browse Donations'}
                      </Button>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        maxHeight: 500, 
                        overflow: 'auto',
                        pr: 2,
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '4px',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.5)',
                          },
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
                      }}
                    >
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
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 6,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent sx={{ p: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    <NotificationsActive sx={{ fontSize: 40 }} />
                    Notifications
                  </Typography>
                  
                  <Badge
                    badgeContent={notifications.length}
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        minWidth: '24px',
                        height: '24px',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          background: 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      <Notifications sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                  </Badge>
                </Stack>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  {notifications.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        borderRadius: 4,
                        border: '2px dashed rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <Notifications
                        sx={{
                          fontSize: 80,
                          color: 'rgba(255, 255, 255, 0.5)',
                          mb: 4,
                          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                        }}
                      />
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        All caught up! 🎉
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '1.1rem'
                        }}
                      >
                        No new notifications
                      </Typography>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        maxHeight: 500, 
                        overflow: 'auto',
                        pr: 2,
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '4px',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.5)',
                          },
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {notifications.map((notification) => (
                        <Card
                          key={notification.id}
                          sx={{
                            mb: 3,
                            borderRadius: 4,
                            background: notification.read
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'rgba(255, 193, 7, 0.25)',
                            backdropFilter: 'blur(20px)',
                            border: `2px solid ${
                              notification.read
                                ? 'rgba(255, 255, 255, 0.3)'
                                : 'rgba(255, 193, 7, 0.5)'
                            }`,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateX(8px) translateY(-2px)',
                              background: notification.read
                                ? 'rgba(255, 255, 255, 0.2)'
                                : 'rgba(255, 193, 7, 0.3)',
                              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                            },
                            '&::before': notification.read
                              ? {}
                              : {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 6,
                                  background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
                                  borderRadius: '0 4px 4px 0'
                                }
                          }}
                        >
                          <CardContent sx={{ p: 4 }}>
                            <Stack direction="row" alignItems="flex-start" spacing={3}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  background: notification.read
                                    ? 'rgba(255, 255, 255, 0.25)'
                                    : 'rgba(255, 193, 7, 0.4)',
                                  border: '2px solid rgba(255, 255, 255, 0.2)',
                                  backdropFilter: 'blur(10px)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    background: notification.read
                                      ? 'rgba(255, 255, 255, 0.3)'
                                      : 'rgba(255, 193, 7, 0.5)'
                                  }
                                }}
                              >
                                <Notifications sx={{ fontSize: 24, color: 'white' }} />
                              </Avatar>
                              
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: notification.read ? 600 : 800,
                                    color: 'white',
                                    mb: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontSize: '1.1rem'
                                  }}
                                >
                                  {notification.title || 'New Notification'}
                                </Typography>
                                
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
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
        sx={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
          width: 72,
          height: 72,
          boxShadow: '0 16px 48px rgba(0, 200, 83, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
            transform: 'scale(1.15) rotate(10deg)',
            boxShadow: '0 24px 64px rgba(0, 200, 83, 0.6)'
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
      >
        <Add sx={{ fontSize: 36, color: 'white', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }} />
      </Fab>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(2deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }

        @keyframes shimmer {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;