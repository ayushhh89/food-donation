// src/components/maps/MapContainer.js - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent,
  Button, Chip, CircularProgress, IconButton, Drawer,
  useTheme, useMediaQuery, Fab, Badge
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, arrayUnion
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const OPENCAGE_KEY = 'f034809c640146a7aa9e8c35252d5999';

const MapContainer = () => {
  const { currentUser, userProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [mapReady, setMapReady] = useState(false);

  // Helper function to validate coordinates
  const isValidCoordinate = (coords) => {
    return coords && 
           Array.isArray(coords) && 
           coords.length === 2 && 
           typeof coords[0] === 'number' && 
           typeof coords[1] === 'number' &&
           coords[0] >= -90 && coords[0] <= 90 &&
           coords[1] >= -180 && coords[1] <= 180;
  };

  useEffect(() => {
    console.log('Setting up donations listener...');
    const q = query(collection(db, 'donations'), where('status', '==', 'available'));
    
    const unsubscribe = onSnapshot(q, async (snap) => {
      console.log(`Found ${snap.docs.length} donations to process`);
      
      const geocodedPromises = snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const address = data.pickupAddress;
        let coords = null;

        console.log(`Processing donation ${docSnap.id} with address: "${address}"`);

        // Only geocode if the address is valid
        if (address && typeof address === 'string' && address.trim() !== '') {
          try {
            const cleanAddress = address.trim();
            console.log(`Geocoding address: "${cleanAddress}"`);
            
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cleanAddress)}&key=${OPENCAGE_KEY}`,
              { timeout: 10000 } // 10 second timeout
            );
            
            if (response.data.results && response.data.results.length > 0) {
              const geometry = response.data.results[0].geometry;
              coords = [geometry.lat, geometry.lng];
              console.log(`Geocoded "${cleanAddress}" to:`, coords);
            } else {
              console.warn(`No geocoding results for address: "${cleanAddress}"`);
            }
          } catch (error) {
            console.error(`Geocoding failed for "${address}":`, error.message);
          }
        } else {
          console.warn(`Invalid address for donation ${docSnap.id}: "${address}"`);
        }

        return {
          id: docSnap.id,
          ...data,
          coordinates: coords,
          expiryDate: data.expiryDate?.toDate() || new Date()
        };
      });

      try {
        const geocoded = await Promise.all(geocodedPromises);
        
        // Filter for donations with valid coordinates
        const validDonations = geocoded.filter(donation => {
          const isValid = isValidCoordinate(donation.coordinates);
          if (!isValid && donation.coordinates) {
            console.warn(`Invalid coordinates for donation ${donation.id}:`, donation.coordinates);
          }
          return isValid;
        });

        console.log(`${validDonations.length} donations have valid coordinates`);
        setDonations(validDonations);
        setLoading(false);
      } catch (error) {
        console.error('Error processing donations:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
      toast.error('Error loading donations');
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up donations listener');
      unsubscribe();
    };
  }, []);

  const handleInterest = async (donation) => {
    if (!currentUser) {
      toast.error('Please log in to show interest');
      return;
    }

    if (userProfile?.role !== 'receiver') {
      toast.error('Only receivers can show interest in donations');
      return;
    }

    try {
      await updateDoc(doc(db, 'donations', donation.id), {
        interestedReceivers: arrayUnion(currentUser.uid)
      });
      toast.success('Interest registered!');
    } catch (error) {
      console.error('Error registering interest:', error);
      toast.error('Error registering interest');
    }
  };

  const flyTo = (donation) => {
    console.log('flyTo called with:', donation.id, donation.coordinates);
    
    if (!donation.coordinates) {
      console.warn('No coordinates for donation:', donation.id);
      toast.warning('Location not available for this donation');
      return;
    }

    if (!isValidCoordinate(donation.coordinates)) {
      console.warn('Invalid coordinates for donation:', donation.id, donation.coordinates);
      toast.warning('Invalid location data');
      return;
    }

    if (!mapRef.current) {
      console.warn('Map not ready');
      toast.warning('Map is still loading, please try again');
      return;
    }

    if (!mapReady) {
      console.warn('Map not fully initialized');
      toast.warning('Map is still initializing, please wait');
      return;
    }

    try {
      console.log(`Flying to coordinates:`, donation.coordinates);
      mapRef.current.flyTo(donation.coordinates, 14, { duration: 1.5 });
      
      // Open popup if marker exists
      setTimeout(() => {
        const marker = markerRefs.current[donation.id];
        if (marker) {
          marker.openPopup();
        }
      }, 1600); // Wait for flyTo animation to complete

      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error flying to location:', error);
      toast.error('Error navigating to location');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Cooked Meals': '#FF6B6B',
      'Raw Ingredients': '#4ECDC4', 
      'Packaged Foods': '#45B7D1',
      'Baked Goods': '#F9CA24',
      'Dairy Products': '#6C5CE7',
      'Fruits & Vegetables': '#A29BFE',
      'Beverages': '#FD79A8',
      'Other': '#FDCB6E',
      'default': '#95A5A6'
    };
    return colors[category] || colors.default;
  };

  // Map ready callback - Fixed to work with React-Leaflet
  const handleMapReady = () => {
    console.log('Map ready event fired');
    setMapReady(true);
  };

  // Effect to handle initial map view when both map and donations are ready
  useEffect(() => {
    if (mapReady && mapRef.current && donations.length > 0) {
      const firstDonation = donations[0];
      if (isValidCoordinate(firstDonation.coordinates)) {
        console.log('Setting initial map view to:', firstDonation.coordinates);
        mapRef.current.setView(firstDonation.coordinates, 10);
      }
    }
  }, [mapReady, donations]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Loading donations map...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Finding nearby food donations
          </Typography>
        </Box>
      </Box>
    );
  }

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          position: 'relative'
        }}
      >
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Available Donations
        </Typography>
        <Badge
          badgeContent={donations.length}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.875rem'
            }
          }}
        >
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Nearby locations
          </Typography>
        </Badge>
      </Box>

      {/* Donations List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
        }}
      >
        {donations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LocationIcon sx={{ fontSize: 64, color: '#bbb', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No donations available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new donations near you
            </Typography>
          </Box>
        ) : (
          donations.map((donation, index) => (
            <Card
              key={donation.id}
              sx={{
                mb: 2,
                cursor: mapReady ? 'pointer' : 'wait',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                '&:hover': {
                  transform: mapReady ? 'translateY(-4px)' : 'none',
                  boxShadow: mapReady ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                  '& .donation-title': {
                    color: mapReady ? '#667eea' : 'inherit',
                  },
                  '& .view-button': {
                    background: mapReady ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.1)',
                    color: mapReady ? 'white' : '#667eea',
                  }
                },
                opacity: mapReady ? 1 : 0.7,
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
              onClick={() => {
                if (mapReady) {
                  flyTo(donation);
                } else {
                  toast.info('Please wait for the map to finish loading');
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography
                    variant="h6"
                    className="donation-title"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      lineHeight: 1.3,
                      transition: 'color 0.3s ease',
                      flex: 1,
                      mr: 1
                    }}
                  >
                    {donation.title}
                  </Typography>
                  <IconButton
                    size="small"
                    className="view-button"
                    sx={{
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 18, color: '#666', mr: 1 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.4,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {donation.pickupAddress}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={donation.category}
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${getCategoryColor(donation.category)}22 0%, ${getCategoryColor(donation.category)}33 100%)`,
                      color: getCategoryColor(donation.category),
                      border: `1px solid ${getCategoryColor(donation.category)}44`,
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      '&:hover': {
                        background: getCategoryColor(donation.category),
                        color: 'white',
                      }
                    }}
                  />
                  {donation.interestedReceivers && donation.interestedReceivers.length > 0 && (
                    <Chip
                      icon={<FavoriteIcon fontSize="small" />}
                      label={`${donation.interestedReceivers.length} interested`}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: '#e74c3c',
                        borderColor: '#e74c3c22',
                        background: '#e74c3c11',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>

                {/* Add loading indicator for map */}
                {!mapReady && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.7 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Map loading...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );

  // Get default center - use first donation or fallback
  const getMapCenter = () => {
    if (donations.length > 0 && isValidCoordinate(donations[0].coordinates)) {
      return donations[0].coordinates;
    }
    return [20.5937, 78.9629]; // India center as fallback
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2,
          px: 3,
          boxShadow: '0 2px 20px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            🗺️ Donation Map
          </Typography>
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
        {!mapReady && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Initializing map...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        {/* Sidebar for Desktop */}
        {!isMobile && (
          <Box
            sx={{
              width: 380,
              height: '100%',
              boxShadow: '2px 0 20px rgba(0,0,0,0.1)',
              zIndex: 100,
              position: 'relative',
            }}
          >
            <SidebarContent />
          </Box>
        )}

        {/* Drawer for Mobile */}
        <Drawer
          anchor="left"
          open={isMobile && drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 320,
              boxShadow: '0 0 30px rgba(0,0,0,0.2)',
            },
          }}
        >
          <SidebarContent />
        </Drawer>

        {/* Map Section */}
        <Box
          sx={{
            flexGrow: 1,
            position: 'relative',
            '& .leaflet-container': {
              height: '100%',
              borderRadius: 0,
            },
            '& .leaflet-popup-content-wrapper': {
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
            '& .leaflet-popup-content': {
              margin: '16px',
              lineHeight: 1.5,
            },
          }}
        >
          <LeafletMap
            center={getMapCenter()}
            zoom={donations.length > 0 ? 10 : 5}
            style={{ height: '100%', width: '100%' }}
            whenReady={handleMapReady}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {donations.map((donation) => (
              isValidCoordinate(donation.coordinates) && (
                <Marker
                  key={donation.id}
                  position={donation.coordinates}
                  ref={(ref) => { 
                    if (ref) {
                      markerRefs.current[donation.id] = ref; 
                    }
                  }}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200, maxWidth: 300 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {donation.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📍 {donation.pickupAddress}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={donation.category}
                          size="small"
                          sx={{
                            background: getCategoryColor(donation.category),
                            color: 'white',
                            fontWeight: 'bold',
                            mr: 1
                          }}
                        />
                        {donation.quantity && (
                          <Chip
                            label={`${donation.quantity} ${donation.unit}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Expires: {format(donation.expiryDate, 'PPp')}
                      </Typography>
                      {userProfile?.role === 'receiver' && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            fullWidth
                            variant={donation.interestedReceivers?.includes(currentUser?.uid) ? "outlined" : "contained"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInterest(donation);
                            }}
                            disabled={donation.interestedReceivers?.includes(currentUser?.uid)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 'bold',
                              ...(donation.interestedReceivers?.includes(currentUser?.uid) ? {
                                borderColor: '#27ae60',
                                color: '#27ae60',
                              } : {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b4c93 100%)',
                                }
                              })
                            }}
                          >
                            {donation.interestedReceivers?.includes(currentUser?.uid) ? '✓ Interested' : 'Show Interest'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Popup>
                </Marker>
              )
            ))}
          </LeafletMap>

          {/* Mobile FAB */}
          {isMobile && (
            <Fab
              color="primary"
              onClick={() => setDrawerOpen(true)}
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b4c93 100%)',
                },
              }}
            >
              <Badge badgeContent={donations.length} color="error">
                <MenuIcon />
              </Badge>
            </Fab>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MapContainer;