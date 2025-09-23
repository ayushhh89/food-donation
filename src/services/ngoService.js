// src/services/ngoService.js
import { useState, useEffect } from 'react';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// React Hook for NGO features
import { useAuth } from '../contexts/AuthContext';

export class NGOService {
  // Register a new NGO
  static async registerNGO(ngoData) {
    try {
      const ngoRef = doc(collection(db, 'ngos'));
      const ngoRegistration = {
        ...ngoData,
        id: ngoRef.id,
        status: 'pending_verification',
        verificationLevel: 'unverified',
        createdAt: serverTimestamp(),
        stats: {
          totalRequests: 0,
          fulfilled: 0,
          peopleServed: 0,
          foodReceived: 0
        },
        documents: ngoData.documents || [],
        contactMethods: {
          email: ngoData.email,
          phone: ngoData.phone,
          whatsapp: ngoData.whatsapp || ngoData.phone,
          website: ngoData.website || ''
        }
      };

      await setDoc(ngoRef, ngoRegistration);
      return ngoRef.id;
    } catch (error) {
      console.error('Error registering NGO:', error);
      throw error;
    }
  }

  // Submit bulk donation request
  static async submitBulkRequest(ngoId, requestData) {
    try {
      const requestRef = doc(collection(db, 'bulkRequests'));
      const bulkRequest = {
        ...requestData,
        id: requestRef.id,
        ngoId,
        status: 'open',
        priority: requestData.urgency || 'medium',
        createdAt: serverTimestamp(),
        responses: [],
        estimatedImpact: {
          peopleToFeed: requestData.estimatedBeneficiaries,
          eventType: requestData.eventType,
          duration: requestData.duration
        },
        logistics: {
          pickupAddress: requestData.pickupAddress,
          preferredTiming: requestData.preferredTiming,
          transportationAvailable: requestData.hasTransport || false,
          storageCapacity: requestData.storageCapacity
        },
        whatsappContact: requestData.whatsappContact
      };

      await setDoc(requestRef, bulkRequest);
      
      // Update NGO stats
      const ngoRef = doc(db, 'ngos', ngoId);
      await updateDoc(ngoRef, {
        'stats.totalRequests': increment(1)
      });

      return requestRef.id;
    } catch (error) {
      console.error('Error submitting bulk request:', error);
      throw error;
    }
  }

  // Respond to bulk request (for donors)
  static async respondToBulkRequest(requestId, donorId, responseData) {
    try {
      const batch = writeBatch(db);
      
      // Add response to bulk request
      const requestRef = doc(db, 'bulkRequests', requestId);
      const responseRef = doc(collection(db, 'bulkResponses'));
      
      const response = {
        id: responseRef.id,
        requestId,
        donorId,
        ...responseData,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      batch.set(responseRef, response);
      
      // Update request with new response
      const requestDoc = await getDoc(requestRef);
      if (requestDoc.exists()) {
        const currentResponses = requestDoc.data().responses || [];
        batch.update(requestRef, {
          responses: [...currentResponses, responseRef.id],
          lastActivity: serverTimestamp()
        });
      }

      await batch.commit();
      return responseRef.id;
    } catch (error) {
      console.error('Error responding to bulk request:', error);
      throw error;
    }
  }

  // WhatsApp Integration
  static generateWhatsAppLink(phoneNumber, message) {
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  static generateBulkRequestWhatsAppMessage(request, donor = null) {
    if (donor) {
      return `Hi! I'm ${donor.name} from FoodShare. I saw your bulk food request for "${request.title}" and would like to help. Can we discuss the details?`;
    }
    return `Hello! I found your organization through FoodShare and would like to discuss a potential food donation partnership.`;
  }

  // Get verified NGOs
  static async getVerifiedNGOs() {
    try {
      const ngosQuery = query(
        collection(db, 'ngos'),
        where('verificationLevel', 'in', ['verified', 'premium']),
        where('status', '==', 'active'),
        orderBy('stats.peopleServed', 'desc')
      );
      
      const snapshot = await getDocs(ngosQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching verified NGOs:', error);
      throw error;
    }
  }

  // Get bulk requests
  static subscribeToActiveBulkRequests(callback) {
    const requestsQuery = query(
      collection(db, 'bulkRequests'),
      where('status', 'in', ['open', 'partially_filled']),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        deadline: doc.data().deadline?.toDate()
      }));
      callback(requests);
    });
  }

  // Partnership matching algorithm
  static async findMatchingPartnerships(donorProfile, location, foodType) {
    try {
      const ngosQuery = query(
        collection(db, 'ngos'),
        where('verificationLevel', '==', 'verified'),
        where('serviceAreas', 'array-contains-any', [location.city, location.state]),
        where('focusAreas', 'array-contains-any', foodType ? [foodType] : ['all'])
      );

      const snapshot = await getDocs(ngosQuery);
      const matchedNGOs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        matchScore: this.calculateMatchScore(doc.data(), donorProfile)
      }));

      return matchedNGOs.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Error finding matching partnerships:', error);
      throw error;
    }
  }

  static calculateMatchScore(ngo, donor) {
    let score = 0;
    
    // Verification level bonus
    if (ngo.verificationLevel === 'premium') score += 30;
    else if (ngo.verificationLevel === 'verified') score += 20;
    
    // Activity score
    const activityRatio = ngo.stats.fulfilled / Math.max(ngo.stats.totalRequests, 1);
    score += activityRatio * 25;
    
    // Impact score
    score += Math.min(ngo.stats.peopleServed / 100, 25);
    
    // Response time bonus
    if (ngo.averageResponseTime && ngo.averageResponseTime < 24) score += 20;
    
    return Math.min(score, 100);
  }

  // Track partnership impact
  static async recordPartnershipImpact(partnershipId, impactData) {
    try {
      const batch = writeBatch(db);
      
      // Record impact
      const impactRef = doc(collection(db, 'partnershipImpacts'));
      batch.set(impactRef, {
        ...impactData,
        partnershipId,
        recordedAt: serverTimestamp()
      });

      // Update NGO stats
      const ngoRef = doc(db, 'ngos', impactData.ngoId);
      batch.update(ngoRef, {
        'stats.peopleServed': increment(impactData.peopleServed),
        'stats.foodReceived': increment(impactData.foodWeight),
        'stats.fulfilled': increment(1)
      });

      await batch.commit();
    } catch (error) {
      console.error('Error recording partnership impact:', error);
      throw error;
    }
  }

  // NGO verification workflow
  static async submitVerificationRequest(ngoId, documents) {
    try {
      const verificationRef = doc(collection(db, 'verificationRequests'));
      await setDoc(verificationRef, {
        ngoId,
        documents,
        status: 'submitted',
        submittedAt: serverTimestamp()
      });

      // Update NGO status
      await updateDoc(doc(db, 'ngos', ngoId), {
        status: 'verification_submitted'
      });

      return verificationRef.id;
    } catch (error) {
      console.error('Error submitting verification request:', error);
      throw error;
    }
  }
}


export const useNGOFeatures = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bulkRequests, setBulkRequests] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [verifiedNGOs, setVerifiedNGOs] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    
    // Subscribe to bulk requests
    const unsubscribeRequests = NGOService.subscribeToActiveBulkRequests((requests) => {
      setBulkRequests(requests);
      setLoading(false);
    });

    // Load verified NGOs
    NGOService.getVerifiedNGOs().then(setVerifiedNGOs).catch(console.error);

    return unsubscribeRequests;
  }, [currentUser]);

  const submitBulkRequest = async (requestData) => {
    setLoading(true);
    try {
      const requestId = await NGOService.submitBulkRequest(currentUser.uid, requestData);
      return requestId;
    } catch (error) {
      console.error('Error submitting bulk request:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, responseData) => {
    setLoading(true);
    try {
      const responseId = await NGOService.respondToBulkRequest(
        requestId, 
        currentUser.uid, 
        responseData
      );
      return responseId;
    } catch (error) {
      console.error('Error responding to request:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initiateWhatsAppContact = (ngo, context = 'general') => {
    const message = context === 'bulk_request' 
      ? NGOService.generateBulkRequestWhatsAppMessage(context, { name: currentUser.displayName })
      : `Hello! I'm reaching out from FoodShare about potential food donation opportunities.`;
    
    const whatsappLink = NGOService.generateWhatsAppLink(ngo.contactMethods.whatsapp, message);
    window.open(whatsappLink, '_blank');
  };

  return {
    loading,
    bulkRequests,
    partnerships,
    verifiedNGOs,
    submitBulkRequest,
    respondToRequest,
    initiateWhatsAppContact
  };
};