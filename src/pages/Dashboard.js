// src/pages/Dashboard.js - COMPLETE ENHANCED VERSION
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
  Tab,
  Tabs,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  People,
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
  EmojiEvents,
  Timeline,
  Share,
  Analytics
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

// Import new components
import ImpactTracker from '../components/impact/ImpactTracker';
import DonationTimeline from '../components/timeline/DonationTimeline';
import { BadgeShowcase, LevelProgress, Leaderboard } from '../components/gamification/BadgeShowcase';
import SocialShareButton from '../components/sharing/SocialShareButton';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalReceived: 0,
    impactScore: 0,
    peopleHelped: 0,
    foodSaved: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingExpiry, setUpcomingExpiry] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch user's donations (for donors) or claims (for receivers)
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

          // Enhanced stats calculation
          const newStats = {
            totalDonations: donations.length,
            activeDonations: donations.filter(d => d.status === 'available').length,
            completedDonations: donations.filter(d => d.status === 'completed').length,
            totalReceived: userProfile?.role === 'receiver' ? donations.length : 0,
            impactScore: donations.filter(d => d.status === 'completed').length * 10,
            peopleHelped: donations.reduce((sum, d) => sum + (d.peopleHelped || 0), 0),
            foodSaved: donations.reduce((sum, d) => sum + (d.foodWeight || 0), 0)
          };
          setStats(newStats);

          // Set recent activity
          setRecentActivity(donations.slice(0, 5));

          // Find donations expiring soon (for donors)
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

        // Fetch notifications
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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

  // Enhanced Stats Cards Component
  const StatsCard = ({ icon: Icon, title, value, color, description, trend }) => (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha(color, 0.2)}`
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            width: 60,
            height: 60
          }}
        >
          <Icon sx={{ fontSize: 28, color: 'white' }} />
        </Avatar>
        
        <Box flex={1}>
          <Typography variant="h4" sx={{ fontWeight: 800, color, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>

        {trend && (
          <Chip
            icon={<TrendingUp />}
            label={`+${trend}%`}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
              color: 'white',
              fontWeight: 600
            }}
          />
        )}
      </Stack>
    </Card>
  );

  const renderDonorDashboard = () => (
    <>
      {/* Quick Actions */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                What would you like to do today?
              </Typography>
            </Box>
            <SocialShareButton
              type="impact"
              data={{
                impactData: stats,
                userName: userProfile?.name
              }}
              variant="button"
              showLabel
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            />
          </Stack>
          
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-donation')}
              size="large"
              sx={{
                background: 'rgba(255,255,255,0.95)',
                color: '#667eea',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'white',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Create Donation
            </Button>
            <Button
              variant="outlined"
              startIcon={<Restaurant />}
              onClick={() => navigate('/my-donations')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              My Donations
            </Button>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => setTabValue(0)} // Switch to impact tab
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              View Impact
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* Expiring Soon Alert */}
      {upcomingExpiry.length > 0 && (
        <Grid item xs={12}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/my-donations')}
                sx={{ fontWeight: 600 }}
              >
                View All
              </Button>
            }
          >
            <Typography variant="subtitle1" fontWeight={600}>
              ⏰ {upcomingExpiry.length} donation{upcomingExpiry.length > 1 ? 's' : ''} expiring within 12 hours!
            </Typography>
          </Alert>
        </Grid>
      )}
    </>
  );

  const renderReceiverDashboard = () => (
    <>
      {/* Quick Actions */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
            color: 'white'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Find food donations in your area
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<Restaurant />}
              onClick={() => navigate('/browse')}
              size="large"
              sx={{
                background: 'rgba(255,255,255,0.95)',
                color: '#00C853',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'white',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Browse Donations
            </Button>
            <Button
              variant="outlined"
              startIcon={<LocalDining />}
              onClick={() => navigate('/my-claims')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              My Claims
            </Button>
            <Button
              variant="outlined"
              startIcon={<Star />}
              onClick={() => navigate('/favorites')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Favorites
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </>
  );

  // Tab content rendering
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Impact Overview
        return (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ImpactTracker userId={currentUser.uid} />
            </Grid>
            <Grid item xs={12} md={8}>
              <LevelProgress userId={currentUser.uid} />
            </Grid>
            <Grid item xs={12} md={4}>
              <BadgeShowcase userId={currentUser.uid} compact />
            </Grid>
          </Grid>
        );
      
      case 1: // Timeline
        return <DonationTimeline userId={currentUser.uid} />;
      
      case 2: // Achievements
        return (
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <BadgeShowcase userId={currentUser.uid} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Leaderboard limit={10} />
            </Grid>
          </Grid>
        );
      
      case 3: // Activity
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Activity
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate(userProfile?.role === 'donor' ? '/my-donations' : '/my-claims')}
                  >
                    View All
                  </Button>
                </Box>
                
                {recentActivity.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
                    >
                      {userProfile?.role === 'donor' ? 'Create First Donation' : 'Browse Donations'}
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {recentActivity.map((item, index) => (
                      <ListItem 
                        key={item.id}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 2, 
                          mb: 1,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(item.status) + '.main' }}>
                            <Restaurant />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {format(item.createdAt?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
                              </Typography>
                              <Chip 
                                label={item.status} 
                                size="small" 
                                color={getStatusColor(item.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                        <IconButton onClick={() => navigate(`/donation/${item.id}`)}>
                          <Visibility />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Notifications
                  </Typography>
                  <Badge badgeContent={notifications.length} color="error">
                    <Notifications />
                  </Badge>
                </Box>
                
                {notifications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No new notifications
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {notifications.map((notification, index) => (
                      <ListItem 
                        key={notification.id}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 2, 
                          mb: 1,
                          bgcolor: notification.read ? 'transparent' : 'action.hover'
                        }}
                      >
                        <ListItemText
                          primary={notification.title || 'New notification'}
                          secondary={
                            <Typography variant="caption">
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
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}, {userProfile?.name?.split(' ')[0]}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {userProfile?.role === 'donor' 
            ? 'Ready to share some food today?' 
            : 'Let\'s find some great food donations for your community!'
          }
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Enhanced Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={Restaurant}
            title={userProfile?.role === 'donor' ? 'Total Donations' : 'Total Claims'}
            value={stats.totalDonations}
            color={theme.palette.primary.main}
            description="Food items shared"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={Schedule}
            title="Active"
            value={stats.activeDonations}
            color={theme.palette.success.main}
            description="Currently available"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedDonations}
            color={theme.palette.info.main}
            description="Successfully shared"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={EnergySavingsLeaf}
            title="Impact Score"
            value={stats.impactScore}
            color={theme.palette.warning.main}
            description="Community impact"
          />
        </Grid>

        {/* Role-specific sections */}
        {userProfile?.role === 'donor' ? renderDonorDashboard() : renderReceiverDashboard()}

        {/* Enhanced Navigation Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    background: 'rgba(102, 126, 234, 0.08)'
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: 2
                }
              }}
            >
              <Tab 
                label="Impact Overview" 
                icon={<TrendingUp />} 
                iconPosition="start"
              />
              <Tab 
                label="Timeline" 
                icon={<Timeline />} 
                iconPosition="start"
              />
              <Tab 
                label="Achievements" 
                icon={<EmojiEvents />} 
                iconPosition="start"
              />
              <Tab 
                label="Activity" 
                icon={<Notifications />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab Content */}
        <Grid item xs={12}>
          {renderTabContent()}
        </Grid>
      </Grid>

      {/* Enhanced Floating Action Button */}
      {userProfile?.role === 'donor' && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/create-donation')}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Dashboard;