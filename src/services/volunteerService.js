// src/services/volunteerService.js
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc,
  getDocs,
  query,
  where,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

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
 * Find an available volunteer
 */
export const findAvailableVolunteer = async () => {
  try {
    const volunteersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'volunteer'),
      where('isActive', '==', 1)
    );
    
    const snapshot = await getDocs(volunteersQuery);
    
    if (snapshot.empty) {
      return null;
    }

    // Return first available volunteer
    // TODO: Implement better matching logic (location-based, workload, etc.)
    const volunteers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    return volunteers[0];
  } catch (error) {
    console.error('Error finding volunteer:', error);
    return null;
  }
};

/**
 * Assign a ride to a volunteer
 */
export const assignRideToVolunteer = async ({
  volunteerId,
  donationId,
  donorId,
  receiverId,
  foodItem,
  quantity,
  pickupLocation,
  deliveryLocation,
  distance = 0,
  notes = ''
}) => {
  try {
    const credits = calculateCredits(distance);

    const rideData = {
      volunteerId,
      donationId,
      donorId,
      receiverId,
      foodItem,
      quantity,
      pickupLocation,
      deliveryLocation,
      distance,
      credits,
      notes,
      status: 'assigned',
      assignedAt: serverTimestamp(),
      startedAt: null,
      completedAt: null,
      completionNotes: ''
    };

    const rideRef = await addDoc(collection(db, 'volunteerRides'), rideData);

    // Update volunteer's total rides
    const userRef = doc(db, 'users', volunteerId);
    await updateDoc(userRef, {
      totalRides: increment(1),
      activeRides: increment(1)
    });

    return { success: true, rideId: rideRef.id };
  } catch (error) {
    console.error('Error assigning ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update volunteer rating
 */
export const updateVolunteerRating = async (volunteerId, newRating) => {
  try {
    const userRef = doc(db, 'users', volunteerId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentRating = userData.avgRating || 0;
      const totalRides = userData.completedRides || 0;

      const newAverage = ((currentRating * totalRides) + newRating) / (totalRides + 1);

      await updateDoc(userRef, {
        avgRating: newAverage
      });

      return { success: true, newAverage };
    }

    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error updating rating:', error);
    return { success: false, error: error.message };
  }
};