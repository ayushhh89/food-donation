// src/components/chat/ConversationList.js - FIXED VERSION
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Restaurant,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ 
  conversations, 
  selectedConversationId, 
  onConversationSelect, 
  loading 
}) => {
  const { currentUser, userProfile } = useAuth();

  const getOtherUserName = (conversation) => {
    const isDonor = conversation.donorId === currentUser?.uid;
    return isDonor ? 'Receiver' : conversation.donorName || 'Donor';
  };

  const getUnreadCount = (conversation) => {
    const isDonor = conversation.donorId === currentUser?.uid;
    return isDonor ? conversation.unreadCount?.donor || 0 : conversation.unreadCount?.receiver || 0;
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 4,
          textAlign: 'center'
        }}
      >
        <Restaurant sx={{ fontSize: 60, color: 'rgba(0,0,0,0.3)', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.6)', mb: 1 }}>
          No conversations yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
          {userProfile?.role === 'donor' 
            ? 'When receivers show interest in your donations, you can chat with them here'
            : 'Show interest in donations to start conversations with donors'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'hidden' }}>
      <List sx={{ height: '100%', overflow: 'auto', p: 0 }}>
        {conversations.map((conversation) => {
          const unreadCount = getUnreadCount(conversation);
          const isSelected = conversation.id === selectedConversationId;
          const isDonor = conversation.donorId === currentUser?.uid;
          
          return (
            <ListItem
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              sx={{
                cursor: 'pointer',
                borderLeft: isSelected ? '4px solid #667eea' : '4px solid transparent',
                backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0,0,0,0.04)'
                },
                py: 2,
                px: 3
              }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={unreadCount}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      background: isDonor 
                        ? 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
                        : 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                      width: 48,
                      height: 48
                    }}
                  >
                    {isDonor ? <Restaurant /> : <Person />}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      component="span"
                      variant="subtitle1"
                      sx={{
                        fontWeight: unreadCount > 0 ? 700 : 500,
                        fontSize: '1rem',
                        color: isSelected ? '#667eea' : 'rgba(0,0,0,0.87)'
                      }}
                    >
                      {getOtherUserName(conversation)}
                    </Typography>
                    <Chip
                      label={isDonor ? 'As Donor' : 'As Receiver'}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: isDonor 
                          ? 'rgba(255, 152, 0, 0.1)' 
                          : 'rgba(0, 200, 83, 0.1)',
                        color: isDonor ? '#FF9800' : '#00C853',
                        border: `1px solid ${isDonor ? 'rgba(255, 152, 0, 0.2)' : 'rgba(0, 200, 83, 0.2)'}`
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box component="div">
                    <Typography
                      component="div"
                      variant="body2"
                      sx={{
                        color: '#667eea',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {conversation.donationTitle}
                    </Typography>
                    
                    {conversation.lastMessage && (
                      <Typography
                        component="div"
                        variant="body2"
                        sx={{
                          color: 'rgba(0,0,0,0.6)',
                          fontWeight: unreadCount > 0 ? 500 : 400,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5
                        }}
                      >
                        {conversation.lastMessage}
                      </Typography>
                    )}
                    
                    <Typography
                      component="div"
                      variant="caption"
                      sx={{
                        color: 'rgba(0,0,0,0.5)',
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatLastMessageTime(conversation.lastMessageTime)}
                    </Typography>
                  </Box>
                }
                sx={{ ml: 1 }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ConversationList;