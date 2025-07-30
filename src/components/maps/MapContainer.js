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
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Person, Restaurant } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Mock geolocation for demo
const mockCoordinates = {
  'New York': { lat: 40.7128, lng: -74.006 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
};

const MapContainer = () => {
  const { currentUser, userProfile } = useAuth();
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch available donations
  useEffect(() => {
    const q = query(collection(db, 'donations'), where('status', '==', 'available'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donationList = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        // Assign coordinates based on city name in pickup address
        let coordinates = null;
        if (data.pickupAddress) {
          Object.entries(mockCoordinates).forEach(([city, coords]) => {
            if (data.pickupAddress.toLowerCase().includes(city.toLowerCase())) {
              coordinates = coords;
            }
          });
        }

        return {
          id: docSnap.id,
          ...data,
          coordinates,
        };
      });

      setDonations(donationList.filter((d) => d));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        () => toast.info('Could not get your location.')
      );
    }
  }, []);

  const handleShowInterest = async (donation) => {
    if (!currentUser) return;
    try {
      const donationRef = doc(db, 'donations', donation.id);
      await updateDoc(donationRef, {
        interestedReceivers: arrayUnion(currentUser.uid),
      });
      toast.success('Interest registered!');
    } catch (error) {
      toast.error('Error registering interest.');
    }
  };

  const flyToDonation = (donation) => {
    if (donation.coordinates && mapRef.current) {
      mapRef.current.flyTo(donation.coordinates, 14, { duration: 1.5 });
      const marker = markerRefs.current[donation.id];
      if (marker) marker.openPopup();
    } else {
      toast.warning('Invalid location for this donation.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Donation Map (Leaflet)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: '70vh', gap: 2 }}>
          {/* Sidebar List */}
          <Box sx={{ width: 300, overflowY: 'auto', bgcolor: 'grey.100', p: 2 }}>
            <Typography variant="h6">Nearby Donations</Typography>
            {donations.map((donation) => (
              <Card
                key={donation.id}
                sx={{ my: 1, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedDonation(donation);
                  flyToDonation(donation);
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1">{donation.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {donation.pickupAddress || 'Invalid location'}
                  </Typography>
                  <Chip label={donation.category} size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Leaflet Map */}
          <Box sx={{ flexGrow: 1 }}>
            <LeafletMap
              center={userLocation || [40.7128, -74.006]}
              zoom={12}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => (mapRef.current = map)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {donations.map((donation) => {
                if (!donation.coordinates) return null;
                return (
                  <Marker
                    key={donation.id}
                    position={donation.coordinates}
                    ref={(ref) => {
                      if (ref) markerRefs.current[donation.id] = ref;
                    }}
                  >
                    <Popup>
                      <Typography variant="subtitle1">{donation.title}</Typography>
                      <Typography variant="body2">{donation.pickupAddress}</Typography>
                      <Button
                        size="small"
                        onClick={() => handleShowInterest(donation)}
                        disabled={
                          donation.interestedReceivers?.includes(currentUser?.uid)
                        }
                      >
                        {donation.interestedReceivers?.includes(currentUser?.uid)
                          ? 'Interested'
                          : 'Show Interest'}
                      </Button>
                    </Popup>
                  </Marker>
                );
              })}

              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
            </LeafletMap>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default MapContainer;
