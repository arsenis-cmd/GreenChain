// File: backend/src/index.ts
// How to name: backend/src/index.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Blockchain Provider Setup
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const contractAddress = process.env.GREEN_TOKEN_CONTRACT_ADDRESS!;
const contractABI = require('./contracts/GreenToken.json').abi;

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import recyclingRoutes from './routes/recycling';
import businessRoutes from './routes/businesses';
import ngoRoutes from './routes/ngos';
import qrRoutes from './routes/qr';
import leaderboardRoutes from './routes/leaderboard';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recycling', recyclingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`GreenChain API running on port ${PORT}`);
});

// File: backend/src/routes/recycling.ts
// How to name: backend/src/routes/recycling.ts

import { Router } from 'express';
import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { authenticate } from '../middleware/auth';
import { QRCode as QRModel, RecyclingCenter, Transaction, User, Notification } from '../models/schemas';

const router = Router();

// Generate QR Code for recycling center
router.post('/generate-qr', authenticate, async (req: any, res) => {
  try {
    const { material_type, weight } = req.body;
    const centerAddress = req.userAddress; // From auth middleware

    // Verify center exists
    const center = await RecyclingCenter.findOne({ wallet_address: centerAddress });
    if (!center) {
      return res.status(403).json({ error: 'Not a registered recycling center' });
    }

    // Generate unique QR code ID
    const qrCodeId = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create hash for blockchain
    const qrHash = ethers.keccak256(ethers.toUtf8Bytes(qrCodeId));
    
    // Generate QR code image
    const qrData = JSON.stringify({
      id: qrCodeId,
      center: centerAddress,
      material: material_type,
      weight: weight,
      timestamp: Date.now()
    });
    
    const qrImageUrl = await QRCode.toDataURL(qrData);
    
    // Save to database
    const qrCode = new QRModel({
      qr_code_id: qrCodeId,
      qr_hash: qrHash,
      center_address: centerAddress,
      material_type,
      weight,
      status: 'active',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      qr_image_url: qrImageUrl
    });

    await qrCode.save();

    res.json({
      qr_code_id: qrCodeId,
      qr_hash: qrHash,
      qr_image: qrImageUrl,
      expires_at: qrCode.expires_at
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Scan and validate QR code (user scans at center)
router.post('/scan-qr', authenticate, async (req: any, res) => {
  try {
    const { qr_code_id } = req.body;
    const userAddress = req.userAddress;

    // Find QR code
    const qrCode = await QRModel.findOne({ qr_code_id });
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Validate QR code
    if (qrCode.status !== 'active') {
      return res.status(400).json({ error: 'QR code already used or expired' });
    }

    if (new Date() > qrCode.expires_at) {
      qrCode.status = 'expired';
      await qrCode.save();
      return res.status(400).json({ error: 'QR code expired' });
    }

    // Get center details
    const center = await RecyclingCenter.findOne({ wallet_address: qrCode.center_address });

    res.json({
      qr_code: qrCode,
      center: {
        name: center?.name,
        address: center?.wallet_address,
        location: center?.location
      },
      estimated_reward: await calculateEstimatedReward(userAddress, qrCode.material_type, qrCode.weight)
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ error: 'Failed to scan QR code' });
  }
});

// Submit recycling to blockchain
router.post('/submit', authenticate, async (req: any, res) => {
  try {
    const { qr_code_id, signature } = req.body;
    const userAddress = req.userAddress;

    // Find and validate QR code
    const qrCode = await QRModel.findOne({ qr_code_id });
    if (!qrCode || qrCode.status !== 'active') {
      return res.status(400).json({ error: 'Invalid or used QR code' });
    }

    // Get user's private key (in production, use wallet connect)
    const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY!, provider);
    
    // Connect to smart contract
    const greenTokenContract = new ethers.Contract(
      process.env.GREEN_TOKEN_CONTRACT_ADDRESS!,
      require('../contracts/GreenToken.json').abi,
      userWallet
    );

    // Call recordRecycling function
    const tx = await greenTokenContract.recordRecycling(
      userAddress,
      qrCode.material_type,
      qrCode.weight,
      qrCode.qr_hash
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Parse events to get tokens earned
    const recyclingEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = greenTokenContract.interface.parseLog(log);
        return parsed?.name === 'RecyclingRecorded';
      } catch {
        return false;
      }
    });

    let tokensEarned = 0;
    if (recyclingEvent) {
      const parsed = greenTokenContract.interface.parseLog(recyclingEvent);
      tokensEarned = Number(ethers.formatEther(parsed.args.tokensEarned));
    }

    // Update QR code status
    qrCode.status = 'used';
    qrCode.used_by = userAddress;
    qrCode.used_at = new Date();
    qrCode.transaction_hash = tx.hash;
    await qrCode.save();

    // Update user stats
    await User.findOneAndUpdate(
      { wallet_address: userAddress },
      {
        $inc: {
          'stats.total_recyclings': 1,
          'stats.total_tokens_earned': tokensEarned
        },
        $set: {
          'stats.last_recycling_date': new Date()
        }
      }
    );

    // Create transaction record
    const transaction = new Transaction({
      transaction_hash: tx.hash,
      block_number: receipt.blockNumber,
      type: 'recycling',
      from_address: qrCode.center_address,
      to_address: userAddress,
      amount: tokensEarned,
      recycling_details: {
        center_address: qrCode.center_address,
        material_type: qrCode.material_type,
        weight: qrCode.weight,
        qr_code_hash: qrCode.qr_hash
      },
      status: 'confirmed'
    });
    await transaction.save();

    // Create notification
    const notification = new Notification({
      user_address: userAddress,
      type: 'recycling_reward',
      title: 'Recycling Recorded!',
      message: `You earned ${tokensEarned.toFixed(2)} GRN tokens for recycling ${qrCode.material_type}`,
      data: {
        tokens_earned: tokensEarned,
        transaction_hash: tx.hash
      }
    });
    await notification.save();

    res.json({
      success: true,
      transaction_hash: tx.hash,
      tokens_earned: tokensEarned,
      material_type: qrCode.material_type,
      weight: qrCode.weight
    });
  } catch (error) {
    console.error('Submit recycling error:', error);
    res.status(500).json({ error: 'Failed to submit recycling to blockchain' });
  }
});

// Get recycling history
router.get('/history', authenticate, async (req: any, res) => {
  try {
    const userAddress = req.userAddress;
    const { limit = 20, offset = 0 } = req.query;

    const transactions = await Transaction.find({
      to_address: userAddress,
      type: 'recycling'
    })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    // Get center details for each transaction
    const historyWithDetails = await Promise.all(
      transactions.map(async (tx) => {
        const center = await RecyclingCenter.findOne({
          wallet_address: tx.recycling_details?.center_address
        });
        
        return {
          transaction_hash: tx.transaction_hash,
          timestamp: tx.timestamp,
          tokens_earned: tx.amount,
          material_type: tx.recycling_details?.material_type,
          weight: tx.recycling_details?.weight,
          center: {
            name: center?.name,
            location: center?.location?.city
          }
        };
      })
    );

    res.json(historyWithDetails);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get nearby recycling centers
router.get('/centers/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const centers = await RecyclingCenter.find({
      is_active: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(radius) * 1000 // convert km to meters
        }
      }
    }).limit(20);

    res.json(centers);
  } catch (error) {
    console.error('Nearby centers error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby centers' });
  }
});

// Helper function
async function calculateEstimatedReward(
  userAddress: string,
  materialType: string,
  weight: number
): Promise<number> {
  try {
    const greenTokenContract = new ethers.Contract(
      process.env.GREEN_TOKEN_CONTRACT_ADDRESS!,
      require('../contracts/GreenToken.json').abi,
      provider
    );

    const reward = await greenTokenContract.calculateReward(
      userAddress,
      materialType,
      weight
    );

    return Number(ethers.formatEther(reward));
  } catch (error) {
    console.error('Reward calculation error:', error);
    return 10; // fallback base reward
  }
}

export default router;

// File: backend/src/routes/businesses.ts
// How to name: backend/src/routes/businesses.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Business, Transaction, User, Notification } from '../models/schemas';
import { ethers } from 'ethers';

const router = Router();

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const { category, city, limit = 20 } = req.query;
    
    const filter: any = { is_active: true };
    if (category) filter.category = category;
    if (city) filter['location.city'] = city;

    const businesses = await Business.find(filter)
      .limit(Number(limit))
      .sort({ 'stats.total_redemptions': -1 });

    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get business details
router.get('/:address', async (req, res) => {
  try {
    const business = await Business.findOne({
      wallet_address: req.params.address
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Redeem tokens at business
router.post('/redeem', authenticate, async (req: any, res) => {
  try {
    const { business_address, token_amount } = req.body;
    const userAddress = req.userAddress;

    // Validate business
    const business = await Business.findOne({
      wallet_address: business_address,
      is_active: true
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found or inactive' });
    }

    // Check minimum tokens required
    if (token_amount < (business.discount.min_tokens_required || 0)) {
      return res.status(400).json({
        error: `Minimum ${business.discount.min_tokens_required} tokens required`
      });
    }

    // Connect to contract and redeem
    const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY!, provider);
    const greenTokenContract = new ethers.Contract(
      process.env.GREEN_TOKEN_CONTRACT_ADDRESS!,
      require('../contracts/GreenToken.json').abi,
      userWallet
    );

    const tx = await greenTokenContract.redeemAtBusiness(
      business_address,
      ethers.parseEther(token_amount.toString())
    );

    const receipt = await tx.wait();

    // Calculate discount value
    const discountValue = token_amount * (business.discount.percentage / 100);

    // Update business stats
    await Business.findOneAndUpdate(
      { wallet_address: business_address },
      {
        $inc: {
          'stats.total_redemptions': 1,
          'stats.total_tokens_redeemed': token_amount
        }
      }
    );

    // Update user stats
    await User.findOneAndUpdate(
      { wallet_address: userAddress },
      {
        $inc: {
          'stats.total_tokens_redeemed': token_amount
        }
      }
    );

    // Create transaction record
    const transaction = new Transaction({
      transaction_hash: tx.hash,
      block_number: receipt.blockNumber,
      type: 'redemption',
      from_address: userAddress,
      to_address: business_address,
      amount: token_amount,
      redemption_details: {
        business_address,
        discount_applied: business.discount.percentage
      },
      status: 'confirmed'
    });
    await transaction.save();

    // Create notification
    const notification = new Notification({
      user_address: userAddress,
      type: 'redemption',
      title: 'Tokens Redeemed!',
      message: `You redeemed ${token_amount} tokens at ${business.name} for ${business.discount.percentage}% discount`,
      data: {
        transaction_hash: tx.hash
      }
    });
    await notification.save();

    res.json({
      success: true,
      transaction_hash: tx.hash,
      tokens_redeemed: token_amount,
      discount_percentage: business.discount.percentage,
      discount_value: discountValue,
      business_name: business.name
    });
  } catch (error) {
    console.error('Redemption error:', error);
    res.status(500).json({ error: 'Failed to redeem tokens' });
  }
});

export default router;

// File: backend/src/routes/leaderboard.ts
// How to name: backend/src/routes/leaderboard.ts

import { Router } from 'express';
import { User, Leaderboard } from '../models/schemas';

const router = Router();

// Get leaderboard
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params; // daily, weekly, monthly, all_time
    
    if (!['daily', 'weekly', 'monthly', 'all_time'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    // Check if cached leaderboard exists and is recent
    const cachedLeaderboard = await Leaderboard.findOne({ period })
      .sort({ updated_at: -1 });

    const cacheAge = cachedLeaderboard 
      ? Date.now() - cachedLeaderboard.updated_at.getTime()
      : Infinity;

    // Refresh if cache is older than 5 minutes
    if (cacheAge > 5 * 60 * 1000) {
      await updateLeaderboard(period);
    }

    const leaderboard = await Leaderboard.findOne({ period })
      .sort({ updated_at: -1 });

    res.json(leaderboard?.rankings || []);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

async function updateLeaderboard(period: string) {
  const users = await User.find({})
    .sort({ 'stats.total_tokens_earned': -1 })
    .limit(100);

  const rankings = users.map((user, index) => ({
    rank: index + 1,
    user_address: user.wallet_address,
    user_name: user.full_name || 'Anonymous',
    score: user.stats.total_tokens_earned,
    profile_image: user.profile_image
  }));

  await Leaderboard.findOneAndUpdate(
    { period },
    {
      period,
      rankings,
      updated_at: new Date()
    },
    { upsert: true }
  );
}

export default router;
