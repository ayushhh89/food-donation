// src/utils/constants.js
export const APP_CONSTANTS = {
  APP_NAME: 'FoodConnect',
  APP_VERSION: '1.0.0',
  
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Firebase Collections
  COLLECTIONS: {
    USERS: 'users',
    DONATIONS: 'donations',
    CLAIMS: 'claims',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics'
  },

  // User Roles
  USER_ROLES: {
    DONOR: 'donor',
    RECEIVER: 'receiver',
    ADMIN: 'admin'
  },

  // Donation Status
  DONATION_STATUS: {
    ACTIVE: 'active',
    CLAIMED: 'claimed',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },

  // Donation Categories
  FOOD_CATEGORIES: [
    { value: 'prepared_food', label: '🍽️ Prepared Food', desc: 'Cooked meals, sandwiches' },
    { value: 'fresh_produce', label: '🥬 Fresh Produce', desc: 'Fruits, vegetables' },
    { value: 'bakery', label: '🥖 Bakery Items', desc: 'Bread, pastries' },
    { value: 'dairy', label: '🥛 Dairy Products', desc: 'Milk, cheese, yogurt' },
    { value: 'packaged', label: '📦 Packaged Food', desc: 'Canned, boxed items' },
    { value: 'beverages', label: '🥤 Beverages', desc: 'Drinks, juices' },
    { value: 'other', label: '🍴 Other', desc: 'Other food items' }
  ],

  // Quantity Units
  QUANTITY_UNITS: [
    'pieces', 'servings', 'kg', 'lbs', 'bags', 'boxes', 
    'containers', 'liters', 'bottles', 'packages'
  ],

  // Dietary Information
  DIETARY_OPTIONS: [
    '🌱 Vegetarian', '🌿 Vegan', '🚫 Gluten-Free', '🥜 Contains Nuts', 
    '🌶️ Spicy', '❄️ Frozen', '🧊 Refrigerated', '🍃 Organic',
    '🥗 Low-Fat', '🧂 Low-Sodium', '🍯 Sugar-Free', '🥛 Dairy-Free'
  ],

  // Distance Options for Filtering
  DISTANCE_OPTIONS: [
    { value: 'all', label: 'Any Distance' },
    { value: '1', label: 'Within 1 km' },
    { value: '5', label: 'Within 5 km' },
    { value: '10', label: 'Within 10 km' },
    { value: '25', label: 'Within 25 km' }
  ],

  // Urgency Levels
  URGENCY_LEVELS: {
    URGENT: { value: 'urgent', label: 'URGENT', color: '#e74c3c' },
    MODERATE: { value: 'moderate', label: 'MODERATE', color: '#f39c12' },
    FRESH: { value: 'fresh', label: 'FRESH', color: '#3498db' },
    NORMAL: { value: 'normal', label: 'AVAILABLE', color: '#2ecc71' }
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    DONATION_CLAIMED: 'donation_claimed',
    DONATION_EXPIRED: 'donation_expired',
    PICKUP_REMINDER: 'pickup_reminder',
    NEW_DONATION_NEARBY: 'new_donation_nearby',
    SYSTEM_UPDATE: 'system_update'
  },

  // Map Configuration
  MAP_CONFIG: {
    DEFAULT_CENTER: { lat: 51.5074, lng: -0.1278 }, // London
    DEFAULT_ZOOM: 12,
    SEARCH_RADIUS: 10000 // 10km in meters
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_IMAGES_PER_DONATION: 3,
    MAX_IMAGE_SIZE_MB: 5,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    USER_PREFERENCES: 'foodconnect_user_preferences',
    LAST_LOCATION: 'foodconnect_last_location',
    THEME_MODE: 'foodconnect_theme_mode'
  }
};