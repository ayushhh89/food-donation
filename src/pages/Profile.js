import React, { useState } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Security,
  Notifications,
  Save,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile, changePassword } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    organization: userProfile?.organization || '',
    organizationType: userProfile?.organizationType || '',
    beneficiaryCount: userProfile?.beneficiaryCount || '',
    location: userProfile?.location || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      organization: userProfile?.organization || '',
      organizationType: userProfile?.organizationType || '',
      beneficiaryCount: userProfile?.beneficiaryCount || '',
      location: userProfile?.location || ''
    });
    setEditing(false);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    fontSize: '2rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {getInitials(userProfile?.name)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {userProfile?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {userProfile?.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={userProfile?.role} 
                    color="primary" 
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip 
                    label={userProfile?.verificationStatus || 'Verified'} 
                    color="success" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Member since ${new Date(userProfile?.createdAt?.toDate()).getFullYear()}`} 
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Button
                variant={editing ? "outlined" : "contained"}
                startIcon={editing ? <Cancel /> : <Edit />}
                onClick={editing ? handleCancel : () => setEditing(true)}
                disabled={loading}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Person color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={true} // Email should not be editable
                  helperText="Email cannot be changed"
                  InputProps={{
                    startAdornment: <Email color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Role-specific Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business color="primary" />
              {userProfile?.role === 'donor' ? 'Donor Information' : 'Organization Information'}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {userProfile?.role === 'donor' ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Organization/Business Name"
                    value={formData.organization}
                    onChange={handleInputChange('organization')}
                    disabled={!editing}
                    helperText="Optional - leave blank if you're an individual donor"
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editing}>
                      <InputLabel>Organization Type</InputLabel>
                      <Select
                        value={formData.organizationType}
                        onChange={handleInputChange('organizationType')}
                        label="Organization Type"
                      >
                        <MenuItem value="charity">Charity</MenuItem>
                        <MenuItem value="shelter">Shelter</MenuItem>
                        <MenuItem value="community">Community Group</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Number of Beneficiaries"
                      type="number"
                      value={formData.beneficiaryCount}
                      onChange={handleInputChange('beneficiaryCount')}
                      disabled={!editing}
                      helperText="Approximate number of people you serve"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Account Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {userProfile?.totalDonations || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userProfile?.role === 'donor' ? 'Donations Made' : 'Claims Made'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {userProfile?.successfulDonations || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {userProfile?.rating || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rating
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                    {new Date(userProfile?.createdAt?.toDate()).getFullYear()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Member Since
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security color="primary" />
              Security Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  onClick={() => setPasswordDialog(true)}
                  startIcon={<Security />}
                  fullWidth
                >
                  Change Password
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<Notifications />}
                  fullWidth
                  onClick={() => toast.info('Notification settings coming soon!')}
                >
                  Notification Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Save Button */}
        {editing && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange('newPassword')}
              sx={{ mb: 3 }}
              helperText="Password must be at least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordUpdate} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;