"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, User, MapPin, Coins, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface CreditRequest {
  id: string;
  _id?: string;
  userId: string;
  activity: string;
  credits: number;
  proofImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  wardNumber: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function AuthorityCreditsPage() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/credits/pending`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const response = await fetch(`${BACKEND_URL}/api/credits/${action}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Authority Admin' })
      });

      if (response.ok) {
        setRequests(requests.filter(r => (r.id || r._id) !== id));
        alert(`Request ${action}d successfully!`);
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      alert(`Failed to ${action} request.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/authority" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Authority Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 rounded-3xl shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">Credit Approvals</h1>
                <p className="text-lg text-slate-600 font-medium">Review and approve citizen pollution reduction activities</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
              <div className="text-4xl font-black text-blue-600">{requests.length}</div>
              <div className="text-sm font-bold text-slate-500">Pending Requests</div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-slate-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">All Caught Up!</h2>
            <p className="text-slate-500 font-medium">There are no pending credit requests to review.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <motion.div
                key={request.id || request._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-100 flex flex-col lg:flex-row gap-8"
              >
                {/* Proof Image Preview */}
                <div className="lg:w-1/3 relative group">
                  <div 
                    className="aspect-video bg-slate-100 rounded-2xl overflow-hidden cursor-pointer relative"
                    onClick={() => setSelectedImage(request.proofImage)}
                  >
                    <Image 
                      src={`${BACKEND_URL}${request.proofImage}`} 
                      alt="Proof" 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-1">
                        <ImageIcon className="w-4 h-4" />
                        {request.activity.replace('_', ' ')}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">
                        {request.activity === 'public_transport' ? 'Public Transport Usage' :
                         request.activity === 'tree' ? 'Tree Plantation' :
                         request.activity === 'report' ? 'Pollution Reporting' : 'Carpooling'}
                      </h3>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                      <div className="text-2xl font-black text-blue-600">+{request.credits}</div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase text-center">Credits</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Citizen ID</p>
                        <p className="font-bold">{request.userId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Ward</p>
                        <p className="font-bold">Ward {request.wardNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Submitted</p>
                        <p className="font-bold">{new Date(request.submittedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleAction(request.id || request._id || '', 'approve')}
                      disabled={processingId === (request.id || request._id)}
                      className="flex-1 bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingId === (request.id || request._id) ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(request.id || request._id || '', 'reject')}
                      disabled={processingId === (request.id || request._id)}
                      className="flex-1 bg-red-50 text-red-600 border-2 border-red-100 font-black py-4 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingId === (request.id || request._id) ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-10"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative w-full h-full max-w-5xl">
                <Image 
                  src={`${BACKEND_URL}${selectedImage}`} 
                  alt="Proof Full" 
                  fill 
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              <button 
                className="absolute top-10 right-10 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="w-8 h-8" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
