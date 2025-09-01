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

const OPENCAGE_KEY = '335eadc8a0804915a48c44699d28f946'; // 🔁 Replace with your actual key

const MapContainer = () => {
  const { currentUser, userProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mapRef = useRef();
  const markerRefs = useRef({});
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  // src/components/map/MapContainer.js - FIXED VERSION

  useEffect(() => {
    const q = query(collection(db, 'donations'), where('status', '==', 'available'));
    const unsubscribe = onSnapshot(q, async snap => {
      const geocodedPromises = snap.docs.map(async docSnap => {
        const data = docSnap.data();
        const address = data.pickupAddress;
        let coords = null;

        // --- THIS IS THE FIX ---
        // Only geocode if the address is a valid, non-empty string
        if (address && address.trim() !== '') {
          try {
            const resp = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address.trim())}&key=${OPENCAGE_KEY}`
            );
            if (resp.data.results.length > 0) {
              const g = resp.data.results[0].geometry;
              coords = [g.lat, g.lng];
            } else {
              console.warn(`Geocoding: No results found for address "${address}"`);
            }
          } catch (err) {
            // Log the problematic address to make debugging easier
            console.error(`Geocoding error for address "${address}":`, err.response ? err.response.data : err.message);
          }
        } else {
          console.warn(`Skipping geocoding for invalid address on donation ID: ${docSnap.id}`);
        }
        return { id: docSnap.id, ...data, coordinates: coords };
      });

      const geocoded = await Promise.all(geocodedPromises);

      setDonations(geocoded.filter(d => d.coordinates));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInterest = async donation => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'donations', donation.id), {
        interestedReceivers: arrayUnion(currentUser.uid)
      });
      toast.success('Interest registered!');
    } catch {
      toast.error('Error.');
    }
  };

  const flyTo = donation => {
    if (!donation.coordinates || !mapRef.current) {
      toast.warning('Invalid location');
      return;
    }
    mapRef.current.flyTo(donation.coordinates, 14, { duration: 1.5 });
    markerRefs.current[donation.id]?.openPopup();
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#FF6B6B',
      'Clothing': '#4ECDC4',
      'Electronics': '#45B7D1',
      'Books': '#FFA07A',
      'Furniture': '#98D8C8',
      'Medical': '#F7DC6F',
      'Toys': '#BB8FCE',
      'default': '#95A5A6'
    };
    return colors[category] || colors.default;
  };

  if (loading) return (
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
          Loading donations...
        </Typography>
      </Box>
    </Box>
  );

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
              Check back later for new donations
            </Typography>
          </Box>
        ) : (
          donations.map((d, index) => (
            <Card
              key={d.id}
              sx={{
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  '& .donation-title': {
                    color: '#667eea',
                  },
                  '& .view-button': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }
                },
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
              onClick={() => flyTo(d)}
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
                    {d.title}
                  </Typography>
                  <IconButton
                    size="small"
                    className="view-button"
                    sx={{
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                      }
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
                    {d.pickupAddress}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={d.category}
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${getCategoryColor(d.category)}22 0%, ${getCategoryColor(d.category)}33 100%)`,
                      color: getCategoryColor(d.category),
                      border: `1px solid ${getCategoryColor(d.category)}44`,
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      '&:hover': {
                        background: getCategoryColor(d.category),
                        color: 'white',
                      }
                    }}
                  />
                  {d.interestedReceivers && d.interestedReceivers.length > 0 && (
                    <Chip
                      icon={<FavoriteIcon fontSize="small" />}
                      label={`${d.interestedReceivers.length} interested`}
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
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );

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
            center={donations[0]?.coordinates || [20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            whenCreated={m => mapRef.current = m}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {donations.map(d => (
              <Marker
                key={d.id}
                position={d.coordinates}
                ref={ref => { if (ref) markerRefs.current[d.id] = ref; }}
              >
                <Popup>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {d.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {d.pickupAddress}
                    </Typography>
                    <Chip
                      label={d.category}
                      size="small"
                      sx={{
                        background: getCategoryColor(d.category),
                        color: 'white',
                        mb: 2,
                        fontWeight: 'bold',
                      }}
                    />
                    {userProfile?.role === 'receiver' && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          fullWidth
                          variant={d.interestedReceivers?.includes(currentUser?.uid) ? "outlined" : "contained"}
                          onClick={() => handleInterest(d)}
                          disabled={d.interestedReceivers?.includes(currentUser?.uid)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            ...(d.interestedReceivers?.includes(currentUser?.uid) ? {
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
                          {d.interestedReceivers?.includes(currentUser?.uid) ? '✓ Interested' : 'Show Interest'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Popup>
              </Marker>
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