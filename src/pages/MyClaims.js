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
  Divider
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
  RateReview
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          This page is only available for food receivers.
        </Alert>
      </Container>
    );
  }

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
          My Claims
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your food requests and pickup status
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
              Total Claims
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
              Available
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ color: 'warning.main', mb: 1 }}>
              <CheckCircle sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {tabData.claimed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Claimed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ color: 'info.main', mb: 1 }}>
              <Star sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {tabData.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
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
          <Tab label={`Available (${tabData.active})`} />
          <Tab label={`Claimed (${tabData.claimed})`} />
          <Tab label={`Completed (${tabData.completed})`} />
          <Tab label={`Other (${tabData.other})`} />
        </Tabs>
      </Paper>

      {/* Claims Grid */}
      {filteredClaims.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {tabValue === 0 ? 'No claims yet' : 'No claims in this category'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {tabValue === 0 
              ? 'Start exploring available food donations!'
              : 'Check other tabs to see your claims'
            }
          </Typography>
          {tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<Restaurant />}
              onClick={() => navigate('/browse')}
            >
              Browse Donations
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredClaims.map((claim) => {
            const statusInfo = getStatusInfo(claim);
            const timeRemaining = claim.expiryDate > new Date() 
              ? formatDistanceToNow(claim.expiryDate, { addSuffix: true })
              : 'Expired';

            return (
              <Grid item xs={12} sm={6} md={4} key={claim.id}>
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
                    label={statusInfo.text}
                    color={statusInfo.color}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1
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
                    onClick={(e) => handleMenuOpen(e, claim)}
                  >
                    <MoreVert />
                  </IconButton>

                  {/* Image */}
                  {claim.images && claim.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="180"
                      image={claim.images[0]}
                      alt={claim.title}
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
                      {claim.title}
                    </Typography>

                    {/* Category and quantity */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={claim.category} 
                        size="small" 
                        variant="outlined"
                      />
                      {claim.servingSize && (
                        <Chip 
                          label={claim.servingSize} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Donor info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {claim.donorName}
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {claim.pickupAddress?.length > 30 
                          ? `${claim.pickupAddress.substring(0, 30)}...` 
                          : claim.pickupAddress
                        }
                      </Typography>
                    </Box>

                    {/* Time info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Expires {timeRemaining}
                      </Typography>
                    </Box>

                    {/* Contact info for claimed items */}
                    {statusInfo.status === 'claimed' && claim.donorContact && (
                      <Alert severity="info" sx={{ mb: 2, py: 0 }}>
                        <Typography variant="caption">
                          📞 {claim.donorContact}
                        </Typography>
                      </Alert>
                    )}

                    {/* Pickup instructions */}
                    {claim.pickupInstructions && statusInfo.status === 'claimed' && (
                      <Alert severity="success" sx={{ mb: 2, py: 0 }}>
                        <Typography variant="caption">
                          📝 {claim.pickupInstructions}
                        </Typography>
                      </Alert>
                    )}

                    {/* Interest date */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                      Interested {formatDistanceToNow(claim.createdAt, { addSuffix: true })}
                    </Typography>

                    {/* Actions */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/donation/${claim.id}`)}
                      >
                        View
                      </Button>
                      {statusInfo.status === 'claimed' && (
                        <Button
                          size="small"
                          startIcon={<DirectionsWalk />}
                          color="success"
                          variant="outlined"
                          onClick={() => window.open(`https://www.google.com/maps/search/${claim.pickupAddress}`, '_blank')}
                        >
                          Directions
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
          navigate(`/donation/${selectedClaim?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {getStatusInfo(selectedClaim).status === 'claimed' && (
          <MenuItem onClick={() => {
            window.open(`tel:${selectedClaim?.donorContact}`, '_blank');
            handleMenuClose();
          }}>
            <Phone sx={{ mr: 1 }} />
            Call Donor
          </MenuItem>
        )}

        {selectedClaim?.status === 'completed' && (
          <MenuItem onClick={() => {
            setReviewDialog(true);
            handleMenuClose();
          }}>
            <RateReview sx={{ mr: 1 }} />
            Leave Review
          </MenuItem>
        )}

        {(getStatusInfo(selectedClaim).status === 'active' || getStatusInfo(selectedClaim).status === 'claimed') && (
          <MenuItem 
            onClick={() => {
              setCancelDialog(true);
            }}
            sx={{ color: 'error.main' }}
          >
            <Cancel sx={{ mr: 1 }} />
            Cancel Interest
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Interest
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to cancel your interest in "{selectedClaim?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            Keep Interest
          </Button>
          <Button
            onClick={handleCancelClaim}
            color="error"
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : <Cancel />}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Interest'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Leave a Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share your experience with this donation
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <Typography variant="body1">Rating:</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                  color={star <= review.rating ? 'primary' : 'default'}
                >
                  <Star />
                </IconButton>
              ))}
            </Box>
          </Box>

          <textarea
            placeholder="Write your review here..."
            value={review.comment}
            onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontFamily: 'inherit'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            startIcon={<RateReview />}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyClaims;