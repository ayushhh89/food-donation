// src/components/chat/ChatInterface.js
import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack,
  Close
} from '@mui/icons-material';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import { useChat } from '../../hooks/useChat';

const ChatInterface = ({ onClose, initialConversationId = null, standalone = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId);
  const [showConversationList, setShowConversationList] = useState(!initialConversationId || !isMobile);
  
  const { conversations, loading } = useChat();

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

  if (standalone) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative'
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
          </Box>
          
          <ChatContent
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            selectedConversation={selectedConversation}
            showConversationList={showConversationList}
            isMobile={isMobile}
            loading={loading}
            onConversationSelect={handleConversationSelect}
            onBackToList={handleBackToList}
          />
        </Container>
      </Box>
    );
  }

  return (
    <ChatContent
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      selectedConversation={selectedConversation}
      showConversationList={showConversationList}
      isMobile={isMobile}
      loading={loading}
      onConversationSelect={handleConversationSelect}
      onBackToList={handleBackToList}
      onClose={onClose}
    />
  );
};

const ChatContent = ({
  conversations,
  selectedConversationId,
  selectedConversation,
  showConversationList,
  isMobile,
  loading,
  onConversationSelect,
  onBackToList,
  onClose
}) => (
  <Paper
    sx={{
      height: { xs: 'calc(100vh - 100px)', md: '600px' },
      borderRadius: 3,
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {/* Header */}
    <Box
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {selectedConversation ? selectedConversation.donationTitle : 'Messages'}
      </Typography>
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <Close />
        </IconButton>
      )}
    </Box>

    {/* Content */}
    <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {!isMobile ? (
        // Desktop Layout
        <Grid container sx={{ height: '100%' }}>
          <Grid item xs={4} sx={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onConversationSelect={onConversationSelect}
              loading={loading}
            />
          </Grid>
          <Grid item xs={8}>
            {selectedConversation ? (
              <MessageThread
                conversation={selectedConversation}
                onBack={onBackToList}
                showBackButton={false}
              />
            ) : (
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
                <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.6)', mb: 1 }}>
                  Select a conversation
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                  Choose a conversation from the list to start chatting
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      ) : (
        // Mobile Layout
        <Box sx={{ width: '100%', height: '100%' }}>
          {showConversationList ? (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onConversationSelect={onConversationSelect}
              loading={loading}
            />
          ) : selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              onBack={onBackToList}
              showBackButton={true}
            />
          ) : null}
        </Box>
      )}
    </Box>
  </Paper>
);

export default ChatInterface;