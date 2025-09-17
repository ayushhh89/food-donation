// src/services/impactService.js - Real-time Impact Tracking Service
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { useState, useEffect } from 'react';
/**
 * Real-time Impact Tracking Service
 * Connects to Firebase to track user impact metrics
 */
export class ImpactService {
  constructor() {
    this.unsubscribers = new Map();
  }

  // Calculate impact metrics from donations
  calculateImpactMetrics(donations) {
    const metrics = {
      totalDonations: donations.length,
      peopleHelped: 0,
      foodSaved: 0, // in kg
      carbonFootprintReduced: 0, // in kg CO2
      topCategories: {},
      completedDonations: 0
    };

    donations.forEach(donation => {
      // Calculate people helped (estimate based on serving size or quantity)
      const servingEstimate = this.estimateServings(donation);
      metrics.peopleHelped += servingEstimate;

      // Calculate food saved (convert different units to kg)
      const foodWeight = this.estimateFoodWeight(donation);
      metrics.foodSaved += foodWeight;

      // Calculate carbon footprint reduction (approximately 2.5kg CO2 per kg food saved)
      metrics.carbonFootprintReduced += foodWeight * 2.5;

      // Track categories
      if (metrics.topCategories[donation.category]) {
        metrics.topCategories[donation.category]++;
      } else {
        metrics.topCategories[donation.category] = 1;
      }

      // Count completed donations
      if (donation.status === 'completed') {
        metrics.completedDonations++;
      }
    });

    // Convert categories object to sorted array
    metrics.topCategories = Object.entries(metrics.topCategories)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / donations.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return metrics;
  }

  // Estimate servings from donation data
  estimateServings(donation) {
    if (donation.servingSize) {
      const match = donation.servingSize.match(/(\d+)/);
      return match ? parseInt(match[1]) : 1;
    }

    // Fallback estimation based on quantity and category
    const quantity = donation.quantity || 1;
    const categoryMultipliers = {
      'Cooked Meals': 1,
      'Raw Ingredients': 0.3,
      'Packaged Foods': 0.5,
      'Baked Goods': 0.8,
      'Dairy Products': 0.4,
      'Fruits & Vegetables': 0.2,
      'Beverages': 0.1
    };

    return Math.max(1, Math.round(quantity * (categoryMultipliers[donation.category] || 0.5)));
  }

  // Estimate food weight in kg
  estimateFoodWeight(donation) {
    const quantity = donation.quantity || 1;

    // Unit conversions to kg
    const unitMultipliers = {
      'kg': 1,
      'lbs': 0.453592,
      'servings': 0.3, // Average serving weight
      'pieces': 0.2,
      'bags': 1.5,
      'boxes': 2,
      'containers': 1,
      'liters': 1, // For beverages, assume 1L = 1kg
      'bottles': 0.5,
      'packages': 0.8
    };

    return quantity * (unitMultipliers[donation.unit] || 0.3);
  }

  // Listen to user's real-time impact data
  subscribeToUserImpact(userId, callback) {
    const unsubscriberId = `impact_${userId}`;

    // Unsubscribe if already subscribed
    if (this.unsubscribers.has(unsubscriberId)) {
      this.unsubscribers.get(unsubscriberId)();
    }

    // Subscribe to user's donations
    const donationsQuery = query(
      collection(db, 'donations'),
      where('donorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(donationsQuery, async (snapshot) => {
      const donations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date()
      }));

      // Calculate impact metrics
      const impact = this.calculateImpactMetrics(donations);

      // Get additional user impact data
      const userImpactDoc = await this.getUserImpactDocument(userId);

      // Calculate points and rankings
      const totalImpactPoints = this.calculateImpactPoints(impact);
      const rankings = await this.calculateUserRankings(userId, totalImpactPoints);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId);

      // Calculate monthly growth
      const monthlyGrowth = this.calculateMonthlyGrowth(donations);

      const completeImpactData = {
        ...impact,
        totalImpactPoints,
        globalRank: rankings.global,
        localRank: rankings.local,
        recentActivity,
        monthlyGrowth,
        lastUpdated: new Date()
      };

      // Update user impact document
      await this.updateUserImpactDocument(userId, completeImpactData);

      callback(completeImpactData);
    });

    this.unsubscribers.set(unsubscriberId, unsubscribe);
    return unsubscribe;
  }

  // Calculate impact points based on metrics
  calculateImpactPoints(impact) {
    let points = 0;

    // Points for donations
    points += impact.totalDonations * 10;

    // Bonus points for completed donations
    points += impact.completedDonations * 15;

    // Points for people helped
    points += impact.peopleHelped * 5;

    // Environmental impact points
    points += Math.round(impact.foodSaved * 2);
    points += Math.round(impact.carbonFootprintReduced);

    return points;
  }

  // Calculate monthly growth percentage
  calculateMonthlyGrowth(donations) {
    const now = new Date();
    const thisMonth = donations.filter(d => {
      const donationDate = d.createdAt;
      return donationDate.getMonth() === now.getMonth() &&
        donationDate.getFullYear() === now.getFullYear();
    }).length;

    const lastMonth = donations.filter(d => {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const donationDate = d.createdAt;
      return donationDate.getMonth() === lastMonthDate.getMonth() &&
        donationDate.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  }

  // Get user impact document
  async getUserImpactDocument(userId) {
    try {
      const impactRef = doc(db, 'userImpacts', userId);
      const impactDoc = await getDoc(impactRef);

      if (impactDoc.exists()) {
        return impactDoc.data();
      } else {
        // Create initial impact document
        const initialData = {
          userId,
          totalImpactPoints: 0,
          globalRank: 0,
          localRank: 0,
          badges: [],
          milestones: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(impactRef, initialData);
        return initialData;
      }
    } catch (error) {
      console.error('Error getting user impact document:', error);
      return {};
    }
  }

  // Update user impact document
  async updateUserImpactDocument(userId, impactData) {
    try {
      const impactRef = doc(db, 'userImpacts', userId);
      await updateDoc(impactRef, {
        ...impactData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user impact document:', error);
    }
  }

  // Calculate user rankings
  async calculateUserRankings(userId, userPoints) {
    try {
      // Get all users with their points (simplified - in production, use pagination)
      const impactQuery = query(
        collection(db, 'userImpacts'),
        orderBy('totalImpactPoints', 'desc')
      );

      const snapshot = await getDocs(impactQuery);
      const allUsers = snapshot.docs.map(doc => ({
        userId: doc.id,
        points: doc.data().totalImpactPoints || 0
      }));

      // Find global rank
      const globalRank = allUsers.findIndex(user => user.userId === userId) + 1;

      // For local rank, you'd filter by location - simplified here
      const localRank = Math.max(1, Math.round(globalRank * 0.1));

      return {
        global: globalRank || 999999,
        local: localRank
      };
    } catch (error) {
      console.error('Error calculating rankings:', error);
      return { global: 999999, local: 999 };
    }
  }

  // Get recent activity for user
  async getRecentActivity(userId) {
    try {
      // Get recent donations
      const donationsQuery = query(
        collection(db, 'donations'),
        where('donorId', '==', userId),
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc'),
        limit(3)
      );

      const donationsSnapshot = await getDocs(donationsQuery);
      const recentDonations = donationsSnapshot.docs.map(doc => ({
        type: 'donation_completed',
        item: doc.data().title,
        date: doc.data().updatedAt?.toDate() || new Date(),
        impact: 10
      }));

      // You can add more activity types here (milestones, badges, etc.)

      return recentDonations;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // Award badge to user
  async awardBadge(userId, badgeId, badgeName) {
    try {
      const impactRef = doc(db, 'userImpacts', userId);
      const impactDoc = await getDoc(impactRef);

      if (impactDoc.exists()) {
        const currentBadges = impactDoc.data().badges || [];

        // Check if badge already awarded
        if (!currentBadges.find(b => b.id === badgeId)) {
          // With this:
          const newBadge = {
            id: badgeId,
            name: badgeName,
            earnedAt: new Date(),
            points: 50
          };

          await updateDoc(impactRef, {
            badges: [...currentBadges, newBadge],
            totalImpactPoints: increment(50),
            updatedAt: serverTimestamp()
          });

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Check for milestone achievements
  async checkMilestones(userId, impactData) {
    const milestones = [
      { id: 'first_donation', name: 'First Donation', requirement: d => d.totalDonations >= 1, points: 25 },
      { id: 'helping_hand', name: 'Helping Hand', requirement: d => d.peopleHelped >= 10, points: 50 },
      { id: 'community_hero', name: 'Community Hero', requirement: d => d.peopleHelped >= 100, points: 100 },
      { id: 'eco_warrior', name: 'Eco Warrior', requirement: d => d.foodSaved >= 50, points: 75 },
      { id: 'waste_reducer', name: 'Waste Reducer', requirement: d => d.carbonFootprintReduced >= 100, points: 100 }
    ];

    for (const milestone of milestones) {
      if (milestone.requirement(impactData)) {
        await this.awardBadge(userId, milestone.id, milestone.name);
      }
    }
  }

  // Clean up subscriptions
  unsubscribeAll() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers.clear();
  }

  // Clean up specific subscription
  unsubscribe(subscriptionId) {
    if (this.unsubscribers.has(subscriptionId)) {
      this.unsubscribers.get(subscriptionId)();
      this.unsubscribers.delete(subscriptionId);
    }
  }
}

// Export singleton instance
export const impactService = new ImpactService();

// Hook for React components
export const useRealTimeImpact = (userId) => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = impactService.subscribeToUserImpact(
      userId,
      (data) => {
        setImpactData(data);
        setLoading(false);

        // Check for milestone achievements
        impactService.checkMilestones(userId, data);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { impactData, loading, error };
};

export default impactService;