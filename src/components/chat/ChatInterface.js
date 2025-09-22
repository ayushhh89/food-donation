// src/components/chat/EnhancedChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  ArrowBack,
  Close,
  Send,
  AttachFile,
  MoreVert,
  Search,
  Restaurant,
  Person,
  AccessTime,
  CheckCircle,
  Circle,
  Phone,
  VideoCall,
  Info,
  Star,
  Flag,
  Block,
  Delete,
  EmojiEmotions,
  Image as ImageIcon,
  FiberManualRecord,
  Schedule,
  LocationOn,
  Verified,
  CameraAlt,
  Mic,
  PhotoLibrary
} from '@mui/icons-material';
import { useChat, useConversation } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, isYesterday, isSameDay, formatDistanceToNow } from 'date-fns';

const ChatInterface = ({ onClose, initialConversationId = null, standalone = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId);
  const [showConversationList, setShowConversationList] = useState(!initialConversationId || !isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  
  const { conversations, loading } = useChat();
  const { currentUser, userProfile } = useAuth();

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowConversationList(true);
      setSelectedConversationId(null);
    }
  };

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.donationTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOtherParticipantName(conv)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get other participant info
  const getOtherParticipantName = (conversation) => {
    if (!conversation || !currentUser) return 'Unknown User';
    
    const isUserDonor = conversation.donorId === currentUser.uid;
    const otherUserId = isUserDonor ? conversation.receiverId : conversation.donorId;
    
    // In a real app, you'd fetch user details by ID
    // For now, we'll use role-based names
    return isUserDonor ? 'Food Receiver' : 'Food Donor';
  };

  const getOtherParticipantRole = (conversation) => {
    if (!conversation || !currentUser) return 'user';
    
    const isUserDonor = conversation.donorId === currentUser.uid;
    return isUserDonor ? 'receiver' : 'donor';
  };

  const ChatContent = () => (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 0,
          zIndex: 1
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            {onClose && (
              <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
                <ArrowBack />
              </IconButton>
            )}
            
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Restaurant sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Food Sharing Chat
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Connect with your community
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Search conversations">
              <IconButton sx={{ color: 'text.secondary' }}>
                <Search />
              </IconButton>
            </Tooltip>
            <Tooltip title="More options">
              <IconButton sx={{ color: 'text.secondary' }}>
                <MoreVert />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {!isMobile ? (
          // Desktop Layout
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={4}>
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onConversationSelect={handleConversationSelect}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                getOtherParticipantName={getOtherParticipantName}
                getOtherParticipantRole={getOtherParticipantRole}
              />
            </Grid>
            <Grid item xs={8}>
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                  showBackButton={false}
                  getOtherParticipantName={getOtherParticipantName}
                  getOtherParticipantRole={getOtherParticipantRole}
                />
              ) : (
                <EmptyState />
              )}
            </Grid>
          </Grid>
        ) : (
          // Mobile Layout
          <Box sx={{ width: '100%', height: '100%' }}>
            {showConversationList ? (
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onConversationSelect={handleConversationSelect}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                getOtherParticipantName={getOtherParticipantName}
                getOtherParticipantRole={getOtherParticipantRole}
              />
            ) : selectedConversation ? (
              <MessageThread
                conversation={selectedConversation}
                onBack={handleBackToList}
                showBackButton={true}
                getOtherParticipantName={getOtherParticipantName}
                getOtherParticipantRole={getOtherParticipantRole}
              />
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );

  const ConversationList = ({ 
    conversations, 
    selectedConversationId, 
    onConversationSelect, 
    loading, 
    searchTerm, 
    onSearchChange,
    getOtherParticipantName,
    getOtherParticipantRole
  }) => {
    const { currentUser } = useAuth();

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : timestamp;
      
      if (isToday(date)) {
        return format(date, 'HH:mm');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd');
      }
    };

    const getUnreadCount = (conversation) => {
      if (!conversation.unreadCount || !currentUser) return 0;
      
      const isUserDonor = conversation.donorId === currentUser.uid;
      return isUserDonor ? 
        (conversation.unreadCount.donor || 0) : 
        (conversation.unreadCount.receiver || 0);
    };

    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: 0,
          borderRight: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        {/* Search */}
        <Box sx={{ p: 3, pb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                background: 'rgba(102, 126, 234, 0.04)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.08)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                },
                '&.Mui-focused': {
                  background: 'rgba(102, 126, 234, 0.08)',
                  border: '1px solid #667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                },
              },
            }}
          />
        </Box>

        {/* Conversations List */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} sx={{ mb: 2, borderRadius: 3 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ width: 50, height: 50, borderRadius: '50%', background: '#F3F4F6' }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ width: '80%', height: 16, background: '#F3F4F6', borderRadius: 1, mb: 1 }} />
                        <Box sx={{ width: '60%', height: 12, background: '#F3F4F6', borderRadius: 1 }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Restaurant sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                No conversations yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Start sharing food to begin chatting with community members
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {conversations.map((conversation, index) => {
                const unreadCount = getUnreadCount(conversation);
                const isSelected = conversation.id === selectedConversationId;
                const otherParticipantName = getOtherParticipantName(conversation);
                const otherParticipantRole = getOtherParticipantRole(conversation);
                
                return (
                  <Zoom in timeout={300 + index * 100} key={conversation.id}>
                    <ListItem
                      button
                      onClick={() => onConversationSelect(conversation.id)}
                      sx={{
                        py: 2,
                        px: 2,
                        mb: 1,
                        mx: 1,
                        borderRadius: 4,
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)'
                          : 'transparent',
                        border: isSelected ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid transparent',
                        '&:hover': {
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)'
                            : 'rgba(102, 126, 234, 0.04)',
                          transform: 'translateX(8px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={unreadCount > 0 ? unreadCount : null}
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              minWidth: 20,
                              height: 20,
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 54,
                              height: 54,
                              background: otherParticipantRole === 'donor' 
                                ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                                : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              border: '3px solid rgba(255, 255, 255, 0.9)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                          >
                            {otherParticipantRole === 'donor' ? 
                              <Restaurant sx={{ fontSize: 26 }} /> : 
                              <Person sx={{ fontSize: 26 }} />
                            }
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: unreadCount > 0 ? 800 : 700,
                                color: 'text.primary',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '1rem'
                              }}
                            >
                              {otherParticipantName}
                            </Typography>
                            <Chip
                              label={otherParticipantRole}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                background: otherParticipantRole === 'donor' 
                                  ? alpha('#10B981', 0.15)
                                  : alpha('#3B82F6', 0.15),
                                color: otherParticipantRole === 'donor' ? '#059669' : '#2563EB',
                                border: 'none',
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'primary.main',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              📦 {conversation.donationTitle}
                            </Typography>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                                  fontWeight: unreadCount > 0 ? 600 : 400,
                                  fontSize: '0.8rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  mr: 1
                                }}
                              >
                                {conversation.lastMessage || 'No messages yet'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {formatTime(conversation.lastMessageTime)}
                              </Typography>
                            </Stack>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Zoom>
                );
              })}
            </List>
          )}
        </Box>
      </Paper>
    );
  };

  const MessageThread = ({ 
    conversation, 
    onBack, 
    showBackButton,
    getOtherParticipantName,
    getOtherParticipantRole
  }) => {
    const { messages, loading, sending, sendMessage } = useConversation(conversation.id);
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const isDonor = conversation.donorId === currentUser?.uid;
    const receiverId = isDonor ? conversation.receiverId : conversation.donorId;
    const otherParticipantRole = getOtherParticipantRole(conversation);
    const otherParticipantName = getOtherParticipantName(conversation);

    // Auto-scroll to bottom
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages]);

    const handleSendMessage = async () => {
      if (!newMessage.trim() || sending) return;

      try {
        await sendMessage(newMessage, receiverId, conversation.donationTitle);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    const formatMessageTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      
      if (isToday(date)) {
        return format(date, 'HH:mm');
      } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'MMM dd, HH:mm');
      }
    };

    const shouldShowDateSeparator = (currentMessage, previousMessage) => {
      if (!previousMessage || !currentMessage.timestamp || !previousMessage.timestamp) {
        return true;
      }
      return !isSameDay(currentMessage.timestamp, previousMessage.timestamp);
    };

    const renderDateSeparator = (timestamp) => (
      <Fade in timeout={500}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 3
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {isToday(timestamp) 
                ? 'Today' 
                : isYesterday(timestamp) 
                  ? 'Yesterday' 
                  : format(timestamp, 'MMMM d, yyyy')
              }
            </Typography>
          </Paper>
        </Box>
      </Fade>
    );

    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: 0
        }}
      >
        {/* Chat Header */}
        <Paper
          elevation={0}
          sx={{ 
            p: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 0
          }}
        >
          <Stack direction="row" alignItems="center" spacing={3}>
            {showBackButton && (
              <IconButton onClick={onBack} size="small">
                <ArrowBack />
              </IconButton>
            )}
            
            <Avatar
              sx={{
                width: 50,
                height: 50,
                background: otherParticipantRole === 'donor' 
                  ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                border: '3px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {otherParticipantRole === 'donor' ? 
                <Restaurant sx={{ fontSize: 24 }} /> : 
                <Person sx={{ fontSize: 24 }} />
              }
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {otherParticipantName}
                </Typography>
                <Chip
                  label={otherParticipantRole}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: otherParticipantRole === 'donor' 
                      ? alpha('#10B981', 0.15)
                      : alpha('#3B82F6', 0.15),
                    color: otherParticipantRole === 'donor' ? '#059669' : '#2563EB',
                  }}
                />
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📦 {conversation.donationTitle}
                </Typography>
                <FiberManualRecord sx={{ fontSize: 6, color: '#10B981' }} />
                <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                  Active
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Call">
                <IconButton
                  size="medium"
                  sx={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    '&:hover': {
                      background: 'rgba(16, 185, 129, 0.2)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <Phone sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="More options">
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  size="medium"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      background: 'rgba(0,0,0,0.04)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <MoreVert sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Messages */}
        <Box 
          ref={messagesContainerRef}
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 3,
            background: `
              linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.01) 100%),
              radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.03) 0%, transparent 50%)
            `,
            scrollBehavior: 'smooth'
          }}
        >
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Restaurant sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Loading messages...
              </Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Restaurant sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                Start the conversation
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                Send a message to discuss the food donation details
              </Typography>
              <Paper
                sx={{
                  p: 3,
                  maxWidth: 400,
                  mx: 'auto',
                  background: 'rgba(102, 126, 234, 0.08)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: 3
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
                  <strong>💡 Tips for great conversations:</strong>
                  <br />• Be clear about pickup times
                  <br />• Ask about food freshness  
                  <br />• Share your location details
                  <br />• Be respectful and kind
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Stack spacing={1}>
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser?.uid;
                const previousMessage = messages[index - 1];
                const showDateSep = shouldShowDateSeparator(message, previousMessage);
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                
                return (
                  <Box key={message.id}>
                    {showDateSep && message.timestamp && renderDateSeparator(message.timestamp)}
                    
                    <Fade in timeout={300}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: 2,
                          mb: 1
                        }}
                      >
                        {!isCurrentUser && (
                          <Avatar
                            sx={{
                              width: showAvatar ? 36 : 0,
                              height: showAvatar ? 36 : 0,
                              opacity: showAvatar ? 1 : 0,
                              background: otherParticipantRole === 'donor' 
                                ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                                : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                              fontSize: '0.9rem',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {showAvatar && (otherParticipantRole === 'donor' ? 
                              <Restaurant sx={{ fontSize: 18 }} /> : 
                              <Person sx={{ fontSize: 18 }} />
                            )}
                          </Avatar>
                        )}
                        
                        <Paper
                          elevation={0}
                          sx={{
                            maxWidth: '75%',
                            p: 2.5,
                            borderRadius: 4,
                            background: isCurrentUser 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'rgba(255, 255, 255, 0.95)',
                            color: isCurrentUser ? 'white' : 'text.primary',
                            boxShadow: isCurrentUser 
                              ? '0 8px 32px rgba(102, 126, 234, 0.25)'
                              : '0 4px 20px rgba(0,0,0,0.08)',
                            border: isCurrentUser ? 'none' : '1px solid rgba(0,0,0,0.06)',
                            borderBottomRightRadius: isCurrentUser ? 1 : 4,
                            borderBottomLeftRadius: isCurrentUser ? 4 : 1,
                            position: 'relative',
                            transform: 'translateZ(0)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: isCurrentUser 
                                ? '0 12px 40px rgba(102, 126, 234, 0.3)'
                                : '0 8px 30px rgba(0,0,0,0.12)'
                            }
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 1, 
                              lineHeight: 1.5,
                              fontSize: '0.95rem',
                              fontWeight: 400
                            }}
                          >
                            {message.content}
                          </Typography>
                          
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1} 
                            sx={{ justifyContent: 'flex-end' }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              {formatMessageTime(message.timestamp)}
                            </Typography>
                            {isCurrentUser && (
                              <CheckCircle 
                                sx={{ 
                                  fontSize: 14, 
                                  color: 'rgba(255,255,255,0.8)' 
                                }} 
                              />
                            )}
                          </Stack>
                        </Paper>
                      </Box>
                    </Fade>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Stack>
          )}
        </Box>

        {/* Message Input */}
        <Paper
          elevation={0}
          sx={{ 
            p: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 0
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={`Message about ${conversation.donationTitle}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  background: 'rgba(102, 126, 234, 0.04)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    border: '1px solid #667eea',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  },
                },
              }}
            />
            
            <IconButton
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.2)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <AttachFile />
            </IconButton>
            
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              sx={{
                minWidth: 60,
                height: 56,
                borderRadius: 4,
                background: newMessage.trim() && !sending
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(0,0,0,0.12)',
                boxShadow: newMessage.trim() && !sending
                  ? '0 8px 32px rgba(102, 126, 234, 0.25)'
                  : 'none',
                '&:hover': {
                  background: newMessage.trim() && !sending
                    ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    : 'rgba(0,0,0,0.12)',
                  transform: newMessage.trim() && !sending ? 'translateY(-2px)' : 'none',
                  boxShadow: newMessage.trim() && !sending
                    ? '0 12px 40px rgba(102, 126, 234, 0.3)'
                    : 'none'
                },
                '&:disabled': {
                  background: 'rgba(0,0,0,0.08)',
                  color: 'rgba(0,0,0,0.26)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Send sx={{ fontSize: 20 }} />
            </Button>
          </Stack>
        </Paper>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.08)'
            }
          }}
        >
          <MenuItem onClick={() => setShowInfoDialog(true)}>
            <Info sx={{ mr: 2 }} />
            Conversation Info
          </MenuItem>
          <MenuItem>
            <Star sx={{ mr: 2 }} />
            Add to Favorites
          </MenuItem>
          <Divider />
          <MenuItem sx={{ color: 'error.main' }}>
            <Flag sx={{ mr: 2 }} />
            Report Issue
          </MenuItem>
        </Menu>
      </Paper>
    );
  };

  const EmptyState = () => (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 4,
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderRadius: 0
      }}
    >
      <Avatar
        sx={{
          width: 120,
          height: 120,
          mx: 'auto',
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
        }}
      >
        <Restaurant sx={{ fontSize: 60 }} />
      </Avatar>
      <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
        Select a conversation
      </Typography>
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400 }}>
        Choose a conversation from the list to start chatting about food donations
      </Typography>
      <Paper
        sx={{
          p: 4,
          maxWidth: 350,
          background: 'rgba(102, 126, 234, 0.08)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: 4
        }}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'left', lineHeight: 1.8 }}>
          <strong>💡 Chat Features:</strong>
          <br />• Real-time messaging
          <br />• Donation context included
          <br />• Secure & private
          <br />• Mobile friendly
        </Typography>
      </Paper>
    </Paper>
  );

  if (standalone) {
    return <ChatContent />;
  }

  return <ChatContent />;
};

export default ChatInterface;


// // src/components/chat/ChatInterface.js
// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   Grid,
//   Typography,
//   Paper,
//   IconButton,
//   useTheme,
//   useMediaQuery
// } from '@mui/material';
// import {
//   ArrowBack,
//   Close
// } from '@mui/icons-material';
// import ConversationList from './ConversationList';
// import MessageThread from './MessageThread';
// import { useChat } from '../../hooks/useChat';

// const ChatInterface = ({ onClose, initialConversationId = null, standalone = false }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId);
//   const [showConversationList, setShowConversationList] = useState(!initialConversationId || !isMobile);
  
//   const { conversations, loading } = useChat();

//   const handleConversationSelect = (conversationId) => {
//     setSelectedConversationId(conversationId);
//     if (isMobile) {
//       setShowConversationList(false);
//     }
//   };

//   const handleBackToList = () => {
//     if (isMobile) {
//       setShowConversationList(true);
//       setSelectedConversationId(null);
//     }
//   };

//   const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

//   if (standalone) {
//     return (
//       <Box
//         sx={{
//           minHeight: '100vh',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           position: 'relative'
//         }}
//       >
//         <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1 }}>
//           <Box sx={{ mb: 2 }}>
//             <IconButton
//               onClick={onClose}
//               sx={{
//                 color: 'white',
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 backdropFilter: 'blur(20px)',
//                 border: '1px solid rgba(255, 255, 255, 0.2)',
//                 '&:hover': {
//                   background: 'rgba(255, 255, 255, 0.15)'
//                 }
//               }}
//             >
//               <ArrowBack />
//             </IconButton>
//           </Box>
          
//           <ChatContent
//             conversations={conversations}
//             selectedConversationId={selectedConversationId}
//             selectedConversation={selectedConversation}
//             showConversationList={showConversationList}
//             isMobile={isMobile}
//             loading={loading}
//             onConversationSelect={handleConversationSelect}
//             onBackToList={handleBackToList}
//           />
//         </Container>
//       </Box>
//     );
//   }

//   return (
//     <ChatContent
//       conversations={conversations}
//       selectedConversationId={selectedConversationId}
//       selectedConversation={selectedConversation}
//       showConversationList={showConversationList}
//       isMobile={isMobile}
//       loading={loading}
//       onConversationSelect={handleConversationSelect}
//       onBackToList={handleBackToList}
//       onClose={onClose}
//     />
//   );
// };

// const ChatContent = ({
//   conversations,
//   selectedConversationId,
//   selectedConversation,
//   showConversationList,
//   isMobile,
//   loading,
//   onConversationSelect,
//   onBackToList,
//   onClose
// }) => (
//   <Paper
//     sx={{
//       height: { xs: 'calc(100vh - 100px)', md: '600px' },
//       borderRadius: 3,
//       overflow: 'hidden',
//       background: 'rgba(255, 255, 255, 0.95)',
//       backdropFilter: 'blur(20px)',
//       border: '1px solid rgba(255, 255, 255, 0.2)',
//       display: 'flex',
//       flexDirection: 'column'
//     }}
//   >
//     {/* Header */}
//     <Box
//       sx={{
//         p: 3,
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         color: 'white',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between'
//       }}
//     >
//       <Typography variant="h5" sx={{ fontWeight: 700 }}>
//         {selectedConversation ? selectedConversation.donationTitle : 'Messages'}
//       </Typography>
//       {onClose && (
//         <IconButton
//           onClick={onClose}
//           sx={{ color: 'white' }}
//         >
//           <Close />
//         </IconButton>
//       )}
//     </Box>

//     {/* Content */}
//     <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
//       {!isMobile ? (
//         // Desktop Layout
//         <Grid container sx={{ height: '100%' }}>
//           <Grid item xs={4} sx={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
//             <ConversationList
//               conversations={conversations}
//               selectedConversationId={selectedConversationId}
//               onConversationSelect={onConversationSelect}
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={8}>
//             {selectedConversation ? (
//               <MessageThread
//                 conversation={selectedConversation}
//                 onBack={onBackToList}
//                 showBackButton={false}
//               />
//             ) : (
//               <Box
//                 sx={{
//                   height: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   flexDirection: 'column',
//                   p: 4,
//                   textAlign: 'center'
//                 }}
//               >
//                 <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.6)', mb: 1 }}>
//                   Select a conversation
//                 </Typography>
//                 <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
//                   Choose a conversation from the list to start chatting
//                 </Typography>
//               </Box>
//             )}
//           </Grid>
//         </Grid>
//       ) : (
//         // Mobile Layout
//         <Box sx={{ width: '100%', height: '100%' }}>
//           {showConversationList ? (
//             <ConversationList
//               conversations={conversations}
//               selectedConversationId={selectedConversationId}
//               onConversationSelect={onConversationSelect}
//               loading={loading}
//             />
//           ) : selectedConversation ? (
//             <MessageThread
//               conversation={selectedConversation}
//               onBack={onBackToList}
//               showBackButton={true}
//             />
//           ) : null}
//         </Box>
//       )}
//     </Box>
//   </Paper>
// );

// export default ChatInterface;