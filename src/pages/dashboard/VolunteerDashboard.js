// src/pages/dashboard/VolunteerDashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Switch, FormControlLabel, CircularProgress, Avatar } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { VolunteerActivism } from '@mui/icons-material';

const VolunteerDashboard = () => {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsActive(data.isActive === 1 || data.isActive === true);
          }
        } catch (error) {
          console.error('Error fetching status:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadStatus();
  }, [currentUser]);

  const handleToggle = async () => {
    if (!currentUser) return;
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newStatus = !isActive;
      await updateDoc(userRef, { isActive: newStatus ? 1 : 0 });
      setIsActive(newStatus);

      if (fetchUserProfile) fetchUserProfile(currentUser.uid);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
          }}
        >
          <VolunteerActivism sx={{ fontSize: 40, color: 'white' }} />
        </Avatar>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mt: 2,
            mb: 1,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          Volunteer Dashboard
        </Typography>
        <Typography sx={{ color: '#444', fontSize: '1.1rem' }}>
          Welcome {userProfile?.name || 'Volunteer'}! Manage your assignments and status.
        </Typography>
      </Box>

      {/* Active Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={handleToggle}
              color="primary"
              disabled={updating}
              sx={{ '& .MuiSwitch-thumb': { boxShadow: '0 2px 4px rgba(0,0,0,0.3)' } }}
            />
          }
          label={
            <Typography sx={{ fontWeight: 600, color: isActive ? '#2e7d32' : '#c62828' }}>
              {isActive ? 'Active 🚚' : 'Inactive ❌'}
            </Typography>
          }
        />
      </Box>

      {/* Cards */}
      <Grid container spacing={4}>
        {[
          {
            title: 'Assigned Donors',
            desc: 'Manage and connect with the donors you’re helping.',
            btnText: 'View Donors',
            btnColor: 'primary',
          },
          {
            title: 'Assigned Receivers',
            desc: 'Track and coordinate food distribution with receivers.',
            btnText: 'View Receivers',
            btnColor: 'secondary',
          },
          {
            title: 'Progress',
            desc: 'Keep an eye on your contributions and approvals.',
            btnText: 'Check Progress',
            btnColor: 'success',
          },
        ].map((card, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                background: '#fff',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  {card.title}
                </Typography>
                <Typography sx={{ mb: 3, color: '#555' }}>{card.desc}</Typography>
                <Button variant="contained" color={card.btnColor}>
                  {card.btnText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VolunteerDashboard;
