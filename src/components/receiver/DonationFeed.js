// src/components/receiver/DonationFeed.js - FIXED VERSION
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
  Skeleton,
  Slide,
  Collapse
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
  MapRounded,
  Star,
  AccessTime,
  GroupAdd,
  ExpandMore,
  ExpandLess,
  LocalDining,
  EmojiEvents,
  Add
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
  { value: 'newest', label: 'Newest First', icon: <AccessTime /> },
  { value: 'expiring', label: 'Expiring Soon', icon: <Warning /> },
  { value: 'popular', label: 'Most Popular', icon: <Star /> },
  { value: 'closest', label: 'Nearest', icon: <LocationOn /> }
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={500}
                  sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                />
              </Grid>
            ))}
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
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    color: 'white',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <LocalDining sx={{ fontSize: 48 }} />
                  Available Donations
                  <Badge 
                    badgeContent={filteredDonations.length} 
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        height: 28,
                        minWidth: 28
                      }
                    }}
                  />
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    maxWidth: 600,
                    fontWeight: 500
                  }}
                >
                  Discover fresh food donations in your area. Every meal counts! 🌟
                </Typography>
              </Box>
              
              <Box>
                <Button
                  variant="contained"
                  startIcon={<MapRounded />}
                  onClick={() => navigate('/map')}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  View on Map
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Enhanced Search and Filters */}
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
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search donations, categories, donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      '& fieldset': {
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover fieldset': {
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid rgba(255, 255, 255, 0.8)'
                      },
                      '& .MuiSelect-icon': {
                        color: 'white'
                      }
                    }}
                  >
                    {foodCategories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid rgba(255, 255, 255, 0.8)'
                      },
                      '& .MuiSelect-icon': {
                        color: 'white'
                      }
                    }}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.icon}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Filters
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Advanced Filters
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={clearFilters}
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        color: 'white',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Clear All
                  </Button>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      🥗 Dietary Preferences
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {[
                        { key: 'vegetarian', label: '🌱 Vegetarian', color: '#4CAF50' },
                        { key: 'vegan', label: '🌿 Vegan', color: '#2E7D32' },
                        { key: 'halal', label: '🕌 Halal', color: '#00BCD4' },
                        { key: 'kosher', label: '✡️ Kosher', color: '#3F51B5' },
                        { key: 'glutenFree', label: '🌾 Gluten Free', color: '#FF9800' }
                      ].map(filter => (
                        <Chip
                          key={filter.key}
                          label={filter.label}
                          onClick={() => setAdvancedFilters(prev => ({
                            ...prev,
                            [filter.key]: !prev[filter.key]
                          }))}
                          sx={{
                            background: advancedFilters[filter.key] 
                              ? `linear-gradient(135deg, ${filter.color} 0%, ${filter.color}CC 100%)`
                              : 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            fontWeight: 600,
                            border: `1px solid ${advancedFilters[filter.key] ? filter.color : 'rgba(255, 255, 255, 0.3)'}`,
                            '&:hover': {
                              background: advancedFilters[filter.key] 
                                ? `linear-gradient(135deg, ${filter.color} 0%, ${filter.color}DD 100%)`
                                : 'rgba(255, 255, 255, 0.2)',
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 16px ${filter.color}40`
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      ⏰ Expiring Within
                    </Typography>
                    <Select
                      fullWidth
                      value={advancedFilters.expiringWithin}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        expiringWithin: e.target.value
                      }))}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        },
                        '& .MuiSelect-icon': {
                          color: 'white'
                        }
                      }}
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
            </Collapse>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card
          sx={{
            mb: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ py: 2, px: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                🍽️ Found {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </Typography>
              
              {filteredDonations.length > 0 && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapRounded />}
                    onClick={() => navigate('/map')}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Map View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EmojiEvents />}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Top Picks
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Fixed Donations Grid */}
        {filteredDonations.length === 0 ? (
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              textAlign: 'center',
              py: 8
            }}
          >
            <CardContent>
              <Restaurant sx={{ fontSize: 120, color: 'rgba(255, 255, 255, 0.6)', mb: 3 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                No donations found
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4, maxWidth: 500, mx: 'auto' }}>
                Try adjusting your search criteria or check back later for new donations.
              </Typography>
              <Button 
                variant="contained" 
                onClick={clearFilters}
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {filteredDonations.map((donation) => {
              const timeRemaining = formatDistanceToNow(donation.expiryDate, { addSuffix: true });
              const interestedCount = donation.interestedReceivers?.length || 0;
              const isUserInterested = isInterested(donation);
              const isExpiring = isExpiringSoon(donation.expiryDate);

              return (
                <Grid item xs={12} sm={6} lg={4} key={donation.id}>
                  <Card 
                    sx={{ 
                      height: 580, // Fixed height for consistency
                      display: 'flex', 
                      flexDirection: 'column',
                      position: 'relative',
                      background: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        '& .donation-image': {
                          transform: 'scale(1.05)'
                        }
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {/* Fixed Image Section */}
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      {/* Status Badge - Fixed Position */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          {isExpiring && (
                            <Chip
                              label="⚡ Expiring Soon!"
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                height: 28,
                                boxShadow: '0 4px 16px rgba(244, 67, 54, 0.4)'
                              }}
                            />
                          )}
                          
                          {isUserInterested && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 16 }} />}
                              label="Interested"
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                height: 28,
                                boxShadow: '0 4px 16px rgba(0, 200, 83, 0.4)'
                              }}
                            />
                          )}
                        </Stack>
                      </Box>

                      {donation.images && donation.images.length > 0 ? (
                        <CardMedia
                          component="img"
                          className="donation-image"
                          height="200"
                          image={donation.images[0]}
                          alt={donation.title}
                          onClick={() => handleViewDetails(donation)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleViewDetails(donation)}
                        >
                          <Restaurant sx={{ fontSize: 60, color: '#bbb' }} />
                        </Box>
                      )}
                    </Box>
                    
                    {/* Fixed Content Section */}
                    <CardContent sx={{ 
                      flex: 1, 
                      p: 3, 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {/* Top Content */}
                      <Box>
                        {/* Title */}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2, 
                            cursor: 'pointer',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            height: 52, // Fixed height
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                          onClick={() => handleViewDetails(donation)}
                        >
                          {donation.title}
                        </Typography>

                        {/* Tags - Fixed Layout */}
                        <Box sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip 
                              label={donation.category} 
                              size="small" 
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 24
                              }}
                            />
                            {donation.servingSize && (
                              <Chip 
                                label={`👥 ${donation.servingSize}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 600, 
                                  fontSize: '0.7rem', 
                                  height: 24,
                                  borderColor: '#667eea',
                                  color: '#667eea'
                                }}
                              />
                            )}
                            {donation.isVegetarian && (
                              <Chip 
                                label="🌱" 
                                size="small" 
                                sx={{
                                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  minWidth: 32
                                }}
                              />
                            )}
                            {donation.isVegan && (
                              <Chip 
                                label="🌿" 
                                size="small" 
                                sx={{
                                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  minWidth: 32
                                }}
                              />
                            )}
                          </Stack>
                        </Box>

                        {/* Description - Fixed Height */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            lineHeight: 1.5,
                            height: 60, // Fixed height
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.85rem'
                          }}
                        >
                          {donation.description}
                        </Typography>

                        {/* Donor Info - Fixed Layout */}
                        <Box sx={{ mb: 2, height: 48 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 700,
                                fontSize: '0.9rem'
                              }}
                            >
                              {donation.donorName.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  lineHeight: 1.2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {donation.donorName}
                              </Typography>
                              {donation.pickupAddress && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: '0.7rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <LocationOn sx={{ fontSize: 12 }} />
                                  {donation.pickupAddress.substring(0, 25)}...
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>

                        {/* Time Info */}
                        <Box sx={{ mb: 2, height: 32 }}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                            📅 {formatDistanceToNow(donation.createdAt, { addSuffix: true })}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: isExpiring ? "#f44336" : "text.secondary",
                              fontWeight: isExpiring ? 600 : 400,
                              fontSize: '0.7rem'
                            }}
                          >
                            ⏰ Expires {timeRemaining}
                          </Typography>
                        </Box>

                        {/* Allergen Warning - Fixed Height */}
                        <Box sx={{ mb: 2, height: donation.allergens?.length > 0 ? 48 : 0 }}>
                          {donation.allergens && donation.allergens.length > 0 && (
                            <Alert 
                              severity="warning" 
                              sx={{ 
                                py: 0.5,
                                px: 1,
                                borderRadius: 2,
                                fontSize: '0.7rem',
                                '& .MuiAlert-message': {
                                  fontSize: '0.7rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                },
                                '& .MuiAlert-icon': {
                                  fontSize: '1rem'
                                }
                              }}
                            >
                              Contains: {donation.allergens.slice(0, 2).join(', ')}{donation.allergens.length > 2 ? '...' : ''}
                            </Alert>
                          )}
                        </Box>
                      </Box>

                      {/* Bottom Fixed Actions */}
                      <Box>
                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                          <Button
                            variant={isUserInterested ? "contained" : "outlined"}
                            onClick={() => handleShowInterest(donation.id)}
                            startIcon={
                              claimingId === donation.id ? 
                                <CircularProgress size={16} color="inherit" /> : 
                                (isUserInterested ? <CheckCircle /> : <Favorite />)
                            }
                            sx={{
                              flex: 1,
                              py: 1.5,
                              borderRadius: 3,
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              ...(isUserInterested ? {
                                background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 16px rgba(0, 200, 83, 0.4)'
                                }
                              } : {
                                borderColor: '#667eea',
                                color: '#667eea',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                  borderColor: '#5a6fd8',
                                  transform: 'translateY(-1px)'
                                }
                              }),
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            disabled={claimingId === donation.id}
                          >
                            {claimingId === donation.id ? 'Processing...' : 
                             (isUserInterested ? 'Interested' : 'Interest')}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            onClick={() => handleViewDetails(donation)}
                            startIcon={<Visibility />}
                            sx={{
                              px: 3,
                              py: 1.5,
                              borderRadius: 3,
                              borderColor: '#667eea',
                              color: '#667eea',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                borderColor: '#5a6fd8',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            Details
                          </Button>
                        </Stack>

                        {/* Interest Count - Fixed Height */}
                        <Box sx={{ height: 20 }}>
                          {interestedCount > 0 && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontWeight: 500,
                                fontSize: '0.7rem'
                              }}
                            >
                              <GroupAdd sx={{ fontSize: 14 }} />
                              {interestedCount} other{interestedCount !== 1 ? 's' : ''} interested
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Enhanced Floating Action Button */}
        {userProfile?.role === 'donor' && (
          <Fab
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
              boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 48px rgba(0, 200, 83, 0.5)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => navigate('/create-donation')}
          >
            <Add sx={{ fontSize: 36, color: 'white' }} />
          </Fab>
        )}

        {/* Enhanced Donation Details Dialog */}
        <Dialog 
          open={detailDialog} 
          onClose={() => setDetailDialog(false)} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          {selectedDonation && (
            <>
              <DialogTitle sx={{ pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {selectedDonation.title}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip 
                        label={selectedDonation.category} 
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      {selectedDonation.isVegetarian && (
                        <Chip 
                          label="🌱 Vegetarian" 
                          sx={{
                            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      )}
                      {selectedDonation.isVegan && (
                        <Chip 
                          label="🌿 Vegan" 
                          sx={{
                            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      )}
                      {selectedDonation.isHalal && (
                        <Chip 
                          label="🕌 Halal" 
                          sx={{
                            background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                  <IconButton 
                    onClick={() => setDetailDialog(false)}
                    sx={{
                      background: 'rgba(244, 67, 54, 0.1)',
                      color: '#f44336',
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Close />
                  </IconButton>
                </Stack>
              </DialogTitle>
              
              <DialogContent sx={{ px: 3 }}>
                {/* Enhanced Images Grid */}
                {selectedDonation.images && selectedDonation.images.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                      {selectedDonation.images.map((image, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              borderRadius: 3,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover img': {
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <img 
                              src={image} 
                              alt={`${selectedDonation.title} ${index + 1}`}
                              style={{ 
                                width: '100%', 
                                height: 140, 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Enhanced Description */}
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                  {selectedDonation.description}
                </Typography>

                {/* Enhanced Details Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {selectedDonation.quantity && (
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          {selectedDonation.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedDonation.unit || 'Units'}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedDonation.servingSize && (
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          👥 {selectedDonation.servingSize}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Servings
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                      <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>
                        ⏰ {formatDistanceToNow(selectedDonation.expiryDate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Until expiry
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        👀 {selectedDonation.viewCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Views
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Enhanced Allergens */}
                {selectedDonation.allergens && selectedDonation.allergens.length > 0 && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 4, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                      border: '1px solid rgba(255, 193, 7, 0.3)'
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      ⚠️ Allergen Information
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedDonation.allergens.map(allergen => (
                        <Chip 
                          key={allergen} 
                          label={allergen} 
                          size="small" 
                          sx={{
                            background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Stack>
                  </Alert>
                )}

                {/* Enhanced Pickup Information */}
                <Paper sx={{ p: 4, borderRadius: 4, mb: 4, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.02) 100%)' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#667eea', mb: 3 }}>
                    📍 Pickup Information
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Address
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {selectedDonation.pickupAddress}
                      </Typography>
                    </Box>

                    {selectedDonation.pickupInstructions && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Pickup Instructions
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {selectedDonation.pickupInstructions}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>

                {/* Enhanced Donor Information */}
                <Paper sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#00C853', mb: 3 }}>
                    👤 Donor Information
                  </Typography>
                  
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar 
                      sx={{ 
                        width: 72, 
                        height: 72,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2rem',
                        fontWeight: 700
                      }}
                    >
                      {selectedDonation.donorName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedDonation.donorName}
                      </Typography>
                      {isInterested(selectedDonation) && selectedDonation.donorContact && (
                        <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 20 }} />
                          {selectedDonation.donorContact}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Member since {format(selectedDonation.createdAt, 'MMMM yyyy')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </DialogContent>
              
              <DialogActions sx={{ p: 4, gap: 2 }}>
                <Button 
                  onClick={() => setDetailDialog(false)}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DirectionsWalk />}
                  onClick={() => window.open(`https://www.google.com/maps/search/${selectedDonation.pickupAddress}`, '_blank')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      borderColor: '#5a6fd8'
                    }
                  }}
                >
                  Get Directions
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleShowInterest(selectedDonation.id)}
                  startIcon={isInterested(selectedDonation) ? <CheckCircle /> : <Favorite />}
                  disabled={claimingId === selectedDonation.id}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    background: isInterested(selectedDonation) 
                      ? 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: isInterested(selectedDonation)
                        ? 'linear-gradient(135deg, #00B248 0%, #43A047 100%)'
                        : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {claimingId === selectedDonation.id ? 'Processing...' :
                   (isInterested(selectedDonation) ? 'Already Interested ✓' : 'Show Interest')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>

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

export default DonationFeed;