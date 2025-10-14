// src/pages/CreateDonation.js - COMPLETE MODERN UI VERSION
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
  Stack,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Tooltip,
  FormHelperText
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
  Nature,
  Person,
  Description,
  Category,
  Numbers,
  Scale,
  Group,
  CalendarMonth,
  Timer,
  Home,
  Assignment,
  PhoneAndroid
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
import { notifyAllReceivers } from '../services/emailService';
import { toast } from 'react-toastify';
import SocialShareButton from '../components/sharing/SocialShareButton';


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
  { value: 'Cooked Meals', icon: '🍽️', color: '#FF6B6B' },
  { value: 'Raw Ingredients', icon: '🥬', color: '#4ECDC4' },
  { value: 'Packaged Foods', icon: '📦', color: '#45B7D1' },
  { value: 'Baked Goods', icon: '🥖', color: '#F9CA24' },
  { value: 'Dairy Products', icon: '🥛', color: '#6C5CE7' },
  { value: 'Fruits & Vegetables', icon: '🍎', color: '#A29BFE' },
  { value: 'Beverages', icon: '🥤', color: '#FD79A8' },
  { value: 'Other', icon: '🍴', color: '#FDCB6E' }
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

  const handleInputChange = (field, value) => {
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
      // Validate that we have expiry date and time before creating Date object
      let expiryDate = null;
      if (formData.expiryDate && formData.expiryTime) {
        const dateStr = `${formData.expiryDate}T${formData.expiryTime}`;
        const parsedDate = new Date(dateStr);
        // Check if date is valid
        if (!isNaN(parsedDate.getTime())) {
          expiryDate = parsedDate;
        }
      }

      const donationData = {
        ...formData,
        donorId: currentUser.uid,
        donorName: userProfile?.name || currentUser?.displayName || 'Unknown User',
        donorEmail: userProfile?.email || currentUser?.email || '',
        expiryDate: expiryDate, // Will be null if not set, which is fine for drafts
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

  // Add this import at the top of CreateDonation.js (around line 40, with other imports)

  // Replace your existing publishDonation function with this updated version
  // Updated publishDonation function for CreateDonation.js
  // Replace your existing publishDonation function with this:

  // src/pages/CreateDonation.js

const publishDonation = async () => {
    if (!validateStep(activeStep)) return;

    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);
    try {
      // This is the MAIN donationData object for Firestore
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

      let donationId;

      if (isEditing) {
        await updateDoc(doc(db, 'donations', id), donationData);
        donationId = id;
        toast.success('Donation updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'donations'), donationData);
        donationId = docRef.id;

        // *** FIX APPLIED HERE ***
        // Renamed the variable from 'donationData' to 'shareData' to avoid conflict
        const shareData = {
          id: donationId,
          title: formData.title,
          category: formData.category,
          quantity: formData.quantity,
          unit: formData.unit,
          images: formData.images
        };

        // Custom success toast with share option
        toast.success(
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              🎉 Donation published successfully!
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Share with your community to reach more people
            </Typography>
            <SocialShareButton
              type="donation"
              data={shareData} // Use the new 'shareData' variable
              variant="button"
              showLabel
              size="small"
              platforms={['facebook', 'twitter', 'whatsapp', 'clipboard']}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            />
          </Box>,
          {
            autoClose: false,
            closeButton: true
          }
        );
      }

      // Send email notifications to all receivers
      try {
        toast.info('📧 Sending notifications to receivers...', { autoClose: 2000 });

        // This now correctly and safely refers to the main donationData object
        const emailData = {
          ...donationData,
          id: donationId,
          expiryDate: new Date(`${formData.expiryDate}T${formData.expiryTime}`)
        };

        // Add a small delay to ensure document is saved before sending emails
        await new Promise(resolve => setTimeout(resolve, 1000));

        const emailResult = await notifyAllReceivers(emailData);

        if (emailResult.success) {
          if (emailResult.sent > 0) {
            toast.success(`🎉 Donation published and ${emailResult.sent} receivers notified!`);
          } else if (emailResult.total === 0) {
            toast.info('Donation published! No receivers to notify at the moment.');
          } else {
            toast.warning(`Donation published! ${emailResult.failed}/${emailResult.total} email notifications failed.`);
          }
        } else {
          toast.warning('Donation published successfully, but email notifications were skipped (duplicate process detected).');
        }

      } catch (emailError) {
        console.error('Email notification error:', emailError);
        toast.warning('Donation published successfully, but email notifications failed to send.');
      }

      // Navigate after everything is complete
      navigate('/my-donations');

    } catch (error) {
      console.error('Error publishing donation:', error);
      // The error will no longer happen, but this catch block is still good to have
      toast.error(`Error publishing donation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card
            sx={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 4,
                borderRadius: '12px 12px 0 0'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={3}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 60,
                    height: 60,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Fastfood sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Tell us about your food donation
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Donation Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title || 'Give your donation a clear, descriptive title'}
                    placeholder="Fresh vegetables from my garden"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Description color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(103, 126, 234, 0.04)',
                        '&:hover': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description || 'Describe the food, its condition, and any special notes'}
                    placeholder="Fresh organic vegetables harvested this morning. Includes tomatoes, lettuce, and carrots. Perfect for families looking for healthy, fresh produce."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(103, 126, 234, 0.04)',
                        '&:hover': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    error={!!errors.category}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(103, 126, 234, 0.04)',
                        '&:hover': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        }
                      }
                    }}
                  >
                    <InputLabel>Food Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label="Food Category"
                      startAdornment={
                        <InputAdornment position="start">
                          <Category color="primary" />
                        </InputAdornment>
                      }
                    >
                      {foodCategories.map(category => (
                        <MenuItem key={category.value} value={category.value}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                bgcolor: category.color,
                                width: 32,
                                height: 32,
                                fontSize: '16px'
                              }}
                            >
                              {category.icon}
                            </Avatar>
                            <Typography fontWeight="medium">{category.value}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <FormHelperText>{errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                        inputProps={{ min: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Numbers color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'rgba(103, 126, 234, 0.04)',
                            '&:hover': {
                              backgroundColor: 'rgba(103, 126, 234, 0.08)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'rgba(103, 126, 234, 0.08)',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'rgba(103, 126, 234, 0.04)',
                            '&:hover': {
                              backgroundColor: 'rgba(103, 126, 234, 0.08)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'rgba(103, 126, 234, 0.08)',
                            }
                          }
                        }}
                      >
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={formData.unit}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                          label="Unit"
                          startAdornment={
                            <InputAdornment position="start">
                              <Scale color="primary" />
                            </InputAdornment>
                          }
                        >
                          {quantityUnits.map(unit => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Serving Size (Optional)"
                    value={formData.servingSize}
                    onChange={(e) => handleInputChange('servingSize', e.target.value)}
                    placeholder="Serves 4-6 people"
                    helperText="Estimate how many people this food can serve"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Group color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(103, 126, 234, 0.04)',
                        '&:hover': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(103, 126, 234, 0.08)',
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Box>
            {/* Expiry Information */}
            <Card
              sx={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                mb: 4
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                  color: 'white',
                  p: 4,
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 60,
                      height: 60,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <AccessTime sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Expiry & Timing
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      When does this food expire?
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Expiry Date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      error={!!errors.expiryDate}
                      helperText={errors.expiryDate || 'When does this food expire?'}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonth color="warning" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 152, 0, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Expiry Time"
                      value={formData.expiryTime}
                      onChange={(e) => handleInputChange('expiryTime', e.target.value)}
                      error={!!errors.expiryTime}
                      helperText={errors.expiryTime || 'What time does it expire?'}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Timer color="warning" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 152, 0, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Dietary Information */}
            <Card
              sx={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                mb: 4
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                  color: 'white',
                  p: 4,
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 60,
                      height: 60,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Nature sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Dietary Information
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Allergens and dietary preferences
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={allergens}
                      value={formData.allergens}
                      onChange={(event, newValue) => {
                        handleInputChange('allergens', newValue);
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                            color="warning"
                            sx={{ fontWeight: 'medium' }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Allergens"
                          placeholder="Select allergens present in this food"
                          helperText="Select all allergens that may be present in this food"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(0, 200, 83, 0.04)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 200, 83, 0.08)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(0, 200, 83, 0.08)',
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                      Dietary Preferences
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { key: 'isVegetarian', label: 'Vegetarian', icon: '🌱', color: '#4CAF50' },
                        { key: 'isVegan', label: 'Vegan', icon: '🌿', color: '#66BB6A' },
                        { key: 'isHalal', label: 'Halal', icon: '☪️', color: '#00BCD4' },
                        { key: 'isKosher', label: 'Kosher', icon: '✡️', color: '#3F51B5' },
                        { key: 'isGlutenFree', label: 'Gluten Free', icon: '🌾', color: '#FF9800' },
                      ].map((diet) => (
                        <Grid item xs={12} sm={6} md={4} key={diet.key}>
                          <Paper
                            elevation={formData[diet.key] ? 8 : 1}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              border: formData[diet.key] ? `3px solid ${diet.color}` : '1px solid rgba(0,0,0,0.1)',
                              bgcolor: formData[diet.key] ? `${diet.color}15` : 'background.paper',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 32px ${diet.color}40`
                              }
                            }}
                            onClick={() => handleInputChange(diet.key, !formData[diet.key])}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                sx={{
                                  bgcolor: diet.color,
                                  width: 40,
                                  height: 40,
                                  fontSize: '20px'
                                }}
                              >
                                {diet.icon}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography fontWeight="bold" color="text.primary">
                                  {diet.label}
                                </Typography>
                                <Switch
                                  checked={formData[diet.key]}
                                  onChange={(e) => handleInputChange(diet.key, e.target.checked)}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: diet.color,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: diet.color,
                                    },
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Images */}
            <Card
              sx={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                  color: 'white',
                  p: 4,
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 60,
                        height: 60,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Camera sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Food Images
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Add photos to make your donation more appealing ({formData.images.length}/5)
                      </Typography>
                    </Box>
                  </Stack>
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
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: 'bold',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)',
                        }
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </Button>
                  </label>
                </Stack>
              </Box>

              <CardContent sx={{ p: 4 }}>
                {formData.images.length > 0 ? (
                  <Grid container spacing={3}>
                    {formData.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          sx={{
                            position: 'relative',
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            '&:hover .delete-btn': {
                              opacity: 1,
                            },
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="200"
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
                              bgcolor: 'rgba(244, 67, 54, 0.9)',
                              color: 'white',
                              opacity: 0,
                              transition: 'all 0.3s ease',
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 1)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              p: 1,
                              textAlign: 'center'
                            }}
                          >
                            <Typography variant="caption" fontWeight="medium">
                              Image {index + 1}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      border: '3px dashed rgba(233, 30, 99, 0.3)',
                      borderRadius: 3,
                      bgcolor: 'rgba(233, 30, 99, 0.05)',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(233, 30, 99, 0.1)',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: '#E91E63' }} />
                    </Avatar>
                    <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                      No images uploaded yet
                    </Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                      Photos help receivers see what you're sharing and make your donation more trustworthy and appealing
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Card
              sx={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                mb: 4
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                  color: 'white',
                  p: 4,
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 60,
                      height: 60,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <LocationOn sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Pickup Location
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Where can receivers collect the food?
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pickup Address"
                      value={formData.pickupAddress}
                      onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                      error={!!errors.pickupAddress}
                      helperText={errors.pickupAddress || 'Full address where food can be picked up'}
                      placeholder="123 Main St, City, State 12345"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Home color="info" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Pickup Instructions"
                      value={formData.pickupInstructions}
                      onChange={(e) => handleInputChange('pickupInstructions', e.target.value)}
                      placeholder="Ring doorbell, food is in cooler by front door. Available between 9 AM - 6 PM. Please bring your own bags."
                      helperText="Specific instructions for pickup (entry, timing, contact, etc.)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Assignment color="info" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Available From"
                      type="time"
                      value={formData.availableFrom}
                      onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Earliest pickup time"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Schedule color="info" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Available Until"
                      type="time"
                      value={formData.availableUntil}
                      onChange={(e) => handleInputChange('availableUntil', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Latest pickup time"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Schedule color="info" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card
              sx={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
                  color: 'white',
                  p: 4,
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 60,
                      height: 60,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <ContactPhone sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Contact Information
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      How can receivers reach you?
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone || 'Phone number for pickup coordination'}
                  placeholder="+1 (555) 123-4567"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneAndroid sx={{ color: '#FF5722' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 87, 34, 0.04)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 87, 34, 0.08)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 87, 34, 0.08)',
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
                border: '1px solid rgba(33, 150, 243, 0.3)'
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Ready to Publish?
              </Typography>
              <Typography variant="body1">
                Please review all details before publishing your donation. Once published, receivers will be able to see and claim your food donation.
              </Typography>
            </Alert>

            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      height: 6
                    }}
                  />
                  <CardContent sx={{ p: 5 }}>
                    <Stack direction="row" spacing={4} mb={4}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 80,
                          height: 80,
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        <Restaurant sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom color="text.primary">
                          {formData.title}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ lineHeight: 1.6 }}>
                          {formData.description}
                        </Typography>

                        <Stack direction="row" spacing={2} flexWrap="wrap" mb={4}>
                          <Chip
                            label={formData.category}
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              px: 2,
                              py: 1
                            }}
                          />
                          <Chip
                            label={`${formData.quantity} ${formData.unit}`}
                            variant="outlined"
                            sx={{
                              borderWidth: 2,
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}
                          />
                          {formData.servingSize && (
                            <Chip
                              label={formData.servingSize}
                              variant="outlined"
                              sx={{
                                borderWidth: 2,
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}
                            />
                          )}
                          {formData.isVegetarian && (
                            <Chip
                              label="🌱 Vegetarian"
                              sx={{
                                bgcolor: '#4CAF50',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                          {formData.isVegan && (
                            <Chip
                              label="🌿 Vegan"
                              sx={{
                                bgcolor: '#66BB6A',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                          {formData.isHalal && (
                            <Chip
                              label="☪️ Halal"
                              sx={{
                                bgcolor: '#00BCD4',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                          {formData.isKosher && (
                            <Chip
                              label="✡️ Kosher"
                              sx={{
                                bgcolor: '#3F51B5',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                          {formData.isGlutenFree && (
                            <Chip
                              label="🌾 Gluten Free"
                              sx={{
                                bgcolor: '#FF9800',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Stack>

                        {formData.allergens.length > 0 && (
                          <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                              Allergens:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {formData.allergens.map((allergen) => (
                                <Chip
                                  key={allergen}
                                  label={allergen}
                                  color="warning"
                                  variant="outlined"
                                  sx={{ fontWeight: 'medium' }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        <Divider sx={{ mb: 4 }} />

                        <Grid container spacing={4}>
                          <Grid item xs={12} sm={6}>
                            <Paper
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                bgcolor: 'rgba(255, 152, 0, 0.05)',
                                border: '2px solid rgba(255, 152, 0, 0.2)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                  <Schedule />
                                </Avatar>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    EXPIRES
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                                    {new Date(`${formData.expiryDate}T${formData.expiryTime}`).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Paper
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                bgcolor: 'rgba(25, 118, 210, 0.05)',
                                border: '2px solid rgba(25, 118, 210, 0.2)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                  <LocationOn />
                                </Avatar>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    PICKUP LOCATION
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                                    {formData.pickupAddress}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          {(formData.availableFrom || formData.availableUntil) && (
                            <Grid item xs={12}>
                              <Paper
                                sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  bgcolor: 'rgba(76, 175, 80, 0.05)',
                                  border: '2px solid rgba(76, 175, 80, 0.2)'
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar sx={{ bgcolor: 'success.main' }}>
                                    <AccessTime />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                      PICKUP HOURS
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                                      {formData.availableFrom && formData.availableUntil
                                        ? `${formData.availableFrom} - ${formData.availableUntil}`
                                        : formData.availableFrom || formData.availableUntil || 'Flexible'
                                      }
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Paper>
                            </Grid>
                          )}
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
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      borderRadius: 3,
                      border: '1px solid rgba(0,0,0,0.08)'
                    }}
                  >
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                        color: 'white',
                        p: 3,
                        borderRadius: '12px 12px 0 0'
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Food Images
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        {formData.images.map((image, index) => (
                          <Grid item xs={6} key={index}>
                            <Box
                              sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '3px solid rgba(233, 30, 99, 0.2)',
                                boxShadow: '0 4px 16px rgba(233, 30, 99, 0.2)',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 8px 24px rgba(233, 30, 99, 0.3)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (userProfile?.role !== 'donor') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'warning.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
            <Restaurant sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Only donors can create food donations. Please contact support if you need to change your role.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/my-donations')}
            sx={{
              mb: 4,
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              bgcolor: 'white',
              color: 'text.primary',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'grey.50',
                transform: 'translateX(-4px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '4rem' }
              }}
            >
              {isEditing ? 'Edit Donation' : 'Create Food Donation'}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                fontSize: '1.3rem',
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 500
              }}
            >
              Share your surplus food with those who need it most
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Paper
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Stepper
            activeStep={activeStep}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{
              '& .MuiStepLabel-root': {
                alignItems: 'flex-start'
              },
              '& .MuiStepLabel-label': {
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&.Mui-active': {
                  color: 'primary.main',
                  fontWeight: 'bold'
                },
                '&.Mui-completed': {
                  color: 'success.main',
                  fontWeight: 'bold'
                },
              },
              '& .MuiStepIcon-root': {
                width: 40,
                height: 40,
                '&.Mui-active': {
                  color: 'primary.main',
                },
                '&.Mui-completed': {
                  color: 'success.main',
                },
              },
              '& .MuiStepConnector-line': {
                borderWidth: 3,
              },
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6" fontWeight="bold">
                    {step.label}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Box sx={{ mb: 6 }}>
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
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
              size="large"
              sx={{
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                '&:disabled': {
                  color: 'text.disabled',
                },
              }}
            >
              Previous
            </Button>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                onClick={saveDraft}
                disabled={loading}
                startIcon={<Save />}
                size="large"
                sx={{
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
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
                  startIcon={loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <Publish />}
                  size="large"
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(0, 200, 83, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00B248 0%, #43A047 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(0, 200, 83, 0.6)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Publishing...' : 'Publish Donation'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  size="large"
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Continue
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateDonation;