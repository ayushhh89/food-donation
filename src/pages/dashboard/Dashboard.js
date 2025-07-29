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
  Skeleton
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
  Warning
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, rgba(129, 199, 132, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(46, 125, 50, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
          `,
          py: 4
        }}
      >
        <Container maxWidth="xl">
          {/* Welcome Section Skeleton */}
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              py: 6,
              borderRadius: 6,
              background: `
                linear-gradient(135deg, 
                  rgba(255,255,255,0.9) 0%, 
                  rgba(248,249,250,0.95) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Skeleton variant="text" width="40%" height={80} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
          </Box>

          {/* Stats Grid Skeleton */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 5,
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.95) 0%, 
                        rgba(248,249,250,0.9) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    textAlign: 'center'
                  }}
                >
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 3 }} />
                  <Skeleton variant="text" width="60%" height={50} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={30} sx={{ mx: 'auto' }} />
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Content Skeleton */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 5, mb: 4 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 5 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 5 }} />
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
          radial-gradient(circle at 20% 80%, rgba(129, 199, 132, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(46, 125, 50, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
        `,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%234CAF50" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 25s linear infinite'
        }
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: 6,
            py: 8,
            borderRadius: 6,
            background: `
              radial-gradient(circle at 30% 40%, rgba(129, 199, 132, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
              linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)
            `,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 80px rgba(46, 125, 50, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 6s ease-in-out infinite'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -80,
              left: -80,
              width: 160,
              height: 160,
              background: 'radial-gradient(circle, rgba(129, 199, 132, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 6s ease-in-out infinite 3s'
            }
          }}
        >
          <Typography 
            variant="h2" 
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #E8F5E8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'relative',
              zIndex: 1
            }}
          >
            {getGreeting()}, {userProfile?.name?.split(' ')[0]}! 🌱
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              fontSize: '1.3rem',
              fontWeight: 300,
              opacity: 0.95,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              position: 'relative',
              zIndex: 1
            }}
          >
            {userProfile?.role === 'donor'
              ? 'Share the gift of food and make a difference today!'
              : 'Discover fresh food donations for your community!'}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 5,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(46, 125, 50, 0.1)',
                boxShadow: '0 20px 60px rgba(46, 125, 50, 0.1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(46, 125, 50, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid rgba(46, 125, 50, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 30,
                    height: 30,
                    background: 'radial-gradient(circle, rgba(46, 125, 50, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 4s ease-in-out infinite'
                  }
                }}
              >
                <Restaurant sx={{ fontSize: 36, color: '#2E7D32' }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                {stats.totalDonations}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                {userProfile?.role === 'donor' ? 'Total Donations' : 'Total Claims'}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 5,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                boxShadow: '0 20px 60px rgba(76, 175, 80, 0.1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(76, 175, 80, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid rgba(76, 175, 80, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 30,
                    height: 30,
                    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 4s ease-in-out infinite 1s'
                  }
                }}
              >
                <Schedule sx={{ fontSize: 36, color: '#4CAF50' }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                {stats.activeDonations}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                Active
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 5,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(33, 150, 243, 0.1)',
                boxShadow: '0 20px 60px rgba(33, 150, 243, 0.1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: 'linear-gradient(90deg, #2196F3 0%, #42A5F5 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(33, 150, 243, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid rgba(33, 150, 243, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 30,
                    height: 30,
                    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 4s ease-in-out infinite 2s'
                  }
                }}
              >
                <CheckCircle sx={{ fontSize: 36, color: '#2196F3' }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                {stats.completedDonations}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                Completed
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 5,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 152, 0, 0.1)',
                boxShadow: '0 20px 60px rgba(255, 152, 0, 0.1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)'
                },
                '&:hover': {
                  boxShadow: '0 30px 80px rgba(255, 152, 0, 0.15)',
                  transform: 'translateY(-8px) scale(1.02)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC02 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid rgba(255, 152, 0, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 30,
                    height: 30,
                    background: 'radial-gradient(circle, rgba(255, 152, 0, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 4s ease-in-out infinite 3s'
                  }
                }}
              >
                <EnergySavingsLeaf sx={{ fontSize: 36, color: '#FF9800' }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  fontWeight: 800,
                  fontSize: '3rem'
                }}
              >
                {stats.impactScore}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                Impact Score
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Expiry Alert */}
        {upcomingExpiry.length > 0 && userProfile?.role === 'donor' && (
          <Box sx={{ mb: 6 }}>
            <Alert
              severity="warning"
              sx={{
                borderRadius: 4,
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 243, 224, 0.95) 0%, 
                    rgba(255, 248, 225, 0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                boxShadow: '0 8px 32px rgba(255, 152, 0, 0.1)',
                p: 3,
                '& .MuiAlert-icon': {
                  fontSize: 28
                }
              }}
              action={
                <Button 
                  sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2.5,
                    px: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={() => navigate('/my-donations')}
                >
                  View All
                </Button>
              }
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#E65100'
                }}
              >
                {upcomingExpiry.length} donation{upcomingExpiry.length > 1 ? 's' : ''} expiring soon!
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Main Content */}
        <Grid container spacing={6}>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 6,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 50%, #66BB6A 100%)'
                }
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 4,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2E7D32 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Quick Actions
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
                {userProfile?.role === 'donor' ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/create-donation')}
                      sx={{
                        px: 5,
                        py: 2.5,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
                        minWidth: 200,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 12px 48px rgba(46, 125, 50, 0.4)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Create Donation
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Restaurant />}
                      onClick={() => navigate('/my-donations')}
                      sx={{
                        px: 5,
                        py: 2.5,
                        borderRadius: 4,
                        border: '2px solid rgba(46, 125, 50, 0.3)',
                        color: '#2E7D32',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        minWidth: 200,
                        background: 'rgba(46, 125, 50, 0.05)',
                        '&:hover': {
                          border: '2px solid rgba(46, 125, 50, 0.6)',
                          background: 'rgba(46, 125, 50, 0.1)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      My Donations
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      onClick={() => navigate('/analytics')}
                      sx={{
                        px: 5,
                        py: 2.5,
                        borderRadius: 4,
                        border: '2px solid rgba(46, 125, 50, 0.3)',
                        color: '#2E7D32',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        minWidth: 200,
                        background: 'rgba(46, 125, 50, 0.05)',
                        '&:hover': {
                          border: '2px solid rgba(46, 125, 50, 0.6)',
                          background: 'rgba(46, 125, 50, 0.1)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      View Analytics
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Restaurant />}
                      onClick={() => navigate('/browse')}
                      sx={{
                        px: 5,
                        py: 2.5,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
                        minWidth: 200,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 12px 48px rgba(46, 125, 50, 0.4)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Browse Donations
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LocalDining />}
                      onClick={() => navigate('/my-claims')}
                      sx={{
                        px: 5,
                        py: 2.5,
                        borderRadius: 4,
                        border: '2px solid rgba(46, 125, 50, 0.3)',
                        color: '#2E7D32',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        minWidth: 200,
                        background: 'rgba(46, 125, 50, 0.05)',
                        '&:hover': {
                          border: '2px solid rgba(46, 125, 50, 0.6)',
                          background: 'rgba(46, 125, 50, 0.1)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      My Claims
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Star />}
                      onClick={() => navigate('/favorites')}
                      sx={{
                        px: 5,
                        py: 2.5,
                        borderRadius: 4,
                        border: '2px solid rgba(46, 125, 50, 0.3)',
                        color: '#2E7D32',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        minWidth: 200,
                        background: 'rgba(46, 125, 50, 0.05)',
                        '&:hover': {
                          border: '2px solid rgba(46, 125, 50, 0.6)',
                          background: 'rgba(46, 125, 50, 0.1)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Favorites
                    </Button>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 6,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.08)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 50%, #66BB6A 100%)'
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4 
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2E7D32 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Recent Activity
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(userProfile?.role === 'donor' ? '/my-donations' : '/my-claims')}
                  sx={{
                    color: '#2E7D32',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(46, 125, 50, 0.08)',
                      transform: 'translateX(4px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  View All
                </Button>
              </Box>
              
              {recentActivity.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    borderRadius: 4,
                    background: 'rgba(46, 125, 50, 0.02)',
                    border: '2px dashed rgba(46, 125, 50, 0.2)'
                  }}
                >
                  <Restaurant 
                    sx={{ 
                      fontSize: 80, 
                      color: 'rgba(46, 125, 50, 0.3)', 
                      mb: 3 
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#666', 
                      mb: 3,
                      fontWeight: 500
                    }}
                  >
                    No recent activity
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
                    sx={{
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {userProfile?.role === 'donor' ? 'Create First Donation' : 'Browse Donations'}
                  </Button>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentActivity.map((item, index) => (
                    <ListItem 
                      key={item.id}
                      sx={{
                        mb: 2,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(46, 125, 50, 0.1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.9)',
                          transform: 'translateX(8px)',
                          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.1)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        p: 3
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            width: 50,
                            height: 50,
                            background: `linear-gradient(135deg, ${
                              getStatusColor(item.status) === 'success' ? '#4CAF50' :
                              getStatusColor(item.status) === 'warning' ? '#FF9800' :
                              getStatusColor(item.status) === 'primary' ? '#2196F3' :
                              getStatusColor(item.status) === 'error' ? '#f44336' : '#9E9E9E'
                            } 0%, ${
                              getStatusColor(item.status) === 'success' ? '#66BB6A' :
                              getStatusColor(item.status) === 'warning' ? '#FFB74D' :
                              getStatusColor(item.status) === 'primary' ? '#42A5F5' :
                              getStatusColor(item.status) === 'error' ? '#ef5350' : '#BDBDBD'
                            } 100%)`,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                          }}
                        >
                          <Restaurant sx={{ color: 'white' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#1a1a1a',
                              mb: 1
                            }}
                          >
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#666',
                                fontWeight: 500
                              }}
                            >
                              {format(item.createdAt?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
                            </Typography>
                            <Chip
                              label={item.status}
                              size="small"
                              color={getStatusColor(item.status)}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                        }
                      />
                      <IconButton 
                        onClick={() => navigate(`/donation/${item.id}`)}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          background: 'rgba(46, 125, 50, 0.1)',
                          color: '#2E7D32',
                          '&:hover': {
                            background: 'rgba(46, 125, 50, 0.2)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 6,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(248,249,250,0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.08)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)'
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4 
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #FF9800 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Notifications
                </Typography>
                <Badge 
                  badgeContent={notifications.length} 
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                      fontWeight: 700
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255, 152, 0, 0.2)'
                    }}
                  >
                    <Notifications sx={{ color: '#FF9800' }} />
                  </Box>
                </Badge>
              </Box>
              
              {notifications.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    borderRadius: 4,
                    background: 'rgba(255, 152, 0, 0.02)',
                    border: '2px dashed rgba(255, 152, 0, 0.2)'
                  }}
                >
                  <Notifications 
                    sx={{ 
                      fontSize: 60, 
                      color: 'rgba(255, 152, 0, 0.3)', 
                      mb: 3 
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#666',
                      fontWeight: 500
                    }}
                  >
                    No new notifications
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.map((notification, index) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        mb: 2,
                        borderRadius: 4,
                        background: notification.read 
                          ? 'rgba(255, 255, 255, 0.5)' 
                          : 'rgba(255, 152, 0, 0.1)',
                        border: `1px solid ${notification.read 
                          ? 'rgba(0,0,0,0.1)' 
                          : 'rgba(255, 152, 0, 0.3)'}`,
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          background: notification.read 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : 'rgba(255, 152, 0, 0.15)',
                          transform: 'translateX(4px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        p: 3,
                        position: 'relative',
                        '&::before': notification.read ? {} : {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                          borderRadius: '4px 0 0 4px'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.read ? 500 : 700,
                              color: notification.read ? '#666' : '#1a1a1a',
                              mb: 1
                            }}
                          >
                            {notification.title || 'New Notification'}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#888',
                              fontWeight: 500
                            }}
                          >
                            {format(notification.createdAt?.toDate() || new Date(), 'MMM d, HH:mm')}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;