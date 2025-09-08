// src/hooks/useChat.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createOrGetConversation,
  sendMessage as sendMessageService,
  markMessagesAsRead,
  getUserConversations,
  getMessages,
  getTotalUnreadCount
} from '../services/chatService';

export const useChat = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  // Get all conversations for the current user
  useEffect(() => {
    if (!currentUser?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = getUserConversations(currentUser.uid, (newConversations) => {
        setConversations(newConversations);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up conversations listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Get total unread count
  useEffect(() => {
    if (!currentUser?.uid) {
      setTotalUnread(0);
      return;
    }

    try {
      const unsubscribe = getTotalUnreadCount(currentUser.uid, (count) => {
        setTotalUnread(count);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up unread count listener:', err);
    }
  }, [currentUser?.uid]);

  // Start a new conversation
  const startConversation = useCallback(async (donationId, donorId, receiverId, donationTitle) => {
    try {
      if (!currentUser?.uid) {
        throw new Error('User must be authenticated to start a conversation');
      }

      console.log('Starting conversation with params:', {
        donationId,
        donorId,
        receiverId,
        donationTitle,
        currentUser: currentUser.uid
      });

      // Validate that current user is either donor or receiver
      if (currentUser.uid !== donorId && currentUser.uid !== receiverId) {
        throw new Error('You must be either the donor or receiver to start this conversation');
      }

      const conversationId = await createOrGetConversation(
        donationId,
        donorId,
        receiverId,
        donationTitle
      );

      console.log('Conversation started/found:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error.message);
      throw error;
    }
  }, [currentUser?.uid]);

  return {
    conversations,
    loading,
    error,
    totalUnread,
    startConversation,
    clearError: () => setError(null)
  };
};

// Hook for individual conversation
export const useConversation = (conversationId) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Get messages for the conversation
  useEffect(() => {
    if (!conversationId || !currentUser?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = getMessages(conversationId, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [conversationId, currentUser?.uid]);

  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (conversationId && currentUser?.uid && messages.length > 0) {
      // Mark as read after a short delay to avoid excessive updates
      const timer = setTimeout(() => {
        markMessagesAsRead(conversationId, currentUser.uid).catch(err => {
          console.error('Error marking messages as read:', err);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [conversationId, currentUser?.uid, messages.length]);

  // Send a message
  const sendMessage = useCallback(async (content, receiverId, donationTitle) => {
    if (!currentUser?.uid || !conversationId) {
      throw new Error('Missing required information to send message');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    setSending(true);
    setError(null);

    try {
      await sendMessageService(
        conversationId,
        currentUser.uid,
        receiverId,
        content.trim(),
        donationTitle
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      throw error;
    } finally {
      setSending(false);
    }
  }, [conversationId, currentUser?.uid]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    clearError: () => setError(null)
  };
};

// Hook for chat actions (for backward compatibility)
export const useChatActions = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Start a new conversation
  const startConversation = useCallback(async (donationId, donorId, receiverId, donationTitle) => {
    if (!currentUser?.uid) {
      throw new Error('User must be authenticated to start a conversation');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting conversation with params:', {
        donationId,
        donorId,
        receiverId,
        donationTitle,
        currentUser: currentUser.uid
      });

      // Validate that current user is either donor or receiver
      if (currentUser.uid !== donorId && currentUser.uid !== receiverId) {
        throw new Error('You must be either the donor or receiver to start this conversation');
      }

      const conversationId = await createOrGetConversation(
        donationId,
        donorId,
        receiverId,
        donationTitle
      );

      console.log('Conversation started/found:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  return {
    startConversation,
    loading,
    error,
    clearError: () => setError(null)
  };
};