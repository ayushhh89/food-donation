// src/pages/Achievements.js
import React from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../services/GamificationService';

const Achievements = () => {
  const { currentUser } = useAuth();
  const { gamificationData, loading } = useGamification(currentUser?.uid);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading achievements...</Typography>
      </Container>
    );
  }

  if (!gamificationData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>No achievements data available</Typography>
      </Container>
    );
  }

  const { level, totalPoints, badges = [], achievements = [] } = gamificationData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        Your Achievements
      </Typography>

      {/* Level Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 60, height: 60, fontSize: '2rem', bgcolor: level?.color }}>
              {level?.icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5">{level?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Level {level?.level} • {totalPoints} points
              </Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={level?.progress || 0} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {level?.pointsToNext > 0 ? `${level.pointsToNext} points to next level` : 'Max level reached!'}
          </Typography>
        </CardContent>
      </Card>

      {/* Badges */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Badges ({badges.length})
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {badges.map((badge, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 50, height: 50, fontSize: '1.5rem', bgcolor: badge.color }}>
                    {badge.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{badge.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {badge.description}
                    </Typography>
                    <Chip 
                      label={`${badge.points} pts`} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Achievements */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Achievements ({achievements.length})
      </Typography>
      <Grid container spacing={2}>
        {achievements.map((achievement, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{achievement.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {achievement.description}
                </Typography>
                <Chip 
                  label={`${achievement.points} pts`} 
                  size="small" 
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {badges.length === 0 && achievements.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Start donating to earn badges and achievements!
        </Typography>
      )}
    </Container>
  );
};

export default Achievements;