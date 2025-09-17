// src/components/sharing/SocialShareButton.js
import React, { useState } from 'react';
import {
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Snackbar,
  Alert,
  Avatar,
  Chip,
    Grid
} from '@mui/material';
import {
  ShareOutlined,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Telegram,
  ContentCopy,
  DownloadOutlined,
  QrCodeOutlined,
  CloseOutlined
} from '@mui/icons-material';
import { useSocialSharing } from '../../services/socialSharingService';

// Add these helper functions after imports:
const getPlatformIcon = (platform) => {
  const icons = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: LinkedIn,
    whatsapp: WhatsApp,
    telegram: Telegram,
    clipboard: ContentCopy
  };
  return icons[platform] || ShareOutlined;
};
const getPlatformColor = (platform) => {
  const colors = {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    whatsapp: '#25D366',
    telegram: '#0088CC',
    clipboard: '#6C757D'
  };
  return colors[platform] || '#667eea';
};

const getPlatformName = (platform) => {
  const names = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    clipboard: 'Copy Link'
  };
  return names[platform] || platform;
};

const SocialShareButton = ({ 
  type, 
  data, 
  variant = 'icon', 
  size = 'medium',
  showLabel = false,
  platforms = ['all'] // or specify: ['facebook', 'twitter', 'whatsapp', 'clipboard']
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { share, generateImage, downloadImage, isSharing, platformAvailability } = useSocialSharing();
  
  const handleClick = (event) => {
    if (platforms.length === 1 && platforms[0] !== 'all') {
      // Direct share for single platform
      handleShare(platforms[0]);
    } else {
      setAnchorEl(event.currentTarget);
      generateSharePreview();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const generateSharePreview = () => {
    try {
      let preview;
      switch (type) {
        case 'donation':
          preview = {
            title: `${data.title} - Available on FoodShare`,
            description: `${data.quantity} ${data.unit} of ${data.category}`,
            image: data.images?.[0],
            url: `${window.location.origin}/donation/${data.id}`
          };
          break;
        case 'impact':
          preview = {
            title: `My Food Sharing Impact`,
            description: `Helped ${data.impactData.peopleHelped} people, saved ${data.impactData.foodSaved}kg food`,
            stats: data.impactData,
            url: window.location.origin
          };
          break;
        case 'milestone':
          preview = {
            title: `Achievement Unlocked: ${data.milestone.name}`,
            description: data.milestone.description,
            badge: data.milestone,
            url: window.location.origin
          };
          break;
      }
      setShareData(preview);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleShare = async (platform) => {
    try {
      const result = await share(type, data, { platform });
      
      if (result.success) {
        let message = 'Shared successfully!';
        switch (result.method) {
          case 'native':
            message = 'Shared via system dialog';
            break;
          case 'clipboard':
          case 'clipboard_legacy':
            message = 'Copied to clipboard!';
            break;
          case 'facebook':
            message = 'Opened Facebook share dialog';
            break;
          case 'twitter':
            message = 'Opened Twitter share dialog';
            break;
          case 'linkedin':
            message = 'Opened LinkedIn share dialog';
            break;
          case 'whatsapp':
            message = 'Opened WhatsApp';
            break;
          case 'telegram':
            message = 'Opened Telegram';
            break;
        }
        
        setSnackbar({ open: true, message, severity: 'success' });
      } else {
        setSnackbar({ 
          open: true, 
          message: result.error || 'Share failed', 
          severity: 'error' 
        });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Share failed', 
        severity: 'error' 
      });
    }
    
    handleClose();
  };

  const handleGenerateImage = async () => {
    try {
      const imageData = await generateImage('share-preview', {
        width: 1200,
        height: 630,
        backgroundColor: '#ffffff'
      });
      
      if (imageData) {
        downloadImage(imageData, `foodshare-${type}-${Date.now()}.png`);
        setSnackbar({ 
          open: true, 
          message: 'Image downloaded successfully!', 
          severity: 'success' 
        });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to generate image', 
        severity: 'error' 
      });
    }
  };

  // const getPlatformIcon = (platform) => {
  //   const icons = {
  //     facebook: FacebookOutlined,
  //     twitter: TwitterOutlined,
  //     linkedin: LinkedIn,
  //     whatsapp: WhatsApp,
  //     telegram: Telegram,
  //     clipboard: ContentCopyOutlined
  //   };
  //   return icons[platform] || ShareOutlined;
  // };

  // const getPlatformColor = (platform) => {
  //   const colors = {
  //     facebook: '#1877F2',
  //     twitter: '#1DA1F2',
  //     linkedin: '#0A66C2',
  //     whatsapp: '#25D366',
  //     telegram: '#0088CC',
  //     clipboard: '#6C757D'
  //   };
  //   return colors[platform] || '#667eea';
  // };

  // const getPlatformName = (platform) => {
  //   const names = {
  //     facebook: 'Facebook',
  //     twitter: 'Twitter',
  //     linkedin: 'LinkedIn',
  //     whatsapp: 'WhatsApp',
  //     telegram: 'Telegram',
  //     clipboard: 'Copy Link'
  //   };
  //   return names[platform] || platform;
  // };

  const availablePlatforms = platforms[0] === 'all' 
    ? ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'clipboard']
    : platforms.filter(platform => platformAvailability[platform]);

  const ShareButton = ({ children, ...props }) => {
    if (variant === 'button') {
      return (
        <Button
          startIcon={<ShareOutlined />}
          onClick={handleClick}
          disabled={isSharing}
          size={size}
          {...props}
        >
          {showLabel && (children || 'Share')}
        </Button>
      );
    }
    
    return (
      <Tooltip title={showLabel ? undefined : 'Share'}>
        <IconButton
          onClick={handleClick}
          disabled={isSharing}
          size={size}
          {...props}
        >
          <ShareOutlined />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <>
      <ShareButton />

      {/* Platform Selection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
            Share via:
          </Typography>
        </Box>

        {availablePlatforms.map((platform) => {
          const IconComponent = getPlatformIcon(platform);
          return (
            <MenuItem
              key={platform}
              onClick={() => handleShare(platform)}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: `${getPlatformColor(platform)}15`,
                  '& .MuiListItemIcon-root': {
                    color: getPlatformColor(platform)
                  }
                }
              }}
            >
              <ListItemIcon>
                <IconComponent sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary={getPlatformName(platform)} />
            </MenuItem>
          );
        })}

        {type === 'impact' && (
          <>
            <MenuItem
              onClick={() => setPreviewDialog(true)}
              sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon>
                <QrCodeOutlined sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary="Generate Image" />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Share Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Share Preview
          </Typography>
          <IconButton onClick={() => setPreviewDialog(false)}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 0 }}>
          {shareData && (
            <Box id="share-preview">
              <Paper
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
                    `,
                    zIndex: 0
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      🍽️
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        FoodShare
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Reducing Food Waste Together
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="h4" fontWeight={800} mb={2}>
                    {shareData.title}
                  </Typography>

                  <Typography variant="body1" sx={{ opacity: 0.95, mb: 3 }}>
                    {shareData.description}
                  </Typography>

                  {/* Stats for impact sharing */}
                  {shareData.stats && (
                    <Stack direction="row" spacing={3} mb={3}>
                      {[
                        { label: 'Donations', value: shareData.stats.totalDonations },
                        { label: 'People Helped', value: shareData.stats.peopleHelped },
                        { label: 'Food Saved', value: `${shareData.stats.foodSaved}kg` }
                      ].map((stat, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={800}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  {/* Badge for milestone */}
                  {shareData.badge && (
                    <Chip
                      label={shareData.badge.name}
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                        mb: 2
                      }}
                    />
                  )}

                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Join the movement at {window.location.hostname}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Custom message (optional)"
              multiline
              rows={3}
              variant="outlined"
              placeholder="Add your personal message..."
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            startIcon={<DownloadOutlined />}
            onClick={handleGenerateImage}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Download Image
          </Button>
          <Button
            startIcon={<ShareOutlined />}
            onClick={() => handleShare('clipboard')}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Share Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Standalone Share Dialog Component
export const SocialShareDialog = ({ 
  open, 
  onClose, 
  type, 
  data, 
  title = "Share" 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose how you'd like to share
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Grid container spacing={2}>
          {['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'clipboard'].map((platform) => (
            <Grid item xs={6} key={platform}>
              <SocialShareButton
                type={type}
                data={data}
                variant="button"
                platforms={[platform]}
                showLabel
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  py: 2,
                  borderRadius: 2,
                  border: '2px solid transparent',
                  '&:hover': {
                    border: `2px solid ${getPlatformColor(platform)}`,
                    bgcolor: `${getPlatformColor(platform)}08`
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareButton;