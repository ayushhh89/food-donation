// src/components/gamification/BadgeShowcase.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Fade,
  alpha
} from '@mui/material';
import {
  EmojiEventsOutlined,
  LockOutlined,
  InfoOutlined,
  CloseOutlined,
  TrendingUpOutlined
} from '@mui/icons-material';
import { useGamification } from '../../services/gamificationService';

// Individual Badge Component
export const BadgeCard = ({ badge, earned = false, progress = 0, onClick, size = 'medium' }) => {
  const sizeConfig = {
    small: { avatar: 40, spacing: 1 },
    medium: { avatar: 60, spacing: 2 },
    large: { avatar: 80, spacing: 3 }
  };

  const config = sizeConfig[size];

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: earned 
          ? `linear-gradient(135deg, ${alpha(badge.color, 0.1)} 0%, ${alpha(badge.color, 0.05)} 100%)`
          : 'rgba(0,0,0,0.02)',
        border: earned 
          ? `2px solid ${alpha(badge.color, 0.3)}`
          : '2px solid rgba(0,0,0,0.1)',
        filter: earned ? 'none' : 'grayscale(60%)',
        opacity: earned ? 1 : 0.7,
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: earned 
            ? `0 8px 32px ${alpha(badge.color, 0.3)}`
            : '0 8px 32px rgba(0,0,0,0.1)',
          filter: 'none',
          opacity: 1
        }
      }}
    >
      <CardContent sx={{ p: config.spacing, textAlign: 'center' }}>
        <Stack spacing={config.spacing} alignItems="center">
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: config.avatar,
                height: config.avatar,
                background: earned 
                  ? `linear-gradient(135deg, ${badge.color} 0%, ${alpha(badge.color, 0.8)} 100%)`
                  : 'rgba(0,0,0,0.2)',
                fontSize: config.avatar * 0.4,
                border: `3px solid ${earned ? 'white' : 'transparent'}`,
                boxShadow: earned ? `0 4px 20px ${alpha(badge.color, 0.4)}` : 'none'
              }}
            >
              {earned ? badge.icon : <LockOutlined />}
            </Avatar>
            
            {!earned && progress > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: config.avatar + 10,
                  px: 1
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: badge.color,
                      borderRadius: 2
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ minHeight: size === 'small' ? 'auto' : 40 }}>
            <Typography 
              variant={size === 'small' ? 'caption' : 'subtitle2'} 
              fontWeight={700}
              color={earned ? 'text.primary' : 'text.secondary'}
              sx={{ lineHeight: 1.2 }}
            >
              {badge.name}
            </Typography>
            
            {size !== 'small' && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                {badge.description}
              </Typography>
            )}
          </Box>

          {earned && badge.points && (
            <Chip
              label={`+${badge.points} pts`}
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${badge.color} 0%, ${alpha(badge.color, 0.8)} 100%)`,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Badge Showcase Component
export const BadgeShowcase = ({ userId, compact = false }) => {
  const { gamificationData, loading } = useGamification(userId);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }} />
                <Typography variant="caption">Loading...</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const earnedBadges = gamificationData?.badges || [];
  const earnedBadgeIds = earnedBadges.map(b => b.id);

  // Get all badges from service (you'd import gamificationService here)
  const allBadges = [
    // Mock badges for demo - replace with gamificationService.getAllBadges()
    { id: 'first_donation', name: 'First Steps', description: 'Made your first donation', icon: '🎯', color: '#4CAF50', points: 50 },
    { id: 'generous_giver', name: 'Generous Giver', description: '5 completed donations', icon: '🤲', color: '#2196F3', points: 100 },
    { id: 'people_helper', name: 'People Helper', description: 'Helped 25 people', icon: '👥', color: '#FF9800', points: 150 },
    { id: 'community_hero', name: 'Community Hero', description: 'Helped 100+ people', icon: '🦸', color: '#E91E63', points: 300 },
    { id: 'eco_warrior', name: 'Eco Warrior', description: 'Saved 50kg food', icon: '🌱', color: '#4CAF50', points: 200 },
    { id: 'carbon_reducer', name: 'Carbon Reducer', description: 'Reduced 100kg CO2', icon: '🌍', color: '#00BCD4', points: 250 }
  ];

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setDetailDialog(true);
  };

  if (compact) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Latest Badges
          </Typography>
          <Chip
            label={`${earnedBadges.length} earned`}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Stack>

        <Grid container spacing={1}>
          {earnedBadges.slice(-4).map((badge, index) => (
            <Grid item xs={3} key={badge.id}>
              <BadgeCard 
                badge={badge} 
                earned={true} 
                size="small"
                onClick={() => handleBadgeClick(badge)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Badge Collection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {earnedBadges.length} of {allBadges.length} badges earned
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<EmojiEventsOutlined />}
            label={`${Math.round((earnedBadges.length / allBadges.length) * 100)}% Complete`}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {allBadges.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id);
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={badge.id}>
              <Fade in={true} timeout={500}>
                <div>
                  <BadgeCard 
                    badge={badge} 
                    earned={earned}
                    onClick={() => handleBadgeClick(badge)}
                  />
                </div>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Badge Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedBadge && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <IconButton
                onClick={() => setDetailDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseOutlined />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  background: `linear-gradient(135deg, ${selectedBadge.color} 0%, ${alpha(selectedBadge.color, 0.8)} 100%)`,
                  fontSize: '3rem',
                  boxShadow: `0 8px 32px ${alpha(selectedBadge.color, 0.4)}`
                }}
              >
                {selectedBadge.icon}
              </Avatar>

              <Typography variant="h4" fontWeight={800} gutterBottom>
                {selectedBadge.name}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {selectedBadge.description}
              </Typography>

              {selectedBadge.points && (
                <Chip
                  label={`Worth ${selectedBadge.points} points`}
                  sx={{
                    background: `linear-gradient(135deg, ${selectedBadge.color} 0%, ${alpha(selectedBadge.color, 0.8)} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2,
                    px: 3
                  }}
                />
              )}

              {earnedBadgeIds.includes(selectedBadge.id) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Earned on {new Date().toLocaleDateString()}
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// Level Progress Component
export const LevelProgress = ({ userId, compact = false }) => {
  const { gamificationData, loading } = useGamification(userId);

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Loading level...</Typography>
      </Paper>
    );
  }

  const level = gamificationData?.level || { level: 1, name: 'Food Friend', progress: 0, color: '#9E9E9E' };
  const totalPoints = gamificationData?.totalPoints || 0;

  if (compact) {
    return (
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${level.color}15 0%, ${level.color}05 100%)`,
        border: `1px solid ${alpha(level.color, 0.2)}`
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              background: `linear-gradient(135deg, ${level.color} 0%, ${alpha(level.color, 0.8)} 100%)`,
              fontSize: '1.5rem'
            }}
          >
            {level.icon}
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              Level {level.level}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {level.name}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={level.progress}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: `${level.color}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: level.color,
                  borderRadius: 3
                }
              }}
            />
          </Box>

          <Box textAlign="right">
            <Typography variant="h6" fontWeight={700} color={level.color}>
              {totalPoints}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              points
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Card sx={{ 
      p: 4, 
      borderRadius: 3,
      background: `linear-gradient(135deg, ${level.color} 0%, ${alpha(level.color, 0.8)} 100%)`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={3} mb={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.2)',
              fontSize: '2.5rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            {level.icon}
          </Avatar>
          
          <Box>
            <Typography variant="h3" fontWeight={800}>
              Level {level.level}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              {level.name}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body1" fontWeight={600}>
              Progress to Level {level.level + 1}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {Math.round(level.progress)}%
            </Typography>
          </Stack>
          
          <LinearProgress
            variant="determinate"
            value={level.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
                borderRadius: 4
              }
            }}
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {totalPoints}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Points
            </Typography>
          </Box>
          
          {level.pointsToNext > 0 && (
            <Box textAlign="right">
              <Typography variant="h6" fontWeight={700}>
                {level.pointsToNext}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                points to next level
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

// Leaderboard Component
export const Leaderboard = ({ limit = 10, timeframe = 'all' }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock leaderboard data - replace with actual service call
    const mockData = [
      { rank: 1, name: 'Sarah Chen', totalPoints: 15420, level: { level: 8, name: 'Eco Guardian', color: '#00BCD4', icon: '🌟' }, badges: 12, peopleHelped: 245 },
      { rank: 2, name: 'Miguel Rodriguez', totalPoints: 12850, level: { level: 7, name: 'Community Hero', color: '#9C27B0', icon: '🦸' }, badges: 10, peopleHelped: 198 },
      { rank: 3, name: 'Emma Thompson', totalPoints: 11200, level: { level: 6, name: 'Impact Champion', color: '#E91E63', icon: '🏆' }, badges: 9, peopleHelped: 176 },
      { rank: 4, name: 'David Kim', totalPoints: 9680, level: { level: 6, name: 'Impact Champion', color: '#E91E63', icon: '🏆' }, badges: 8, peopleHelped: 142 },
      { rank: 5, name: 'Lisa Wang', totalPoints: 8750, level: { level: 5, name: 'Sharing Superstar', color: '#FF9800', icon: '⭐' }, badges: 7, peopleHelped: 128 }
    ];

    setTimeout(() => {
      setLeaderboardData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeframe, limit]);

  if (loading) {
    return (
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Loading leaderboard...</Typography>
        {[1, 2, 3, 4, 5].map(i => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 40, height: 40 }} />
            <Box flex={1}>
              <Typography variant="body1">Loading...</Typography>
            </Box>
          </Box>
        ))}
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          🏆 Leaderboard
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Top contributors this {timeframe}
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {leaderboardData.map((user, index) => (
            <Paper
              key={user.rank}
              sx={{
                p: 2,
                borderRadius: 2,
                background: user.rank <= 3 
                  ? `linear-gradient(135deg, ${user.level.color}15 0%, ${user.level.color}05 100%)`
                  : 'rgba(0,0,0,0.02)',
                border: user.rank <= 3 ? `2px solid ${alpha(user.level.color, 0.3)}` : '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: user.rank <= 3 
                      ? `linear-gradient(135deg, ${user.level.color} 0%, ${alpha(user.level.color, 0.8)} 100%)`
                      : 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem'
                  }}
                >
                  {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                </Box>

                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    background: `linear-gradient(135deg, ${user.level.color} 0%, ${alpha(user.level.color, 0.8)} 100%)`,
                    fontSize: '1.5rem'
                  }}
                >
                  {user.level.icon}
                </Avatar>

                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Level {user.level.level} • {user.level.name}
                  </Typography>
                </Box>

                <Stack alignItems="flex-end" spacing={0.5}>
                  <Typography variant="h6" fontWeight={700} color={user.level.color}>
                    {user.totalPoints.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.peopleHelped} people helped
                  </Typography>
                </Stack>

                <Chip
                  label={`${user.badges} badges`}
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${user.level.color} 0%, ${alpha(user.level.color, 0.8)} 100%)`,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

export default BadgeShowcase;