// src/services/chatService.js - DEBUG VERSION with detailed logging
import {
  collection,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Helper function to verify user authentication
const getCurrentUserId = () => {
  const user = auth.currentUser;
  console.log('Auth current user:', user);
  if (!user) {
    throw new Error('User not authenticated');
  }
  console.log('Current user UID:', user.uid);
  console.log('User email verified:', user.emailVerified);
  console.log('User token result available:', !!user.accessToken);
  return user.uid;
};

// Helper function to validate conversation participants
const validateParticipants = (donorId, receiverId, currentUserId) => {
  console.log('Validating participants:', { donorId, receiverId, currentUserId });
  
  if (!donorId || !receiverId) {
    throw new Error('Both donorId and receiverId are required');
  }
  
  if (currentUserId !== donorId && currentUserId !== receiverId) {
    throw new Error('Current user must be either the donor or receiver');
  }
  
  if (donorId === receiverId) {
    throw new Error('Donor and receiver cannot be the same user');
  }
  
  console.log('Participants validation passed');
};

// Create a new conversation or get existing one
export const createOrGetConversation = async (donationId, donorId, receiverId, donationTitle) => {
  try {
    console.log('=== Starting createOrGetConversation ===');
    console.log('Input params:', {
      donationId,
      donorId, 
      receiverId,
      donationTitle
    });

    // Verify user authentication
    const currentUserId = getCurrentUserId();
    console.log('Current user ID verified:', currentUserId);
    
    // Validate participants
    validateParticipants(donorId, receiverId, currentUserId);

    const conversationId = `${donationId}_${donorId}_${receiverId}`;
    const conversationRef = doc(db, 'conversations', conversationId);
    
    console.log('Generated conversation ID:', conversationId);
    console.log('Conversation document path:', conversationRef.path);
    
    // Check if conversation already exists
    console.log('Checking if conversation exists...');
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      console.log('Conversation does not exist, creating new one...');
      
      // Create conversation data with explicit field types
      const conversationData = {
        donationId: String(donationId),
        donorId: String(donorId),
        receiverId: String(receiverId),
        donationTitle: String(donationTitle),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          donor: 0,
          receiver: 0
        },
        createdAt: serverTimestamp(),
        createdBy: String(currentUserId)
      };
      
      console.log('Conversation data to create:', JSON.stringify(conversationData, null, 2));
      console.log('Data types:', {
        donationId: typeof conversationData.donationId,
        donorId: typeof conversationData.donorId,
        receiverId: typeof conversationData.receiverId,
        donationTitle: typeof conversationData.donationTitle,
        createdBy: typeof conversationData.createdBy
      });
      
      // Log current user token info
      try {
        const user = auth.currentUser;
        if (user) {
          const tokenResult = await user.getIdTokenResult();
          console.log('User token claims:', tokenResult.claims);
          console.log('Token expiration:', tokenResult.expirationTime);
          console.log('Auth time:', tokenResult.authTime);
        }
      } catch (tokenError) {
        console.log('Could not get token info:', tokenError);
      }
      
      console.log('Attempting to create document with setDoc...');
      
      // Create new conversation using setDoc
      await setDoc(conversationRef, conversationData);
      
      console.log('Conversation created successfully!');
    } else {
      console.log('Conversation already exists:', conversationDoc.data());
    }
    
    console.log('=== createOrGetConversation completed successfully ===');
    return conversationId;
  } catch (error) {
    console.error('=== Error in createOrGetConversation ===');
    console.error('Error object:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Additional debugging for permission errors
    if (error.code === 'permission-denied') {
      console.error('PERMISSION DENIED - Additional debugging:');
      console.error('Current auth state:', {
        currentUser: auth.currentUser,
        isSignedIn: !!auth.currentUser,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email
      });
      console.error('Expected donorId:', donorId);
      console.error('Expected receiverId:', receiverId);
      console.error('User should match one of these IDs');
      
      // Try to get fresh token
      try {
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken(true);
          console.error('Fresh token obtained, length:', token.length);
        }
      } catch (tokenError) {
        console.error('Could not get fresh token:', tokenError);
      }
    }
    
    throw error;
  }
};

// Send a message with enhanced error handling and debugging
export const sendMessage = async (conversationId, senderId, receiverId, content, donationTitle) => {
  try {
    console.log('=== Starting sendMessage ===');
    console.log('Send message params:', { conversationId, senderId, receiverId, content });
    
    // Verify user authentication
    const currentUserId = getCurrentUserId();
    
    if (currentUserId !== senderId) {
      throw new Error('Current user must be the sender');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    
    const batch = writeBatch(db);
    
    // Add message to messages collection
    const messageRef = doc(collection(db, 'messages'));
    const messageData = {
      conversationId: String(conversationId),
      senderId: String(senderId),
      receiverId: String(receiverId),
      content: String(content.trim()),
      timestamp: serverTimestamp(),
      read: false,
      messageType: 'text'
    };
    
    console.log('Message data to create:', messageData);
    batch.set(messageRef, messageData);
    
    // Update conversation with last message and unread count
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      console.log('Existing conversation data:', conversationData);
      
      // Verify user is part of this conversation
      if (currentUserId !== conversationData.donorId && currentUserId !== conversationData.receiverId) {
        throw new Error('User not authorized for this conversation');
      }
      
      // Determine which user should have unread count incremented
      const isFromDonor = conversationData.donorId === senderId;
      const unreadCountUpdate = isFromDonor 
        ? { 'unreadCount.receiver': increment(1), 'unreadCount.donor': 0 }
        : { 'unreadCount.donor': increment(1), 'unreadCount.receiver': 0 };
      
      const conversationUpdate = {
        lastMessage: content.trim(),
        lastMessageTime: serverTimestamp(),
        donationTitle,
        ...unreadCountUpdate
      };
      
      console.log('Conversation update data:', conversationUpdate);
      batch.update(conversationRef, conversationUpdate);
    } else {
      throw new Error('Conversation not found');
    }
    
    console.log('Committing batch...');
    await batch.commit();
    console.log('Message sent successfully!');
    return messageRef.id;
  } catch (error) {
    console.error('=== Error in sendMessage ===');
    console.error('Error:', error);
    throw error;
  }
};

// Mark messages as read with better error handling
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    console.log('Marking messages as read:', { conversationId, userId });
    
    // Verify user authentication
    const currentUserId = getCurrentUserId();
    
    if (currentUserId !== userId) {
      throw new Error('Cannot mark messages as read for another user');
    }
    
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationDoc.data();
    
    // Verify user is part of this conversation
    if (userId !== conversationData.donorId && userId !== conversationData.receiverId) {
      throw new Error('User not authorized for this conversation');
    }
    
    // Determine if user is donor or receiver
    const isDonor = conversationData.donorId === userId;
    const unreadCountReset = isDonor 
      ? { 'unreadCount.donor': 0 }
      : { 'unreadCount.receiver': 0 };
    
    // Update conversation unread count
    await updateDoc(conversationRef, unreadCountReset);
    
    // Mark individual messages as read
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(messagesQuery);
    
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
    }
    
    console.log('Messages marked as read successfully');
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get conversations for a user with better error handling
export const getUserConversations = (userId, callback) => {
  try {
    console.log('Setting up conversations listener for user:', userId);
    
    // Verify user authentication
    const currentUserId = getCurrentUserId();
    
    if (currentUserId !== userId) {
      throw new Error('Cannot get conversations for another user');
    }
    
    let allConversations = new Map();
    let unsubscribers = [];
    
    const conversationsQuery1 = query(
      collection(db, 'conversations'),
      where('donorId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const conversationsQuery2 = query(
      collection(db, 'conversations'),
      where('receiverId', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const updateCallback = () => {
      const conversations = Array.from(allConversations.values())
        .sort((a, b) => {
          const aTime = a.lastMessageTime?.toDate() || new Date(0);
          const bTime = b.lastMessageTime?.toDate() || new Date(0);
          return bTime - aTime;
        });
      callback(conversations);
    };
    
    const unsubscribe1 = onSnapshot(conversationsQuery1, (snapshot) => {
      snapshot.docs.forEach(doc => {
        allConversations.set(doc.id, {
          id: doc.id,
          ...doc.data()
        });
      });
      updateCallback();
    }, (error) => {
      console.error('Error in conversations query 1:', error);
    });
    
    const unsubscribe2 = onSnapshot(conversationsQuery2, (snapshot) => {
      snapshot.docs.forEach(doc => {
        allConversations.set(doc.id, {
          id: doc.id,
          ...doc.data()
        });
      });
      updateCallback();
    }, (error) => {
      console.error('Error in conversations query 2:', error);
    });
    
    unsubscribers.push(unsubscribe1, unsubscribe2);
    
    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

// Get messages for a conversation with better error handling
export const getMessages = (conversationId, callback) => {
  try {
    console.log('Setting up messages listener for conversation:', conversationId);
    
    // Verify user authentication
    const currentUserId = getCurrentUserId();
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()
        };
      });
      
      // Verify user has access to these messages
      if (messages.length > 0) {
        const firstMessage = messages[0];
        if (currentUserId !== firstMessage.senderId && currentUserId !== firstMessage.receiverId) {
          console.error('User not authorized to view these messages');
          return;
        }
      }
      
      callback(messages);
    }, (error) => {
      console.error('Error getting messages:', error);
    });
  } catch (error) {
    console.error('Error setting up messages listener:', error);
    throw error;
  }
};

// Get total unread count for a user
export const getTotalUnreadCount = (userId, callback) => {
  try {
    // Verify user authentication
    const currentUserId = getCurrentUserId();
    
    if (currentUserId !== userId) {
      throw new Error('Cannot get unread count for another user');
    }
    
    const conversationsQuery1 = query(
      collection(db, 'conversations'),
      where('donorId', '==', userId)
    );
    
    const conversationsQuery2 = query(
      collection(db, 'conversations'),
      where('receiverId', '==', userId)
    );
    
    let donorConversations = [];
    let receiverConversations = [];
    
    const unsubscribe1 = onSnapshot(conversationsQuery1, (snapshot) => {
      donorConversations = snapshot.docs.map(doc => doc.data());
      calculateTotalUnread();
    }, (error) => {
      console.error('Error in unread count query 1:', error);
    });
    
    const unsubscribe2 = onSnapshot(conversationsQuery2, (snapshot) => {
      receiverConversations = snapshot.docs.map(doc => doc.data());
      calculateTotalUnread();
    }, (error) => {
      console.error('Error in unread count query 2:', error);
    });
    
    const calculateTotalUnread = () => {
      const donorUnread = donorConversations.reduce((total, conv) => 
        total + (conv.unreadCount?.donor || 0), 0);
      const receiverUnread = receiverConversations.reduce((total, conv) => 
        total + (conv.unreadCount?.receiver || 0), 0);
      
      callback(donorUnread + receiverUnread);
    };
    
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};