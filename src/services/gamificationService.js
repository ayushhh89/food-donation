// src/services/gamificationService.js
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
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { useState, useEffect } from 'react';

/**
 * Gamification Service
 * Handles badges, achievements, levels, and leaderboards
 */
export class GamificationService {
  constructor() {
    this.badges = this.initializeBadges();
    this.levels = this.initializeLevels();
    this.achievements = this.initializeAchievements();
  }

  // Initialize badge definitions
  initializeBadges() {
    return {
      // Beginner Badges
      first_donation: {
        id: 'first_donation',
        name: 'First Steps',
        description: 'Made your first food donation',
        icon: '🎯',
        color: '#4CAF50',
        points: 50,
        tier: 'bronze',
        requirement: (data) => data.totalDonations >= 1
      },
      
      generous_giver: {
        id: 'generous_giver',
        name: 'Generous Giver',
        description: 'Completed 5 food donations',
        icon: '🤲',
        color: '#2196F3',
        points: 100,
        tier: 'bronze',
        requirement: (data) => data.completedDonations >= 5
      },

      // Impact Badges
      people_helper: {
        id: 'people_helper',
        name: 'People Helper',
        description: 'Helped 25 people through your donations',
        icon: '👥',
        color: '#FF9800',
        points: 150,
        tier: 'silver',
        requirement: (data) => data.peopleHelped >= 25
      },

      community_hero: {
        id: 'community_hero',
        name: 'Community Hero',
        description: 'Helped 100+ people in your community',
        icon: '🦸',
        color: '#E91E63',
        points: 300,
        tier: 'gold',
        requirement: (data) => data.peopleHelped >= 100
      },

      // Environmental Badges
      eco_warrior: {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Prevented 50kg of food waste',
        icon: '🌱',
        color: '#4CAF50',
        points: 200,
        tier: 'silver',
        requirement: (data) => data.foodSaved >= 50
      },

      carbon_reducer: {
        id: 'carbon_reducer',
        name: 'Carbon Reducer',
        description: 'Reduced 100kg of CO2 emissions',
        icon: '🌍',
        color: '#00BCD4',
        points: 250,
        tier: 'gold',
        requirement: (data) => data.carbonFootprintReduced >= 100
      },

      // Consistency Badges
      weekly_warrior: {
        id: 'weekly_warrior',
        name: 'Weekly Warrior',
        description: 'Made donations for 4 consecutive weeks',
        icon: '📅',
        color: '#9C27B0',
        points: 200,
        tier: 'silver',
        requirement: (data) => data.consecutiveWeeks >= 4
      },

      monthly_master: {
        id: 'monthly_master',
        name: 'Monthly Master',
        description: 'Active donor for 3 consecutive months',
        icon: '🗓️',
        color: '#673AB7',
        points: 500,
        tier: 'gold',
        requirement: (data) => data.consecutiveMonths >= 3
      },

      // Special Badges
      variety_champion: {
        id: 'variety_champion',
        name: 'Variety Champion',
        description: 'Donated from all 5+ food categories',
        icon: '🌈',
        color: '#FF5722',
        points: 300,
        tier: 'gold',
        requirement: (data) => (data.topCategories?.length || 0) >= 5
      },

      speed_sharer: {
        id: 'speed_sharer',
        name: 'Speed Sharer',
        description: 'Donation claimed within 1 hour',
        icon: '⚡',
        color: '#FFC107',
        points: 100,
        tier: 'bronze',
        requirement: (data) => data.fastestClaim <= 60 // minutes
      },

      // Milestone Badges
      century_club: {
        id: 'century_club',
        name: 'Century Club',
        description: 'Completed 100 donations',
        icon: '💯',
        color: '#9C27B0',
        points: 1000,
        tier: 'platinum',
        requirement: (data) => data.completedDonations >= 100
      },

      legend: {
        id: 'legend',
        name: 'FoodShare Legend',
        description: 'Helped 500+ people and saved 200kg+ food',
        icon: '👑',
        color: '#FFD700',
        points: 2000,
        tier: 'platinum',
        requirement: (data) => data.peopleHelped >= 500 && data.foodSaved >= 200
      }
    };
  }

  // Initialize level definitions
  initializeLevels() {
    return [
      { level: 1, name: 'Food Friend', minPoints: 0, maxPoints: 499, color: '#9E9E9E', icon: '🍎' },
      { level: 2, name: 'Kind Contributor', minPoints: 500, maxPoints: 999, color: '#8BC34A', icon: '🥕' },
      { level: 3, name: 'Generous Giver', minPoints: 1000, maxPoints: 1999, color: '#4CAF50', icon: '🥗' },
      { level: 4, name: 'Community Helper', minPoints: 2000, maxPoints: 3999, color: '#2196F3', icon: '🍽️' },
      { level: 5, name: 'Sharing Superstar', minPoints: 4000, maxPoints: 7999, color: '#FF9800', icon: '⭐' },
      { level: 6, name: 'Impact Champion', minPoints: 8000, maxPoints: 15999, color: '#E91E63', icon: '🏆' },
      { level: 7, name: 'Community Hero', minPoints: 16000, maxPoints: 31999, color: '#9C27B0', icon: '🦸' },
      { level: 8, name: 'Eco Guardian', minPoints: 32000, maxPoints: 63999, color: '#00BCD4', icon: '🌟' },
      { level: 9, name: 'FoodShare Master', minPoints: 64000, maxPoints: 127999, color: '#673AB7', icon: '💎' },
      { level: 10, name: 'Legend', minPoints: 128000, maxPoints: Infinity, color: '#FFD700', icon: '👑' }
    ];
  }

  // Initialize achievement definitions
  initializeAchievements() {
    return {
      streak_achievements: [
        { id: 'streak_3', name: '3-Day Streak', description: 'Active for 3 consecutive days', points: 50, requirement: 3 },
        { id: 'streak_7', name: 'Week Warrior', description: 'Active for 7 consecutive days', points: 100, requirement: 7 },
        { id: 'streak_30', name: 'Month Master', description: 'Active for 30 consecutive days', points: 500, requirement: 30 }
      ],
      
      donation_milestones: [
        { id: 'donations_10', name: 'Double Digits', description: '10 total donations', points: 100, requirement: 10 },
        { id: 'donations_25', name: 'Quarter Century', description: '25 total donations', points: 250, requirement: 25 },
        { id: 'donations_50', name: 'Half Century', description: '50 total donations', points: 500, requirement: 50 }
      ],

      impact_achievements: [
        { id: 'impact_1000', name: 'Thousand Points', description: 'Earned 1,000 impact points', points: 100, requirement: 1000 },
        { id: 'impact_5000', name: 'Five Grand', description: 'Earned 5,000 impact points', points: 500, requirement: 5000 },
        { id: 'impact_10000', name: 'Ten Thousand Strong', description: 'Earned 10,000 impact points', points: 1000, requirement: 10000 }
      ]
    };
  }

  // Get user level based on points
  getUserLevel(points) {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (points >= this.levels[i].minPoints) {
        return {
          ...this.levels[i],
          progress: this.levels[i].maxPoints === Infinity 
            ? 100 
            : ((points - this.levels[i].minPoints) / (this.levels[i].maxPoints - this.levels[i].minPoints)) * 100,
          pointsToNext: this.levels[i].maxPoints === Infinity 
            ? 0 
            : this.levels[i].maxPoints - points + 1
        };
      }
    }
    return this.levels[0];
  }

  // Check and award badges
  async checkAndAwardBadges(userId, impactData) {
    try {
      const userGameRef = doc(db, 'userGamification', userId);
      const userGameDoc = await getDoc(userGameRef);
      
      const existingBadges = userGameDoc.exists() ? (userGameDoc.data().badges || []) : [];
      const existingBadgeIds = existingBadges.map(b => b.id);
      
      const newBadges = [];
      let pointsEarned = 0;

      // Check each badge requirement
      Object.values(this.badges).forEach(badge => {
        if (!existingBadgeIds.includes(badge.id) && badge.requirement(impactData)) {
          newBadges.push({
            ...badge,
            earnedAt: new Date(),
            earnedTimestamp: serverTimestamp()
          });
          pointsEarned += badge.points;
        }
      });

      // Award new badges
      if (newBadges.length > 0) {
        const batch = writeBatch(db);

        // Update user gamification document
        batch.set(userGameRef, {
          userId,
          badges: [...existingBadges, ...newBadges],
          totalBadgePoints: increment(pointsEarned),
          lastBadgeEarned: newBadges[newBadges.length - 1].id,
          lastBadgeEarnedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Update user impact points
        const userImpactRef = doc(db, 'userImpacts', userId);
        batch.update(userImpactRef, {
          totalImpactPoints: increment(pointsEarned),
          updatedAt: serverTimestamp()
        });

        await batch.commit();

        return { newBadges, pointsEarned };
      }

      return { newBadges: [], pointsEarned: 0 };
    } catch (error) {
      console.error('Error checking badges:', error);
      return { newBadges: [], pointsEarned: 0 };
    }
  }

  // Check achievements
  async checkAchievements(userId, stats) {
    try {
      const userGameRef = doc(db, 'userGamification', userId);
      const userGameDoc = await getDoc(userGameRef);
      
      const existingAchievements = userGameDoc.exists() ? (userGameDoc.data().achievements || []) : [];
      const existingAchievementIds = existingAchievements.map(a => a.id);
      
      const newAchievements = [];
      let pointsEarned = 0;

      // Check streak achievements
      if (stats.currentStreak) {
        this.achievements.streak_achievements.forEach(achievement => {
          if (!existingAchievementIds.includes(achievement.id) && 
              stats.currentStreak >= achievement.requirement) {
            newAchievements.push({
              ...achievement,
              earnedAt: new Date(),
              earnedTimestamp: serverTimestamp()
            });
            pointsEarned += achievement.points;
          }
        });
      }

      // Check donation milestones
      this.achievements.donation_milestones.forEach(achievement => {
        if (!existingAchievementIds.includes(achievement.id) && 
            stats.totalDonations >= achievement.requirement) {
          newAchievements.push({
            ...achievement,
            earnedAt: new Date(),
            earnedTimestamp: serverTimestamp()
          });
          pointsEarned += achievement.points;
        }
      });

      // Check impact achievements
      this.achievements.impact_achievements.forEach(achievement => {
        if (!existingAchievementIds.includes(achievement.id) && 
            stats.totalImpactPoints >= achievement.requirement) {
          newAchievements.push({
            ...achievement,
            earnedAt: new Date(),
            earnedTimestamp: serverTimestamp()
          });
          pointsEarned += achievement.points;
        }
      });

      // Save new achievements
      if (newAchievements.length > 0) {
        await updateDoc(userGameRef, {
          achievements: [...existingAchievements, ...newAchievements],
          totalAchievementPoints: increment(pointsEarned),
          updatedAt: serverTimestamp()
        }, { merge: true });

        return { newAchievements, pointsEarned };
      }

      return { newAchievements: [], pointsEarned: 0 };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { newAchievements: [], pointsEarned: 0 };
    }
  }

  // Get user's gamification data
  async getUserGamificationData(userId) {
    try {
      const userGameRef = doc(db, 'userGamification', userId);
      const userGameDoc = await getDoc(userGameRef);
      
      if (userGameDoc.exists()) {
        const data = userGameDoc.data();
        const totalPoints = data.totalBadgePoints + data.totalAchievementPoints + data.totalImpactPoints;
        const level = this.getUserLevel(totalPoints);
        
        return {
          ...data,
          totalPoints,
          level,
          badges: data.badges || [],
          achievements: data.achievements || []
        };
      } else {
        // Create initial gamification document
        const initialData = {
          userId,
          badges: [],
          achievements: [],
          totalBadgePoints: 0,
          totalAchievementPoints: 0,
          totalImpactPoints: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userGameRef, initialData);
        
        return {
          ...initialData,
          totalPoints: 0,
          level: this.getUserLevel(0)
        };
      }
    } catch (error) {
      console.error('Error getting gamification data:', error);
      return null;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 50, timeframe = 'all') {
    try {
      let leaderboardQuery;
      
      if (timeframe === 'all') {
        leaderboardQuery = query(
          collection(db, 'userImpacts'),
          orderBy('totalImpactPoints', 'desc'),
          limit(limit)
        );
      } else {
        // For weekly/monthly, you'd need additional fields in the document
        leaderboardQuery = query(
          collection(db, 'userImpacts'),
          orderBy('totalImpactPoints', 'desc'),
          limit(limit)
        );
      }

      const snapshot = await getDocs(leaderboardQuery);
      const leaderboard = [];

      for (const doc of snapshot.docs) {
        const impactData = doc.data();
        const userRef = doc(db, 'users', doc.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const gameData = await this.getUserGamificationData(doc.id);
          
          leaderboard.push({
            userId: doc.id,
            name: userData.name || 'Anonymous User',
            totalPoints: impactData.totalImpactPoints || 0,
            level: gameData?.level || this.getUserLevel(0),
            badges: gameData?.badges?.length || 0,
            peopleHelped: impactData.peopleHelped || 0,
            foodSaved: impactData.foodSaved || 0,
            totalDonations: impactData.totalDonations || 0
          });
        }
      }

      return leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Subscribe to real-time gamification updates
  subscribeToUserGamification(userId, callback) {
    const userGameRef = doc(db, 'userGamification', userId);
    
    return onSnapshot(userGameRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const totalPoints = (data.totalBadgePoints || 0) + 
                           (data.totalAchievementPoints || 0) + 
                           (data.totalImpactPoints || 0);
        const level = this.getUserLevel(totalPoints);
        
        callback({
          ...data,
          totalPoints,
          level,
          badges: data.badges || [],
          achievements: data.achievements || []
        });
      } else {
        // Initialize if doesn't exist
        const initialData = await this.getUserGamificationData(userId);
        callback(initialData);
      }
    });
  }

  // Get badge by ID
  getBadge(badgeId) {
    return this.badges[badgeId] || null;
  }

  // Get all available badges
  getAllBadges() {
    return Object.values(this.badges);
  }

  // Get all levels
  getAllLevels() {
    return this.levels;
  }

  // Calculate streak (you'd implement this based on your activity tracking)
  async calculateUserStreak(userId) {
    // This would analyze user's donation/activity history
    // For now, return a mock value
    return {
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: new Date()
    };
  }
}
// Create and export singleton instance
const gamificationServiceInstance = new GamificationService();

// React hook for gamification
export const useGamification = (userId) => {
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = gamificationServiceInstance.subscribeToUserGamification(
      userId,
      (data) => {
        setGamificationData(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const checkForNewBadges = async (impactData) => {
    return gamificationServiceInstance.checkAndAwardBadges(userId, impactData);
  };

  const checkForNewAchievements = async (stats) => {
    return gamificationServiceInstance.checkAchievements(userId, stats);
  };

  return {
    gamificationData,
    loading,
    error,
    checkForNewBadges,
    checkForNewAchievements
  };
};

// Export as named export
export const gamificationService = gamificationServiceInstance;

// Export as default
export default gamificationServiceInstance;