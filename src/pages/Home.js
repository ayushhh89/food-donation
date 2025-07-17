import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  Chip
} from '@mui/material';
import {
  Restaurant,
  People,
  LocationOn,
  Schedule,
  EnergySavingsLeaf,
  Favorite
} from '@mui/icons-material';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Share Food,
                <br />
                Share Hope
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Connect surplus food with people who need it. 
                Reduce waste, build community, make impact.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  startIcon={<Restaurant />}
                  onClick={() => window.location.href = '/create-donation'}
                >
                  Donate Food
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  startIcon={<People />}
                  onClick={() => window.location.href = '/browse'}
                >
                  Find Food
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Restaurant sx={{ fontSize: 120, opacity: 0.7 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <Restaurant sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h3" color="primary.main" gutterBottom>
                1,200+
              </Typography>
              <Typography variant="h6">
                Meals Shared
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <People sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h3" color="secondary.main" gutterBottom>
                350+
              </Typography>
              <Typography variant="h6">
                Community Members
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <EnergySavingsLeaf sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" color="success.main" gutterBottom>
                500kg
              </Typography>
              <Typography variant="h6">
                Waste Prevented
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Simple steps to share and receive food
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Restaurant sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">For Donors</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip label="1" color="primary" sx={{ mr: 2 }} />
                    <Typography>Post your surplus food with details</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip label="2" color="primary" sx={{ mr: 2 }} />
                    <Typography>Receivers express interest</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip label="3" color="primary" sx={{ mr: 2 }} />
                    <Typography>Coordinate pickup and share!</Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  startIcon={<Restaurant />}
                  onClick={() => window.location.href = '/create-donation'}
                >
                  Start Donating
                </Button>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <People sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Typography variant="h5">For Receivers</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip label="1" color="secondary" sx={{ mr: 2 }} />
                    <Typography>Browse available food donations</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip label="2" color="secondary" sx={{ mr: 2 }} />
                    <Typography>Express interest in items you need</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip label="3" color="secondary" sx={{ mr: 2 }} />
                    <Typography>Pick up and enjoy the food!</Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 3 }}
                  startIcon={<People />}
                  onClick={() => window.location.href = '/browse'}
                >
                  Find Food
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" textAlign="center" gutterBottom>
          Why Choose FoodShare?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <LocationOn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Local Community
              </Typography>
              <Typography color="text.secondary">
                Connect with neighbors in your area
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Schedule sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Real-time Updates
              </Typography>
              <Typography color="text.secondary">
                Get instant notifications about new donations
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <EnergySavingsLeaf sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Reduce Waste
              </Typography>
              <Typography color="text.secondary">
                Help prevent good food from going to waste
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Favorite sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Build Community
              </Typography>
              <Typography color="text.secondary">
                Create meaningful connections through sharing
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h4" gutterBottom>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join our community of food sharers and help reduce waste while helping others.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={() => window.location.href = '/register'}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
              onClick={() => window.location.href = '/browse'}
            >
              Browse Food
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;