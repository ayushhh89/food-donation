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
import './Dashboard.css';

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
      <Container maxWidth="xl" className="dashboard-container">
        <Box className="welcome-section">
          <Skeleton variant="text" width="40%" height={60} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="60%" height={30} sx={{ mx: 'auto' }} />
        </Box>
        <Grid container spacing={3} className="stats-grid">
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="stats-card">
                <Box className="stats-icon">
                  <Skeleton variant="circular" width={48} height={48} />
                </Box>
                <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4} className="main-content" sx={{ flexDirection: 'column !important' }}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4, mb: 3 }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="dashboard-container">
      <Box className="welcome-section">
        <Typography variant="h3" className="welcome-title">
          {getGreeting()} {userProfile?.name?.split(' ')[0]}🌱
        </Typography>
        <Typography variant="body1" className="welcome-subtitle">
          {userProfile?.role === 'donor'
            ? 'Share the gift of food and make a difference today!'
            : 'Discover fresh food donations for your community!'}
        </Typography>
      </Box>

      <Grid container spacing={3} className="stats-grid">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <Box className="stats-icon primary">
              <Restaurant />
            </Box>
            <Typography variant="h4" className="stats-value primary">
              {stats.totalDonations}
            </Typography>
            <Typography variant="body2" className="stats-label">
              {userProfile?.role === 'donor' ? 'Total Donations' : 'Total Claims'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <Box className="stats-icon success">
              <Schedule />
            </Box>
            <Typography variant="h4" className="stats-value success">
              {stats.activeDonations}
            </Typography>
            <Typography variant="body2" className="stats-label">
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <Box className="stats-icon info">
              <CheckCircle />
            </Box>
            <Typography variant="h4" className="stats-value info">
              {stats.completedDonations}
            </Typography>
            <Typography variant="body2" className="stats-label">
              Completed
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <Box className="stats-icon warning">
              <EnergySavingsLeaf />
            </Box>
            <Typography variant="h4" className="stats-value warning">
              {stats.impactScore}
            </Typography>
            <Typography variant="body2" className="stats-label">
              Impact Score
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {upcomingExpiry.length > 0 && userProfile?.role === 'donor' && (
        <Box className="alert-section">
          <Alert
            severity="warning"
            className="expiring-alert"
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/my-donations')}>
                View All
              </Button>
            }
          >
            <Typography variant="subtitle1">
              {upcomingExpiry.length} donation{upcomingExpiry.length > 1 ? 's' : ''} expiring soon!
            </Typography>
          </Alert>
        </Box>
      )}

      <Grid container spacing={4} className="main-content" sx={{ flexDirection: 'column !important' }}>
        <Grid item xs={12}>
          <Paper className="quick-actions-card">
            <Typography variant="h6" className="card-title">Quick Actions</Typography>
            <Box className="quick-actions-grid">
              {userProfile?.role === 'donor' ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/create-donation')}
                    className="action-button primary-action"
                  >
                    Create Donation
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Restaurant />}
                    onClick={() => navigate('/my-donations')}
                    className="action-button secondary-action"
                  >
                    My Donations
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/analytics')}
                    className="action-button secondary-action"
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
                    className="action-button primary-action"
                  >
                    Browse Donations
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LocalDining />}
                    onClick={() => navigate('/my-claims')}
                    className="action-button secondary-action"
                  >
                    My Claims
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Star />}
                    onClick={() => navigate('/favorites')}
                    className="action-button secondary-action"
                  >
                    Favorites
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className="recent-activity-card">
            <Box className="card-header">
              <Typography variant="h6" className="card-title">Recent Activity</Typography>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate(userProfile?.role === 'donor' ? '/my-donations' : '/my-claims')}
                className="view-all-button"
              >
                View All
              </Button>
            </Box>
            {recentActivity.length === 0 ? (
              <Box className="no-content">
                <Typography variant="body2" className="no-content-text">
                  No recent activity
                </Typography>
                <Button
                  variant="outlined"
                  className="no-content-button"
                  onClick={() => navigate(userProfile?.role === 'donor' ? '/create-donation' : '/browse')}
                >
                  {userProfile?.role === 'donor' ? 'Create First Donation' : 'Browse Donations'}
                </Button>
              </Box>
            ) : (
              <List className="activity-list">
                {recentActivity.map((item) => (
                  <ListItem key={item.id} className="activity-item">
                    <ListItemAvatar>
                      <Avatar className={`avatar-${getStatusColor(item.status)}`}>
                        <Restaurant />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" className="activity-date">
                            {format(item.createdAt?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
                          </Typography>
                          <Chip
                            label={item.status}
                            size="small"
                            color={getStatusColor(item.status)}
                            className="status-chip"
                          />
                        </Box>
                      }
                    />
                    <IconButton onClick={() => navigate(`/donation/${item.id}`)} className="view-icon">
                      <Visibility />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className="notifications-card">
            <Box className="card-header">
              <Typography variant="h6" className="card-title">Notifications</Typography>
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </Box>
            {notifications.length === 0 ? (
              <Box className="no-content">
                <Typography variant="body2" className="no-content-text">
                  No new notifications
                </Typography>
              </Box>
            ) : (
              <List className="notifications-list">
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    className={`notification-item ${notification.read ? '' : 'unread'}`}
                  >
                    <ListItemText
                      primary={notification.title || 'New Notification'}
                      secondary={
                        <Typography variant="caption" className="notification-date">
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

      {/* {userProfile?.role === 'donor' && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/create-donation')}
          className="fab"
        >
          <Add />
        </Fab>
      )} */}
    </Container>
  );
};

export default Dashboard;