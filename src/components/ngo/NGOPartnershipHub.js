// src/components/ngo/NGOPartnershipHub.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress,
  Fab
} from '@mui/material';
import {
  Business,
  ExpandMore,
  WhatsApp,
  Verified,
  People,
  Restaurant,
  LocationOn,
  Schedule,
  TrendingUp,
  Add,
  Phone,
  Email,
  Language,
  Assignment,
  CheckCircle,
  Warning,
  Info,
  Share,
  Handshake,
  Favorite,
  LocalShipping,
  AccessTime,
  Group,
  EmojiEvents,
  Close,
  Send,
  Description,
  CalendarToday,
  PriorityHigh
} from '@mui/icons-material';
import { useNGOFeatures } from '../../services/ngoService';
import { useAuth } from '../../contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

const NGOPartnershipHub = () => {
  const { currentUser, userProfile } = useAuth();
  const {
    loading,
    bulkRequests,
    verifiedNGOs,
    submitBulkRequest,
    respondToRequest,
    initiateWhatsAppContact
  } = useNGOFeatures();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    estimatedBeneficiaries: '',
    urgency: 'medium',
    eventType: '',
    duration: '',
    deadline: '',
    preferredTiming: '',
    foodTypes: [],
    hasTransport: false,
    storageCapacity: '',
    whatsappContact: '',
    pickupAddress: ''
  });
  const [responseForm, setResponseForm] = useState({
    donationItems: '',
    quantity: '',
    availableDate: '',
    notes: '',
    canDeliver: false
  });

  const handleSubmitBulkRequest = async () => {
    try {
      await submitBulkRequest({
        ...requestForm,
        deadline: new Date(requestForm.deadline),
        foodTypes: requestForm.foodTypes,
        hasTransport: requestForm.hasTransport
      });
      setShowRequestDialog(false);
      setRequestForm({
        title: '',
        description: '',
        estimatedBeneficiaries: '',
        urgency: 'medium',
        eventType: '',
        duration: '',
        deadline: '',
        preferredTiming: '',
        foodTypes: [],
        hasTransport: false,
        storageCapacity: '',
        whatsappContact: '',
        pickupAddress: ''
      });
      toast.success('Bulk request submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const handleRespondToRequest = async () => {
    try {
      await respondToRequest(selectedRequest.id, {
        ...responseForm,
        availableDate: new Date(responseForm.availableDate)
      });
      setShowResponseDialog(false);
      setResponseForm({
        donationItems: '',
        quantity: '',
        availableDate: '',
        notes: '',
        canDeliver: false
      });
      toast.success('Response submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  const NGOCard = ({ ngo }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
        borderRadius: 4,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }
      }}
      onClick={() => setSelectedNGO(ngo)}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" alignItems="flex-start" spacing={3} mb={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              fontSize: '2rem',
              fontWeight: 800,
              border: '3px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            {ngo.name.charAt(0)}
          </Avatar>
          
          <Box flex={1} minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {ngo.name}
              </Typography>
              {ngo.verificationLevel === 'verified' && (
                <Verified sx={{ color: '#10B981', fontSize: 20 }} />
              )}
              {ngo.verificationLevel === 'premium' && (
                <EmojiEvents sx={{ color: '#F59E0B', fontSize: 20 }} />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={2}>
              {ngo.description?.substring(0, 120)}...
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {ngo.focusAreas?.slice(0, 3).map((area, index) => (
                <Chip
                  key={index}
                  label={area}
                  size="small"
                  sx={{
                    backgroundColor: '#EBF8FF',
                    color: '#1E40AF',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800} color="primary">
                {ngo.stats.peopleServed?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                People Served
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800} color="success.main">
                {((ngo.stats.fulfilled / Math.max(ngo.stats.totalRequests, 1)) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Success Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            startIcon={<WhatsApp />}
            onClick={(e) => {
              e.stopPropagation();
              initiateWhatsAppContact(ngo, 'general');
            }}
            sx={{
              flex: 1,
              background: '#25D366',
              '&:hover': { background: '#20BA5A' },
              borderRadius: 2,
              py: 1.5
            }}
          >
            WhatsApp
          </Button>
          <Button
            variant="outlined"
            startIcon={<Handshake />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNGO(ngo);
            }}
            sx={{
              flex: 1,
              borderRadius: 2,
              py: 1.5,
              borderColor: '#3B82F6',
              color: '#3B82F6',
              '&:hover': {
                borderColor: '#1D4ED8',
                background: 'rgba(59, 130, 246, 0.04)'
              }
            }}
          >
            Partner
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const BulkRequestCard = ({ request }) => {
    const isUrgent = request.urgency === 'high';
    const timeLeft = request.deadline ? formatDistanceToNow(request.deadline) : null;
    
    return (
      <Card
        sx={{
          mb: 3,
          background: isUrgent 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          border: isUrgent ? '2px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(156, 163, 175, 0.2)',
          borderRadius: 4,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3}>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  {request.title}
                </Typography>
                {isUrgent && (
                  <Chip
                    label="URGENT"
                    size="small"
                    icon={<PriorityHigh />}
                    sx={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      color: 'white',
                      fontWeight: 700,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                )}
                <Chip
                  label={request.eventType}
                  size="small"
                  sx={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    fontWeight: 600
                  }}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" mb={3}>
                {request.description}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <People sx={{ color: '#3B82F6', fontSize: 20 }} />
                      <Typography variant="body2">
                        <strong>{request.estimatedImpact.peopleToFeed}</strong> people to feed
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule sx={{ color: '#10B981', fontSize: 20 }} />
                      <Typography variant="body2">
                        Duration: <strong>{request.estimatedImpact.duration}</strong>
                      </Typography>
                    </Box>
                    {timeLeft && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime sx={{ color: isUrgent ? '#EF4444' : '#F59E0B', fontSize: 20 }} />
                        <Typography 
                          variant="body2" 
                          color={isUrgent ? 'error.main' : 'warning.main'}
                          fontWeight={600}
                        >
                          {timeLeft} left
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn sx={{ color: '#8B5CF6', fontSize: 20 }} />
                      <Typography variant="body2">
                        {request.logistics.pickupAddress}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocalShipping sx={{ color: '#06B6D4', fontSize: 20 }} />
                      <Typography variant="body2">
                        Transport: {request.logistics.transportationAvailable ? 'Available' : 'Needed'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={() => {
                  const message = `Hi! I saw your food request "${request.title}" on FoodShare. I'd like to help with the donation. Can we discuss the details?`;
                  window.open(`https://wa.me/${request.whatsappContact}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                sx={{
                  background: '#25D366',
                  '&:hover': { background: '#20BA5A' },
                  borderRadius: 2
                }}
              >
                Contact NGO
              </Button>
              {userProfile?.role === 'donor' && (
                <Button
                  variant="outlined"
                  startIcon={<Send />}
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowResponseDialog(true);
                  }}
                  sx={{
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1D4ED8',
                      background: 'rgba(59, 130, 246, 0.04)'
                    }
                  }}
                >
                  Respond
                </Button>
              )}
            </Stack>
          </Stack>

          {request.responses && request.responses.length > 0 && (
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {request.responses.length} donor(s) responded
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((request.responses.length / 5) * 100, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#F3F4F6',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            🤝 NGO Partnership Hub
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '1.2rem',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Connect with verified NGOs for large-scale food distribution and maximum community impact
          </Typography>
        </Box>

        {/* Tabs */}
        <Card
          sx={{
            mb: 4,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                fontSize: '1rem',
                py: 3,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #00C853 0%, #4CAF50 100%)',
                height: 4,
                borderRadius: 2
              }
            }}
          >
            <Tab label="Partner NGOs" />
            <Tab label="Bulk Requests" />
            {userProfile?.organizationType && <Tab label="Submit Request" />}
          </Tabs>
        </Card>

        {/* Content */}
        {activeTab === 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                Verified NGO Partners
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {verifiedNGOs.length} verified organizations
              </Typography>
            </Stack>

            {loading ? (
              <Grid container spacing={4}>
                {[...Array(6)].map((_, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card sx={{ height: 300, borderRadius: 4 }}>
                      <CardContent sx={{ p: 4 }}>
                        <CircularProgress />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={4}>
                {verifiedNGOs.map((ngo) => (
                  <Grid item xs={12} md={6} lg={4} key={ngo.id}>
                    <NGOCard ngo={ngo} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                Active Bulk Requests
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {bulkRequests.length} active requests
              </Typography>
            </Stack>

            {bulkRequests.length === 0 ? (
              <Card
                sx={{
                  p: 8,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4
                }}
              >
                <Assignment sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)', mb: 3 }} />
                <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                  No active bulk requests
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Check back later for NGO food requests or partner with organizations directly
                </Typography>
              </Card>
            ) : (
              <Box>
                {bulkRequests.map((request) => (
                  <BulkRequestCard key={request.id} request={request} />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Bulk Request Dialog */}
        <Dialog
          open={showRequestDialog}
          onClose={() => setShowRequestDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4 }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Submit Bulk Food Request
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Request Title"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Estimated Beneficiaries"
                  value={requestForm.estimatedBeneficiaries}
                  onChange={(e) => setRequestForm({ ...requestForm, estimatedBeneficiaries: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Urgency</InputLabel>
                  <Select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Event Type"
                  value={requestForm.eventType}
                  onChange={(e) => setRequestForm({ ...requestForm, eventType: e.target.value })}
                  placeholder="e.g., Community Kitchen, Disaster Relief"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Deadline"
                  value={requestForm.deadline}
                  onChange={(e) => setRequestForm({ ...requestForm, deadline: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="WhatsApp Contact"
                  value={requestForm.whatsappContact}
                  onChange={(e) => setRequestForm({ ...requestForm, whatsappContact: e.target.value })}
                  placeholder="+1234567890"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitBulkRequest}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Response Dialog */}
        <Dialog
          open={showResponseDialog}
          onClose={() => setShowResponseDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4 }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={700}>
              Respond to: {selectedRequest?.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Donation Items"
                  value={responseForm.donationItems}
                  onChange={(e) => setResponseForm({ ...responseForm, donationItems: e.target.value })}
                  placeholder="e.g., Rice, Vegetables, Cooked Meals"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Estimated Quantity"
                  value={responseForm.quantity}
                  onChange={(e) => setResponseForm({ ...responseForm, quantity: e.target.value })}
                  placeholder="e.g., 50kg, 100 meals"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Available Date"
                  value={responseForm.availableDate}
                  onChange={(e) => setResponseForm({ ...responseForm, availableDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={responseForm.notes}
                  onChange={(e) => setResponseForm({ ...responseForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowResponseDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRespondToRequest}>
              Submit Response
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Floating Action Button */}
      {userProfile?.organizationType && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
            width: 64,
            height: 64,
            '&:hover': {
              background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
              transform: 'scale(1.1)'
            }
          }}
          onClick={() => setShowRequestDialog(true)}
        >
          <Add sx={{ fontSize: 32, color: 'white' }} />
        </Fab>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </Box>
  );
};

export default NGOPartnershipHub;