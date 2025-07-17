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
  DialogActions
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
  Restaurant
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

  useEffect(() => {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Donations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your food donations and track their impact
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ color: 'primary.main', mb: 1 }}>
              <Restaurant sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {tabData.all}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Donations
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ color: 'success.main', mb: 1 }}>
              <Schedule sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {tabData.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ color: 'info.main', mb: 1 }}>
              <CheckCircle sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {tabData.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ color: 'warning.main', mb: 1 }}>
              <TrendingUp sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {tabData.completed * 10}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Impact Score
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label={`All (${tabData.all})`} />
          <Tab label={`Active (${tabData.active})`} />
          <Tab label={`Completed (${tabData.completed})`} />
          <Tab label={`Expired (${tabData.expired})`} />
        </Tabs>
      </Paper>

      {/* Donations Grid */}
      {filteredDonations.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {tabValue === 0 ? 'No donations yet' : 'No donations in this category'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {tabValue === 0 
              ? 'Start sharing your surplus food with the community!'
              : 'Check other tabs to see your donations'
            }
          </Typography>
          {tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-donation')}
            >
              Create First Donation
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredDonations.map((donation) => {
            const timeRemaining = getTimeRemaining(donation.expiryDate);
            const interestedCount = donation.interestedReceivers?.length || 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={donation.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  {/* Status badge */}
                  <Chip
                    label={donation.status}
                    color={getStatusColor(donation.status)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      textTransform: 'capitalize'
                    }}
                  />

                  {/* Menu button */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      zIndex: 1
                    }}
                    onClick={(e) => handleMenuOpen(e, donation)}
                  >
                    <MoreVert />
                  </IconButton>

                  {/* Image */}
                  {donation.images && donation.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="180"
                      image={donation.images[0]}
                      alt={donation.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100'
                      }}
                    >
                      <Restaurant sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Title */}
                    <Typography variant="h6" component="h3" gutterBottom>
                      {donation.title}
                    </Typography>

                    {/* Category and quantity */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={donation.category} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${donation.quantity} ${donation.unit}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {donation.pickupLocation?.length > 30 
                          ? `${donation.pickupLocation.substring(0, 30)}...` 
                          : donation.pickupLocation
                        }
                      </Typography>
                    </Box>

                    {/* Time remaining */}
                    {timeRemaining && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Schedule sx={{ 
                          fontSize: 16, 
                          mr: 0.5, 
                          color: timeRemaining.urgent ? 'error.main' : 'text.secondary' 
                        }} />
                        <Typography 
                          variant="body2" 
                          color={timeRemaining.urgent ? 'error.main' : 'text.secondary'}
                          sx={{ fontWeight: timeRemaining.urgent ? 'medium' : 'normal' }}
                        >
                          {timeRemaining.text} remaining
                        </Typography>
                      </Box>
                    )}

                    {/* Interested users */}
                    {interestedCount > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main">
                          {interestedCount} interested receiver{interestedCount > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}

                    {/* Posted date */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                      Posted {donation.createdAt.toLocaleDateString()}
                    </Typography>

                    {/* Actions */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/donation/${donation.id}`)}
                      >
                        View
                      </Button>
                      {donation.status === 'available' && (
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => navigate(`/edit-donation/${donation.id}`)}
                        >
                          Edit
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/donation/${selectedDonation?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedDonation?.status === 'available' && (
          <MenuItem onClick={() => {
            navigate(`/edit-donation/${selectedDonation?.id}`);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}

        {selectedDonation?.status === 'claimed' && (
          <MenuItem onClick={() => markAsCompleted(selectedDonation?.id)}>
            <CheckCircle sx={{ mr: 1 }} />
            Mark as Completed
          </MenuItem>
        )}

        {(selectedDonation?.status === 'available' || selectedDonation?.status === 'expired') && (
          <MenuItem 
            onClick={() => {
              setDeleteDialog(true);
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Donation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{selectedDonation?.title}"? This action cannot be undone.
          </Typography>
          {selectedDonation?.interestedReceivers?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {selectedDonation.interestedReceivers.length} user(s) have shown interest in this donation.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add donation"
        onClick={() => navigate('/create-donation')}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default MyDonations;