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
  getDoc,
  getCountFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { toast } from 'react-toastify';
import {
  getAllVolunteers,
  getVolunteerStats,
  assignDeliveryToVolunteer,
  verifyDeliveryCompletion,
  getPendingVerificationDeliveries
} from '../services/deliveryService';


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

  // Volunteer management state
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({});
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [statsDialog, setStatsDialog] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

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

        // Location stats - Handle multiple location field formats
        const locationMap = {};
        donationsData.forEach(d => {
          let locationStr = null;

          // Try different location field formats
          if (d.pickupAddress) {
            // Extract city from address (split by comma, take first part with city)
            const parts = d.pickupAddress.split(',');
            locationStr = parts.length >= 2 ? parts[parts.length - 2].trim() : parts[0].trim();
          } else if (d.location) {
            if (typeof d.location === 'string') {
              locationStr = d.location;
            } else if (d.location.city) {
              locationStr = d.location.city;
            } else if (d.location.address) {
              const parts = d.location.address.split(',');
              locationStr = parts.length >= 2 ? parts[parts.length - 2].trim() : parts[0].trim();
            }
          } else if (d.address) {
            const parts = d.address.split(',');
            locationStr = parts.length >= 2 ? parts[parts.length - 2].trim() : parts[0].trim();
          }

          if (locationStr) {
            locationMap[locationStr] = (locationMap[locationStr] || 0) + 1;
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

        // Fetch volunteers and their stats
        const allVolunteers = await getAllVolunteers();
        setVolunteers(allVolunteers);

        // Fetch stats for each volunteer
        const statsPromises = allVolunteers.map(v => getVolunteerStats(v.uid));
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        allVolunteers.forEach((v, i) => {
          statsMap[v.uid] = statsResults[i];
        });
        setVolunteerStats(statsMap);

        // Fetch pending verifications
        const pending = await getPendingVerificationDeliveries();
        setPendingVerifications(pending);

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
    try {
      // Reload donations from Firestore
      const donationsRef = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsRef);
      const donationsData = donationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date()
      }));
      setDonations(donationsData);

      console.log('Refreshed donations:', donationsData.length);
      console.log('Donations with interested receivers:', donationsData.filter(d =>
        d.interestedReceivers && d.interestedReceivers.length > 0
      ).length);

      setRefreshing(false);
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshing(false);
      toast.error('Error refreshing data');
    }
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

  // Handle assigning volunteer to donation
  const handleAssignVolunteer = async () => {
    if (!selectedVolunteer || !selectedDonation) {
      toast.error('Please select both volunteer and donation');
      return;
    }

    try {
      // Get donor info
      const donorDoc = await getDoc(doc(db, 'users', selectedDonation.donorId));

      // Get receiver info - prefer claimedBy, then first interested receiver
      let receiverId = selectedDonation.claimedBy;
      if (!receiverId && selectedDonation.interestedReceivers && selectedDonation.interestedReceivers.length > 0) {
        receiverId = selectedDonation.interestedReceivers[0]; // Take first interested receiver
      }

      const receiverDoc = receiverId ? await getDoc(doc(db, 'users', receiverId)) : null;
      const receiverData = receiverDoc?.exists() ? receiverDoc.data() : null;

      // Get delivery location from receiver's profile
      let deliveryLocation = 'Unknown';
      if (receiverData) {
        if (receiverData.address) {
          deliveryLocation = receiverData.address;
        } else if (receiverData.location?.address) {
          deliveryLocation = receiverData.location.address;
        }
      }

      const result = await assignDeliveryToVolunteer({
        volunteerId: selectedVolunteer.uid,
        donationId: selectedDonation.id,
        donorId: selectedDonation.donorId,
        receiverId: receiverId || 'N/A',
        donorName: donorDoc.exists() ? donorDoc.data().name : 'Unknown',
        receiverName: receiverData?.name || 'Unknown',
        foodItem: selectedDonation.title,
        quantity: `${selectedDonation.quantity} ${selectedDonation.unit || ''}`,
        pickupLocation: selectedDonation.pickupAddress || selectedDonation.location || 'Unknown',
        deliveryLocation: deliveryLocation,
        donorContact: donorDoc.exists() ? (donorDoc.data().phone || donorDoc.data().contact || 'N/A') : 'N/A',
        receiverContact: receiverData?.phone || receiverData?.contact || 'N/A',
        notes: selectedDonation.pickupInstructions || ''
      });

      if (result.success) {
        toast.success(`Volunteer assigned successfully! ${result.credits} credits will be awarded upon completion.`);
        setAssignDialog(false);
        setSelectedVolunteer(null);
        setSelectedDonation(null);
        // Refresh data
        handleRefreshData();
      } else {
        toast.error(result.error || 'Failed to assign volunteer');
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      toast.error('Error assigning volunteer');
    }
  };

  // Handle verifying delivery completion
  const handleVerifyDelivery = async (rideId) => {
    try {
      const result = await verifyDeliveryCompletion(rideId, currentUser.uid);

      if (result.success) {
        toast.success(`Delivery verified! ${result.creditsAwarded} credits awarded to volunteer.`);
        setVerifyDialog(false);
        setSelectedRide(null);
        // Refresh data
        handleRefreshData();
      } else {
        toast.error(result.error || 'Failed to verify delivery');
      }
    } catch (error) {
      console.error('Error verifying delivery:', error);
      toast.error('Error verifying delivery');
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend, onClick }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`,
        border: `2px solid ${color}40`,
        borderRadius: 5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 32px ${color}15`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
          opacity: 0.8
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 60px ${color}30`,
          border: `2px solid ${color}60`,
          '& .stat-icon': {
            transform: 'rotate(360deg) scale(1.1)',
          }
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3.5, position: 'relative', zIndex: 1 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Avatar
              className="stat-icon"
              sx={{
                width: 68,
                height: 68,
                background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
                boxShadow: `0 8px 24px ${color}40`,
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Icon sx={{ fontSize: 34, color: 'white' }} />
            </Avatar>

            {trend && (
              <Chip
                icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${Math.abs(trend)}%`}
                size="small"
                sx={{
                  background: trend > 0
                    ? 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)'
                    : 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            )}
          </Stack>

          <Box>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}BB 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                fontSize: { xs: '2rem', sm: '2.5rem' },
                letterSpacing: '-0.02em'
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 1, fontSize: '1.1rem' }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const UserManagementTable = () => (
    <Card
      sx={{
        borderRadius: 5,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 4,
            borderBottom: '2px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                👥 User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor all platform users
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<FilterList />}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }
                }}
              >
                Filter
              </Button>
              <Button
                startIcon={<Download />}
                variant="contained"
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                  }
                }}
              >
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
            background: `
              radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `
          }
        }}
      >
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            maxWidth: 500,
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 3,
              background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.4)'
            }}
          >
            <Security sx={{ fontSize: 40 }} />
          </Avatar>
          <Alert
            severity="error"
            sx={{
              mb: 4,
              borderRadius: 3,
              border: '2px solid rgba(244, 67, 54, 0.3)',
              '& .MuiAlert-icon': {
                fontSize: 32
              }
            }}
          >
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              You need admin privileges to access this page.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(102, 126, 234, 0.5)'
              }
            }}
          >
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
            background: `
              radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `,
            animation: 'pulse 4s ease-in-out infinite',
          }
        }}
      >
        <Card
          sx={{
            p: 8,
            textAlign: 'center',
            minWidth: 400,
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 40 }} />
          </Avatar>
          <CircularProgress
            size={70}
            thickness={4}
            sx={{
              mb: 3,
              color: '#667eea',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Loading Admin Dashboard...
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Fetching platform statistics and analytics
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
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)
          `,
          animation: 'pulse 8s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        }
      }}
    >
      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Card
            sx={{
              mb: 5,
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(50px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 6,
              boxShadow: '0 16px 64px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                pointerEvents: 'none'
              }
            }}
          >
            <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar
                      sx={{
                        width: 90,
                        height: 90,
                        background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                        border: '4px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 8px 32px rgba(244, 67, 54, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(360deg) scale(1.1)',
                        }
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: 45, color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          color: 'white',
                          fontSize: { xs: '2rem', md: '3.5rem' },
                          textShadow: '0 4px 24px rgba(0,0,0,0.4)',
                          letterSpacing: '-0.02em',
                          mb: 0.5
                        }}
                      >
                        Admin Dashboard
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255,255,255,0.95)',
                          fontWeight: 500,
                          letterSpacing: '0.01em'
                        }}
                      >
                        Platform Overview & Management Console
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={refreshing ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Refresh />}
                    onClick={handleRefreshData}
                    disabled={refreshing}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.6)',
                      borderWidth: 2,
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'white',
                        borderWidth: 2,
                        background: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={logout}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(244, 67, 54, 1) 100%)',
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: '0 4px 16px rgba(244, 67, 54, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(211, 47, 47, 1) 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(244, 67, 54, 0.5)'
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
              <Card
                sx={{
                  borderRadius: 5,
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        User Registration Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last 30 Days Performance
                      </Typography>
                    </Box>
                  </Stack>
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
              <Card
                sx={{
                  borderRadius: 5,
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(0, 200, 83, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
                        boxShadow: '0 4px 16px rgba(0, 200, 83, 0.3)'
                      }}
                    >
                      <PieChart />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        Food Categories
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distribution Overview
                      </Typography>
                    </Box>
                  </Stack>
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
              <Card
                sx={{
                  borderRadius: 5,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(255, 143, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #FF8F00 0%, #FFB300 100%)',
                        boxShadow: '0 4px 16px rgba(255, 143, 0, 0.3)'
                      }}
                    >
                      <BarChart />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        Donation Activity
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last 14 Days Performance
                      </Typography>
                    </Box>
                  </Stack>
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
              <Card
                sx={{
                  borderRadius: 5,
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(156, 39, 176, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                        boxShadow: '0 4px 16px rgba(156, 39, 176, 0.3)'
                      }}
                    >
                      <LocationOn />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        Top Locations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Most Active Areas
                      </Typography>
                    </Box>
                  </Stack>
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

        {/* Pending Verifications Alert */}
        {pendingVerifications.length > 0 && (
          <Slide direction="up" in timeout={1900}>
            <Alert
              severity="warning"
              icon={<Warning sx={{ fontSize: 32 }} />}
              sx={{
                mb: 5,
                borderRadius: 5,
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)',
                border: '3px solid rgba(255, 193, 7, 0.4)',
                boxShadow: '0 8px 32px rgba(255, 193, 7, 0.2)',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 48px rgba(255, 193, 7, 0.3)',
                }
              }}
              action={
                <Button
                  variant="contained"
                  onClick={() => setVerifyDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FFB300 0%, #FFA000 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(255, 193, 7, 0.4)'
                    }
                  }}
                >
                  View All
                </Button>
              }
            >
              <Typography variant="h5" fontWeight={800} gutterBottom sx={{ fontSize: '1.5rem' }}>
                🚨 {pendingVerifications.length} Deliveries Pending Verification
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                Volunteers are waiting for delivery verification to receive their credits.
              </Typography>
            </Alert>
          </Slide>
        )}

        {/* Volunteer Management Section */}
        <Slide direction="up" in timeout={2000}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 5,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={3} mb={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                        boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      <VolunteerActivism sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={800} gutterBottom>
                        Volunteer Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="1rem">
                        Manage volunteers, view stats, and assign deliveries
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => setAssignDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1rem',
                    boxShadow: '0 4px 16px rgba(255, 152, 0, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 24px rgba(255, 152, 0, 0.5)'
                    }
                  }}
                >
                  Assign Delivery
                </Button>
              </Stack>

              <Divider sx={{ mb: 4, borderWidth: 2 }} />

              {volunteers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No volunteers registered yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {volunteers.map((volunteer) => {
                    const stats = volunteerStats[volunteer.uid] || {};
                    const isActive = volunteer.isActive === 1 || volunteer.isActive === true;

                    return (
                      <Grid item xs={12} md={6} lg={4} key={volunteer.uid}>
                        <Card
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            background: isActive
                              ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.08) 100%)'
                              : 'linear-gradient(135deg, rgba(158, 158, 158, 0.12) 0%, rgba(189, 189, 189, 0.06) 100%)',
                            border: isActive ? '2px solid rgba(76, 175, 80, 0.5)' : '2px solid rgba(158, 158, 158, 0.3)',
                            boxShadow: isActive ? '0 4px 20px rgba(76, 175, 80, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': isActive ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '5px',
                              background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                            } : {},
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: isActive ? '0 12px 40px rgba(76, 175, 80, 0.3)' : '0 12px 40px rgba(0, 0, 0, 0.15)',
                              border: isActive ? '2px solid #4CAF50' : '2px solid rgba(158, 158, 158, 0.5)'
                            }
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                sx={{
                                  width: 56,
                                  height: 56,
                                  background: isActive
                                    ? 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
                                    : 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)'
                                }}
                              >
                                {volunteer.name?.charAt(0) || 'V'}
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight={700}>
                                  {volunteer.name || 'Unknown'}
                                </Typography>
                                <Chip
                                  label={isActive ? 'Active' : 'Inactive'}
                                  size="small"
                                  icon={isActive ? <CheckCircle /> : <Cancel />}
                                  sx={{
                                    background: isActive
                                      ? 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
                                      : 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                            </Stack>

                            <Divider />

                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Total Rides
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700}>
                                    {stats.totalRides || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Completed
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="success.main">
                                    {stats.completedRides || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Active Rides
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="warning.main">
                                    {stats.activeRides || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Credits
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                                    <Typography variant="h6" fontWeight={700}>
                                      {stats.totalCredits || 0}
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Grid>
                            </Grid>

                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Completion Rate
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={stats.completionRate || 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  mt: 1,
                                  background: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                                    borderRadius: 4
                                  }
                                }}
                              />
                              <Typography variant="caption" fontWeight={600} color="text.secondary">
                                {(stats.completionRate || 0).toFixed(1)}%
                              </Typography>
                            </Box>

                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => {
                                setSelectedVolunteer(volunteer);
                                setStatsDialog(true);
                              }}
                              sx={{
                                borderColor: isActive ? '#4CAF50' : '#9E9E9E',
                                color: isActive ? '#4CAF50' : '#9E9E9E',
                                fontWeight: 600,
                                '&:hover': {
                                  borderColor: isActive ? '#4CAF50' : '#9E9E9E',
                                  background: isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)'
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </Stack>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Slide>

        {/* Recent Activity */}
        <Slide direction="up" in timeout={2000}>
          <Card
            sx={{
              borderRadius: 5,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(102, 126, 234, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <Timeline />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    Recent Platform Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest updates and events
                  </Typography>
                </Box>
              </Stack>
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

        {/* Assign Delivery Dialog */}
        <Dialog
          open={assignDialog}
          onClose={() => setAssignDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: '1.75rem',
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0.03) 100%)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                  boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)'
                }}
              >
                <Assignment />
              </Avatar>
              <Box>
                Assign Delivery to Volunteer
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Select Volunteer (Active Only)
                </Typography>
                <Stack spacing={1}>
                  {volunteers.filter(v => v.isActive === 1 || v.isActive === true).map((volunteer) => (
                    <Paper
                      key={volunteer.uid}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedVolunteer?.uid === volunteer.uid ? '2px solid #4CAF50' : '1px solid #E0E0E0',
                        background: selectedVolunteer?.uid === volunteer.uid ? 'rgba(76, 175, 80, 0.1)' : 'white',
                        '&:hover': {
                          background: 'rgba(76, 175, 80, 0.05)',
                          borderColor: '#4CAF50'
                        }
                      }}
                      onClick={() => setSelectedVolunteer(volunteer)}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)' }}>
                          {volunteer.name?.charAt(0) || 'V'}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {volunteer.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {volunteerStats[volunteer.uid]?.totalRides || 0} total rides •{' '}
                            {volunteerStats[volunteer.uid]?.totalCredits || 0} credits
                          </Typography>
                        </Box>
                        {selectedVolunteer?.uid === volunteer.uid && (
                          <CheckCircle sx={{ color: '#4CAF50' }} />
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Select Donation (With Interested Receivers)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleRefreshData}
                    sx={{ minWidth: 'auto' }}
                  >
                    Refresh
                  </Button>
                </Stack>
                <Stack spacing={1} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {(() => {
                    // Debug: Log all donations with their interested receivers
                    console.log('All donations:', donations.map(d => ({
                      id: d.id,
                      title: d.title,
                      status: d.status,
                      interestedReceivers: d.interestedReceivers,
                      assignedVolunteerId: d.assignedVolunteerId
                    })));

                    const filtered = donations.filter(d => {
                      const hasInterestedReceivers = d.interestedReceivers && Array.isArray(d.interestedReceivers) && d.interestedReceivers.length > 0;
                      const isAvailable = d.status === 'available' || d.status === 'claimed';
                      // SHOW ALL DONATIONS WITH INTERESTED RECEIVERS (even if already assigned)
                      // This allows admin to see and potentially reassign

                      // Debug logging for donations with interest
                      if (hasInterestedReceivers) {
                        console.log('Donation with interest found:', {
                          id: d.id,
                          title: d.title,
                          interestedCount: d.interestedReceivers.length,
                          status: d.status,
                          assignedVolunteerId: d.assignedVolunteerId,
                          isAvailable,
                          willShow: hasInterestedReceivers && isAvailable
                        });
                      }

                      return hasInterestedReceivers && isAvailable;
                    });

                    console.log('Filtered donations count:', filtered.length);
                    return filtered;
                  })()
                    .slice(0, 20)
                    .map((donation) => (
                      <Paper
                        key={donation.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedDonation?.id === donation.id ? '2px solid #FF9800' : '1px solid #E0E0E0',
                          background: selectedDonation?.id === donation.id ? 'rgba(255, 152, 0, 0.1)' : 'white',
                          '&:hover': {
                            background: 'rgba(255, 152, 0, 0.05)',
                            borderColor: '#FF9800'
                          }
                        }}
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }}>
                            <Restaurant />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {donation.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {donation.quantity} {donation.unit} • {donation.status}
                            </Typography>
                            <Typography variant="caption" color="primary" fontWeight={600}>
                              📍 {donation.pickupAddress?.substring(0, 40)}...
                            </Typography>
                            <Typography variant="caption" color="success.main" display="block" fontWeight={600}>
                              👥 {donation.interestedReceivers?.length || 0} interested receiver(s)
                            </Typography>
                            {donation.assignedVolunteerId && (
                              <Typography variant="caption" color="warning.main" display="block" fontWeight={600}>
                                ⚠️ Already assigned to volunteer
                              </Typography>
                            )}
                          </Box>
                          {selectedDonation?.id === donation.id && (
                            <CheckCircle sx={{ color: '#FF9800' }} />
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  {donations.filter(d =>
                    (d.status === 'available' || d.status === 'claimed') &&
                    !d.assignedVolunteerId &&
                    d.interestedReceivers && d.interestedReceivers.length > 0
                  ).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        No donations with interested receivers available for assignment
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAssignVolunteer}
              disabled={!selectedVolunteer || !selectedDonation}
              sx={{
                background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                fontWeight: 600,
                px: 4
              }}
            >
              Assign Delivery
            </Button>
          </DialogActions>
        </Dialog>

        {/* Verify Deliveries Dialog */}
        <Dialog
          open={verifyDialog}
          onClose={() => setVerifyDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: '1.75rem',
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 193, 7, 0.03) 100%)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                  boxShadow: '0 4px 16px rgba(255, 193, 7, 0.3)'
                }}
              >
                <Verified />
              </Avatar>
              <Box>
                Pending Delivery Verifications
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {pendingVerifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No pending verifications
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {pendingVerifications.map((ride) => (
                  <Paper
                    key={ride.id}
                    sx={{
                      p: 3,
                      border: '1px solid #E0E0E0',
                      borderRadius: 3,
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={700}>
                          {ride.foodItem}
                        </Typography>
                        <Chip
                          label={`${ride.credits} credits`}
                          icon={<Star />}
                          sx={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Volunteer
                          </Typography>
                          <Typography fontWeight={600}>
                            {ride.volunteerName || volunteers.find(v => v.uid === ride.volunteerId)?.name || 'Unknown'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Distance
                          </Typography>
                          <Typography fontWeight={600}>
                            {ride.distance} km
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Completion Notes
                          </Typography>
                          <Typography>
                            {ride.completionNotes || 'No notes provided'}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Verified />}
                        onClick={() => handleVerifyDelivery(ride.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                          fontWeight: 600
                        }}
                      >
                        Verify & Award {ride.credits} Credits
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setVerifyDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Volunteer Stats Dialog */}
        <Dialog
          open={statsDialog}
          onClose={() => setStatsDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          {selectedVolunteer && (
            <>
              <DialogTitle
                sx={{
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%)'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                      boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    {selectedVolunteer.name?.charAt(0) || 'V'}
                  </Avatar>
                  <Box>
                    {selectedVolunteer.name || 'Unknown'}'s Stats
                  </Box>
                </Stack>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={800} color="success.main">
                          {volunteerStats[selectedVolunteer.uid]?.totalRides || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Rides
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255, 215, 0, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={800} color="warning.main">
                          {volunteerStats[selectedVolunteer.uid]?.totalCredits || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Credits
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={800} color="info.main">
                          {volunteerStats[selectedVolunteer.uid]?.completedRides || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={800} color="warning.main">
                          {volunteerStats[selectedVolunteer.uid]?.activeRides || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Active
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Recent Rides
                    </Typography>
                    <List>
                      {(volunteerStats[selectedVolunteer.uid]?.recentRides || []).map((ride) => (
                        <ListItem key={ride.id} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, mb: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }}>
                              <Restaurant />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={ride.foodItem}
                            secondary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={ride.status} size="small" />
                                <Typography variant="caption">
                                  {ride.distance} km • {ride.credits} credits
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setStatsDialog(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
