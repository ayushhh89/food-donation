// src/components/delivery/DeliveryTrackingCard.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
  Divider,
  Button
} from '@mui/material';
import {
  LocalShipping,
  Person,
  Phone,
  LocationOn,
  Schedule,
  CheckCircle,
  DirectionsBike,
  Star,
  Navigation
} from '@mui/icons-material';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatDistanceToNow } from 'date-fns';

const DeliveryTrackingCard = ({ donationId, compact = false }) => {
  const [deliveryData, setDeliveryData] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!donationId) return;

    const fetchDeliveryData = async () => {
      try {
        // Fetch donation to get rideId
        const donationDoc = await getDoc(doc(db, 'donations', donationId));
        if (!donationDoc.exists() || !donationDoc.data().rideId) {
          setLoading(false);
          return;
        }

        const donationData = donationDoc.data();
        const rideId = donationData.rideId;

        // Set up real-time listener for ride
        const unsubscribe = onSnapshot(doc(db, 'volunteerRides', rideId), async (rideDoc) => {
          if (rideDoc.exists()) {
            const rideData = rideDoc.data();
            setDeliveryData(rideData);

            // Fetch volunteer data
            if (rideData.volunteerId) {
              const volunteerDoc = await getDoc(doc(db, 'users', rideData.volunteerId));
              if (volunteerDoc.exists()) {
                setVolunteer(volunteerDoc.data());
              }
            }
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching delivery data:', error);
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, [donationId]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'assigned':
        return {
          label: 'Assigned',
          color: '#FF9800',
          gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
          progress: 25,
          icon: <Schedule />
        };
      case 'in_progress':
        return {
          label: 'In Transit',
          color: '#2196F3',
          gradient: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
          progress: 60,
          icon: <DirectionsBike />
        };
      case 'pending_verification':
        return {
          label: 'Awaiting Verification',
          color: '#FFC107',
          gradient: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
          progress: 90,
          icon: <Schedule />
        };
      case 'completed':
        return {
          label: 'Delivered',
          color: '#4CAF50',
          gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
          progress: 100,
          icon: <CheckCircle />
        };
      default:
        return {
          label: 'Pending',
          color: '#9E9E9E',
          gradient: 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)',
          progress: 0,
          icon: <Schedule />
        };
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!deliveryData) {
    return null;
  }

  const statusInfo = getStatusInfo(deliveryData.status);

  if (compact) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}05 100%)`,
          border: `1px solid ${statusInfo.color}30`
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: statusInfo.gradient
              }}
            >
              {statusInfo.icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Delivery: {statusInfo.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {volunteer?.name || 'Volunteer assigned'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={statusInfo.progress}
              sx={{
                width: 60,
                height: 8,
                borderRadius: 4,
                background: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: statusInfo.gradient,
                  borderRadius: 4
                }
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}05 100%)`,
        border: `2px solid ${statusInfo.color}40`,
        boxShadow: `0 4px 20px ${statusInfo.color}20`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: statusInfo.gradient
                }}
              >
                <LocalShipping sx={{ fontSize: 28, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Delivery Tracking
                </Typography>
                <Chip
                  label={statusInfo.label}
                  icon={statusInfo.icon}
                  size="small"
                  sx={{
                    background: statusInfo.gradient,
                    color: 'white',
                    fontWeight: 600,
                    mt: 0.5
                  }}
                />
              </Box>
            </Stack>
          </Stack>

          <Divider />

          {/* Progress Bar */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Delivery Progress
              </Typography>
              <Typography variant="body2" fontWeight={700} color={statusInfo.color}>
                {statusInfo.progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={statusInfo.progress}
              sx={{
                height: 10,
                borderRadius: 5,
                background: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: statusInfo.gradient,
                  borderRadius: 5
                }
              }}
            />
          </Box>

          {/* Volunteer Info */}
          {volunteer && (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.secondary">
                Your Volunteer
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
                  }}
                >
                  {volunteer.name?.charAt(0) || 'V'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {volunteer.name || 'Volunteer'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Star sx={{ fontSize: 14, color: '#FFD700' }} />
                    <Typography variant="caption" fontWeight={600}>
                      {volunteer.avgRating?.toFixed(1) || '5.0'} • {volunteer.completedRides || 0} deliveries
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              {deliveryData.donorContact && deliveryData.donorContact !== 'N/A' && (
                <Button
                  size="small"
                  startIcon={<Phone />}
                  href={`tel:${deliveryData.donorContact}`}
                  sx={{
                    color: statusInfo.color,
                    fontWeight: 600
                  }}
                >
                  Contact Volunteer
                </Button>
              )}
            </Box>
          )}

          {/* Delivery Details */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: '#FF5722', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pickup Location
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {deliveryData.pickupLocation}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Navigation sx={{ fontSize: 20, color: '#4CAF50', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Delivery Location
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {deliveryData.deliveryLocation}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {deliveryData.distance && (
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsBike sx={{ fontSize: 18, color: '#666' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Distance
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {deliveryData.distance} km
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {deliveryData.assignedAt && (
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 18, color: '#666' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Assigned
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDistanceToNow(deliveryData.assignedAt.toDate ? deliveryData.assignedAt.toDate() : deliveryData.assignedAt)} ago
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Completion Notes */}
          {deliveryData.status === 'completed' && deliveryData.completionNotes && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}
            >
              <Typography variant="caption" fontWeight={700} color="success.main" display="block" gutterBottom>
                ✓ Delivery Notes
              </Typography>
              <Typography variant="body2">
                {deliveryData.completionNotes}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DeliveryTrackingCard;
