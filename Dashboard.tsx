// File: frontend/src/components/Dashboard.tsx
// How to name: frontend/src/components/Dashboard.tsx

import React, { useState } from 'react';
import { Leaf, Coins, TrendingUp, Award, MapPin, Gift, Heart, Zap } from 'lucide-react';

const GreenChainDashboard = () => {
  const [userStats, setUserStats] = useState({
    tokenBalance: 1250,
    totalRecyclings: 45,
    totalTokensEarned: 2150,
    currentStreak: 12,
    level: 5,
    co2Saved: 156 // kg
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'recycling', material: 'Plastic', weight: 250, tokens: 35, date: '2 hours ago', center: 'EcoCenter Downtown' },
    { id: 2, type: 'recycling', material: 'Glass', weight: 500, tokens: 52, date: '1 day ago', center: 'Green Recycling Hub' },
    { id: 3, type: 'redemption', business: 'Organic Cafe', tokens: 50, discount: '20%', date: '2 days ago' },
    { id: 4, type: 'recycling', material: 'Electronic', weight: 1200, tokens: 180, date: '3 days ago', center: 'Tech Waste Center' }
  ]);

  const [nearbyCenters, setNearbyCenters] = useState([
    { id: 1, name: 'EcoCenter Downtown', distance: 0.8, materials: ['Plastic', 'Paper', 'Glass'], rating: 4.8 },
    { id: 2, name: 'Green Recycling Hub', distance: 1.2, materials: ['Metal', 'Electronic'], rating: 4.6 },
    { id: 3, name: 'Community Recycle Point', distance: 2.1, materials: ['Plastic', 'Paper'], rating: 4.9 }
  ]);

  const [partnerBusinesses, setPartnerBusinesses] = useState([
    { id: 1, name: 'Organic Cafe', category: 'Restaurant', discount: 20, minTokens: 50, logo: '☕' },
    { id: 2, name: 'Green Market', category: 'Retail', discount: 15, minTokens: 30, logo: '🛒' },
    { id: 3, name: 'Eco Fitness', category: 'Health', discount: 25, minTokens: 75, logo: '💪' },
    { id: 4, name: 'Nature Books', category: 'Education', discount: 10, minTokens: 20, logo: '📚' }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'EcoWarrior', tokens: 5420, avatar: '🌟' },
    { rank: 2, name: 'GreenHero', tokens: 4890, avatar: '🌿' },
    { rank: 3, name: 'RecyclePro', tokens: 4250, avatar: '♻️' },
    { rank: 4, name: 'You', tokens: 2150, avatar: '😊', isCurrentUser: true },
    { rank: 5, name: 'EarthLover', tokens: 1980, avatar: '🌍' }
  ]);

  const getActivityIcon = (type: string) => {
    if (type === 'recycling') return <Leaf className="w-5 h-5 text-green-600" />;
    if (type === 'redemption') return <Gift className="w-5 h-5 text-purple-600" />;
    return <Coins className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Leaf className="w-10 h-10 text-green-600" />
            GreenChain
          </h1>
          <p className="text-gray-600">Earn tokens by recycling, redeem at local businesses</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-6 h-6 text-green-500" />
              <span className="text-xs text-gray-500">Balance</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{userStats.tokenBalance}</div>
            <div className="text-sm text-gray-500 mt-1">GRN Tokens</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{userStats.totalRecyclings}</div>
            <div className="text-sm text-gray-500 mt-1">Recyclings</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-orange-500" />
              <span className="text-xs text-gray-500">Streak</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{userStats.currentStreak} 🔥</div>
            <div className="text-sm text-gray-500 mt-1">Days</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-purple-500" />
              <span className="text-xs text-gray-500">Level</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{userStats.level}</div>
            <div className="text-sm text-gray-500 mt-1">Eco Champion</div>
          </div>
        </div>

        {/* Impact Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Your Environmental Impact</h3>
              <p className="opacity-90">You've saved {userStats.co2Saved}kg of CO₂ from entering the atmosphere!</p>
            </div>
            <div className="text-6xl">🌍</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        {activity.type === 'recycling' ? (
                          <>
                            <h3 className="font-semibold text-gray-800">
                              Recycled {activity.material}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.weight}g at {activity.center}
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-semibold text-gray-800">
                              Redeemed at {activity.business}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.discount} discount applied
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {activity.type === 'recycling' ? '+' : '-'}{activity.tokens}
                      </div>
                      <div className="text-xs text-gray-500">tokens</div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                View All Activity
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`p-3 rounded-lg flex items-center gap-3 ${
                    user.isCurrentUser
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-400 w-8">#{user.rank}</div>
                  <div className="text-2xl">{user.avatar}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.tokens} tokens</div>
                  </div>
                  {user.rank <= 3 && (
                    <div className="text-2xl">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nearby Centers & Partner Businesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Nearby Recycling Centers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Nearby Recycling Centers
            </h2>
            <div className="space-y-3">
              {nearbyCenters.map((center) => (
                <div key={center.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{center.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{center.distance} km away</span>
                        <span className="text-sm text-yellow-600">⭐ {center.rating}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      Navigate
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {center.materials.map((material, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white text-green-700 text-xs rounded-full border border-green-300">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Businesses */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Partner Businesses
            </h2>
            <div className="space-y-3">
              {partnerBusinesses.map((business) => (
                <div key={business.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-3xl">{business.logo}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{business.discount}%</div>
                      <div className="text-xs text-gray-500">OFF</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Min: {business.minTokens} tokens</span>
                    <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105">
            <Leaf className="w-8 h-8 mb-3 mx-auto" />
            <div className="text-xl font-bold mb-2">Scan QR Code</div>
            <div className="text-sm opacity-90">Record your recycling</div>
          </button>

          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
            <Gift className="w-8 h-8 mb-3 mx-auto" />
            <div className="text-xl font-bold mb-2">Redeem Tokens</div>
            <div className="text-sm opacity-90">Get discounts at businesses</div>
          </button>

          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105">
            <Heart className="w-8 h-8 mb-3 mx-auto" />
            <div className="text-xl font-bold mb-2">Donate to NGO</div>
            <div className="text-sm opacity-90">Support environmental causes</div>
          </button>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Make Every Recycling Count!</h3>
          <p className="mb-4 opacity-90">Join thousands of eco-warriors earning rewards for recycling</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Find Recycling Centers
            </button>
            <button className="bg-green-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-900 transition-colors">
              Invite Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenChainDashboard;
