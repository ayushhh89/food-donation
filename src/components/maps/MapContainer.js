import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Directions,
  FilterList,
  Restaurant,
  Close,
  Phone,
  Schedule,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Mock coordinates for demonstration (in real app, you'd geocode addresses)
const mockCoordinates = {
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Miami': { lat: 25.7617, lng: -80.1918 }
};

const MapContainer = () => {
  const { currentUser, userProfile } = useAuth();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  // Initialize map
  useEffect(() => {
    if (!window.google) {
      // Fallback for when Google Maps is not available
      setLoading(false);
      return;
    }

    const initMap = () => {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      setMap(mapInstance);
      setLoading(false);
    };

    if (window.google.maps) {
      initMap();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          if (map) {
            map.setCenter(location);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.info('Could not get your location. Showing default area.');
        }
      );
    }
  }, [map]);

  // Fetch donations
  useEffect(() => {
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'available')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donationsList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Mock coordinates based on city name in address
        let coordinates = { lat: 40.7128, lng: -74.0060 }; // Default NYC
        
        if (data.pickupAddress) {
          Object.entries(mockCoordinates).forEach(([city, coords]) => {
            if (data.pickupAddress.toLowerCase().includes(city.toLowerCase())) {
              coordinates = coords;
            }
          });
        }

        return {
          id: doc.id,
          ...data,
          coordinates
        };
      });
      
      setDonations(donationsList);
    });

    return () => unsubscribe();
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map || !donations.length) return;

    // Clear existing markers
    if (window.google) {
      donations.forEach(donation => {
        const marker = new window.google.maps.Marker({
          position: donation.coordinates,
          map: map,
          title: donation.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="#fff" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🍽️</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        marker.addListener('click', () => {
          setSelectedDonation(donation);
          setDetailDialog(true);
        });
      });
    }

    // Add user location marker if available
    if (userLocation && window.google) {
      new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="13" fill="#2196F3" stroke="#fff" stroke-width="2"/>
              <circle cx="15" cy="15" r="5" fill="#fff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30)
        }
      });
    }
  }, [map, donations, userLocation]);

  const handleShowInterest = async (donation) => {
    if (!currentUser) return;

    try {
      const donationRef = doc(db, 'donations', donation.id);
      await updateDoc(donationRef, {
        interestedReceivers: arrayUnion(currentUser.uid)
      });
      toast.success('Interest registered!');
      setDetailDialog(false);
    } catch (error) {
      console.error('Error showing interest:', error);
      toast.error('Error registering interest');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
          }
        },
        (error) => {
          toast.error('Could not get your location');
        }
      );
    }
  };

  const getDirections = (donation) => {
    if (userLocation && donation.coordinates) {
      const origin = `${userLocation.lat},${userLocation.lng}`;
      const destination = `${donation.coordinates.lat},${donation.coordinates.lng}`;
      const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
      window.open(url, '_blank');
    } else {
      toast.error('Location not available for directions');
    }
  };

  const filteredDonations = filterCategory === 'All' 
    ? donations 
    : donations.filter(d => d.category === filterCategory);

  // Fallback when Google Maps is not available
  if (!window.google && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Donation Map
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Map functionality requires Google Maps API. Showing list view instead.
        </Alert>
        
        {/* List View Fallback */}
        <Box>
          {donations.map(donation => (
            <Card key={donation.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{donation.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {donation.pickupAddress}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={donation.category} size="small" />
                  <Button 
                    size="small" 
                    sx={{ ml: 2 }}
                    onClick={() => {setSelectedDonation(donation); setDetailDialog(true);}}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Donation Map
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            Filter ({filteredDonations.length})
          </Button>
          <Fab
            color="primary"
            size="small"
            onClick={getCurrentLocation}
          >
            <MyLocation />
          </Fab>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ height: '70vh', position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          
          {/* Map Controls */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.100' } }}
              onClick={getCurrentLocation}
            >
              <MyLocation />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Filter Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Cooked Meals">Cooked Meals</MenuItem>
              <MenuItem value="Raw Ingredients">Raw Ingredients</MenuItem>
              <MenuItem value="Packaged Foods">Packaged Foods</MenuItem>
              <MenuItem value="Baked Goods">Baked Goods</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>
            Nearby Donations ({filteredDonations.length})
          </Typography>
          
          <List>
            {filteredDonations.slice(0, 10).map(donation => (
              <React.Fragment key={donation.id}>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedDonation(donation);
                    setDetailDialog(true);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Restaurant />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={donation.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" component="div">
                          {donation.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {donation.pickupAddress?.substring(0, 40)}...
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Donation Detail Dialog */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        {selectedDonation && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedDonation.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={selectedDonation.category} size="small" color="primary" />
                {selectedDonation.isVegetarian && (
                  <Chip label="Vegetarian" size="small" color="success" />
                )}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedDonation.description}
              </Typography>

              {/* Donation Details */}
              <Box sx={{ mb: 3 }}>
                {selectedDonation.quantity && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Quantity:</strong> {selectedDonation.quantity}
                  </Typography>
                )}
                {selectedDonation.servingSize && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Serves:</strong> {selectedDonation.servingSize}
                  </Typography>
                )}
                <Typography variant="body2" gutterBottom>
                  <strong>Best Before:</strong> {format(selectedDonation.expiryDate?.toDate() || new Date(), 'MMM d, yyyy HH:mm')}
                </Typography>
              </Box>

              {/* Allergen Information */}
              {selectedDonation.allergens && selectedDonation.allergens.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Contains allergens:</strong> {selectedDonation.allergens.join(', ')}
                  </Typography>
                </Alert>
              )}

              {/* Pickup Information */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📍 Pickup Location
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedDonation.pickupAddress}
                </Typography>
                {selectedDonation.pickupInstructions && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Instructions:</strong> {selectedDonation.pickupInstructions}
                  </Typography>
                )}
              </Box>

              {/* Donor Information */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {selectedDonation.donorName}
                  </Typography>
                  {selectedDonation.donorContact && (
                    <Typography variant="body2" color="text.secondary">
                      📞 Contact available after showing interest
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Interest Information */}
              {selectedDonation.interestedReceivers && selectedDonation.interestedReceivers.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {selectedDonation.interestedReceivers.length} other{selectedDonation.interestedReceivers.length !== 1 ? 's' : ''} interested
                </Typography>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={() => getDirections(selectedDonation)}
                startIcon={<Directions />}
                variant="outlined"
              >
                Directions
              </Button>
              <Button 
                onClick={() => setDetailDialog(false)}
              >
                Close
              </Button>
              {userProfile?.role === 'receiver' && (
                <Button
                  variant="contained"
                  onClick={() => handleShowInterest(selectedDonation)}
                  startIcon={<Restaurant />}
                  disabled={selectedDonation.interestedReceivers?.includes(currentUser?.uid)}
                >
                  {selectedDonation.interestedReceivers?.includes(currentUser?.uid) 
                    ? 'Already Interested' 
                    : 'Show Interest'
                  }
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Legend */}
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'absolute', 
          bottom: 100, 
          left: 20, 
          p: 2, 
          bgcolor: 'background.paper',
          minWidth: 200
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Map Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4CAF50' }} />
          <Typography variant="body2">Available Donations</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#2196F3' }} />
          <Typography variant="body2">Your Location</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MapContainer;