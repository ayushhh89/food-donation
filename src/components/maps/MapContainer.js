import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent,
  Button, Chip, CircularProgress
} from '@mui/material';
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
  const mapRef = useRef();
  const markerRefs = useRef({});
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'donations'), where('status', '==', 'available'));
    const unsubscribe = onSnapshot(q, async snap => {
      const geocoded = await Promise.all(snap.docs.map(async docSnap => {
        const data = docSnap.data();
        const address = data.pickupAddress;
        let coords = null;
        if (address) {
          try {
            const resp = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_KEY}`
            );
            if (resp.data.results.length > 0) {
              const g = resp.data.results[0].geometry;
              coords = { lat: g.lat, lng: g.lng };
            } else {
              console.warn(`No result for ${address}`);
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }
        }
        return { id: docSnap.id, ...data, coordinates: coords };
      }));

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
  };

  if (loading) return (
    <Container><CircularProgress /></Container>
  );

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Donation Map</Typography>
      <Box sx={{ display: 'flex', height: '70vh', gap: 2 }}>
        {/* List Section */}
        <Box sx={{ width: 300, overflowY: 'auto', bgcolor: 'grey.100', p: 2 }}>
          <Typography variant="h6">Nearby Donations</Typography>
          {donations.map(d => (
            <Card key={d.id} sx={{ my:1, cursor:'pointer' }} onClick={() => flyTo(d)}>
              <CardContent>
                <Typography>{d.title}</Typography>
                <Typography variant="body2" color="text.secondary">{d.pickupAddress}</Typography>
                <Chip label={d.category} size="small" sx={{ mt:1 }} />
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Map Section */}
        <LeafletMap
          center={donations[0]?.coordinates || [20.5937, 78.9629]}
          zoom={5}
          style={{ flexGrow:1 }}
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
              ref={ref => { if(ref) markerRefs.current[d.id] = ref; }}
            >
              <Popup>
                <Typography>{d.title}</Typography>
                <Typography variant="body2">{d.pickupAddress}</Typography>
                {userProfile?.role === 'receiver' && (
                  <Button
                    size="small"
                    onClick={() => handleInterest(d)}
                    disabled={d.interestedReceivers?.includes(currentUser?.uid)}
                  >
                    {d.interestedReceivers?.includes(currentUser?.uid) ? 'Interested' : 'Show Interest'}
                  </Button>
                )}
              </Popup>
            </Marker>
          ))}
        </LeafletMap>
      </Box>
    </Container>
  );
};

export default MapContainer;
