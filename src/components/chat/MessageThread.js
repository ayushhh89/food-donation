// src/components/chat/MessageThread.js
import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Restaurant
} from '@mui/icons-material';
import { useConversation } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import MessageInput from './MessageInput';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';

const MessageThread = ({ conversation, onBack, showBackButton = false }) => {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const { messages, loading, sending, sendMessage } = useConversation(conversation.id);
  
  const isDonor = conversation.donorId === currentUser?.uid;
  const receiverId = isDonor ? conversation.receiverId : conversation.donorId;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content) => {
    try {
      await sendMessage(content, receiverId, conversation.donationTitle);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm');
    } else if (isYesterday(timestamp)) {
      return `Yesterday ${format(timestamp, 'HH:mm')}`;
    } else {
      return format(timestamp, 'MMM d, HH:mm');
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage || !currentMessage.timestamp || !previousMessage.timestamp) {
      return true;
    }
    return !isSameDay(currentMessage.timestamp, previousMessage.timestamp);
  };

  const renderDateSeparator = (timestamp) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        my: 2
      }}
    >
      <Typography
        variant="caption"
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.05)',
          color: 'rgba(0,0,0,0.6)',
          fontSize: '0.75rem',
          fontWeight: 500
        }}
      >
        {isToday(timestamp) 
          ? 'Today' 
          : isYesterday(timestamp) 
            ? 'Yesterday' 
            : format(timestamp, 'MMMM d, yyyy')
        }
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {showBackButton && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'white'
          }}
        >
          <IconButton onClick={onBack} size="small">
            <ArrowBack />
          </IconButton>
          
          <Avatar
            sx={{
              background: isDonor 
                ? 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
                : 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
              width: 40,
              height: 40
            }}
          >
            {isDonor ? <Restaurant /> : <Person />}
          </Avatar>
          
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {isDonor ? 'Receiver' : 'Donor'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 500,
                display: 'block',
                lineHeight: 1
              }}
            >
              {conversation.donationTitle}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: '#f8f9fa'
        }}
      >
        {loading ? (
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
        ) : messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.6)', mb: 1 }}>
              Start the conversation
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
              Send a message to begin chatting about this donation
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUser?.uid;
              const previousMessage = messages[index - 1];
              const showDateSep = shouldShowDateSeparator(message, previousMessage);

              return (
                <Box key={message.id}>
                  {showDateSep && message.timestamp && renderDateSeparator(message.timestamp)}
                  
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      sx={{
                        maxWidth: '70%',
                        px: 2,
                        py: 1.5,
                        borderRadius: 3,
                        background: isOwnMessage
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'white',
                        color: isOwnMessage ? 'white' : 'rgba(0,0,0,0.87)',
                        border: isOwnMessage ? 'none' : '1px solid rgba(0,0,0,0.1)',
                        borderBottomRightRadius: isOwnMessage ? 1 : 3,
                        borderBottomLeftRadius: isOwnMessage ? 3 : 1
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 0.5, lineHeight: 1.4 }}>
                        {message.content}
                      </Typography>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                          fontSize: '0.7rem'
                        }}
                      >
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })}
            
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
        placeholder={`Message about ${conversation.donationTitle}...`}
      />
    </Box>
  );
};

export default MessageThread;