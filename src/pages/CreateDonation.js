// src/pages/CreateDonation.js - BEAUTIFULLY ENHANCED VERSION
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
  Autocomplete,
  Fade,
  Slide,
  Stack,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
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
  Phone,
  Info,
  Camera,
  CheckCircle,
  LocalDining,
  Business,
  Image as ImageIcon,
  Fastfood,
  AccessTime,
  ContactPhone,
  Preview,
  Star,
  Nature
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

const steps = [
  {
    label: 'Basic Info',
    icon: Info,
    description: 'Tell us about your food donation'
  },
  {
    label: 'Details & Images',
    icon: ImageIcon,
    description: 'Add photos and dietary information'
  },
  {
    label: 'Location & Pickup',
    icon: LocationOn,
    description: 'Set pickup details and contact info'
  },
  {
    label: 'Review & Publish',
    icon: Preview,
    description: 'Review and publish your donation'
  }
];

const foodCategories = [
  { value: 'Cooked Meals', icon: '🍽️' },
  { value: 'Raw Ingredients', icon: '🥬' },
  { value: 'Packaged Foods', icon: '📦' },
  { value: 'Baked Goods', icon: '🥖' },
  { value: 'Dairy Products', icon: '🥛' },
  { value: 'Fruits & Vegetables', icon: '🍎' },
  { value: 'Beverages', icon: '🥤' },
  { value: 'Other', icon: '🍴' }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isEditing = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [animationTrigger, setAnimationTrigger] = useState(false);

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

  useEffect(() => {
    setAnimationTrigger(true);
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
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity required';
        break;

      case 1:
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        if (!formData.expiryTime) newErrors.expiryTime = 'Expiry time is required';

        const expiryDateTime = new Date(`${formData.expiryDate}T${formData.expiryTime}`);
        if (expiryDateTime <= new Date()) {
          newErrors.expiryDate = 'Expiry must be in the future';
        }
        break;

      case 2:
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

  const StyledTextField = ({ children, ...props }) => (
    <TextField
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.3)',
          },
          '&.Mui-focused': {
            border: '2px solid rgba(102, 126, 234, 0.8)',
            background: 'rgba(255, 255, 255, 0.15)',
          },
          '& fieldset': {
            border: 'none',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: 600,
          '&.Mui-focused': {
            color: '#667eea',
          },
        },
        '& .MuiOutlinedInput-input': {
          color: 'white',
          fontWeight: 500,
        },
        '& .MuiFormHelperText-root': {
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 500,
        },
        ...props.sx,
      }}
    />
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in={animationTrigger} timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Fastfood sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Basic Information
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Tell us about your food donation
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
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
                      <StyledTextField
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
                      <FormControl
                        fullWidth
                        error={!!errors.category}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused': {
                              border: '2px solid rgba(102, 126, 234, 0.8)',
                              background: 'rgba(255, 255, 255, 0.15)',
                            },
                            '& fieldset': {
                              border: 'none',
                            },
                            '& .MuiSelect-select': {
                              color: 'white',
                              fontWeight: 500,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 600,
                            '&.Mui-focused': {
                              color: '#667eea',
                            },
                          },
                        }}
                      >
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={formData.category}
                          onChange={handleInputChange('category')}
                          label="Category"
                        >
                          {foodCategories.map(category => (
                            <MenuItem key={category.value} value={category.value}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <span>{category.icon}</span>
                                <span>{category.value}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <StyledTextField
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
                      <FormControl
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused': {
                              border: '2px solid rgba(102, 126, 234, 0.8)',
                              background: 'rgba(255, 255, 255, 0.15)',
                            },
                            '& fieldset': {
                              border: 'none',
                            },
                            '& .MuiSelect-select': {
                              color: 'white',
                              fontWeight: 500,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 600,
                            '&.Mui-focused': {
                              color: '#667eea',
                            },
                          },
                        }}
                      >
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

                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Serving Size (Optional)"
                        value={formData.servingSize}
                        onChange={handleInputChange('servingSize')}
                        placeholder="Serves 4-6 people"
                        helperText="How many people this food can serve"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        );

      case 1:
        return (
          <Fade in={animationTrigger} timeout={600}>
            <Grid container spacing={4}>
              {/* Expiry Information */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <AccessTime sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Expiry & Timing
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        When does this food expire?
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
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
                      <StyledTextField
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
                  </Grid>
                </Card>
              </Grid>

              {/* Dietary Information */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Nature sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Dietary Information
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Allergens and dietary preferences
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={allergens}
                        value={formData.allergens}
                        onChange={(event, newValue) => {
                          setFormData(prev => ({ ...prev, allergens: newValue }));
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              key={option}
                              sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '& .MuiChip-deleteIcon': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                }
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Allergens"
                            placeholder="Select allergens present in this food"
                          />
                        )}
                        sx={{
                          '& .MuiAutocomplete-popupIndicator': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {[
                          { key: 'isVegetarian', label: 'Vegetarian', icon: '🌱' },
                          { key: 'isVegan', label: 'Vegan', icon: '🌿' },
                          { key: 'isHalal', label: 'Halal', icon: '☪️' },
                          { key: 'isKosher', label: 'Kosher', icon: '✡️' },
                          { key: 'isGlutenFree', label: 'Gluten Free', icon: '🌾' },
                        ].map((diet) => (
                          <Card
                            key={diet.key}
                            sx={{
                              background: formData[diet.key]
                                ? 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${formData[diet.key] ? '#00C853' : 'rgba(255, 255, 255, 0.2)'}`,
                              borderRadius: 3,
                              p: 2,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                background: formData[diet.key]
                                  ? 'linear-gradient(135deg, #00B248 0%, #43A047 100%)'
                                  : 'rgba(255, 255, 255, 0.1)',
                              }
                            }}
                            onClick={() => setFormData(prev => ({ ...prev, [diet.key]: !prev[diet.key] }))}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography sx={{ fontSize: '1.5rem' }}>{diet.icon}</Typography>
                              <Box>
                                <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                  {diet.label}
                                </Typography>
                                <Switch
                                  checked={formData[diet.key]}
                                  onChange={handleInputChange(diet.key)}
                                  size="small"
                                  sx={{
                                    '& .MuiSwitch-track': {
                                      background: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '& .MuiSwitch-thumb': {
                                      background: 'white',
                                    },
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Card>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Images */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Camera sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Food Images
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Add photos to make your donation more appealing
                      </Typography>
                    </Box>
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
                        variant="contained"
                        component="span"
                        startIcon={uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CloudUpload />}
                        disabled={uploading || formData.images.length >= 5}
                        sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 600,
                          px: 3,
                          py: 1.5,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                          },
                          '&:disabled': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Images'}
                      </Button>
                    </label>
                  </Stack>

                  {formData.images.length > 0 ? (
                    <Grid container spacing={2}>
                      {formData.images.map((image, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Card
                            sx={{
                              position: 'relative',
                              borderRadius: 3,
                              overflow: 'hidden',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              '&:hover .delete-btn': {
                                opacity: 1,
                              }
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="120"
                              image={image}
                              alt={`Donation image ${index + 1}`}
                              sx={{ objectFit: 'cover' }}
                            />
                            <IconButton
                              className="delete-btn"
                              size="small"
                              onClick={() => removeImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(244, 67, 54, 0.8)',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(244, 67, 54, 1)',
                                }
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 6,
                        border: '2px dashed rgba(255, 255, 255, 0.3)',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        No images uploaded yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Images help receivers see what you're sharing
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Fade>
        );

      case 2:
        return (
          <Fade in={animationTrigger} timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <LocationOn sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Pickup Location
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Where can receivers collect the food?
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Pickup Address"
                        value={formData.pickupAddress}
                        onChange={handleInputChange('pickupAddress')}
                        error={!!errors.pickupAddress}
                        helperText={errors.pickupAddress || 'Full address where food can be picked up'}
                        placeholder="123 Main St, City, State 12345"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <StyledTextField
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
                      <StyledTextField
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
                      <StyledTextField
                        fullWidth
                        label="Available Until"
                        type="time"
                        value={formData.availableUntil}
                        onChange={handleInputChange('availableUntil')}
                        InputLabelProps={{ shrink: true }}
                        helperText="Latest pickup time"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    p: 3,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <ContactPhone sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Contact Information
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        How can receivers reach you?
                      </Typography>
                    </Box>
                  </Stack>

                  <StyledTextField
                    fullWidth
                    label="Contact Phone"
                    value={formData.contactPhone}
                    onChange={handleInputChange('contactPhone')}
                    error={!!errors.contactPhone}
                    helperText={errors.contactPhone || 'Phone number for pickup coordination'}
                    placeholder="+1 (555) 123-4567"
                  />
                </Card>
              </Grid>
            </Grid>
          </Fade>
        );

      case 3:
        return (
          <Fade in={animationTrigger} timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: 'white',
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      color: '#2196F3',
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Ready to Publish? 🚀
                  </Typography>
                  Please review all details before publishing your donation. Once published, receivers will be able to see and claim your food donation.
                </Alert>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, pt: 5 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={3} mb={3}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          width: 64,
                          height: 64,
                        }}
                      >
                        <Restaurant sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                          {formData.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, lineHeight: 1.6 }}>
                          {formData.description}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
                          <Chip
                            label={formData.category}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          <Chip
                            label={`${formData.quantity} ${formData.unit}`}
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          {formData.isVegetarian && (
                            <Chip
                              label="🌱 Vegetarian"
                              sx={{
                                background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          )}
                          {formData.isVegan && (
                            <Chip
                              label="🌿 Vegan"
                              sx={{
                                background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Stack>

                        <Divider sx={{ background: 'rgba(255, 255, 255, 0.2)', mb: 3 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Schedule sx={{ color: '#FF9800', fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  Expires
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                  {new Date(`${formData.expiryDate}T${formData.expiryTime}`).toLocaleString()}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <LocationOn sx={{ color: '#2196F3', fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  Pickup Location
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                  {formData.pickupAddress}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {formData.images.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 4,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                      📸 Food Images
                    </Typography>
                    <Grid container spacing={2}>
                      {formData.images.map((image, index) => (
                        <Grid item xs={6} key={index}>
                          <Box
                            sx={{
                              borderRadius: 3,
                              overflow: 'hidden',
                              border: '2px solid rgba(255, 255, 255, 0.2)',
                              '&:hover': {
                                border: '2px solid rgba(102, 126, 234, 0.8)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: 80,
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Fade>
        );

      default:
        return null;
    }
  };

  if (userProfile?.role !== 'donor') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="md">
          <Alert
            severity="warning"
            sx={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              color: 'white',
              borderRadius: 4,
              '& .MuiAlert-icon': {
                color: '#FFC107',
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Access Restricted
            </Typography>
            Only donors can create food donations. Please contact support if you need to change your role.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)
          `,
          animation: 'float 20s ease-in-out infinite'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in={animationTrigger} timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/my-donations')}
              sx={{
                mb: 3,
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateX(-4px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Back to My Donations
            </Button>

            <Box sx={{ textAlign: 'center', mb: 6 }}>
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
                {isEditing ? '✏️ Edit Donation' : '🍽️ Create Food Donation'}
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
                Share your surplus food with those who need it most
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Stepper */}
        <Slide direction="up" in={animationTrigger} timeout={1000}>
          <Card
            sx={{
              mb: 4,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              p: 4,
            }}
          >
            <Stepper
              activeStep={activeStep}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                '& .MuiStepLabel-root': {
                  color: 'white',
                },
                '& .MuiStepLabel-label': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                  '&.Mui-active': {
                    color: 'white',
                    fontWeight: 700,
                  },
                  '&.Mui-completed': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(255, 255, 255, 0.3)',
                  '&.Mui-active': {
                    color: '#667eea',
                  },
                  '&.Mui-completed': {
                    color: '#00C853',
                  },
                },
                '& .MuiStepConnector-line': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Card>
        </Slide>

        {/* Form Content */}
        <Slide direction="up" in={animationTrigger} timeout={1200}>
          <Box sx={{ mb: 4 }}>
            {renderStepContent()}
          </Box>
        </Slide>

        {/* Navigation Buttons */}
        <Slide direction="up" in={animationTrigger} timeout={1400}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              p: 4,
            }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3
            }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  },
                  '&:disabled': {
                    color: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Previous
              </Button>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="outlined"
                  onClick={saveDraft}
                  disabled={loading}
                  startIcon={<Save />}
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    border: '2px solid rgba(255, 193, 7, 0.8)',
                    '&:hover': {
                      background: 'rgba(255, 193, 7, 0.1)',
                      border: '2px solid #FFC107',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Save Draft
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={publishDonation}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Publish />}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 200, 83, 0.6)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Publishing...' : '🚀 Publish Donation'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 6,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Continue
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        </Slide>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }
      `}</style>
    </Box>
  );
};

export default CreateDonation;