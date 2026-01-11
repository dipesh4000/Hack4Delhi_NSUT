"use client";

import { useState, useEffect } from 'react';
import { Trophy, Coins, TrendingUp, Award, Gift, Users, Leaf, Car, TreePine, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PollutionCreditsProps {
  wardName: string;
  wardNumber: string;
  userId?: string;
}

interface CreditTransaction {
  id: string;
  type: 'earn' | 'spend';
  source: string;
  amount: number;
  timestamp: Date;
  description: string;
}

interface UserCredits {
  totalCredits: number;
  rank: number;
  transactions: CreditTransaction[];
}

interface WardLeaderboard {
  rank: number;
  wardName: string;
  totalCredits: number;
  improvement: number;
}

export default function PollutionCredits({ wardName, wardNumber, userId = 'user123' }: PollutionCreditsProps) {
  const [credits, setCredits] = useState<UserCredits>({
    totalCredits: 0,
    rank: 0,
    transactions: []
  });
  const [leaderboard, setLeaderboard] = useState<WardLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earn' | 'spend' | 'leaderboard'>('earn');

  useEffect(() => {
    fetchCredits();
    fetchLeaderboard();
  }, [userId, wardNumber]);

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/credits/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      // Use mock data for demo
      setCredits({
        totalCredits: 245,
        rank: 12,
        transactions: [
          { id: '1', type: 'earn', source: 'public_transport', amount: 5, timestamp: new Date(), description: 'Used metro today' },
          { id: '2', type: 'earn', source: 'report', amount: 10, timestamp: new Date(Date.now() - 86400000), description: 'Reported illegal burning' },
          { id: '3', type: 'earn', source: 'tree', amount: 50, timestamp: new Date(Date.now() - 172800000), description: 'Planted a tree' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/credits/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Use mock data for demo
      setLeaderboard([
        { rank: 1, wardName: 'Rohini Sector 7', totalCredits: 15420, improvement: 12 },
        { rank: 2, wardName: 'Dwarka Sector 10', totalCredits: 14850, improvement: 8 },
        { rank: 3, wardName: 'Vasant Kunj', totalCredits: 13920, improvement: 15 },
        { rank: 4, wardName: 'Saket', totalCredits: 12100, improvement: -3 },
        { rank: 5, wardName: wardName, totalCredits: 11500, improvement: 5 },
      ]);
    }
  };

  const earnCredits = async (source: string, amount: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/credits/earn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, source, amount, wardNumber })
      });
      
      if (response.ok) {
        await fetchCredits();
      }
    } catch (error) {
      console.error('Failed to earn credits:', error);
    }
  };

  const spendCredits = async (purpose: string, amount: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/credits/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, purpose, amount })
      });
      
      if (response.ok) {
        await fetchCredits();
      }
    } catch (error) {
      console.error('Failed to spend credits:', error);
    }
  };

  const earnOptions = [
    { icon: Car, title: 'Use Public Transport', credits: 5, color: 'blue', action: () => earnCredits('public_transport', 5) },
    { icon: Users, title: 'Carpool', credits: 3, color: 'green', action: () => earnCredits('carpool', 3) },
    { icon: AlertCircle, title: 'Report Pollution', credits: 10, color: 'orange', action: () => earnCredits('report', 10) },
    { icon: TreePine, title: 'Plant a Tree', credits: 50, color: 'emerald', action: () => earnCredits('tree', 50) },
  ];

  const spendOptions = [
    { icon: Car, title: 'Parking Discount', credits: 50, color: 'blue', action: () => spendCredits('parking', 50) },
    { icon: Gift, title: 'Property Tax Discount', credits: 200, color: 'purple', action: () => spendCredits('tax', 200) },
    { icon: Leaf, title: 'Ward Improvement', credits: 100, color: 'green', action: () => spendCredits('improvement', 100) },
    { icon: Award, title: 'Premium Features', credits: 150, color: 'yellow', action: () => spendCredits('premium', 150) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-6 shadow-xl border-2 border-amber-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 rounded-2xl">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Pollution Credits</h3>
            <p className="text-sm text-slate-500 font-medium">Earn rewards for reducing pollution</p>
          </div>
        </div>

        {/* Total Credits Badge */}
        <div className="text-right">
          <div className="text-4xl font-black text-amber-600">{credits.totalCredits}</div>
          <div className="text-xs font-bold text-slate-500">Total Credits</div>
        </div>
      </div>

      {/* Rank Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <div className="text-sm font-semibold opacity-90">Your Rank in {wardName}</div>
              <div className="text-3xl font-black">#{credits.rank || '—'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold opacity-90">This Month</div>
            <div className="flex items-center gap-1 text-lg font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['earn', 'spend', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 rounded-xl font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'earn' && (
          <motion.div
            key="earn"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            <h4 className="font-black text-slate-900 mb-4">Ways to Earn Credits</h4>
            {earnOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={option.action}
                className={`w-full bg-${option.color}-50 border-2 border-${option.color}-200 rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-${option.color}-500 rounded-xl group-hover:scale-110 transition-transform`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{option.title}</div>
                    <div className="text-sm font-semibold text-slate-600">Click to log activity</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-600">+{option.credits}</div>
                  <div className="text-xs font-bold text-slate-500">credits</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {activeTab === 'spend' && (
          <motion.div
            key="spend"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            <h4 className="font-black text-slate-900 mb-4">Redeem Your Credits</h4>
            {spendOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={option.action}
                disabled={credits.totalCredits < option.credits}
                className={`w-full bg-${option.color}-50 border-2 border-${option.color}-200 rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-${option.color}-500 rounded-xl group-hover:scale-110 transition-transform`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{option.title}</div>
                    <div className="text-sm font-semibold text-slate-600">
                      {credits.totalCredits >= option.credits ? 'Available' : 'Insufficient credits'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-purple-600">-{option.credits}</div>
                  <div className="text-xs font-bold text-slate-500">credits</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            <h4 className="font-black text-slate-900 mb-4">Ward Leaderboard</h4>
            {leaderboard.map((ward, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 flex items-center justify-between ${
                  ward.wardName === wardName
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300'
                    : 'bg-white border-2 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    ward.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    ward.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    ward.rank === 3 ? 'bg-orange-400 text-orange-900' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {ward.rank}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{ward.wardName}</div>
                    <div className="text-sm font-semibold text-slate-600">{ward.totalCredits.toLocaleString()} credits</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 font-bold ${
                  ward.improvement > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${ward.improvement < 0 ? 'rotate-180' : ''}`} />
                  <span>{Math.abs(ward.improvement)}%</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Transactions */}
      {credits.transactions.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-5 border-2 border-slate-200">
          <h4 className="font-black text-slate-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {credits.transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{tx.description}</div>
                  <div className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                </div>
                <div className={`font-black ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
