// src/pages/CreateDonation.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  LocationOn,
  Schedule,
  Restaurant,
  ArrowBack,
  ArrowForward,
  Save,
  Publish,
  Phone
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { toast } from 'react-toastify';

const steps = ['Basic Info', 'Details & Images', 'Location & Pickup', 'Review & Publish'];

const foodCategories = [
  'Cooked Meals', 'Raw Ingredients', 'Packaged Foods', 'Baked Goods',
  'Dairy Products', 'Fruits & Vegetables', 'Beverages', 'Other'
];

const quantityUnits = [
  'servings', 'pieces', 'kg', 'lbs', 'bags', 'boxes', 
  'containers', 'liters', 'bottles', 'packages'
];

const allergens = [
  'Nuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Shellfish', 'Fish', 'Sesame'
];

const CreateDonation = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'servings',
    servingSize: '',
    expiryDate: '',
    expiryTime: '',
    pickupAddress: '',
    pickupInstructions: '',
    contactPhone: userProfile?.phone || '',
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isHalal: false,
    isKosher: false,
    isGlutenFree: false,
    availableFrom: '',
    availableUntil: '',
    images: [],
    isDraft: false
  });

  // Load existing donation for editing
  useEffect(() => {
    if (isEditing && id) {
      loadDonation();
    }
  }, [id, isEditing]);

  const loadDonation = async () => {
    try {
      const donationDoc = await getDoc(doc(db, 'donations', id));
      if (donationDoc.exists()) {
        const data = donationDoc.data();
        setFormData({
          ...data,
          expiryDate: data.expiryDate?.toDate().toISOString().split('T')[0] || '',
          expiryTime: data.expiryDate?.toDate().toTimeString().split(' ')[0].slice(0, 5) || '',
          allergens: data.allergens || [],
          images: data.images || []
        });
      }
    } catch (error) {
      console.error('Error loading donation:', error);
      toast.error('Error loading donation details');
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `donations/${currentUser.uid}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      });

      const imageUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    const imageUrl = formData.images[index];
    try {
      // Delete from storage if it's a Firebase URL
      if (imageUrl.includes('firebase')) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Error removing image');
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity required';
        break;
      
      case 1: // Details & Images
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        if (!formData.expiryTime) newErrors.expiryTime = 'Expiry time is required';
        
        const expiryDateTime = new Date(`${formData.expiryDate}T${formData.expiryTime}`);
        if (expiryDateTime <= new Date()) {
          newErrors.expiryDate = 'Expiry must be in the future';
        }
        break;
      
      case 2: // Location & Pickup
        if (!formData.pickupAddress.trim()) newErrors.pickupAddress = 'Pickup address is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const saveDraft = async () => {
    setLoading(true);
    try {
      const donationData = {
        ...formData,
        donorId: currentUser.uid,
        donorName: userProfile?.name || currentUser?.displayName || 'Unknown User',
        donorEmail: userProfile?.email || currentUser?.email || '',
        expiryDate: new Date(`${formData.expiryDate}T${formData.expiryTime}`),
        status: 'draft',
        isDraft: true,
        interestedReceivers: [],
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (isEditing) {
        await updateDoc(doc(db, 'donations', id), donationData);
        toast.success('Draft updated successfully!');
      } else {
        await addDoc(collection(db, 'donations'), donationData);
        toast.success('Draft saved successfully!');
      }
      
      navigate('/my-donations');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Error saving draft');
    } finally {
      setLoading(false);
    }
  };

  const publishDonation = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const donationData = {
        ...formData,
        donorId: currentUser.uid,
        donorName: userProfile?.name || currentUser?.displayName || 'Unknown User',
        donorEmail: userProfile?.email || currentUser?.email || '',
        donorContact: formData.contactPhone,
        expiryDate: new Date(`${formData.expiryDate}T${formData.expiryTime}`),
        status: 'available',
        isDraft: false,
        interestedReceivers: [],
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (isEditing) {
        await updateDoc(doc(db, 'donations', id), donationData);
        toast.success('Donation updated successfully!');
      } else {
        await addDoc(collection(db, 'donations'), donationData);
        toast.success('Donation published successfully!');
      }
      
      navigate('/my-donations');
    } catch (error) {
      console.error('Error publishing donation:', error);
      toast.error('Error publishing donation');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Donation Title"
                value={formData.title}
                onChange={handleInputChange('title')}
                error={!!errors.title}
                helperText={errors.title || 'Give your donation a clear, descriptive title'}
                placeholder="Fresh vegetables from garden"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                error={!!errors.description}
                helperText={errors.description || 'Describe the food, its condition, and any special notes'}
                placeholder="Fresh organic vegetables harvested this morning. Includes tomatoes, lettuce, and carrots."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  label="Category"
                >
                  {foodCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
                error={!!errors.quantity}
                helperText={errors.quantity}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={handleInputChange('unit')}
                  label="Unit"
                >
                  {quantityUnits.map(unit => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serving Size (Optional)"
                value={formData.servingSize}
                onChange={handleInputChange('servingSize')}
                placeholder="Serves 4-6 people"
                helperText="How many people this food can serve"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={handleInputChange('expiryDate')}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Expiry Time"
                value={formData.expiryTime}
                onChange={handleInputChange('expiryTime')}
                error={!!errors.expiryTime}
                helperText={errors.expiryTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Allergens & Dietary Information
              </Typography>
              
              <Autocomplete
                multiple
                options={allergens}
                value={formData.allergens}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, allergens: newValue }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Allergens"
                    placeholder="Select allergens present in this food"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVegetarian}
                      onChange={handleInputChange('isVegetarian')}
                    />
                  }
                  label="Vegetarian"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVegan}
                      onChange={handleInputChange('isVegan')}
                    />
                  }
                  label="Vegan"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isHalal}
                      onChange={handleInputChange('isHalal')}
                    />
                  }
                  label="Halal"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isKosher}
                      onChange={handleInputChange('isKosher')}
                    />
                  }
                  label="Kosher"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isGlutenFree}
                      onChange={handleInputChange('isGlutenFree')}
                    />
                  }
                  label="Gluten Free"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images (Optional but recommended)
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={uploading || formData.images.length >= 5}
                  >
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </label>
              </Box>

              {formData.images.length > 0 && (
                <Grid container spacing={2}>
                  {formData.images.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="120"
                          image={image}
                          alt={`Donation image ${index + 1}`}
                        />
                        <CardContent sx={{ p: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => removeImage(index)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pickup Address"
                value={formData.pickupAddress}
                onChange={handleInputChange('pickupAddress')}
                error={!!errors.pickupAddress}
                helperText={errors.pickupAddress || 'Full address where food can be picked up'}
                placeholder="123 Main St, City, State 12345"
                InputProps={{
                  startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Pickup Instructions"
                value={formData.pickupInstructions}
                onChange={handleInputChange('pickupInstructions')}
                placeholder="Ring doorbell, food is in cooler by front door. Available between 9 AM - 6 PM."
                helperText="Specific instructions for pickup (entry, timing, contact, etc.)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available From"
                type="time"
                value={formData.availableFrom}
                onChange={handleInputChange('availableFrom')}
                InputLabelProps={{ shrink: true }}
                helperText="Earliest pickup time"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available Until"
                type="time"
                value={formData.availableUntil}
                onChange={handleInputChange('availableUntil')}
                InputLabelProps={{ shrink: true }}
                helperText="Latest pickup time"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={handleInputChange('contactPhone')}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone || 'Phone number for pickup coordination'}
                placeholder="+1 (555) 123-4567"
                InputProps={{
                  startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review all details before publishing your donation.
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {formData.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formData.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={formData.category} color="primary" size="small" />
                    <Chip label={`${formData.quantity} ${formData.unit}`} variant="outlined" size="small" />
                    {formData.isVegetarian && <Chip label="Vegetarian" color="success" size="small" />}
                    {formData.isVegan && <Chip label="Vegan" color="success" size="small" />}
                  </Box>
                  <Typography variant="body2">
                    <Schedule sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Expires: {new Date(`${formData.expiryDate}T${formData.expiryTime}`).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <LocationOn sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    {formData.pickupAddress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {formData.images.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                <Grid container spacing={1}>
                  {formData.images.map((image, index) => (
                    <Grid item xs={6} key={index}>
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  if (userProfile?.role !== 'donor') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Only donors can create food donations.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-donations')}
          sx={{ mb: 2 }}
        >
          Back to My Donations
        </Button>
        
        <Typography variant="h4" gutterBottom>
          {isEditing ? 'Edit Donation' : 'Create Food '}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your surplus food with those who need it
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Box>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={saveDraft}
              disabled={loading}
              startIcon={<Save />}
            >
              Save Draft
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={publishDonation}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Publish />}
              >
                {loading ? 'Publishing...' : 'Publish Donation'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateDonation;