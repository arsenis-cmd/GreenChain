// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// File: contracts/GreenToken.sol
// How to name: contracts/GreenToken.sol

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GreenToken
 * @dev ERC20 Token for rewarding recycling activities
 * Users earn tokens by recycling, can redeem at businesses or donate to NGOs
 */
contract GreenToken is ERC20, Ownable, ReentrancyGuard {
    
    // Token economics
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**18; // 10 million tokens
    uint256 public constant RECYCLING_REWARD_BASE = 10 * 10**18; // 10 tokens per recycling action
    
    // Structs
    struct RecyclingCenter {
        address centerAddress;
        string name;
        string location;
        bool isActive;
        uint256 totalRecyclings;
        uint256 totalTokensIssued;
    }
    
    struct RecyclingAction {
        address user;
        address center;
        uint256 timestamp;
        uint256 tokensEarned;
        string materialType; // plastic, paper, glass, metal, electronic
        uint256 weight; // in grams
        bytes32 qrCodeHash;
    }
    
    struct Business {
        address businessAddress;
        string name;
        string category; // restaurant, retail, service, etc.
        bool isActive;
        uint256 discountPercentage; // 1-100
        uint256 totalRedemptions;
    }
    
    struct NGO {
        address ngoAddress;
        string name;
        string mission;
        bool isActive;
        uint256 totalDonations;
    }
    
    // State variables
    mapping(address => RecyclingCenter) public recyclingCenters;
    mapping(address => Business) public businesses;
    mapping(address => NGO) public ngos;
    mapping(bytes32 => bool) public usedQRCodes;
    mapping(address => uint256) public userRecyclingCount;
    mapping(address => uint256) public userTotalTokensEarned;
    
    RecyclingAction[] public recyclingHistory;
    address[] public allCenters;
    address[] public allBusinesses;
    address[] public allNGOs;
    
    // Events
    event RecyclingCenterRegistered(address indexed center, string name);
    event BusinessRegistered(address indexed business, string name, uint256 discount);
    event NGORegistered(address indexed ngo, string name);
    event RecyclingRecorded(
        address indexed user,
        address indexed center,
        uint256 tokensEarned,
        string materialType,
        uint256 weight
    );
    event TokensRedeemed(address indexed user, address indexed business, uint256 amount);
    event TokensDonated(address indexed user, address indexed ngo, uint256 amount);
    event RewardMultiplierApplied(address indexed user, uint256 multiplier);
    
    constructor() ERC20("GreenToken", "GRN") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // Modifiers
    modifier onlyActiveCenter() {
        require(recyclingCenters[msg.sender].isActive, "Not an active recycling center");
        _;
    }
    
    modifier onlyActiveBusiness() {
        require(businesses[msg.sender].isActive, "Not an active business");
        _;
    }
    
    // Registration Functions
    
    function registerRecyclingCenter(
        address _centerAddress,
        string memory _name,
        string memory _location
    ) external onlyOwner {
        require(_centerAddress != address(0), "Invalid address");
        require(!recyclingCenters[_centerAddress].isActive, "Center already registered");
        
        recyclingCenters[_centerAddress] = RecyclingCenter({
            centerAddress: _centerAddress,
            name: _name,
            location: _location,
            isActive: true,
            totalRecyclings: 0,
            totalTokensIssued: 0
        });
        
        allCenters.push(_centerAddress);
        emit RecyclingCenterRegistered(_centerAddress, _name);
    }
    
    function registerBusiness(
        address _businessAddress,
        string memory _name,
        string memory _category,
        uint256 _discountPercentage
    ) external onlyOwner {
        require(_businessAddress != address(0), "Invalid address");
        require(_discountPercentage > 0 && _discountPercentage <= 100, "Invalid discount");
        require(!businesses[_businessAddress].isActive, "Business already registered");
        
        businesses[_businessAddress] = Business({
            businessAddress: _businessAddress,
            name: _name,
            category: _category,
            isActive: true,
            discountPercentage: _discountPercentage,
            totalRedemptions: 0
        });
        
        allBusinesses.push(_businessAddress);
        emit BusinessRegistered(_businessAddress, _name, _discountPercentage);
    }
    
    function registerNGO(
        address _ngoAddress,
        string memory _name,
        string memory _mission
    ) external onlyOwner {
        require(_ngoAddress != address(0), "Invalid address");
        require(!ngos[_ngoAddress].isActive, "NGO already registered");
        
        ngos[_ngoAddress] = NGO({
            ngoAddress: _ngoAddress,
            name: _name,
            mission: _mission,
            isActive: true,
            totalDonations: 0
        });
        
        allNGOs.push(_ngoAddress);
        emit NGORegistered(_ngoAddress, _name);
    }
    
    // Core Functions
    
    function recordRecycling(
        address _user,
        string memory _materialType,
        uint256 _weight,
        bytes32 _qrCodeHash
    ) external onlyActiveCenter nonReentrant returns (uint256) {
        require(_user != address(0), "Invalid user address");
        require(_weight > 0, "Weight must be positive");
        require(!usedQRCodes[_qrCodeHash], "QR code already used");
        
        // Mark QR code as used
        usedQRCodes[_qrCodeHash] = true;
        
        // Calculate reward with multipliers
        uint256 tokensToAward = calculateReward(_user, _materialType, _weight);
        
        // Mint tokens to user
        _mint(_user, tokensToAward);
        
        // Update statistics
        userRecyclingCount[_user]++;
        userTotalTokensEarned[_user] += tokensToAward;
        recyclingCenters[msg.sender].totalRecyclings++;
        recyclingCenters[msg.sender].totalTokensIssued += tokensToAward;
        
        // Record action
        recyclingHistory.push(RecyclingAction({
            user: _user,
            center: msg.sender,
            timestamp: block.timestamp,
            tokensEarned: tokensToAward,
            materialType: _materialType,
            weight: _weight,
            qrCodeHash: _qrCodeHash
        }));
        
        emit RecyclingRecorded(_user, msg.sender, tokensToAward, _materialType, _weight);
        
        return tokensToAward;
    }
    
    function calculateReward(
        address _user,
        string memory _materialType,
        uint256 _weight
    ) public view returns (uint256) {
        uint256 baseReward = RECYCLING_REWARD_BASE;
        
        // Weight multiplier (every 100g adds 10%)
        uint256 weightMultiplier = 100 + (_weight / 100);
        
        // Material type multiplier
        uint256 materialMultiplier = 100;
        bytes32 materialHash = keccak256(abi.encodePacked(_materialType));
        
        if (materialHash == keccak256(abi.encodePacked("electronic"))) {
            materialMultiplier = 200; // 2x for electronics
        } else if (materialHash == keccak256(abi.encodePacked("glass"))) {
            materialMultiplier = 150; // 1.5x for glass
        } else if (materialHash == keccak256(abi.encodePacked("metal"))) {
            materialMultiplier = 150; // 1.5x for metal
        } else if (materialHash == keccak256(abi.encodePacked("plastic"))) {
            materialMultiplier = 120; // 1.2x for plastic
        }
        
        // Streak multiplier (bonus for consistent recycling)
        uint256 streakMultiplier = 100;
        uint256 recyclingCount = userRecyclingCount[_user];
        if (recyclingCount >= 50) {
            streakMultiplier = 150; // 1.5x for 50+ recyclings
        } else if (recyclingCount >= 20) {
            streakMultiplier = 130; // 1.3x for 20+ recyclings
        } else if (recyclingCount >= 10) {
            streakMultiplier = 120; // 1.2x for 10+ recyclings
        }
        
        // Calculate final reward
        uint256 reward = (baseReward * weightMultiplier * materialMultiplier * streakMultiplier) / (100 * 100 * 100);
        
        return reward;
    }
    
    function redeemAtBusiness(address _business, uint256 _amount) external nonReentrant {
        require(businesses[_business].isActive, "Business not active");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount must be positive");
        
        // Burn tokens from user
        _burn(msg.sender, _amount);
        
        // Update statistics
        businesses[_business].totalRedemptions++;
        
        emit TokensRedeemed(msg.sender, _business, _amount);
    }
    
    function donateToNGO(address _ngo, uint256 _amount) external nonReentrant {
        require(ngos[_ngo].isActive, "NGO not active");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount must be positive");
        
        // Transfer tokens to NGO
        _transfer(msg.sender, _ngo, _amount);
        
        // Update statistics
        ngos[_ngo].totalDonations += _amount;
        
        emit TokensDonated(msg.sender, _ngo, _amount);
    }
    
    // View Functions
    
    function getUserStats(address _user) external view returns (
        uint256 balance,
        uint256 recyclingCount,
        uint256 totalEarned,
        uint256 nextRewardMultiplier
    ) {
        balance = balanceOf(_user);
        recyclingCount = userRecyclingCount[_user];
        totalEarned = userTotalTokensEarned[_user];
        
        // Calculate next milestone multiplier
        if (recyclingCount >= 50) {
            nextRewardMultiplier = 150;
        } else if (recyclingCount >= 20) {
            nextRewardMultiplier = 150;
        } else if (recyclingCount >= 10) {
            nextRewardMultiplier = 130;
        } else {
            nextRewardMultiplier = 120;
        }
    }
    
    function getAllCenters() external view returns (address[] memory) {
        return allCenters;
    }
    
    function getAllBusinesses() external view returns (address[] memory) {
        return allBusinesses;
    }
    
    function getAllNGOs() external view returns (address[] memory) {
        return allNGOs;
    }
    
    function getRecyclingHistoryCount() external view returns (uint256) {
        return recyclingHistory.length;
    }
    
    function getRecyclingAction(uint256 _index) external view returns (
        address user,
        address center,
        uint256 timestamp,
        uint256 tokensEarned,
        string memory materialType,
        uint256 weight
    ) {
        require(_index < recyclingHistory.length, "Index out of bounds");
        RecyclingAction memory action = recyclingHistory[_index];
        return (
            action.user,
            action.center,
            action.timestamp,
            action.tokensEarned,
            action.materialType,
            action.weight
        );
    }
    
    // Admin Functions
    
    function deactivateCenter(address _center) external onlyOwner {
        recyclingCenters[_center].isActive = false;
    }
    
    function deactivateBusiness(address _business) external onlyOwner {
        businesses[_business].isActive = false;
    }
    
    function deactivateNGO(address _ngo) external onlyOwner {
        ngos[_ngo].isActive = false;
    }
    
    function updateBusinessDiscount(address _business, uint256 _newDiscount) external onlyOwner {
        require(businesses[_business].isActive, "Business not active");
        require(_newDiscount > 0 && _newDiscount <= 100, "Invalid discount");
        businesses[_business].discountPercentage = _newDiscount;
    }
}
