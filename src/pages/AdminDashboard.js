// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Avatar,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  useMediaQuery,
  Fade,
  Slide
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Restaurant,
  TrendingUp,
  Analytics,
  MoreVert,
  Refresh,
  Download,
  FilterList,
  Search,
  Verified,
  Warning,
  Block,
  CheckCircle,
  Cancel,
  PersonAdd,
  Assignment,
  LocalDining,
  EmojiEvents,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  Group,
  LocationOn,
  Schedule,
  Star,
  Flag,
  Notifications,
  Settings,
  Security,
  Assessment,
  Storage,
  Speed,
  Public,
  TrendingDown,
  AccountBalance,
  Handshake,
  VolunteerActivism,
  AdminPanelSettings
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Legend,
  Pie
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs,
  doc,
  updateDoc,
  getCountFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { toast } from 'react-toastify';


const COLORS = ['#667eea', '#764ba2', '#00C853', '#FF8F00', '#f44336', '#9C27B0', '#FF5722', '#795548'];

const AdminDashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalReceivers: 0,
    totalVolunteers: 0,
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    expiredDonations: 0,
    totalNGOs: 0,
    verifiedNGOs: 0,
    pendingVerifications: 0,
    totalFoodSaved: 0,
    totalPeopleHelped: 0,
    co2Saved: 0,
    topCategories: [],
    userGrowth: [],
    donationTrends: [],
    locationStats: [],
    recentActivity: [],
    flaggedContent: 0,
    averageResponseTime: 0,
    successRate: 0
  });

  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);

  // Check admin access
  useEffect(() => {
    if (!currentUser || !userProfile) return;
    
    if (userProfile.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
  }, [currentUser, userProfile, navigate]);

  // Fetch admin data
  useEffect(() => {
    if (!currentUser || userProfile?.role !== 'admin') return;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setUsers(usersData);

        // Fetch donations
        const donationsRef = collection(db, 'donations');
        const donationsSnapshot = await getDocs(donationsRef);
        const donationsData = donationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          expiryDate: doc.data().expiryDate?.toDate() || new Date()
        }));
        setDonations(donationsData);

        // Calculate comprehensive stats
        const totalUsers = usersData.length;
        const totalDonors = usersData.filter(u => u.role === 'donor').length;
        const totalReceivers = usersData.filter(u => u.role === 'receiver').length;
        const totalVolunteers = usersData.filter(u => u.role === 'volunteer').length;
        
        const totalDonations = donationsData.length;
        const activeDonations = donationsData.filter(d => d.status === 'available').length;
        const completedDonations = donationsData.filter(d => d.status === 'completed').length;
        const expiredDonations = donationsData.filter(d => d.status === 'expired' || 
          (d.expiryDate && d.expiryDate < new Date())).length;

        // Calculate food impact
        const totalFoodSaved = donationsData.reduce((total, d) => 
          total + (parseFloat(d.quantity) || 0), 0);
        const totalPeopleHelped = donationsData.reduce((total, d) => 
          total + (d.estimatedServings || 0), 0);
        const co2Saved = totalFoodSaved * 2.5; // Approximate CO2 per kg of food

        // Category analysis
        const categoryMap = {};
        donationsData.forEach(d => {
          if (d.category) {
            categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;
          }
        });
        const topCategories = Object.entries(categoryMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));

        // User growth data (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const dayUsers = usersData.filter(u => 
            u.createdAt && isWithinInterval(u.createdAt, { start: dayStart, end: dayEnd })
          ).length;

          return {
            date: format(date, 'MMM dd'),
            users: dayUsers,
            donors: usersData.filter(u => 
              u.role === 'donor' && u.createdAt && 
              isWithinInterval(u.createdAt, { start: dayStart, end: dayEnd })
            ).length,
            receivers: usersData.filter(u => 
              u.role === 'receiver' && u.createdAt && 
              isWithinInterval(u.createdAt, { start: dayStart, end: dayEnd })
            ).length
          };
        }).reverse();

        // Donation trends (last 14 days)
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const dayDonations = donationsData.filter(d => 
            d.createdAt && isWithinInterval(d.createdAt, { start: dayStart, end: dayEnd })
          ).length;
          
          const dayCompleted = donationsData.filter(d => 
            d.status === 'completed' && d.updatedAt && 
            isWithinInterval(d.updatedAt?.toDate() || d.createdAt, { start: dayStart, end: dayEnd })
          ).length;

          return {
            date: format(date, 'MMM dd'),
            donations: dayDonations,
            completed: dayCompleted
          };
        }).reverse();

        // Location stats
        const locationMap = {};
        donationsData.forEach(d => {
          if (d.location) {
            const location = d.location.city || d.location;
            locationMap[location] = (locationMap[location] || 0) + 1;
          }
        });
        const locationStats = Object.entries(locationMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([name, value]) => ({ name, value }));

        // Recent activity
        const recentActivity = [...donationsData, ...usersData]
          .sort((a, b) => (b.createdAt || new Date()) - (a.createdAt || new Date()))
          .slice(0, 10)
          .map(item => ({
            ...item,
            type: item.role ? 'user' : 'donation'
          }));

        // Success rate calculation
        const successRate = totalDonations > 0 ? 
          ((completedDonations / totalDonations) * 100) : 0;

        // Average response time (mock calculation)
        const averageResponseTime = 4.2; // hours

        setStats({
          totalUsers,
          totalDonors,
          totalReceivers,
          totalVolunteers,
          totalDonations,
          activeDonations,
          completedDonations,
          expiredDonations,
          totalNGOs: 12, // Mock data
          verifiedNGOs: 8, // Mock data
          pendingVerifications: 3, // Mock data
          totalFoodSaved,
          totalPeopleHelped,
          co2Saved,
          topCategories,
          userGrowth: last30Days,
          donationTrends: last14Days,
          locationStats,
          recentActivity,
          flaggedContent: 2, // Mock data
          averageResponseTime,
          successRate
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Error loading admin dashboard');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, userProfile]);


  const fetchAllVolunteerRides = async () => {
  const ridesQuery = query(collection(db, 'volunteerRides'));
  const snapshot = await getDocs(ridesQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

  const handleRefreshData = async () => {
    setRefreshing(true);
    // Trigger data refresh
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Data refreshed successfully');
    }, 2000);
  };

  const handleUserAction = async (userId, action) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      switch (action) {
        case 'verify':
          await updateDoc(userRef, { 
            verificationStatus: 'verified',
            updatedAt: serverTimestamp()
          });
          toast.success('User verified successfully');
          break;
        case 'suspend':
          await updateDoc(userRef, { 
            status: 'suspended',
            updatedAt: serverTimestamp()
          });
          toast.success('User suspended successfully');
          break;
        case 'activate':
          await updateDoc(userRef, { 
            status: 'active',
            updatedAt: serverTimestamp()
          });
          toast.success('User activated successfully');
          break;
        default:
          break;
      }
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, [action === 'verify' ? 'verificationStatus' : 'status']: 
          action === 'verify' ? 'verified' : action === 'suspend' ? 'suspended' : 'active' } : user
      ));
      
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend, onClick }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${color}20`
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                }}
              >
                <Icon sx={{ fontSize: 28, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight={800} color={color}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {title}
                </Typography>
              </Box>
            </Stack>
            
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            
            {trend && (
              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                {trend > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, color: '#00C853' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
                )}
                <Typography 
                  variant="caption" 
                  fontWeight={600}
                  color={trend > 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(trend)}% vs last month
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const UserManagementTable = () => (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              User Management
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<FilterList />} size="small">
                Filter
              </Button>
              <Button startIcon={<Download />} size="small">
                Export
              </Button>
            </Stack>
          </Stack>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage)
                .map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {user.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={
                        user.role === 'donor' ? 'primary' : 
                        user.role === 'receiver' ? 'secondary' : 
                        user.role === 'volunteer' ? 'success' : 'default'
                      }
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status || 'active'}
                      size="small"
                      color={user.status === 'suspended' ? 'error' : 'success'}
                      variant={user.verificationStatus === 'verified' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(user.createdAt, 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedUser(user);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={users.length}
          page={userPage}
          onPageChange={(e, newPage) => setUserPage(newPage)}
          rowsPerPage={userRowsPerPage}
          onRowsPerPageChange={(e) => setUserRowsPerPage(parseInt(e.target.value, 10))}
        />
      </CardContent>
    </Card>
  );

  if (!currentUser || userProfile?.role !== 'admin') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2">
              You need admin privileges to access this page.
            </Typography>
          </Alert>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Card sx={{ p: 6, textAlign: 'center', minWidth: 300 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Loading Admin Dashboard...</Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching platform statistics
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Card
            sx={{
              mb: 4,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                        border: '3px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          color: 'white',
                          fontSize: { xs: '2rem', md: '3rem' },
                          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                        }}
                      >
                        Admin Dashboard
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Platform Overview & Management Console
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={handleRefreshData}
                    disabled={refreshing}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={logout}
                    sx={{
                      background: 'rgba(244, 67, 54, 0.8)',
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 1)'
                      }
                    }}
                  >
                    Logout
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Key Metrics */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={People}
                title="Total Users"
                value={stats.totalUsers}
                subtitle={`${stats.totalDonors} donors, ${stats.totalReceivers} receivers`}
                color="#667eea"
                trend={12}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={Restaurant}
                title="Total Donations"
                value={stats.totalDonations}
                subtitle={`${stats.activeDonations} active, ${stats.completedDonations} completed`}
                color="#00C853"
                trend={8}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={TrendingUp}
                title="Food Saved"
                value={`${stats.totalFoodSaved.toFixed(1)}kg`}
                subtitle={`${stats.totalPeopleHelped} people helped`}
                color="#FF8F00"
                trend={15}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                icon={EmojiEvents}
                title="Success Rate"
                value={`${stats.successRate.toFixed(1)}%`}
                subtitle={`${stats.averageResponseTime}h avg response`}
                color="#9C27B0"
                trend={3}
              />
            </Grid>
          </Grid>
        </Slide>

        {/* Secondary Metrics */}
        <Slide direction="up" in timeout={1200}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={2}>
              <StatCard
                icon={VolunteerActivism}
                title="Volunteers"
                value={stats.totalVolunteers}
                color="#795548"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <StatCard
                icon={Handshake}
                title="NGO Partners"
                value={`${stats.verifiedNGOs}/${stats.totalNGOs}`}
                color="#607D8B"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <StatCard
                icon={Public}
                title="CO₂ Saved"
                value={`${stats.co2Saved.toFixed(1)}kg`}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <StatCard
                icon={Flag}
                title="Reports"
                value={stats.flaggedContent}
                color="#f44336"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <StatCard
                icon={Schedule}
                title="Expired"
                value={stats.expiredDonations}
                color="#FF5722"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <StatCard
                icon={Security}
                title="Pending"
                value={stats.pendingVerifications}
                color="#FFC107"
              />
            </Grid>
          </Grid>
        </Slide>

        {/* Charts and Analytics */}
        <Slide direction="up" in timeout={1400}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* User Growth Chart */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    User Registration Trends (Last 30 Days)
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.userGrowth}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDonors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="users" stroke="#667eea" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                        <Area type="monotone" dataKey="donors" stroke="#00C853" fillOpacity={1} fill="url(#colorDonors)" name="Donors" />
                        <Line type="monotone" dataKey="receivers" stroke="#FF8F00" name="Receivers" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Distribution */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Food Categories
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={stats.topCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.topCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

        {/* Donation Trends */}
        <Slide direction="up" in timeout={1600}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Donation Activity (Last 14 Days)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={stats.donationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="donations" fill="#667eea" name="New Donations" />
                        <Bar dataKey="completed" fill="#00C853" name="Completed" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Location Stats */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Top Locations
                  </Typography>
                  <List dense>
                    {stats.locationStats.slice(0, 8).map((location, index) => (
                      <ListItem key={location.name} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: COLORS[index % COLORS.length],
                              fontSize: '0.8rem'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={location.name}
                          secondary={`${location.value} donations`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

        {/* User Management */}
        <Slide direction="up" in timeout={1800}>
          <Box sx={{ mb: 4 }}>
            <UserManagementTable />
          </Box>
        </Slide>

        {/* Recent Activity */}
        <Slide direction="up" in timeout={2000}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Recent Platform Activity
              </Typography>
              <List>
                {stats.recentActivity.slice(0, 10).map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: activity.type === 'user' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)'
                        }}
                      >
                        {activity.type === 'user' ? <PersonAdd /> : <Restaurant />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        activity.type === 'user' 
                          ? `New ${activity.role} registered: ${activity.name}`
                          : `New donation posted: ${activity.title}`
                      }
                      secondary={format(activity.createdAt, 'MMM dd, yyyy HH:mm')}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Slide>

        {/* User Actions Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            handleUserAction(selectedUser?.id, 'verify');
            setMenuAnchor(null);
          }}>
            <Verified sx={{ mr: 1 }} />
            Verify User
          </MenuItem>
          <MenuItem onClick={() => {
            handleUserAction(selectedUser?.id, 'suspend');
            setMenuAnchor(null);
          }}>
            <Block sx={{ mr: 1 }} />
            Suspend User
          </MenuItem>
          <MenuItem onClick={() => {
            handleUserAction(selectedUser?.id, 'activate');
            setMenuAnchor(null);
          }}>
            <CheckCircle sx={{ mr: 1 }} />
            Activate User
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
