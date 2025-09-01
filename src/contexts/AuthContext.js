// src/contexts/AuthContext.js - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Register new user
  async function register(email, password, userData) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role, // 'donor' or 'receiver'
        phone: userData.phone || '',
        location: userData.location || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileComplete: false,
        isActive: true,
        // Role-specific fields
        ...(userData.role === 'donor' && {
          organization: userData.organization || '',
          totalDonations: 0,
          successfulDonations: 0,
          rating: 0
        }),
        ...(userData.role === 'receiver' && {
          organizationType: userData.organizationType || '',
          beneficiaryCount: userData.beneficiaryCount || 0,
          totalReceived: 0,
          verificationStatus: 'pending'
        })
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);
      setUserProfile(userDoc);
      
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Better error messages
      let errorMessage = 'Failed to create account. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  // Login user
  async function login(email, password) {
    try {
      console.log('Attempting login for:', email);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful for:', user.uid);
      
      // Don't show success toast here - let the auth state change handle it
      return user;
    } catch (error) {
      console.error('Login error:', error);
      
      // Better error messages
      let errorMessage = 'Failed to login. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  // Logout user
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      if (!currentUser) throw new Error('No user logged in');

      // Update Firebase Auth profile if name is being updated
      if (updates.name && updates.name !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: updates.name
        });
      }

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }));
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile');
      throw error;
    }
  }

  // Change password
  async function changePassword(currentPassword, newPassword) {
    try {
      if (!currentUser) throw new Error('No user logged in');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
      
      toast.success('Password updated successfully!');
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Error updating password');
      }
      throw error;
    }
  }

  // Fetch user profile from Firestore with better error handling
  async function fetchUserProfile(uid) {
    if (!uid) {
      console.error('No UID provided to fetchUserProfile');
      return null;
    }

    setProfileLoading(true);
    
    try {
      console.log('Fetching user profile for:', uid);
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const profile = { id: userDoc.id, ...userDoc.data() };
        console.log('Profile fetched successfully:', profile);
        setUserProfile(profile);
        return profile;
      } else {
        console.warn('User profile document does not exist for UID:', uid);
        
        // Create a basic profile if it doesn't exist (this can happen with existing users)
        const basicProfile = {
          uid: uid,
          email: auth.currentUser?.email || '',
          name: auth.currentUser?.displayName || 'User',
          role: 'receiver', // Default role
          phone: '',
          location: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profileComplete: false,
          isActive: true,
          organizationType: '',
          beneficiaryCount: 0,
          totalReceived: 0,
          verificationStatus: 'pending'
        };

        // Create the profile document
        await setDoc(userRef, basicProfile);
        console.log('Created basic profile for existing user');
        
        setUserProfile(basicProfile);
        toast.info('Profile created successfully. Please complete your profile.');
        return basicProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Don't show error toast for permission errors during development
      if (error.code !== 'permission-denied') {
        toast.error('Error loading profile. Please try refreshing the page.');
      }
      
      return null;
    } finally {
      setProfileLoading(false);
    }
  }

  // Check if user has required role
  function hasRole(requiredRole) {
    return userProfile?.role === requiredRole;
  }

  // Check if user is donor
  function isDonor() {
    return userProfile?.role === 'donor';
  }

  // Check if user is receiver
  function isReceiver() {
    return userProfile?.role === 'receiver';
  }

  // Update user location
  async function updateUserLocation(location) {
    try {
      if (!currentUser) return;

      await updateUserProfile({ location });
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  }

  // Auth state listener with better error handling
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid || 'No user');
      
      setLoading(true);
      
      try {
        if (user) {
          setCurrentUser(user);
          console.log('User authenticated, fetching profile...');
          
          // Fetch user profile
          const profile = await fetchUserProfile(user.uid);
          
          if (profile) {
            console.log('Login flow completed successfully');
            // Only show success message on actual login (not page refresh)
            if (!currentUser) {
              toast.success('Welcome back!');
            }
          } else {
            console.warn('Failed to fetch user profile');
          }
        } else {
          console.log('No user, clearing state');
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        console.log('Auth state processing complete');
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []); // Remove currentUser dependency to avoid infinite loops

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    register,
    login,
    logout,
    updateUserProfile,
    changePassword,
    fetchUserProfile,
    hasRole,
    isDonor,
    isReceiver,
    updateUserLocation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}