# ♻️ GreenChain - Blockchain-Powered Recycling Rewards

[![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=flat&logo=ethereum&logoColor=white)](https://ethereum.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A decentralized recycling incentive platform that rewards users with blockchain tokens for eco-friendly behavior. Users scan QR codes at recycling centers, earn GRN tokens recorded on-chain, and redeem them at local businesses or donate to environmental NGOs.

---

##  Key Features

### For Users
- **Scan & Earn** - QR code scanning at recycling centers with instant token rewards
- **Smart Rewards** - Multipliers based on material type, weight, and user streak
- **Local Redemption** - Spend tokens at partner businesses for discounts (10-25% off)
- **NGO Donations** - Support environmental causes directly with your tokens
- **Gamification** - Levels, streaks, badges, and leaderboards
- **Transparency** - All transactions recorded immutably on blockchain

### For Recycling Centers
- **QR Generation** - Create unique, time-limited QR codes for materials
- **Fraud Prevention** - Each QR code is single-use and blockchain-verified
- **Analytics Dashboard** - Track recycling volumes and token distribution

### For Businesses
- **Customer Acquisition** - Attract eco-conscious customers with token discounts
- **Marketing Tool** - Promote sustainability while driving foot traffic
- **Flexible Discounts** - Set custom discount percentages and minimum token requirements

### For NGOs
- **Direct Funding** - Receive token donations from users
- **Impact Tracking** - Show real-time environmental metrics
- **Transparency** - All donations visible on blockchain

---

##  Architecture

```
┌─────────────────────────────┐
│   React Web/Mobile App      │
│  - QR Scanner               │
│  - Wallet Dashboard         │
│  - Business Directory       │
│  - Leaderboard             │
└──────────┬──────────────────┘
           │ REST API + Web3
┌──────────▼──────────────────┐
│   Node.js Backend           │
│  - User Management          │
│  - QR Code Generation       │
│  - Transaction Mirror       │
│  - Geolocation Services     │
└───┬──────────────────┬──────┘
    │                  │
    ▼                  ▼
┌────────┐      ┌──────────────────┐
│MongoDB │      │  Polygon Network │
│        │      │  (Blockchain)    │
│- Users │      │  - GreenToken    │
│- QR    │      │  - Smart Contract│
│- Biz   │      │  - Transactions  │
└────────┘      └──────────────────┘
```

---

##  Tech Stack

### Smart Contract
- **Solidity 0.8.19** - Smart contract language
- **OpenZeppelin** - Secure contract libraries (ERC20, Ownable)
- **Hardhat** - Development environment
- **Polygon Mumbai** - Testnet deployment (low gas fees)

### Backend
- **Node.js** with Express + TypeScript
- **MongoDB** with Mongoose
- **ethers.js** - Blockchain interaction
- **qrcode** - QR code generation

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Web3Modal** - Wallet connection

### Blockchain Features
- **ERC20 Token** - Standard fungible token (GRN)
- **Smart Multipliers** - Weight, material type, and streak bonuses
- **Anti-fraud** - Single-use QR codes with hash verification
- **Transparency** - Public transaction history

---

##  Getting Started

### Prerequisites
```bash
node >= 18.0.0
mongodb >= 5.0
npm >= 9.0.0
```

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/yourusername/greenchain.git
cd greenchain
```

**2. Install Dependencies**
```bash
# Install Hardhat & contract dependencies
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**3. Deploy Smart Contract**
```bash
# Configure network in hardhat.config.ts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network polygon_mumbai

# Copy contract address to .env
```

**4. Configure Environment**

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/greenchain
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
GREEN_TOKEN_CONTRACT_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...
JWT_SECRET=your-secret-key
PORT=3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_CHAIN_ID=80001
```

**5. Run Services**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

---

##  Smart Contract Functions

### User Functions
```solidity
// Record recycling and earn tokens
function recordRecycling(
    address user,
    string materialType,
    uint256 weight,
    bytes32 qrCodeHash
) returns (uint256 tokensEarned)

// Redeem tokens at business
function redeemAtBusiness(
    address business,
    uint256 amount
)

// Donate to NGO
function donateToNGO(
    address ngo,
    uint256 amount
)

// Get user statistics
function getUserStats(address user) returns (
    uint256 balance,
    uint256 recyclingCount,
    uint256 totalEarned,
    uint256 nextRewardMultiplier
)
```

### Admin Functions
```solidity
// Register recycling center
function registerRecyclingCenter(
    address centerAddress,
    string name,
    string location
)

// Register business partner
function registerBusiness(
    address businessAddress,
    string name,
    string category,
    uint256 discountPercentage
)

// Register NGO
function registerNGO(
    address ngoAddress,
    string name,
    string mission
)
```

---

## 💰 Token Economics

### GreenToken (GRN)
- **Total Supply**: 10,000,000 GRN
- **Base Reward**: 10 GRN per recycling action
- **Distribution**: Minted on-demand for verified recycling

### Reward Multipliers
```javascript
// Material Type Multipliers
Electronic: 2.0x    // Encourages e-waste recycling
Glass: 1.5x         // Heavy but recyclable
Metal: 1.5x         // High value material
Plastic: 1.2x       // Common material
Paper: 1.0x         // Base rate

// Weight Multipliers
Every 100g: +10%    // Linear scaling

// Streak Multipliers
50+ recyclings: 1.5x
20+ recyclings: 1.3x
10+ recyclings: 1.2x
```

**Example Calculation:**
- User recycles 500g of electronic waste (20th recycling)
- Base: 10 GRN
- Material: 10 × 2.0 = 20 GRN
- Weight: 20 × (1 + 500/100 × 0.1) = 30 GRN
- Streak: 30 × 1.3 = 39 GRN
- **Total: 39 GRN earned**

---

##  User Flow

### Recycling Process
1. User collects recyclable materials
2. Takes materials to registered recycling center
3. Center weighs materials and generates QR code
4. User scans QR code with mobile app
5. Smart contract validates QR (single-use, not expired)
6. Tokens minted and transferred to user wallet
7. Transaction recorded on blockchain
8. User receives notification with token amount

### Redemption Process
1. User browses partner businesses
2. Selects business and token amount
3. Confirms redemption transaction
4. Tokens burned from user wallet
5. User shows transaction proof at business
6. Business applies discount

---

##  Gamification Features

### Levels
- Level 1: 0-500 tokens earned
- Level 2: 500-1,500 tokens
- Level 3: 1,500-3,500 tokens
- Level 4: 3,500-7,500 tokens
- Level 5: 7,500+ tokens (Eco Champion)

### Badges
-  **First Steps** - First recycling
-  **On Fire** - 7-day streak
-  **Lightning** - 30-day streak
-  **Eco Star** - 100 recyclings
-  **Champion** - Top 10 leaderboard
-  **Generous** - Donated 500+ tokens to NGOs

### Streaks
- Track consecutive days with at least one recycling
- Bonus multipliers for active streaks
- Push notifications to maintain streaks

---

## Security Features

### Smart Contract Security
- **OpenZeppelin Libraries** - Battle-tested security
- **ReentrancyGuard** - Prevents reentrancy attacks
- **Access Control** - Owner-only admin functions
- **Input Validation** - All parameters checked

### QR Code Security
- **Hash-based Verification** - Keccak256 hashing
- **Single-use** - Each QR can only be used once
- **Expiration** - QR codes expire after 24 hours
- **Center Verification** - Only registered centers can generate

### API Security
- **JWT Authentication** - Secure user sessions
- **Rate Limiting** - Prevents abuse
- **Input Sanitization** - SQL injection prevention
- **HTTPS Only** - Encrypted communication

---

##  Environmental Impact

### Carbon Savings Calculator
```javascript
// Material CO2 savings per kg
Plastic: 2.0 kg CO2
Paper: 1.5 kg CO2
Glass: 0.5 kg CO2
Metal: 3.0 kg CO2
Electronic: 5.0 kg CO2

// Example: 500g plastic = 1kg CO2 saved
```

### Impact Metrics Displayed
- Total CO2 saved by user
- Number of trees equivalent
- Ocean plastic prevented
- Landfill space saved

---

##  Testing

```bash
# Smart contract tests
npx hardhat test

# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

---

##  Deployment

### Smart Contract Deployment

**Polygon Mumbai (Testnet)**
```bash
npx hardhat run scripts/deploy.ts --network polygon_mumbai
```

**Polygon Mainnet (Production)**
```bash
npx hardhat run scripts/deploy.ts --network polygon_mainnet
```

### Backend Deployment
- **Railway** or **Render** ($5-10/month)
- Docker container with Node.js + MongoDB

### Frontend Deployment
- **Vercel** (free) - Best for React apps
- **Netlify** (free) - Alternative option

---

##  Roadmap

### Phase 1: MVP ✅
- [x] Smart contract development
- [x] QR code system
- [x] Basic token rewards
- [x] User dashboard
- [x] Business redemption

### Phase 2: Enhancement (4 weeks)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline QR scanning

### Phase 3: Scale (8 weeks)
- [ ] Multi-chain support (Ethereum, BSC)
- [ ] NFT badges for achievements
- [ ] Marketplace for green products
- [ ] Corporate partnerships

### Phase 4: Expansion (12 weeks)
- [ ] Government integration
- [ ] Carbon credit trading
- [ ] International expansion
- [ ] Machine learning fraud detection

---

##  What I Learned

Through building GreenChain, I gained expertise in:
- **Solidity Development** - Writing secure, efficient smart contracts
- **Blockchain Integration** - Connecting web apps to blockchain
- **Token Economics** - Designing sustainable reward systems
- **QR Code Systems** - Implementing secure verification
- **Web3 UX** - Making blockchain accessible to non-technical users
- **Geolocation Services** - Finding nearby locations efficiently

---

##  Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

---

##  License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Author

**Your Name**
- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

---

**Built with love to incentivize recycling and fight climate change through blockchain technology**
