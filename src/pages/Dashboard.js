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
  Badge
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
  Warning
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

          // Calculate stats
          const newStats = {
            totalDonations: donations.length,
            activeDonations: donations.filter(d => d.status === 'available').length,
            completedDonations: donations.filter(d => d.status === 'completed').length,
            totalReceived: userProfile?.role === 'receiver' ? donations.length : 0,
            impactScore: donations.filter(d => d.status === 'completed').length * 10
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

  const renderDonorDashboard = () => (
    <>
      {/* Quick Actions */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-donation')}
              size="large"
            >
              Create Donation
            </Button>
            <Button
              variant="outlined"
              startIcon={<Restaurant />}
              onClick={() => navigate('/my-donations')}
            >
              My Donations
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Expiring Soon Alert */}
      {upcomingExpiry.length > 0 && (
        <Grid item xs={12}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/my-donations')}>
                View All
              </Button>
            }
          >
            <Typography variant="subtitle2">
              {upcomingExpiry.length} donation{upcomingExpiry.length > 1 ? 's' : ''} expiring within 12 hours!
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
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Restaurant />}
              onClick={() => navigate('/browse')}
              size="large"
            >
              Browse Donations
            </Button>
            <Button
              variant="outlined"
              startIcon={<LocalDining />}
              onClick={() => navigate('/my-claims')}
            >
              My Claims
            </Button>
            <Button
              variant="outlined"
              startIcon={<Star />}
              onClick={() => navigate('/favorites')}
            >
              Favorites
            </Button>
          </Box>
        </Paper>
      </Grid>
    </>
  );

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
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1 }}>
              <Restaurant sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {stats.totalDonations}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userProfile?.role === 'donor' ? 'Total Donations' : 'Total Claims'}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ color: 'success.main', mb: 1 }}>
              <Schedule sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {stats.activeDonations}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ color: 'info.main', mb: 1 }}>
              <CheckCircle sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {stats.completedDonations}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ color: 'warning.main', mb: 1 }}>
              <EnergySavingsLeaf sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {stats.impactScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Impact Score
            </Typography>
          </Card>
        </Grid>

        {/* Role-specific sections */}
        {userProfile?.role === 'donor' ? renderDonorDashboard() : renderReceiverDashboard()}

        {/* Recent Activity */}
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

        {/* Notifications */}
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

      {/* Floating Action Button */}
      {userProfile?.role === 'donor' && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/create-donation')}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Dashboard;