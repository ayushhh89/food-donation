// src/components/timeline/DonationTimeline.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Fade,
  Skeleton,
  useTheme,
  alpha,
  Divider,
  Grid
} from '@mui/material';
import {
  RestaurantMenuOutlined,
  PeopleOutlined,
  EcoOutlined,
  StarOutlined,
  TrendingUpOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
  CheckCircleOutlined,
  AccessTimeOutlined,
  ShareOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  LocalDiningOutlined,
  CelebrationOutlined,
  VolunteerActivismOutlined
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

// Hook to get user's donation timeline data
const useTimelineData = (userId) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // This would connect to your existing Firebase services
    // For now, using mock data - replace with actual Firebase queries
    const fetchTimelineData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = [
          {
            id: '1',
            type: 'milestone',
            title: 'First Donation Milestone! 🎉',
            description: 'Congratulations on making your first donation!',
            date: new Date('2024-01-15'),
            icon: CelebrationOutlined,
            color: '#FF6B6B',
            points: 25
          },
          {
            id: '2',
            type: 'donation',
            title: 'Fresh Vegetables from Garden',
            description: 'Shared fresh tomatoes, lettuce, and carrots with 3 families',
            category: 'Fruits & Vegetables',
            quantity: '5 kg',
            peopleHelped: 8,
            status: 'completed',
            date: new Date('2024-01-15'),
            images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'],
            pickupLocation: 'Downtown Community Center'
          },
          {
            id: '3',
            type: 'donation',
            title: 'Homemade Soup for Shelter',
            description: 'Prepared nutritious vegetable soup for local shelter',
            category: 'Cooked Meals',
            quantity: '20 servings',
            peopleHelped: 20,
            status: 'completed',
            date: new Date('2024-01-22'),
            images: ['https://images.unsplash.com/photo-1547592180-85f173990554?w=400'],
            pickupLocation: 'Hope Shelter'
          },
          {
            id: '4',
            type: 'milestone',
            title: 'Community Hero Badge Earned! 🌟',
            description: 'You\'ve helped over 50 people through your donations',
            date: new Date('2024-02-01'),
            icon: StarOutlined,
            color: '#4ECDC4',
            points: 100
          },
          {
            id: '5',
            type: 'donation',
            title: 'Bakery Surplus Distribution',
            description: 'Fresh bread and pastries shared with community',
            category: 'Baked Goods',
            quantity: '30 pieces',
            peopleHelped: 15,
            status: 'completed',
            date: new Date('2024-02-10'),
            images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
            pickupLocation: 'Central Park'
          },
          {
            id: '6',
            type: 'donation',
            title: 'Weekly Grocery Share',
            description: 'Packaged foods and canned goods for families in need',
            category: 'Packaged Foods',
            quantity: '25 items',
            peopleHelped: 12,
            status: 'available',
            date: new Date('2024-02-28'),
            images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'],
            pickupLocation: 'Community Center'
          }
        ];

        setTimelineData(mockData.reverse()); // Most recent first
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [userId]);

  return { timelineData, loading, error };
};

const DonationTimeline = ({ userId, compact = false }) => {
  const { timelineData, loading, error } = useTimelineData(userId);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const theme = useTheme();

  const formatDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    
    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo <= 7) return `${daysAgo} days ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'available': return '#2196F3';
      case 'claimed': return '#FF9800';
      case 'expired': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const TimelineItemCard = ({ item, index }) => {
    const isExpanded = expandedItems.has(item.id);
    const isMilestone = item.type === 'milestone';

    return (
      <TimelineItem sx={{ minHeight: 120 }}>
        <TimelineSeparator>
          <TimelineDot
            sx={{
              bgcolor: isMilestone ? item.color : getStatusColor(item.status),
              width: 56,
              height: 56,
              border: `4px solid ${alpha(isMilestone ? item.color : getStatusColor(item.status), 0.2)}`,
              boxShadow: `0 4px 20px ${alpha(isMilestone ? item.color : getStatusColor(item.status), 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMilestone ? (
              <item.icon sx={{ color: 'white', fontSize: 24 }} />
            ) : (
              <RestaurantMenuOutlined sx={{ color: 'white', fontSize: 24 }} />
            )}
          </TimelineDot>
          {index < timelineData.length - 1 && (
            <TimelineConnector 
              sx={{ 
                bgcolor: 'rgba(102, 126, 234, 0.2)',
                width: 3
              }} 
            />
          )}
        </TimelineSeparator>

        <TimelineContent sx={{ pb: 4 }}>
          <Card
            sx={{
              ml: 2,
              background: isMilestone 
                ? `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.05)} 100%)`
                : 'rgba(255, 255, 255, 0.9)',
              border: isMilestone 
                ? `2px solid ${alpha(item.color, 0.3)}`
                : '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 3,
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 32px ${alpha(isMilestone ? item.color : getStatusColor(item.status), 0.15)}`
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header */}
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: isMilestone ? item.color : 'text.primary'
                      }}
                    >
                      {item.title}
                    </Typography>
                    {item.points && (
                      <Chip
                        label={`+${item.points} pts`}
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${item.color} 0%, ${alpha(item.color, 0.8)} 100%)`,
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Stack>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, lineHeight: 1.6 }}
                  >
                    {item.description}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<CalendarTodayOutlined />}
                      label={formatDate(item.date)}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />

                    {!isMilestone && (
                      <>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(item.status),
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                      </>
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Tooltip title="Share this achievement">
                    <IconButton
                      size="small"
                      sx={{ 
                        color: isMilestone ? item.color : 'text.secondary',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    >
                      <ShareOutlined />
                    </IconButton>
                  </Tooltip>

                  {!isMilestone && (
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(item.id)}
                      sx={{ 
                        color: 'text.secondary',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {isExpanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              {/* Expanded Content */}
              {!isMilestone && isExpanded && (
                <Fade in={isExpanded}>
                  <Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    {/* Stats */}
                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                          <Typography variant="h6" fontWeight={700} color="primary">
                            {item.quantity}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Donated
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(0, 200, 83, 0.05)' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#00C853' }}>
                            {item.peopleHelped}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            People Helped
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#FF9800' }}>
                            {Math.round(item.peopleHelped * 0.5)}kg
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Food Saved
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Location */}
                    {item.pickupLocation && (
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <LocationOnOutlined sx={{ color: 'text.secondary', fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary">
                          {item.pickupLocation}
                        </Typography>
                      </Stack>
                    )}

                    {/* Images */}
                    {item.images && item.images.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                          Photos
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {item.images.slice(0, 3).map((image, idx) => (
                            <Box
                              key={idx}
                              component="img"
                              src={image}
                              alt={`${item.title} ${idx + 1}`}
                              sx={{
                                width: 80,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  borderColor: '#667eea'
                                }
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </TimelineContent>
      </TimelineItem>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="50%" height={48} sx={{ mb: 4 }} />
        <Timeline>
          {[1, 2, 3].map((i) => (
            <TimelineItem key={i}>
              <TimelineSeparator>
                <Skeleton variant="circular" width={56} height={56} />
                {i < 3 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Skeleton variant="rectangular" height={120} sx={{ ml: 2, borderRadius: 3 }} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    );
  }

  if (error || timelineData.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <LocalDiningOutlined sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Your Journey Starts Here
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create your first donation to start building your impact timeline
        </Typography>
        <Button
          variant="contained"
          startIcon={<VolunteerActivismOutlined />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600
          }}
        >
          Create First Donation
        </Button>
      </Paper>
    );
  }

  const displayItems = showAll ? timelineData : timelineData.slice(0, compact ? 3 : 5);

  return (
    <Box>
      {!compact && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Your Food Sharing Journey
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A timeline of your community impact and achievements
            </Typography>
          </Box>

          {timelineData.length > 5 && (
            <Button
              variant={showAll ? "outlined" : "contained"}
              onClick={() => setShowAll(!showAll)}
              sx={{
                borderRadius: 3,
                px: 3,
                background: showAll ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600
              }}
            >
              {showAll ? 'Show Less' : `View All ${timelineData.length} Items`}
            </Button>
          )}
        </Stack>
      )}

      <Timeline
        sx={{
          '& .MuiTimelineItem-root': {
            '&:before': {
              display: 'none'
            }
          }
        }}
      >
        {displayItems.map((item, index) => (
          <Fade key={item.id} in={true} timeout={600 + index * 200}>
            <div>
              <TimelineItemCard item={item} index={index} />
            </div>
          </Fade>
        ))}
      </Timeline>

      {compact && timelineData.length > 3 && !showAll && (
        <Box sx={{ textAlign: 'center', pt: 2 }}>
          <Button
            variant="text"
            onClick={() => setShowAll(true)}
            sx={{
              color: '#667eea',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.08)'
              }
            }}
          >
            View All {timelineData.length} Timeline Items
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DonationTimeline;