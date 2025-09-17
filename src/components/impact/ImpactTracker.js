// src/components/impact/ImpactTracker.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  Paper,
  Stack,
  Fade,
  IconButton,
  Tooltip,
  alpha,
  Skeleton
} from '@mui/material';
import {
  Nature,
  PeopleOutlined,
  RestaurantMenuOutlined,
  TrendingUpOutlined,
  LocationOnOutlined,
  AccessTimeOutlined,
  StarOutlined,
  ShareOutlined,
  InfoOutlined
} from '@mui/icons-material';
import { useRealTimeImpact } from '../../services/impactService';

// CountUp component simulation (you can install react-countup for better animation)
const CountUp = ({ end, duration = 2, decimals = 0 }) => {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = progress * end;
      setCount(decimals > 0 ? currentCount.toFixed(decimals) : Math.floor(currentCount));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, decimals]);

  return <span>{count}</span>;
};

const ImpactTracker = ({ userId, compact = false }) => {
  const { impactData, loading, error } = useRealTimeImpact(userId);

  const ImpactCard = ({ icon: Icon, title, value, unit, color, gradient, description, trend }) => (
    <Card
      sx={{
        height: '100%',
        background: gradient || `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(color, 0.15)}`,
          '& .impact-icon': {
            transform: 'scale(1.1) rotate(5deg)'
          }
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Avatar
            className="impact-icon"
            sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              width: 56,
              height: 56,
              transition: 'transform 0.3s ease'
            }}
          >
            <Icon sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>

          {trend && (
            <Chip
              icon={<TrendingUpOutlined />}
              label={`+${trend}%`}
              size="small"
              sx={{
                background: `linear-gradient(135deg, #00C853 0%, #4CAF50 100%)`,
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
        </Stack>

        <Typography variant="h3" sx={{ fontWeight: 800, color: color, mb: 1 }}>
          <CountUp end={value} duration={2} decimals={typeof value === 'number' && value % 1 !== 0 ? 1 : 0} />
          {unit && (
            <Typography component="span" variant="h5" sx={{ color: 'text.secondary', ml: 0.5 }}>
              {unit}
            </Typography>
          )}
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const CategoryProgress = ({ category }) => (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={600}>
          {category.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {category.count} donations ({category.percentage}%)
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={category.percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4
          }
        }}
      />
    </Box>
  );

  const handleShare = async () => {
    const shareData = {
      title: 'My Food Sharing Impact',
      text: `I've helped ${impactData?.peopleHelped || 0} people and saved ${impactData?.foodSaved || 0}kg of food through FoodShare!`,
      url: window.location.origin
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text} Join me at ${shareData.url}`
        );
        // You can add a toast notification here
        console.log('Impact shared to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {compact ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box flex={1}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Skeleton variant="text" width="100%" height={40} />
                <Skeleton variant="text" width="80%" height={16} />
              </Grid>
              <Grid item xs={6}>
                <Skeleton variant="text" width="100%" height={40} />
                <Skeleton variant="text" width="80%" height={16} />
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <Box>
            <Skeleton variant="text" width="40%" height={48} sx={{ mb: 4 }} />
            <Grid container spacing={3} mb={4}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    );
  }

  if (error || !impactData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Unable to load impact data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try refreshing the page
        </Typography>
      </Box>
    );
  }

  if (compact) {
    return (
      <Paper sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
            <Nature />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              Your Impact Today
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Real-time community contribution
            </Typography>
          </Box>
          <IconButton sx={{ color: 'white' }} onClick={handleShare}>
            <ShareOutlined />
          </IconButton>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h4" fontWeight={800}>
              <CountUp end={impactData.peopleHelped} duration={1.5} />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>People Helped</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h4" fontWeight={800}>
              <CountUp end={impactData.foodSaved} decimals={1} duration={1.5} />kg
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>Food Saved</Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Your Impact Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time tracking of your community contribution
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Share your impact">
            <IconButton
              onClick={handleShare}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <ShareOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Impact calculation info">
            <IconButton>
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Main Impact Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <ImpactCard
            icon={RestaurantMenuOutlined}
            title="Total Donations"
            value={impactData.totalDonations}
            color="#667eea"
            description="Food items shared with community"
            trend={impactData.monthlyGrowth}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ImpactCard
            icon={PeopleOutlined}
            title="People Helped"
            value={impactData.peopleHelped}
            color="#00C853"
            description="Lives touched through your donations"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ImpactCard
            icon={Nature}
            title="Food Saved"
            value={impactData.foodSaved}
            unit="kg"
            color="#FF9800"
            description="Food waste prevented"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ImpactCard
            icon={Nature}
            title="CO₂ Reduced"
            value={impactData.carbonFootprintReduced}
            unit="kg"
            color="#E91E63"
            description="Environmental impact reduction"
          />
        </Grid>
      </Grid>

      {/* Secondary Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Your Top Categories
              </Typography>
              <Chip
                label="This Month"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Stack>

            {impactData.topCategories?.map((category, index) => (
              <Fade in={true} timeout={800 + index * 200} key={category.name}>
                <div>
                  <CategoryProgress category={category} />
                </div>
              </Fade>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Community Ranking
            </Typography>

            <Stack spacing={3}>
              <Box textAlign="center">
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 1,
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem'
                  }}
                >
                  🏆
                </Avatar>
                <Typography variant="h4" fontWeight={800}>
                  #{impactData.localRank}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  In your area
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700}>
                  <CountUp end={impactData.totalImpactPoints} duration={2} />
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Impact Points
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="body1" fontWeight={600}>
                  #{impactData.globalRank}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Global Ranking
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Recent Impact Activity
        </Typography>

        <Stack spacing={2}>
          {impactData.recentActivity?.map((activity, index) => (
            <Fade in={true} timeout={1000 + index * 300} key={index}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(102, 126, 234, 0.04)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      background: activity.type === 'donation_completed'
                        ? 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)'
                        : activity.type === 'milestone_reached'
                          ? 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
                          : 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
                      width: 40,
                      height: 40
                    }}
                  >
                    {activity.type === 'donation_completed' && <RestaurantMenuOutlined />}
                    {activity.type === 'milestone_reached' && <StarOutlined />}
                    {activity.type === 'badge_earned' && <Nature />}
                  </Avatar>

                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {activity.type === 'donation_completed' && `Donation completed: ${activity.item}`}
                      {activity.type === 'milestone_reached' && `Milestone reached: ${activity.milestone}`}
                      {activity.type === 'badge_earned' && `New badge earned: ${activity.badge}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.date.toLocaleDateString()} • {activity.date.toLocaleTimeString()}
                    </Typography>
                  </Box>

                  {activity.impact && (
                    <Chip
                      label={`+${activity.impact} points`}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Stack>
              </Paper>
            </Fade>
          ))}
        </Stack>
      </Card>
    </Box>
  );
};

export default ImpactTracker;