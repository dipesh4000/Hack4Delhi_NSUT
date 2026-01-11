"use client";

import { useState, useEffect } from 'react';
import { Trophy, Coins, TrendingUp, Award, Gift, Users, Leaf, Car, TreePine, AlertCircle, ArrowLeft, Upload, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePollution } from '@/context/PollutionContext';
import Image from 'next/image';

interface CreditRequest {
  id: string;
  userId: string;
  activity: string;
  credits: number;
  proofImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

interface UserCredits {
  totalCredits: number;
  rank: number;
  pendingRequests: CreditRequest[];
  approvedRequests: CreditRequest[];
}

interface WardLeaderboard {
  rank: number;
  wardName: string;
  totalCredits: number;
  memberCount: number;
  improvement: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function PollutionCreditsPage() {
  const { pollutionData } = usePollution();
  const wardName = pollutionData?.name || 'Your Ward';
  const wardNumber = pollutionData?.id?.replace('ward-', '') || '123';
  const userId = 'user123'; // In real app, get from auth

  const [credits, setCredits] = useState<UserCredits>({
    totalCredits: 0,
    rank: 0,
    pendingRequests: [],
    approvedRequests: []
  });
  const [leaderboard, setLeaderboard] = useState<WardLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earn' | 'spend' | 'history' | 'leaderboard'>('earn');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCredits();
    fetchLeaderboard();
  }, [userId, wardNumber]);

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/credits/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/credits/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCreditRequest = async () => {
    if (!selectedActivity || !uploadedFile) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('activity', selectedActivity);
      formData.append('wardNumber', wardNumber);
      formData.append('proof', uploadedFile);

      const response = await fetch(`${BACKEND_URL}/api/credits/request`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchCredits();
        setSelectedActivity(null);
        setUploadedFile(null);
        setPreviewUrl(null);
        alert('Credit request submitted! Waiting for authority approval.');
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const spendCredits = async (purpose: string, amount: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/credits/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, purpose, amount })
      });
      
      if (response.ok) {
        await fetchCredits();
        alert(`Successfully redeemed ${purpose}!`);
      }
    } catch (error) {
      console.error('Failed to spend credits:', error);
    }
  };

  const earnOptions = [
    { id: 'public_transport', icon: Car, title: 'Use Public Transport', credits: 5, description: 'Upload metro/bus ticket' },
    { id: 'carpool', icon: Users, title: 'Carpool', credits: 3, description: 'Upload carpool proof' },
    { id: 'report', icon: AlertCircle, title: 'Report Pollution', credits: 10, description: 'Upload photo of pollution' },
    { id: 'tree', icon: TreePine, title: 'Plant a Tree', credits: 50, description: 'Upload photo with planted tree' },
  ];

  const spendOptions = [
    { icon: Car, title: 'Parking Discount', credits: 50 },
    { icon: Gift, title: 'Property Tax Discount', credits: 200 },
    { icon: Leaf, title: 'Ward Improvement', credits: 100 },
    { icon: Award, title: 'Premium Features', credits: 150 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/citizen" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 rounded-3xl shadow-lg">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">Pollution Credits</h1>
                <p className="text-lg text-slate-600 font-medium">Earn rewards for reducing pollution</p>
              </div>
            </div>
            
            {/* Total Credits Badge */}
            <div className="text-right bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
              <div className="text-5xl font-black text-blue-600">{credits.totalCredits}</div>
              <div className="text-sm font-bold text-slate-500">Total Credits</div>
              {credits.pendingRequests.length > 0 && (
                <div className="text-xs font-semibold text-orange-600 mt-2">
                  {credits.pendingRequests.length} pending
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rank Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="w-12 h-12" />
              <div>
                <div className="text-sm font-semibold opacity-90">Your Rank in {wardName}</div>
                <div className="text-5xl font-black">#{credits.rank || '—'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold opacity-90">This Month</div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <TrendingUp className="w-6 h-6" />
                <span>+15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {(['earn', 'spend', 'history', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 rounded-xl font-bold capitalize transition-all text-lg ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
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
              className="space-y-6"
            >
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                <p className="text-blue-900 font-semibold">
                  📸 <strong>Upload Proof Required:</strong> To earn credits, you must upload a photo/ticket as proof. Your request will be reviewed by authorities.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {earnOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedActivity(option.id)}
                    className={`bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-between group ${
                      selectedActivity === option.id ? 'border-blue-600 bg-blue-50' : 'border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                        <option.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 text-lg">{option.title}</div>
                        <div className="text-sm font-semibold text-slate-600">{option.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-blue-600">+{option.credits}</div>
                      <div className="text-xs font-bold text-slate-500">credits</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Upload Section */}
              {selectedActivity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-lg"
                >
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Upload Proof</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <p className="text-lg font-bold text-slate-900">Click to upload image</p>
                        <p className="text-sm text-slate-600">PNG, JPG up to 10MB</p>
                      </label>
                    </div>

                    {previewUrl && (
                      <div className="relative">
                        <Image src={previewUrl} alt="Preview" width={400} height={300} className="rounded-xl mx-auto" />
                      </div>
                    )}

                    <button
                      onClick={submitCreditRequest}
                      disabled={!uploadedFile || submitting}
                      className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit for Approval'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'spend' && (
            <motion.div
              key="spend"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {spendOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => spendCredits(option.title, option.credits)}
                  disabled={credits.totalCredits < option.credits}
                  className="bg-white border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <option.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 text-lg">{option.title}</div>
                      <div className="text-sm font-semibold text-slate-600">
                        {credits.totalCredits >= option.credits ? 'Available' : 'Insufficient credits'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-purple-600">-{option.credits}</div>
                    <div className="text-xs font-bold text-slate-500">credits</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">Credit Requests</h2>
              
              {/* Pending Requests */}
              {credits.pendingRequests.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Approval ({credits.pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {credits.pendingRequests.map((req) => (
                      <div key={req.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{req.activity}</div>
                          <div className="text-sm text-slate-600">{new Date(req.submittedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-orange-600 font-bold">+{req.credits} pending</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Requests */}
              {credits.approvedRequests.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Approved ({credits.approvedRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {credits.approvedRequests.map((req) => (
                      <div key={req.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{req.activity}</div>
                          <div className="text-sm text-slate-600">{new Date(req.approvedAt!).toLocaleDateString()}</div>
                        </div>
                        <div className="text-green-600 font-bold">+{req.credits}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <h2 className="text-2xl font-black text-slate-900 mb-6">Ward Leaderboard</h2>
              {leaderboard.map((ward) => (
                <div
                  key={ward.rank}
                  className={`rounded-2xl p-6 flex items-center justify-between ${
                    ward.wardName === wardName
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 shadow-lg'
                      : 'bg-white border-2 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl ${
                      ward.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      ward.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      ward.rank === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {ward.rank}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{ward.wardName}</div>
                      <div className="text-sm font-semibold text-slate-600">
                        {ward.totalCredits.toLocaleString()} credits • {ward.memberCount} members
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 font-bold text-lg ${
                    ward.improvement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-5 h-5 ${ward.improvement < 0 ? 'rotate-180' : ''}`} />
                    <span>{Math.abs(ward.improvement)}%</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
