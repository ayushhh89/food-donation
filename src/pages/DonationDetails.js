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
  TextField
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
  MoreVert
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!donation) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Donation not found or has been removed.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {donation.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip 
                label={donation.status} 
                color={donation.status === 'available' ? 'success' : 'warning'}
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip label={donation.category} variant="outlined" />
              {donation.isVegetarian && <Chip label="Vegetarian" color="success" size="small" />}
              {donation.isVegan && <Chip label="Vegan" color="success" size="small" />}
              {donation.isHalal && <Chip label="Halal" color="info" size="small" />}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleShare}>
              <Share />
            </IconButton>
            {isOwner && (
              <>
                <IconButton onClick={() => navigate(`/edit-donation/${donation.id}`)}>
                  <Edit />
                </IconButton>
                <IconButton color="error">
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Images and Description */}
        <Grid item xs={12} md={8}>
          {/* Images */}
          {donation.images && donation.images.length > 0 && (
            <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 3 }}>
              <CardMedia
                component="img"
                height="400"
                image={donation.images[0]}
                alt={donation.title}
                sx={{ objectFit: 'cover' }}
              />
              {donation.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
                  {donation.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${donation.title} ${index + 2}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          )}

          {/* Description */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {donation.description}
            </Typography>

            {/* Details Grid */}
            <Grid container spacing={2}>
              {donation.quantity && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2">Quantity</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {donation.quantity} {donation.unit}
                  </Typography>
                </Grid>
              )}
              
              {donation.servingSize && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2">Serving Size</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {donation.servingSize}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2">Best Before</Typography>
                <Typography 
                  variant="body2" 
                  color={timeRemaining?.urgent ? 'error.main' : 'text.secondary'}
                  sx={{ fontWeight: timeRemaining?.urgent ? 'medium' : 'normal' }}
                >
                  {format(donation.expiryDate, 'MMM d, yyyy HH:mm')}
                  {timeRemaining && (
                    <span style={{ display: 'block', fontSize: '0.8em' }}>
                      ({timeRemaining.text} remaining)
                    </span>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Allergen Information */}
          {donation.allergens && donation.allergens.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Allergen Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {donation.allergens.map(allergen => (
                  <Chip key={allergen} label={allergen} size="small" color="error" variant="outlined" />
                ))}
              </Box>
            </Alert>
          )}

          {/* Pickup Instructions */}
          {donation.pickupInstructions && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pickup Instructions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {donation.pickupInstructions}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Donor Info and Actions */}
        <Grid item xs={12} md={4}>
          {/* Time Warning */}
          {timeRemaining?.urgent && (
            <Alert severity={timeRemaining.expired ? "error" : "warning"} sx={{ mb: 3 }}>
              <Typography variant="subtitle2">
                {timeRemaining.expired ? "This donation has expired" : "Expires soon!"}
              </Typography>
              <Typography variant="body2">
                {timeRemaining.text} {timeRemaining.expired ? "" : "remaining"}
              </Typography>
            </Alert>
          )}

          {/* Action Buttons */}
          {canShowInterest && (
            <Card sx={{ p: 3, mb: 3, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interested in this donation?
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleShowInterest}
                disabled={claiming}
                startIcon={claiming ? <CircularProgress size={20} /> : (isInterested ? <CheckCircle /> : <Favorite />)}
                color={isInterested ? "success" : "primary"}
                sx={{ mb: 2 }}
              >
                {claiming ? 'Processing...' : (isInterested ? 'Already Interested' : 'Show Interest')}
              </Button>
              
              {isInterested && donation.donorContact && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Phone />}
                  onClick={handleContactDonor}
                >
                  Contact Donor
                </Button>
              )}
            </Card>
          )}

          {/* Donor Information */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Donor Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {donation.donorName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {donation.organization || 'Individual Donor'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Member since {format(donation.createdAt, 'MMM yyyy')}
            </Typography>
            
            {/* Contact info only shown to interested receivers */}
            {isInterested && donation.donorContact && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body2">
                  📞 {donation.donorContact}
                </Typography>
                {donation.donorEmail && (
                  <Typography variant="body2">
                    ✉️ {donation.donorEmail}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>

          {/* Pickup Location */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pickup Location
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
              <LocationOn color="primary" />
              <Typography variant="body2">
                {donation.pickupAddress}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<DirectionsWalk />}
              onClick={() => window.open(`https://www.google.com/maps/search/${donation.pickupAddress}`, '_blank')}
            >
              Get Directions
            </Button>
          </Paper>

          {/* Interest Stats */}
          {donation.interestedReceivers && donation.interestedReceivers.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interest ({donation.interestedReceivers.length})
              </Typography>
              
              {isOwner ? (
                <List dense>
                  {interestedUsers.map((user) => (
                    <ListItem key={user.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>
                          {user.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.organizationType || 'Individual'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {donation.interestedReceivers.length} receiver{donation.interestedReceivers.length > 1 ? 's' : ''} interested
                </Typography>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Donor</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
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
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Donor Contact Information:
            </Typography>
            <Typography variant="body2">
              📞 {donation.donorContact}
            </Typography>
            {donation.donorEmail && (
              <Typography variant="body2">
                ✉️ {donation.donorEmail}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => window.open(`tel:${donation.donorContact}`, '_blank')}
            variant="contained"
            startIcon={<Phone />}
          >
            Call Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Donation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share this donation with others
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            value={window.location.href}
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>
            Cancel
          </Button>
          <Button onClick={copyToClipboard} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DonationDetails;