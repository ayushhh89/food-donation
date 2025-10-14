// src/components/delivery/VolunteerInfoCard.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
  Chip,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  VolunteerActivism,
  Phone,
  DirectionsBike,
  Schedule,
  LocationOn,
  Navigation,
  Star,
  CheckCircle,
  Info,
  Close,
  LocalShipping
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { getDeliveryDetails } from '../../services/deliveryService';
import { confirmDeliveryByReceiver } from '../../services/deliveryService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';

const VolunteerInfoCard = ({ donationId, userRole, currentUserId }) => {
  const [loading, setLoading] = useState(true);
  const [volunteerData, setVolunteerData] = useState(null);
  const [rideData, setRideData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');

  useEffect(() => {
    loadVolunteerInfo();
  }, [donationId]);

  const loadVolunteerInfo = async () => {
    try {
      setLoading(true);

      // Get donation document to find ride ID
      const donationDoc = await getDoc(doc(db, 'donations', donationId));

      if (!donationDoc.exists()) {
        setLoading(false);
        return;
      }

      const donationData = donationDoc.data();

      // Check if volunteer is assigned
      if (!donationData.rideId || !donationData.assignedVolunteerId) {
        setLoading(false);
        return;
      }

      // Get ride details
      const ride = await getDeliveryDetails(donationData.rideId);

      if (!ride) {
        setLoading(false);
        return;
      }

      setRideData(ride);

      // Get volunteer details
      const volunteerDoc = await getDoc(doc(db, 'users', ride.volunteerId));

      if (volunteerDoc.exists()) {
        setVolunteerData({
          uid: volunteerDoc.id,
          ...volunteerDoc.data()
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading volunteer info:', error);
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!rideData) return;

    setConfirming(true);
    try {
      const result = await confirmDeliveryByReceiver(rideData.id, currentUserId);

      if (result.success) {
        toast.success(`Delivery confirmed! Volunteer earned ${result.creditsAwarded} credits! 🎉`);
        setConfirmDialog(false);
        loadVolunteerInfo(); // Reload to show updated status
      } else {
        toast.error(result.error || 'Failed to confirm delivery');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('Error confirming delivery');
    } finally {
      setConfirming(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'assigned': return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
      case 'in_progress': return 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)';
      case 'completed': return 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)';
      case 'cancelled': return 'linear-gradient(135deg, #F44336 0%, #E57373 100%)';
      default: return 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)';
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>Loading volunteer information...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!volunteerData || !rideData) {
    return (
      <Card sx={{ borderRadius: 4, border: '2px dashed rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <LocalShipping sx={{ fontSize: 60, color: 'rgba(0,0,0,0.3)', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Volunteer Assigned Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {userRole === 'donor'
              ? 'An admin will assign a volunteer to handle this delivery soon.'
              : 'A volunteer will be assigned to deliver this donation to you.'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: `2px solid ${getStatusColor(rideData.status)}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: getStatusGradient(rideData.status)
          }
        }}
      >
        <CardContent sx={{ p: 4, pt: 5 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                  boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
                  fontSize: '2rem'
                }}
              >
                {volunteerData.name?.charAt(0) || 'V'}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {volunteerData.name || 'Volunteer'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<VolunteerActivism />}
                    label="Volunteer"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip
                    label={rideData.status}
                    size="small"
                    sx={{
                      background: getStatusGradient(rideData.status),
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            {/* Delivery Status */}
            {rideData.status === 'completed' && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{
                  borderRadius: 3,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                <Typography fontWeight={600}>
                  Delivery Completed Successfully! 🎉
                </Typography>
                {rideData.completedAt && (
                  <Typography variant="body2">
                    Completed {formatDistanceToNow(rideData.completedAt.toDate ? rideData.completedAt.toDate() : rideData.completedAt)} ago
                  </Typography>
                )}
              </Alert>
            )}

            {rideData.status === 'in_progress' && (
              <Alert
                severity="info"
                icon={<DirectionsBike />}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                <Typography fontWeight={600}>
                  🚴 Delivery In Progress
                </Typography>
                <Typography variant="body2">
                  Your volunteer is on the way!
                </Typography>
              </Alert>
            )}

            {rideData.status === 'assigned' && (
              <Alert
                severity="warning"
                icon={<Schedule />}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                <Typography fontWeight={600}>
                  ⏳ Delivery Scheduled
                </Typography>
                <Typography variant="body2">
                  Volunteer will start the delivery soon
                </Typography>
              </Alert>
            )}

            {/* Volunteer Stats */}
            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(76, 175, 80, 0.1)',
                  textAlign: 'center'
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <Star sx={{ fontSize: 18, color: '#FFD700' }} />
                  <Typography variant="h6" fontWeight={700}>
                    {volunteerData.credits || 0}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Credits
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(33, 150, 243, 0.1)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  {volunteerData.completedRides || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(255, 152, 0, 0.1)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  {volunteerData.avgRating?.toFixed(1) || '5.0'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rating
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* Delivery Details */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize="small" />
                Delivery Details
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {userRole === 'donor' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Pickup Location
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationOn sx={{ fontSize: 18, color: '#FF5722' }} />
                      <Typography fontWeight={600}>{rideData.pickupLocation}</Typography>
                    </Stack>
                  </Box>
                )}

                {userRole === 'receiver' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Delivery Location
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Navigation sx={{ fontSize: 18, color: '#4CAF50' }} />
                      <Typography fontWeight={600}>{rideData.deliveryLocation}</Typography>
                    </Stack>
                  </Box>
                )}

                {rideData.distance && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Distance
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DirectionsBike sx={{ fontSize: 18 }} />
                      <Typography fontWeight={600}>{rideData.distance} km</Typography>
                    </Stack>
                  </Box>
                )}

                {rideData.assignedAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {rideData.status === 'completed' ? 'Completed' : 'Assigned'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Schedule sx={{ fontSize: 18 }} />
                      <Typography fontWeight={600}>
                        {format(
                          rideData.status === 'completed' && rideData.completedAt
                            ? rideData.completedAt.toDate ? rideData.completedAt.toDate() : rideData.completedAt
                            : rideData.assignedAt.toDate ? rideData.assignedAt.toDate() : rideData.assignedAt,
                          'MMM d, yyyy HH:mm'
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {volunteerData.phone && userRole !== 'admin' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Contact Volunteer
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone sx={{ fontSize: 18, color: '#2196F3' }} />
                      <Typography fontWeight={600}>{volunteerData.phone}</Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Action Buttons */}
            {userRole === 'receiver' && rideData.status === 'in_progress' && (
              <>
                <Divider />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={() => setConfirmDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)'
                    }
                  }}
                >
                  Confirm Delivery Received
                </Button>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Confirming will award 5 credits to the volunteer
                </Typography>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => !confirming && setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            Confirm Delivery
            <IconButton onClick={() => !confirming && setConfirmDialog(false)} disabled={confirming}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Has {volunteerData?.name || 'the volunteer'} successfully delivered the food?
              </Typography>
              <Typography variant="body2">
                By confirming, you'll award <strong>5 credits</strong> to the volunteer and mark the delivery as complete.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (Optional)"
              placeholder="Add any feedback or comments about the delivery..."
              value={confirmationNotes}
              onChange={(e) => setConfirmationNotes(e.target.value)}
              disabled={confirming}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setConfirmDialog(false)} disabled={confirming}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelivery}
            disabled={confirming}
            startIcon={confirming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircle />}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
              fontWeight: 600,
              px: 4
            }}
          >
            {confirming ? 'Confirming...' : 'Confirm Delivery'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VolunteerInfoCard;
