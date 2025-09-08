// src/components/chat/MessageInput.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Send
} from '@mui/icons-material';

const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: 'white'
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(102, 126, 234, 0.04)',
              '&:hover fieldset': {
                borderColor: '#667eea'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
                borderWidth: 2
              },
              '& fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.2)'
              }
            },
            '& .MuiInputBase-input': {
              fontSize: '0.95rem',
              lineHeight: 1.4
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(0,0,0,0.5)',
              opacity: 1
            }
          }}
        />
        
        <IconButton
          type="submit"
          disabled={!message.trim() || disabled}
          sx={{
            background: message.trim() && !disabled 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(0,0,0,0.12)',
            color: message.trim() && !disabled ? 'white' : 'rgba(0,0,0,0.26)',
            width: 44,
            height: 44,
            '&:hover': {
              background: message.trim() && !disabled 
                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                : 'rgba(0,0,0,0.12)',
              transform: message.trim() && !disabled ? 'scale(1.05)' : 'none'
            },
            '&:disabled': {
              background: 'rgba(0,0,0,0.12)',
              color: 'rgba(0,0,0,0.26)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {disabled ? (
            <CircularProgress size={20} sx={{ color: 'rgba(0,0,0,0.26)' }} />
          ) : (
            <Send sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default MessageInput;