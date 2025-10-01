// File: backend/models/schemas.js
// How to name: backend/models/schemas.js

const mongoose = require('mongoose');

// Users Collection
const userSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  full_name: String,
  phone: String,
  profile_image: String,
  
  // Gamification
  level: {
    type: Number,
    default: 1
  },
  experience_points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    earned_at: Date,
    icon: String
  }],
  
  // Statistics (cached from blockchain)
  stats: {
    total_recyclings: {
      type: Number,
      default: 0
    },
    total_tokens_earned: {
      type: Number,
      default: 0
    },
    total_tokens_redeemed: {
      type: Number,
      default: 0
    },
    total_donations: {
      type: Number,
      default: 0
    },
    current_streak: {
      type: Number,
      default: 0
    },
    longest_streak: {
      type: Number,
      default: 0
    },
    last_recycling_date: Date
  },
  
  // Preferences
  preferences: {
    notifications_enabled: {
      type: Boolean,
      default: true
    },
    favorite_centers: [String], // center IDs
    preferred_materials: [String]
  },
  
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Recycling Centers Collection
const recyclingCenterSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Location
  location: {
    address: String,
    city: String,
    state: String,
    zip_code: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact
  contact: {
    phone: String,
    email: String,
    website: String
  },
  
  // Operating hours
  operating_hours: {
    monday: { open: String, close: String, is_open: Boolean },
    tuesday: { open: String, close: String, is_open: Boolean },
    wednesday: { open: String, close: String, is_open: Boolean },
    thursday: { open: String, close: String, is_open: Boolean },
    friday: { open: String, close: String, is_open: Boolean },
    saturday: { open: String, close: String, is_open: Boolean },
    sunday: { open: String, close: String, is_open: Boolean }
  },
  
  // Accepted materials
  accepted_materials: [{
    type: String,
    enum: ['plastic', 'paper', 'glass', 'metal', 'electronic', 'organic', 'textile']
  }],
  
  // Images
  images: [String],
  
  // Ratings
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Verification
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_date: Date,
  
  // Stats (synced from blockchain)
  stats: {
    total_recyclings: Number,
    total_tokens_issued: Number,
    total_weight_collected: Number // in kg
  },
  
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// QR Codes Collection
const qrCodeSchema = new mongoose.Schema({
  qr_code_id: {
    type: String,
    required: true,
    unique: true
  },
  qr_hash: {
    type: String,
    required: true,
    unique: true
  },
  
  // QR Code details
  center_address: {
    type: String,
    required: true
  },
  material_type: {
    type: String,
    enum: ['plastic', 'paper', 'glass', 'metal', 'electronic', 'organic', 'textile'],
    required: true
  },
  weight: Number, // in grams
  
  // Status
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Usage
  used_by: String, // user wallet address
  used_at: Date,
  transaction_hash: String, // blockchain tx hash
  
  // Expiration
  expires_at: Date,
  
  // QR Code image
  qr_image_url: String,
  
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Businesses Collection
const businessSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['restaurant', 'retail', 'service', 'entertainment', 'health', 'education', 'other']
  },
  
  // Location
  location: {
    address: String,
    city: String,
    state: String,
    zip_code: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact
  contact: {
    phone: String,
    email: String,
    website: String
  },
  
  // Discount offer
  discount: {
    percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    description: String,
    min_tokens_required: Number,
    terms_conditions: String
  },
  
  // Images
  logo: String,
  images: [String],
  
  // Operating hours
  operating_hours: {
    monday: { open: String, close: String, is_open: Boolean },
    tuesday: { open: String, close: String, is_open: Boolean },
    wednesday: { open: String, close: String, is_open: Boolean },
    thursday: { open: String, close: String, is_open: Boolean },
    friday: { open: String, close: String, is_open: Boolean },
    saturday: { open: String, close: String, is_open: Boolean },
    sunday: { open: String, close: String, is_open: Boolean }
  },
  
  // Stats
  stats: {
    total_redemptions: Number,
    total_tokens_redeemed: Number,
    total_customers: Number
  },
  
  // Ratings
  rating: {
    average: Number,
    count: Number
  },
  
  is_active: {
    type: Boolean,
    default: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// NGOs Collection
const ngoSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  mission: String,
  description: String,
  
  // Categories
  focus_areas: [{
    type: String,
    enum: ['environment', 'climate', 'ocean', 'forest', 'wildlife', 'renewable_energy', 'waste_management']
  }],
  
  // Contact
  contact: {
    phone: String,
    email: String,
    website: String
  },
  
  // Media
  logo: String,
  images: [String],
  
  // Impact metrics
  impact_metrics: [{
    metric: String, // e.g., "Trees planted", "Ocean cleaned (kg)"
    value: Number,
    unit: String,
    updated_at: Date
  }],
  
  // Stats
  stats: {
    total_donations: Number,
    total_donors: Number,
    total_tokens_received: Number
  },
  
  // Verification
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_documents: [String],
  tax_id: String,
  
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Transactions Collection (Off-chain mirror for quick queries)
const transactionSchema = new mongoose.Schema({
  transaction_hash: {
    type: String,
    required: true,
    unique: true
  },
  block_number: Number,
  
  // Transaction details
  type: {
    type: String,
    enum: ['recycling', 'redemption', 'donation', 'transfer'],
    required: true
  },
  
  from_address: String,
  to_address: String,
  amount: Number, // token amount
  
  // Recycling specific
  recycling_details: {
    center_address: String,
    material_type: String,
    weight: Number,
    qr_code_hash: String
  },
  
  // Redemption specific
  redemption_details: {
    business_address: String,
    discount_applied: Number
  },
  
  // Donation specific
  donation_details: {
    ngo_address: String,
    message: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Leaderboard Collection (Cached rankings)
const leaderboardSchema = new mongoose.Schema({
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'all_time'],
    required: true
  },
  start_date: Date,
  end_date: Date,
  
  rankings: [{
    rank: Number,
    user_address: String,
    user_name: String,
    score: Number, // tokens earned or recyclings count
    profile_image: String
  }],
  
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Notifications Collection
const notificationSchema = new mongoose.Schema({
  user_address: {
    type: String,
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['recycling_reward', 'milestone', 'redemption', 'donation', 'badge_earned', 'streak', 'system'],
    required: true
  },
  
  title: String,
  message: String,
  
  // Related data
  data: {
    tokens_earned: Number,
    transaction_hash: String,
    badge_name: String,
    milestone: String
  },
  
  is_read: {
    type: Boolean,
    default: false
  },
  
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Reviews Collection
const reviewSchema = new mongoose.Schema({
  user_address: {
    type: String,
    required: true
  },
  
  // Review target
  target_type: {
    type: String,
    enum: ['center', 'business'],
    required: true
  },
  target_address: {
    type: String,
    required: true
  },
  
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: String,
  
  // Helpful votes
  helpful_count: {
    type: Number,
    default: 0
  },
  
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ wallet_address: 1 });
userSchema.index({ email: 1 });
recyclingCenterSchema.index({ 'location.coordinates': '2dsphere' });
businessSchema.index({ 'location.coordinates': '2dsphere' });
qrCodeSchema.index({ status: 1, expires_at: 1 });
transactionSchema.index({ from_address: 1, timestamp: -1 });
transactionSchema.index({ to_address: 1, timestamp: -1 });
notificationSchema.index({ user_address: 1, is_read: 1, created_at: -1 });

// Export models
module.exports = {
  User: mongoose.model('User', userSchema),
  RecyclingCenter: mongoose.model('RecyclingCenter', recyclingCenterSchema),
  QRCode: mongoose.model('QRCode', qrCodeSchema),
  Business: mongoose.model('Business', businessSchema),
  NGO: mongoose.model('NGO', ngoSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Leaderboard: mongoose.model('Leaderboard', leaderboardSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Review: mongoose.model('Review', reviewSchema)
};
