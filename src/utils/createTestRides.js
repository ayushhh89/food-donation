// src/utils/createTestRides.js
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const createTestRideForVolunteer = async (volunteerId) => {
  try {
    // Create a test ride with proper timestamp
    const testRide = {
      volunteerId,
      donationId: 'test-donation-001',
      donorId: 'test-donor-001',
      receiverId: 'test-receiver-001',
      foodItem: 'Fresh Vegetables & Fruits',
      quantity: '10 kg',
      pickupLocation: '123 Main Street, Mumbai, Maharashtra',
      deliveryLocation: '456 Community Center, Bhayandar, Maharashtra',
      distance: 4.5,
      credits: 10,
      notes: 'Please handle with care. Perishable items.',
      status: 'assigned',
      assignedAt: serverTimestamp(), // <-- CHANGED: Use serverTimestamp
      startedAt: null,
      completedAt: null,
      completionNotes: ''
    };

    const docRef = await addDoc(collection(db, 'volunteerRides'), testRide);
    console.log('✅ Test ride created with ID:', docRef.id);
    
    // Update volunteer stats
    const userRef = doc(db, 'users', volunteerId);
    await updateDoc(userRef, {
      totalRides: increment(1),
      activeRides: increment(1)
    });

    console.log('✅ Test ride created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating test ride:', error);
    return false;
  }
};