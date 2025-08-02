import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  Chip,
  Avatar,
  Paper,
  CardContent,
  IconButton,
  Divider,
  Rating,
  Fade,
  Slide,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Restaurant,
  People,
  LocationOn,
  Schedule,
  EnergySavingsLeaf,
  Favorite,
  TrendingUp,
  Security,
  Speed,
  EmojiEvents,
  Star,
  ArrowForward,
  PlayArrow,
  CheckCircle,
  LocalDining,
  Group,
  ConnectWithoutContact,
  VolunteerActivism,
  FormatQuote,
  ExpandMore,
  Email,
  Phone,
  Timeline,
  Community,
  Handshake,
  Public,
  AutoGraph,
  Verified,
  Diversity3,
  RecyclingOutlined,
  FoodBank,
  Restaurant as RestaurantIcon,
  Groups,
  LocalShipping,
  NotificationsActive,
  Share,
  StarBorder,
  AccessTime,
  CheckCircleOutline,
  TrendingDown,
  BarChart,
  PieChart,
  ShowChart,
  Celebration,
  EmojiPeople,
  FavoriteOutlined,
  ThumbUp,
  Psychology,
  Lightbulb,
  Build,
  School,
  Work,
  Home,
  FamilyRestroom
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Community Volunteer",
      avatar: "S",
      rating: 5,
      text: "FoodShare has revolutionized how our community handles food waste. It's incredible to see neighbors helping neighbors!"
    },
    {
      name: "Michael Rodriguez",
      role: "Restaurant Owner",
      avatar: "M",
      rating: 5,
      text: "Instead of throwing away perfectly good food, we now share it with families who need it. Win-win for everyone!"
    },
    {
      name: "Emma Thompson",
      role: "Working Parent",
      avatar: "E",
      rating: 5,
      text: "This platform has been a lifesaver for our family. Fresh, quality food shared by generous neighbors."
    }
  ];

  const impactStats = [
    { number: "2,500+", label: "Meals Shared", icon: Restaurant, color: "#00C853", gradient: "linear-gradient(135deg, #00C853 0%, #69F0AE 100%)" },
    { number: "850+", label: "Active Members", icon: People, color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #9C9EFE 100%)" },
    { number: "1.2K kg", label: "Waste Prevented", icon: EnergySavingsLeaf, color: "#FF9800", gradient: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)" },
    { number: "95%", label: "Success Rate", icon: EmojiEvents, color: "#E91E63", gradient: "linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)" }
  ];

  const features = [
    {
      icon: LocationOn,
      title: "Hyperlocal Network",
      description: "Connect with neighbors within walking distance for maximum freshness and community impact",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      icon: Speed,
      title: "Real-time Matching",
      description: "AI-powered smart matching ensures food reaches the right people at the right time",
      gradient: "linear-gradient(135deg, #00C853 0%, #4CAF50 100%)"
    },
    {
      icon: Security,
      title: "Trust & Safety",
      description: "Verified profiles, ratings, and secure communication for peace of mind",
      gradient: "linear-gradient(135deg, #FF9800 0%, #FFC107 100%)"
    },
    {
      icon: VolunteerActivism,
      title: "Community Impact",
      description: "Track your positive impact and see how you're making a difference",
      gradient: "linear-gradient(135deg, #E91E63 0%, #F06292 100%)"
    }
  ];

  const successStories = [
    {
      title: "Local Restaurant Saves 500kg of Food",
      description: "Marina's Bistro partnered with FoodShare to donate surplus food daily, preventing waste and feeding 200+ families monthly.",
      impact: "500kg saved",
      timeframe: "This month",
      avatar: "M",
      color: "#00C853"
    },
    {
      title: "College Students Create Food Network",
      description: "University students organized a campus-wide food sharing initiative, connecting dining halls with student communities.",
      impact: "1000+ meals",
      timeframe: "Last semester",
      avatar: "U",
      color: "#667eea"
    },
    {
      title: "Neighborhood Hero Feeds 50 Families",
      description: "Local volunteer coordinates weekly food distributions, creating lasting relationships and community bonds.",
      impact: "50 families",
      timeframe: "Weekly",
      avatar: "H",
      color: "#FF9800"
    }
  ];

  const communityHighlights = [
    { icon: Groups, label: "Active Communities", value: "120+", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #9C9EFE 100%)" },
    { icon: Public, label: "Cities Served", value: "45+", color: "#00C853", gradient: "linear-gradient(135deg, #00C853 0%, #69F0AE 100%)" },
    { icon: Handshake, label: "Partnerships", value: "200+", color: "#FF9800", gradient: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)" },
    { icon: Diversity3, label: "Volunteers", value: "500+", color: "#E91E63", gradient: "linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)" }
  ];

  const faqs = [
    {
      question: "How does FoodShare ensure food safety?",
      answer: "We have strict guidelines for food donors, including freshness requirements, proper storage instructions, and hygiene standards. All users are verified, and we provide safety tips for both donors and receivers."
    },
    {
      question: "Is there a cost to use FoodShare?",
      answer: "FoodShare is completely free for all users. Our mission is to reduce food waste and help communities, not to profit from it. The platform is supported by partnerships and grants."
    },
    {
      question: "How do I know if food is still good to eat?",
      answer: "Donors are required to provide accurate information about food freshness, expiration dates, and storage conditions. We also provide guidelines on food safety and encourage users to use their best judgment."
    },
    {
      question: "Can businesses and restaurants join?",
      answer: "Absolutely! We welcome restaurants, cafes, grocery stores, and other food businesses. Many of our most impactful partnerships are with local businesses looking to reduce waste."
    },
    {
      question: "How do pickups work?",
      answer: "Donors and receivers coordinate pickup times and locations through our secure messaging system. Most pickups happen at convenient public locations or the donor's preferred spot."
    }
  ];

  const platformFeatures = [
    { icon: NotificationsActive, title: "Smart Notifications", desc: "Get notified about food in your area" },
    { icon: Share, title: "Easy Sharing", desc: "Quick photo upload and description tools" },
    { icon: LocalShipping, title: "Pickup Coordination", desc: "Seamless pickup scheduling system" },
    { icon: StarBorder, title: "Rating System", desc: "Community-driven trust and quality" },
    { icon: BarChart, title: "Impact Tracking", desc: "See your environmental contribution" },
    { icon: Psychology, title: "AI Matching", desc: "Smart algorithms connect the right people" }
  ];

  return (
    <Box
      sx={{
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
      {/* Enhanced Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Fade in={animationTrigger} timeout={1000}>
                <Box>
                  <Chip
                    label="🌟 #1 Food Sharing Platform"
                    sx={{
                      mb: 3,
                      px: 3,
                      py: 1,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', md: '4.5rem', lg: '6rem' },
                      fontWeight: 900,
                      lineHeight: 0.9,
                      mb: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Share Food,
                    <br />
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Transform
                    </Box>{' '}
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Lives
                    </Box>
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mb: 6,
                      fontSize: { xs: '1.3rem', md: '1.6rem' },
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.9)',
                      maxWidth: 600
                    }}
                  >
                    Join the revolution against food waste. Connect surplus food with people who need it,
                    build stronger communities, and create lasting impact—one meal at a time. 🌟
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 6 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Restaurant />}
                      onClick={() => navigate('/register')}
                      sx={{
                        px: 6,
                        py: 3,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        color: '#667eea',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        textTransform: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 1)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 16px 64px rgba(255, 255, 255, 0.4)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Start Sharing Today
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{
                        px: 6,
                        py: 3,
                        borderRadius: 4,
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1.2rem',
                        textTransform: 'none',
                        borderWidth: 2,
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      See How It Works
                    </Button>
                  </Stack>

                  {/* Enhanced Trust Indicators */}
                  <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#00C853', fontSize: 24 }} />
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        100% Free
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Verified sx={{ color: '#00C853', fontSize: 24 }} />
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        Verified Community
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EnergySavingsLeaf sx={{ color: '#00C853', fontSize: 24 }} />
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        Zero Waste Goal
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Slide direction="left" in={animationTrigger} timeout={1200}>
                <Box sx={{ position: 'relative' }}>
                  {/* Enhanced Main Hero Card */}
                  <Card
                    sx={{
                      p: 6,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -100,
                        left: -100,
                        width: 200,
                        height: 200,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'pulse 4s ease-in-out infinite'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 4,
                        border: '3px solid rgba(255,255,255,0.3)',
                        animation: 'float 6s ease-in-out infinite'
                      }}
                    >
                      <Restaurant sx={{ fontSize: 60, color: 'white' }} />
                    </Box>

                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                      Join 850+ Members
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
                      Making Real Impact Every Day
                    </Typography>

                    {/* Enhanced Mini Stats */}
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 215, 0, 0.1)' }}>
                          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>
                            2.5K+
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Meals
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(0, 200, 83, 0.1)' }}>
                          <Typography variant="h6" sx={{ color: '#00C853', fontWeight: 700 }}>
                            1.2K kg
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Saved
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 107, 107, 0.1)' }}>
                          <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 700 }}>
                            95%
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Success
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Enhanced Floating Cards */}
                  <Card
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      p: 2,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      animation: 'float 4s ease-in-out infinite 1s'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {/* <Badge badgeContent="" color="success"> */}
                        <LocalDining sx={{ color: '#FFD700', fontSize: 20 }} />
                      {/* </Badge> */}
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        +12 today
                      </Typography>
                    </Stack>
                  </Card>

                  <Card
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      left: -20,
                      p: 2,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      animation: 'float 4s ease-in-out infinite 2s'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Verified sx={{ color: '#00C853', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        Trusted platform
                      </Typography>
                    </Stack>
                  </Card>

                  <Card
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: -30,
                      p: 2,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      animation: 'float 4s ease-in-out infinite 3s'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingUp sx={{ color: '#FF9800', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        Growing fast
                      </Typography>
                    </Stack>
                  </Card>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ENHANCED IMPACT STATS - STUNNING REDESIGN */}
      {/* COMPLETELY REDESIGNED IMPACT STATS - STUNNING & CENTERED */}
      <Container maxWidth="xl" sx={{ py: 15, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header Section */}
        <Box textAlign="center" sx={{ mb: 12 }}>
          <Chip
            label="📊 Live Impact Dashboard"
            sx={{
              mb: 4,
              px: 4,
              py: 1.5,
              borderRadius: 5,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)'
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 4,
              textShadow: '0 8px 32px rgba(255,255,255,0.1)',
              letterSpacing: '-0.02em'
            }}
          >
            Our Community Impact
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.3rem', md: '1.8rem' },
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 800,
              mx: 'auto',
              fontWeight: 300,
              lineHeight: 1.6,
              mb: 6
            }}
          >
            Real numbers, real impact, real change happening every single day
          </Typography>

          {/* Decorative Elements */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 8 }}>
            <Box sx={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
            <Box sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFD700 0%, rgba(255, 215, 0, 0.3) 100%)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <Box sx={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
          </Box>
        </Box>

        {/* MAIN IMPACT CARDS - COMPLETELY REDESIGNED WITH PERFECT CENTERING */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 12,
          px: { xs: 2, md: 4 }
        }}>
          <Grid container spacing={5} sx={{ maxWidth: 1400 }} justifyContent="center">
            {impactStats.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 320,
                    height: 350,
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(60px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 40px 120px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-20px) scale(1.05)',
                      boxShadow: '0 60px 160px rgba(0,0,0,0.25)',
                      '& .stat-icon-container': {
                        transform: 'scale(1.15) rotate(5deg)',
                      },
                      '& .stat-number': {
                        transform: 'scale(1.1)',
                      },
                      '& .glow-effect': {
                        opacity: 1,
                        transform: 'scale(1.4)',
                      },
                      '& .floating-particles': {
                        opacity: 1,
                      }
                    },
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 8,
                      background: stat.gradient,
                      borderRadius: '32px 32px 0 0'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `radial-gradient(circle at 50% 30%, ${stat.color}12 0%, transparent 60%)`,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  {/* Enhanced Animated Background Effects */}
                  <Box
                    className="glow-effect"
                    sx={{
                      position: 'absolute',
                      top: '40%',
                      left: '50%',
                      width: 250,
                      height: 250,
                      transform: 'translate(-50%, -50%)',
                      background: `radial-gradient(circle, ${stat.color}20 0%, ${stat.color}05 40%, transparent 70%)`,
                      borderRadius: '50%',
                      opacity: 0.6,
                      transition: 'all 0.8s ease',
                      animation: 'pulse 6s ease-in-out infinite'
                    }}
                  />

                  {/* Floating Particles Effect */}
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      className="floating-particles"
                      sx={{
                        position: 'absolute',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: stat.gradient,
                        opacity: 0,
                        transition: 'all 0.6s ease',
                        animation: `float ${3 + i}s ease-in-out infinite ${i * 0.5}s`,
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 30}%`
                      }}
                    />
                  ))}

                  <CardContent sx={{
                    p: 5,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {/* Completely Redesigned Icon Container */}
                    <Box
                      className="stat-icon-container"
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: stat.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 4,
                        boxShadow: `0 25px 60px ${stat.color}50, 0 0 0 8px rgba(255,255,255,0.05)`,
                        border: `4px solid rgba(255, 255, 255, 0.1)`,
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -8,
                          left: -8,
                          right: -8,
                          bottom: -8,
                          background: stat.gradient,
                          borderRadius: '50%',
                          opacity: 0.2,
                          filter: 'blur(16px)',
                          zIndex: -1
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -4,
                          left: -4,
                          right: -4,
                          bottom: -4,
                          background: `conic-gradient(from 0deg, ${stat.color}, transparent, ${stat.color})`,
                          borderRadius: '50%',
                          opacity: 0.3,
                          animation: 'rotate 8s linear infinite',
                          zIndex: -1
                        }
                      }}
                    >
                      <stat.icon sx={{
                        fontSize: 55,
                        color: 'white',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                      }} />
                    </Box>

                    {/* Enhanced Number Display */}
                    <Typography
                      className="stat-number"
                      variant="h1"
                      sx={{
                        fontWeight: 900,
                        fontSize: '3.5rem',
                        mb: 2,
                        background: `linear-gradient(135deg, ${stat.color} 0%, white 50%, ${stat.color} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 8px 32px rgba(255,255,255,0.1)',
                        transition: 'all 0.6s ease',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {stat.number}
                    </Typography>

                    {/* Enhanced Label */}
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        mb: 3,
                        letterSpacing: '0.5px'
                      }}
                    >
                      {stat.label}
                    </Typography>

                    {/* Enhanced Progress Indicator */}
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={88 + (index * 2)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: stat.gradient,
                            borderRadius: 4,
                            boxShadow: `0 0 20px ${stat.color}60, inset 0 1px 2px rgba(255,255,255,0.2)`,
                            animation: 'progressGlow 3s ease-in-out infinite'
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          mt: 1,
                          display: 'block'
                        }}
                      >
                        Growing daily
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ENHANCED COMMUNITY HIGHLIGHTS - PERFECTLY CENTERED */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={4} sx={{ maxWidth: 1000 }} justifyContent="center">
            {communityHighlights.map((highlight, index) => (
              <Grid item xs={6} sm={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 220,
                    textAlign: 'center',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.05)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
                      '& .highlight-icon': {
                        transform: 'scale(1.2) rotate(10deg)',
                        color: highlight.color
                      },
                      '& .highlight-glow': {
                        opacity: 0.8,
                        transform: 'scale(1.2)'
                      }
                    },
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: highlight.gradient,
                      borderRadius: '24px 24px 0 0'
                    }
                  }}
                >
                  {/* Background Glow Effect */}
                  <Box
                    className="highlight-glow"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 150,
                      height: 150,
                      transform: 'translate(-50%, -50%)',
                      background: `radial-gradient(circle, ${highlight.color}15 0%, transparent 70%)`,
                      borderRadius: '50%',
                      opacity: 0.4,
                      transition: 'all 0.6s ease'
                    }}
                  />

                  {/* Enhanced Icon with Container */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${highlight.color}20 0%, ${highlight.color}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        border: `2px solid ${highlight.color}30`,
                        boxShadow: `0 12px 30px ${highlight.color}25`
                      }}
                    >
                      <highlight.icon
                        className="highlight-icon"
                        sx={{
                          fontSize: 40,
                          color: highlight.color,
                          transition: 'all 0.4s ease',
                          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        mb: 1,
                        fontSize: '2rem',
                        background: highlight.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {highlight.value}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {highlight.label}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Decorative Bottom Element */}
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            px: 4,
            py: 2,
            borderRadius: 5,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <TrendingUp sx={{ color: '#00C853', fontSize: 24 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Growing stronger every day
            </Typography>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00C853',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </Box>
        </Box>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
@keyframes progressGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.6), inset 0 1px 2px rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), inset 0 1px 2px rgba(255,255,255,0.3); }
}
      `}</style>

      {/* Success Stories Section */}
      <Container maxWidth="xl" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'white',
              mb: 3
            }}
          >
            Success Stories
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Inspiring stories from our amazing community members
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {successStories.map((story, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.18)'
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${story.color} 0%, ${story.color}CC 100%)`
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: `linear-gradient(135deg, ${story.color} 0%, ${story.color}CC 100%)`,
                      fontSize: '1.2rem',
                      fontWeight: 700
                    }}
                  >
                    {story.avatar}
                  </Avatar>
                  <Box>
                    <Chip
                      label={story.timeframe}
                      size="small"
                      sx={{
                        background: `${story.color}20`,
                        color: story.color,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Stack>

                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                  {story.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  {story.description}
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: `${story.color}15`,
                    border: `1px solid ${story.color}30`
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: story.color,
                      fontWeight: 700,
                      textAlign: 'center'
                    }}
                  >
                    🎉 {story.impact}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ENHANCED HOW IT WORKS SECTION - STUNNING REDESIGN */}
      <Container maxWidth="xl" sx={{ py: 12, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" sx={{ mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.8rem', md: '4rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 3,
              textShadow: '0 4px 20px rgba(255,255,255,0.1)'
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: '1.4rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 300,
              lineHeight: 1.6
            }}
          >
            Three simple steps to start making a difference in your community
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* ENHANCED FOR DONORS CARD */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 0,
                height: '100%',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 90px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.01)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.3)',
                  '& .donor-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                },
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 8,
                  background: 'linear-gradient(90deg, #00C853 0%, #69F0AE 100%)',
                  borderRadius: '24px 24px 0 0'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 20% 20%, rgba(0, 200, 83, 0.1) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }
              }}
            >
              <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
                {/* Enhanced Header */}
                <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 6 }}>
                  <Box
                    className="donor-icon"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 50px rgba(0, 200, 83, 0.4)',
                      border: '4px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.4s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                        borderRadius: '50%',
                        opacity: 0.3,
                        filter: 'blur(12px)',
                        zIndex: -1
                      }
                    }}
                  >
                    <Restaurant sx={{ fontSize: 50, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'white',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: { xs: '1.8rem', md: '2.2rem' }
                      }}
                    >
                      For Food Donors
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Turn waste into hope
                    </Typography>
                  </Box>
                </Stack>

                {/* Enhanced Steps */}
                <Stack spacing={5} sx={{ mb: 6 }}>
                  {[
                    { emoji: "📱", text: "Post your surplus food with photos and details", desc: "Simple upload process with smart categorization" },
                    { emoji: "👥", text: "Connect with interested community members", desc: "AI-powered matching with nearby recipients" },
                    { emoji: "🤝", text: "Coordinate pickup and make an impact", desc: "Secure messaging and flexible scheduling" }
                  ].map((step, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                          transform: 'translateX(8px)',
                          '& .step-number': {
                            transform: 'scale(1.1)',
                            background: 'linear-gradient(135deg, #69F0AE 0%, #00C853 100%)'
                          }
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Box
                          className="step-number"
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'white',
                            boxShadow: '0 8px 25px rgba(0, 200, 83, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box flex={1}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mb: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <span style={{ fontSize: '1.3rem' }}>{step.emoji}</span>
                            {step.text}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255,255,255,0.65)',
                              fontSize: '0.95rem'
                            }}
                          >
                            {step.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                {/* Enhanced CTA Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Restaurant />}
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 15px 40px rgba(0, 200, 83, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00B248 0%, #4CAF50 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 20px 60px rgba(0, 200, 83, 0.5)'
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Start Donating Food
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* ENHANCED FOR RECEIVERS CARD */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 0,
                height: '100%',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 90px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.01)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.3)',
                  '& .receiver-icon': {
                    transform: 'scale(1.1) rotate(-5deg)',
                  }
                },
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 8,
                  background: 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)',
                  borderRadius: '24px 24px 0 0'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 80% 20%, rgba(255, 152, 0, 0.1) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }
              }}
            >
              <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
                {/* Enhanced Header */}
                <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 6 }}>
                  <Box
                    className="receiver-icon"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 50px rgba(255, 152, 0, 0.4)',
                      border: '4px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.4s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        borderRadius: '50%',
                        opacity: 0.3,
                        filter: 'blur(12px)',
                        zIndex: -1
                      }
                    }}
                  >
                    <People sx={{ fontSize: 50, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'white',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: { xs: '1.8rem', md: '2.2rem' }
                      }}
                    >
                      For Food Receivers
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Find fresh food nearby
                    </Typography>
                  </Box>
                </Stack>

                {/* Enhanced Steps */}
                <Stack spacing={5} sx={{ mb: 6 }}>
                  {[
                    { emoji: "🔍", text: "Browse fresh food donations in your area", desc: "Real-time listings with detailed descriptions" },
                    { emoji: "❤️", text: "Express interest in items you need", desc: "One-click requests with instant notifications" },
                    { emoji: "📍", text: "Pick up food and enjoy your meal", desc: "Easy coordination and community connections" }
                  ].map((step, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                          transform: 'translateX(8px)',
                          '& .step-number': {
                            transform: 'scale(1.1)',
                            background: 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)'
                          }
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Box
                          className="step-number"
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'white',
                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box flex={1}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mb: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <span style={{ fontSize: '1.3rem' }}>{step.emoji}</span>
                            {step.text}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255,255,255,0.65)',
                              fontSize: '0.95rem'
                            }}
                          >
                            {step.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                {/* Enhanced CTA Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<People />}
                  onClick={() => navigate('/browse')}
                  sx={{
                    py: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 15px 40px rgba(255, 152, 0, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 20px 60px rgba(255, 152, 0, 0.5)'
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Find Food Near You
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Platform Features */}
      <Container maxWidth="xl" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'white',
              mb: 3
            }}
          >
            Advanced Platform Features
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Cutting-edge technology meets community impact
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {platformFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    '& .feature-icon': {
                      transform: 'scale(1.1)',
                      color: '#FFD700'
                    }
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <feature.icon
                    className="feature-icon"
                    sx={{
                      fontSize: 28,
                      color: 'rgba(255,255,255,0.8)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5
                  }}
                >
                  {feature.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Enhanced Features */}
      <Container maxWidth="xl" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'white',
              mb: 3
            }}
          >
            Why Choose FoodShare?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Advanced features designed for maximum impact and community building
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <feature.icon sx={{ fontSize: 50, color: 'white' }} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 2
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.6,
                    fontSize: '1rem'
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="xl" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'white',
              mb: 3
            }}
          >
            What Our Community Says
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Real stories from real people making a difference
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    background: 'rgba(255, 255, 255, 0.2)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <FormatQuote sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 40, mb: 2 }} />

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.7,
                    mb: 3,
                    fontSize: '1.1rem',
                    fontStyle: 'italic'
                  }}
                >
                  "{testimonial.text}"
                </Typography>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                      fontSize: '1.5rem',
                      fontWeight: 700
                    }}
                  >
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {testimonial.role}
                    </Typography>
                    <Rating value={testimonial.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'white',
              mb: 3
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Everything you need to know about FoodShare
          </Typography>
        </Box>

        <Stack spacing={2}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  margin: '8px 0 !important'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0'
                  }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.7
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>

      {/* Newsletter Section */}
      <Container maxWidth="md" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            p: 6,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
            Stay Updated 📬
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 4,
              fontSize: '1.1rem'
            }}
          >
            Get the latest updates about community impact, new features, and success stories.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ maxWidth: 400, mx: 'auto' }}>
            <TextField
              variant="outlined"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Email />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#667eea',
                fontWeight: 600,
                '&:hover': {
                  background: 'white',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Subscribe
            </Button>
          </Stack>
        </Card>
      </Container>

      {/* Enhanced CTA Section */}
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            p: 8,
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #FFD700 0%, #FF6B6B 50%, #4ECDC4 100%)'
            }
          }}
        >
          <Celebration sx={{ fontSize: 60, color: '#FFD700', mb: 3 }} />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.2rem', md: '3rem' },
              color: 'white',
              mb: 3
            }}
          >
            Ready to Transform Lives?
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: '1.4rem',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 700,
              mx: 'auto',
              mb: 6,
              lineHeight: 1.6
            }}
          >
            Join thousands of community members who are already making a difference.
            Every meal shared creates ripples of positive change. 🌊
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" sx={{ mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/register')}
              sx={{
                px: 8,
                py: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                color: '#667eea',
                fontWeight: 700,
                fontSize: '1.3rem',
                textTransform: 'none',
                minWidth: 250,
                '&:hover': {
                  background: 'white',
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 16px 64px rgba(255, 255, 255, 0.4)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Join the Movement
            </Button>

            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/browse')}
              sx={{
                px: 8,
                py: 3,
                borderRadius: 4,
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.3rem',
                textTransform: 'none',
                borderWidth: 2,
                minWidth: 250,
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-4px) scale(1.05)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Explore Now
            </Button>
          </Stack>

          {/* Enhanced Trust badges */}
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                  850+
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Verified Members
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#00C853', fontWeight: 800 }}>
                  2.5K+
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Meals Shared
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 800 }}>
                  95%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Success Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 800 }}>
                  24/7
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Support
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
};

export default HomePage;