// src/components/receiver/DonationFeed.js - ENHANCED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Fab,
  Badge,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Search,
  FilterList,
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
  Visibility,
  CheckCircle,
  Warning,
  TuneRounded,
  Close,
  SortRounded,
  MapRounded
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

const foodCategories = [
  'All Categories',
  'Cooked Meals', 'Raw Ingredients', 'Packaged Foods', 'Baked Goods',
  'Dairy Products', 'Fruits & Vegetables', 'Beverages', 'Other'
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'closest', label: 'Nearest' }
];

const DonationFeed = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    vegetarian: false,
    vegan: false,
    halal: false,
    kosher: false,
    glutenFree: false,
    maxDistance: 25,
    expiringWithin: 24 // hours
  });

  // Real-time donations listener
  useEffect(() => {
    const donationsQuery = query(
      collection(db, 'donations'),
      where('status', '==', 'available'),
      where('expiryDate', '>', new Date()),
      orderBy('expiryDate'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(donationsQuery, (snapshot) => {
      const donationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date()
      }));
      
      setDonations(donationsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching donations:', error);
      setLoading(false);
      toast.error('Error loading donations');
    });

    return () => unsubscribe();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...donations];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(donation =>
        donation.title.toLowerCase().includes(term) ||
        donation.description.toLowerCase().includes(term) ||
        donation.category.toLowerCase().includes(term) ||
        donation.donorName.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(donation => donation.category === categoryFilter);
    }

    // Advanced dietary filters
    if (advancedFilters.vegetarian) {
      filtered = filtered.filter(donation => donation.isVegetarian);
    }
    if (advancedFilters.vegan) {
      filtered = filtered.filter(donation => donation.isVegan);
    }
    if (advancedFilters.halal) {
      filtered = filtered.filter(donation => donation.isHalal);
    }
    if (advancedFilters.kosher) {
      filtered = filtered.filter(donation => donation.isKosher);
    }
    if (advancedFilters.glutenFree) {
      filtered = filtered.filter(donation => 
        !donation.allergens?.includes('Gluten') && 
        !donation.allergens?.includes('gluten')
      );
    }

    // Expiring within filter
    if (advancedFilters.expiringWithin < 24) {
      const cutoffTime = new Date(Date.now() + advancedFilters.expiringWithin * 60 * 60 * 1000);
      filtered = filtered.filter(donation => donation.expiryDate <= cutoffTime);
    }

    // Sort donations
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'expiring':
        filtered.sort((a, b) => a.expiryDate - b.expiryDate);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.interestedReceivers?.length || 0) - (a.interestedReceivers?.length || 0));
        break;
      case 'closest':
        // Would need geolocation implementation
        break;
      default:
        break;
    }

    setFilteredDonations(filtered);
  }, [donations, searchTerm, categoryFilter, advancedFilters, sortBy]);

  const handleShowInterest = async (donationId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userProfile?.role !== 'receiver') {
      toast.error('Only food receivers can show interest in donations');
      return;
    }

    setClaimingId(donationId);
    try {
      const donation = donations.find(d => d.id === donationId);
      const donationRef = doc(db, 'donations', donationId);
      const isInterested = donation.interestedReceivers?.includes(currentUser.uid);
      
      if (isInterested) {
        await updateDoc(donationRef, {
          interestedReceivers: arrayRemove(currentUser.uid)
        });
        toast.success('Interest removed');
      } else {
        await updateDoc(donationRef, {
          interestedReceivers: arrayUnion(currentUser.uid),
          viewCount: increment(1)
        });
        toast.success('Interest registered! The donor will be notified.');
      }
    } catch (error) {
      console.error('Error updating interest:', error);
      toast.error('Error updating interest');
    } finally {
      setClaimingId(null);
    }
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setDetailDialog(true);
    
    // Increment view count
    try {
      const donationRef = doc(db, 'donations', donation.id);
      updateDoc(donationRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const now = new Date();
    const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 6;
  };

  const isInterested = (donation) => {
    return donation.interestedReceivers?.includes(currentUser?.uid);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All Categories');
    setSortBy('newest');
    setAdvancedFilters({
      vegetarian: false,
      vegan: false,
      halal: false,
      kosher: false,
      glutenFree: false,
      maxDistance: 25,
      expiringWithin: 24
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Restaurant color="primary" />
          Available Donations
          <Badge badgeContent={filteredDonations.length} color="primary" />
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover fresh food donations in your area. Every meal counts!
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {foodCategories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                startAdornment={<SortRounded />}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<TuneRounded />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ minWidth: 'auto' }}
              >
                Filters
              </Button>
              <Tooltip title="View on Map">
                <IconButton onClick={() => navigate('/map')}>
                  <MapRounded />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Advanced Filters
              </Typography>
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Dietary Preferences
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {[
                    { key: 'vegetarian', label: 'Vegetarian' },
                    { key: 'vegan', label: 'Vegan' },
                    { key: 'halal', label: 'Halal' },
                    { key: 'kosher', label: 'Kosher' },
                    { key: 'glutenFree', label: 'Gluten Free' }
                  ].map(filter => (
                    <Chip
                      key={filter.key}
                      label={filter.label}
                      onClick={() => setAdvancedFilters(prev => ({
                        ...prev,
                        [filter.key]: !prev[filter.key]
                      }))}
                      color={advancedFilters[filter.key] ? "primary" : "default"}
                      variant={advancedFilters[filter.key] ? "filled" : "outlined"}
                    />
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  Expiring Within (hours)
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={advancedFilters.expiringWithin}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    expiringWithin: e.target.value
                  }))}
                >
                  <MenuItem value={1}>1 hour</MenuItem>
                  <MenuItem value={6}>6 hours</MenuItem>
                  <MenuItem value={12}>12 hours</MenuItem>
                  <MenuItem value={24}>24 hours</MenuItem>
                  <MenuItem value={48}>48 hours</MenuItem>
                  <MenuItem value={168}>1 week</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Found {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        
        {filteredDonations.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<MapRounded />}
            onClick={() => navigate('/map')}
          >
            View on Map
          </Button>
        )}
      </Box>

      {/* Donations Grid */}
      {filteredDonations.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No donations found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your search criteria or check back later for new donations.
          </Typography>
          <Button variant="outlined" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredDonations.map((donation) => {
            const timeRemaining = formatDistanceToNow(donation.expiryDate, { addSuffix: true });
            const interestedCount = donation.interestedReceivers?.length || 0;
            const isUserInterested = isInterested(donation);
            const isExpiring = isExpiringSoon(donation.expiryDate);

            return (
              <Grid item xs={12} sm={6} md={4} key={donation.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    transition: 'all 0.3s ease'
                  }
                }}>
                  {/* Urgency Badge */}
                  {isExpiring && (
                    <Chip
                      label="Expiring Soon!"
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                        fontWeight: 'bold'
                      }}
                    />
                  )}

                  {/* Interest Badge */}
                  {isUserInterested && (
                    <Chip
                      label="Interested"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                    />
                  )}

                  {/* Image */}
                  {donation.images && donation.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="220"
                      image={donation.images[0]}
                      alt={donation.title}
                      onClick={() => handleViewDetails(donation)}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewDetails(donation)}
                    >
                      <Restaurant sx={{ fontSize: 60, color: 'text.secondary' }} />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1, cursor: 'pointer' }}
                      onClick={() => handleViewDetails(donation)}>
                      {donation.title}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={donation.category} size="small" color="primary" variant="outlined" />
                      {donation.servingSize && (
                        <Chip label={donation.servingSize} size="small" variant="outlined" />
                      )}
                      {donation.isVegetarian && (
                        <Chip label="Vegetarian" size="small" color="success" />
                      )}
                      {donation.isVegan && (
                        <Chip label="Vegan" size="small" color="success" />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {donation.description.length > 120 
                        ? `${donation.description.substring(0, 120)}...` 
                        : donation.description
                      }
                    </Typography>

                    {/* Donor Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" display="block">
                          {donation.donorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {donation.pickupAddress && (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 12 }} />
                              {donation.pickupAddress.substring(0, 30)}...
                            </Box>
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Time Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Posted {formatDistanceToNow(donation.createdAt, { addSuffix: true })}
                      </Typography>
                      <Typography variant="caption" color={isExpiring ? "error.main" : "text.secondary"}>
                        Expires {timeRemaining}
                      </Typography>
                    </Box>

                    {/* Allergen Warning */}
                    {donation.allergens && donation.allergens.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 2, py: 0 }}>
                        <Typography variant="caption">
                          Contains: {donation.allergens.join(', ')}
                        </Typography>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} justifyContent="space-between">
                      <Button
                        variant={isUserInterested ? "contained" : "outlined"}
                        color={isUserInterested ? "success" : "primary"}
                        onClick={() => handleShowInterest(donation.id)}
                        startIcon={
                          claimingId === donation.id ? 
                            <CircularProgress size={16} /> : 
                            (isUserInterested ? <CheckCircle /> : <Favorite />)
                        }
                        size="small"
                        sx={{ flex: 1 }}
                        disabled={claimingId === donation.id}
                      >
                        {claimingId === donation.id ? 'Processing...' : 
                         (isUserInterested ? 'Interested' : 'Show Interest')}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(donation)}
                        startIcon={<Visibility />}
                      >
                        Details
                      </Button>
                    </Stack>

                    {/* Interest Count */}
                    {interestedCount > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {interestedCount} other{interestedCount !== 1 ? 's' : ''} interested
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Floating Action Button for donors */}
      {userProfile?.role === 'donor' && (
        <Fab
          color="primary"
          aria-label="add donation"
          onClick={() => navigate('/create-donation')}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <Restaurant />
        </Fab>
      )}

      {/* Donation Details Dialog */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedDonation && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h5">
                  {selectedDonation.title}
                </Typography>
                <IconButton onClick={() => setDetailDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={selectedDonation.category} size="small" color="primary" />
                {selectedDonation.isVegetarian && <Chip label="Vegetarian" size="small" color="success" />}
                {selectedDonation.isVegan && <Chip label="Vegan" size="small" color="success" />}
                {selectedDonation.isHalal && <Chip label="Halal" size="small" color="info" />}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {/* Images */}
              {selectedDonation.images && selectedDonation.images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={1}>
                    {selectedDonation.images.map((image, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <img 
                          src={image} 
                          alt={`${selectedDonation.title} ${index + 1}`}
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Description */}
              <Typography variant="body1" paragraph>
                {selectedDonation.description}
              </Typography>

              {/* Details Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedDonation.quantity && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Quantity</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDonation.quantity} {selectedDonation.unit}
                    </Typography>
                  </Grid>
                )}
                
                {selectedDonation.servingSize && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Serving Size</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDonation.servingSize}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Best Before</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(selectedDonation.expiryDate, 'MMM d, yyyy HH:mm')}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Posted</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDistanceToNow(selectedDonation.createdAt, { addSuffix: true })}
                  </Typography>
                </Grid>
              </Grid>

              {/* Allergens */}
              {selectedDonation.allergens && selectedDonation.allergens.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Allergens
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedDonation.allergens.map(allergen => (
                      <Chip key={allergen} label={allergen} size="small" color="error" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Pickup Information */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pickup Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDonation.pickupAddress}
                </Typography>
              </Box>

              {selectedDonation.pickupInstructions && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pickup Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDonation.pickupInstructions}
                  </Typography>
                </Box>
              )}

              {/* Contact Info */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Donor Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {selectedDonation.donorName}
                  </Typography>
                  {isInterested(selectedDonation) && selectedDonation.donorContact && (
                    <Typography variant="body2" color="text.secondary">
                      📞 {selectedDonation.donorContact}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDetailDialog(false)}>
                Close
              </Button>
              <Button
                variant="outlined"
                startIcon={<DirectionsWalk />}
                onClick={() => window.open(`https://www.google.com/maps/search/${selectedDonation.pickupAddress}`, '_blank')}
              >
                Directions
              </Button>
              <Button
                variant="contained"
                onClick={() => handleShowInterest(selectedDonation.id)}
                startIcon={isInterested(selectedDonation) ? <CheckCircle /> : <Favorite />}
                color={isInterested(selectedDonation) ? "success" : "primary"}
                disabled={claimingId === selectedDonation.id}
              >
                {claimingId === selectedDonation.id ? 'Processing...' :
                 (isInterested(selectedDonation) ? 'Already Interested' : 'Show Interest')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DonationFeed;