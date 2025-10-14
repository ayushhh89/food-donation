// src/services/deliveryService.js
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Enhanced Delivery Service
 * Handles volunteer assignments, delivery tracking, and credits
 */

/**
 * Calculate credits based on distance
 */
export const calculateCredits = (distance) => {
  if (distance < 5) return 10;
  if (distance >= 5 && distance <= 10) return 15;
  return 25;
};

/**
 * Calculate distance between two addresses (simplified)
 * In production, use Google Maps Distance Matrix API
 */
export const calculateDistance = (address1, address2) => {
  // Simplified: return random distance for now
  // TODO: Integrate with Google Maps API
  return Math.floor(Math.random() * 15) + 1;
};

/**
 * Get all active volunteers
 */
export const getActiveVolunteers = async () => {
  try {
    const volunteersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'volunteer'),
      where('isActive', '==', 1)
    );

    const snapshot = await getDocs(volunteersQuery);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting active volunteers:', error);
    return [];
  }
};

/**
 * Get all volunteers (active and inactive)
 */
export const getAllVolunteers = async () => {
  try {
    const volunteersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'volunteer')
    );

    const snapshot = await getDocs(volunteersQuery);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting volunteers:', error);
    return [];
  }
};

/**
 * Get volunteer statistics
 */
export const getVolunteerStats = async (volunteerId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', volunteerId));
    const ridesQuery = query(
      collection(db, 'volunteerRides'),
      where('volunteerId', '==', volunteerId)
    );
    const ridesSnapshot = await getDocs(ridesQuery);

    const rides = ridesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const completedRides = rides.filter(r => r.status === 'completed');
    const activeRides = rides.filter(r => r.status === 'assigned' || r.status === 'in_progress' || r.status === 'pending_verification');

    const userData = userDoc.exists() ? userDoc.data() : {};

    return {
      totalRides: rides.length,
      completedRides: completedRides.length,
      activeRides: activeRides.length,
      totalCredits: userData.credits || 0,
      totalDistance: userData.totalDistance || 0,
      avgRating: userData.avgRating || 0,
      completionRate: rides.length > 0 ? (completedRides.length / rides.length) * 100 : 0,
      recentRides: rides.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting volunteer stats:', error);
    return null;
  }
};

/**
 * Assign a delivery to a volunteer
 */
export const assignDeliveryToVolunteer = async ({
  volunteerId,
  donationId,
  donorId,
  receiverId,
  donorName,
  receiverName,
  foodItem,
  quantity,
  pickupLocation,
  deliveryLocation,
  donorContact,
  receiverContact,
  notes = ''
}) => {
  try {
    // Calculate distance and credits
    const distance = calculateDistance(pickupLocation, deliveryLocation);
    const credits = calculateCredits(distance);

    // Create ride document
    const rideData = {
      volunteerId,
      donationId,
      donorId,
      receiverId,
      donorName: donorName || 'Unknown Donor',
      receiverName: receiverName || 'Unknown Receiver',
      foodItem,
      quantity,
      pickupLocation,
      deliveryLocation,
      donorContact: donorContact || 'N/A',
      receiverContact: receiverContact || 'N/A',
      distance,
      credits,
      notes,
      status: 'assigned',
      assignedAt: serverTimestamp(),
      assignedBy: 'admin',
      startedAt: null,
      completedAt: null,
      verifiedAt: null,
      completionNotes: ''
    };

    const rideRef = await addDoc(collection(db, 'volunteerRides'), rideData);

    // Update volunteer's stats
    const volunteerRef = doc(db, 'users', volunteerId);
    await updateDoc(volunteerRef, {
      totalRides: increment(1),
      activeRides: increment(1)
    });

    // Update donation document
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, {
      assignedVolunteerId: volunteerId,
      volunteerAssignedAt: serverTimestamp(),
      deliveryStatus: 'assigned',
      rideId: rideRef.id
    });

    return { success: true, rideId: rideRef.id, credits };
  } catch (error) {
    console.error('Error assigning delivery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Start a delivery (volunteer marks as started)
 */
export const startDelivery = async (rideId, volunteerId) => {
  try {
    const rideRef = doc(db, 'volunteerRides', rideId);
    await updateDoc(rideRef, {
      status: 'in_progress',
      startedAt: serverTimestamp()
    });

    // Update donation status
    const rideDoc = await getDoc(rideRef);
    if (rideDoc.exists()) {
      const donationRef = doc(db, 'donations', rideDoc.data().donationId);
      await updateDoc(donationRef, {
        deliveryStatus: 'in_transit'
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error starting delivery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete a delivery (volunteer marks as completed, waits for verification)
 */
export const completeDelivery = async (rideId, volunteerId, completionNotes = '') => {
  try {
    const rideRef = doc(db, 'volunteerRides', rideId);
    const rideDoc = await getDoc(rideRef);

    if (!rideDoc.exists()) {
      return { success: false, error: 'Ride not found' };
    }

    const rideData = rideDoc.data();

    // Update ride status to pending verification
    await updateDoc(rideRef, {
      status: 'pending_verification',
      completedAt: serverTimestamp(),
      completionNotes
    });

    // Update donation status
    const donationRef = doc(db, 'donations', rideData.donationId);
    await updateDoc(donationRef, {
      deliveryStatus: 'pending_verification'
    });

    return { success: true, pendingVerification: true };
  } catch (error) {
    console.error('Error completing delivery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify and approve delivery completion (admin action)
 * Awards credits to volunteer
 */
export const verifyDeliveryCompletion = async (rideId, adminId) => {
  try {
    const rideRef = doc(db, 'volunteerRides', rideId);
    const rideDoc = await getDoc(rideRef);

    if (!rideDoc.exists()) {
      return { success: false, error: 'Ride not found' };
    }

    const rideData = rideDoc.data();
    const creditsToAward = rideData.credits || 10;

    // Update ride status to completed
    await updateDoc(rideRef, {
      status: 'completed',
      verifiedAt: serverTimestamp(),
      verifiedBy: adminId
    });

    // Award credits to volunteer
    const volunteerRef = doc(db, 'users', rideData.volunteerId);
    await updateDoc(volunteerRef, {
      credits: increment(creditsToAward),
      completedRides: increment(1),
      activeRides: increment(-1),
      totalDistance: increment(rideData.distance || 0)
    });

    // Update donation status
    const donationRef = doc(db, 'donations', rideData.donationId);
    await updateDoc(donationRef, {
      status: 'completed',
      deliveryStatus: 'delivered',
      deliveryVerifiedAt: serverTimestamp()
    });

    return { success: true, creditsAwarded: creditsToAward };
  } catch (error) {
    console.error('Error verifying delivery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Receiver confirms delivery completion
 * Awards 5 credits to volunteer automatically
 */
export const confirmDeliveryByReceiver = async (rideId, receiverId) => {
  try {
    console.log('🔵 START confirmDeliveryByReceiver:', { rideId, receiverId });

    const rideRef = doc(db, 'volunteerRides', rideId);
    const rideDoc = await getDoc(rideRef);

    if (!rideDoc.exists()) {
      console.log('❌ Ride not found');
      return { success: false, error: 'Ride not found' };
    }

    const rideData = rideDoc.data();
    console.log('📄 Ride data:', { status: rideData.status, volunteerId: rideData.volunteerId, receiverId: rideData.receiverId });

    // Verify the receiver is authorized
    if (rideData.receiverId !== receiverId) {
      console.log('❌ Unauthorized receiver');
      return { success: false, error: 'Unauthorized: You are not the receiver for this delivery' };
    }

    // Check if already confirmed
    if (rideData.status === 'completed') {
      console.log('❌ Already completed');
      return { success: false, error: 'Delivery already confirmed' };
    }

    const creditsToAward = 5;
    console.log('💰 Credits to award:', creditsToAward);

    // Update ride status to completed
    console.log('🔄 Updating ride...');
    await updateDoc(rideRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      confirmedBy: receiverId,
      confirmedByRole: 'receiver',
      creditsAwarded: creditsToAward
    });
    console.log('✅ Ride updated');

    // Award credits to volunteer
    console.log('🔄 Updating volunteer credits...', rideData.volunteerId);
    const volunteerRef = doc(db, 'users', rideData.volunteerId);
    await updateDoc(volunteerRef, {
      credits: increment(creditsToAward),
      completedRides: increment(1),
      activeRides: increment(-1),
      totalDistance: increment(rideData.distance || 0)
    });
    console.log('✅ Volunteer credits updated');

    // Update donation status
    console.log('🔄 Updating donation...');
    const donationRef = doc(db, 'donations', rideData.donationId);
    await updateDoc(donationRef, {
      status: 'completed',
      deliveryStatus: 'delivered',
      deliveryConfirmedAt: serverTimestamp(),
      deliveryConfirmedBy: receiverId
    });
    console.log('✅ Donation updated');

    console.log('🎉 SUCCESS! Credits awarded:', creditsToAward);
    return { success: true, creditsAwarded: creditsToAward };
  } catch (error) {
    console.error('❌ ERROR in confirmDeliveryByReceiver:', error);
    console.error('Error details:', { code: error.code, message: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Cancel a delivery
 */
export const cancelDelivery = async (rideId, reason = '') => {
  try {
    const rideRef = doc(db, 'volunteerRides', rideId);
    const rideDoc = await getDoc(rideRef);

    if (!rideDoc.exists()) {
      return { success: false, error: 'Ride not found' };
    }

    const rideData = rideDoc.data();

    await updateDoc(rideRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancellationReason: reason
    });

    // Update volunteer stats
    const volunteerRef = doc(db, 'users', rideData.volunteerId);
    await updateDoc(volunteerRef, {
      activeRides: increment(-1)
    });

    // Update donation
    const donationRef = doc(db, 'donations', rideData.donationId);
    await updateDoc(donationRef, {
      assignedVolunteerId: null,
      deliveryStatus: 'pending',
      rideId: null
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling delivery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get delivery details
 */
export const getDeliveryDetails = async (rideId) => {
  try {
    const rideDoc = await getDoc(doc(db, 'volunteerRides', rideId));
    if (!rideDoc.exists()) {
      return null;
    }
    return { id: rideDoc.id, ...rideDoc.data() };
  } catch (error) {
    console.error('Error getting delivery details:', error);
    return null;
  }
};

/**
 * Get all deliveries for a donation
 */
export const getDeliveriesForDonation = async (donationId) => {
  try {
    const ridesQuery = query(
      collection(db, 'volunteerRides'),
      where('donationId', '==', donationId),
      orderBy('assignedAt', 'desc')
    );

    const snapshot = await getDocs(ridesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting deliveries for donation:', error);
    return [];
  }
};

/**
 * Get volunteer's delivery history
 */
export const getVolunteerDeliveryHistory = async (volunteerId) => {
  try {
    const ridesQuery = query(
      collection(db, 'volunteerRides'),
      where('volunteerId', '==', volunteerId),
      orderBy('assignedAt', 'desc')
    );

    const snapshot = await getDocs(ridesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting volunteer delivery history:', error);
    return [];
  }
};

/**
 * Get all pending verification deliveries
 */
export const getPendingVerificationDeliveries = async () => {
  try {
    const ridesQuery = query(
      collection(db, 'volunteerRides'),
      where('status', '==', 'pending_verification'),
      orderBy('completedAt', 'desc')
    );

    const snapshot = await getDocs(ridesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting pending deliveries:', error);
    return [];
  }
};

export default {
  calculateCredits,
  calculateDistance,
  getActiveVolunteers,
  getAllVolunteers,
  getVolunteerStats,
  assignDeliveryToVolunteer,
  startDelivery,
  completeDelivery,
  verifyDeliveryCompletion,
  confirmDeliveryByReceiver,
  cancelDelivery,
  getDeliveryDetails,
  getDeliveriesForDonation,
  getVolunteerDeliveryHistory,
  getPendingVerificationDeliveries
};
