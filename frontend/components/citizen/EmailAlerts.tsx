"use client";

import { useState } from 'react';
import { Mail, Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailAlertsProps {
  wardName: string;
  wardNumber: string;
}

export default function EmailAlerts({ wardName, wardNumber }: EmailAlertsProps) {
  const [email, setEmail] = useState('');
  const [aqiThreshold, setAqiThreshold] = useState(200);
  const [frequency, setFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use relative URL to avoid CORS issues
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/alerts/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          wardNumber,
          wardName,
          aqiThreshold,
          frequency,
          alertTypes: ['aqi_high', 'pollution_spike', 'health_advisory']
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully subscribed! You'll receive alerts when AQI exceeds ${aqiThreshold}.`);
        setIsSubscribed(true);
        
        // Send welcome email
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/alerts/send-welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, wardName })
        });
      } else {
        setError(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/alerts/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wardNumber })
      });

      if (response.ok) {
        setSuccess('Successfully unsubscribed from alerts.');
        setIsSubscribed(false);
        setEmail('');
      } else {
        setError('Failed to unsubscribe. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl p-6 shadow-xl border-2 border-indigo-100"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500 rounded-2xl">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Email Pollution Alerts</h3>
          <p className="text-sm text-slate-500 font-medium">Get notified when air quality deteriorates</p>
        </div>
      </div>

      {!isSubscribed ? (
        <form onSubmit={handleSubscribe} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-semibold"
            />
          </div>

          {/* AQI Threshold */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Alert When AQI Exceeds: <span className="text-indigo-600">{aqiThreshold}</span>
            </label>
            <input
              type="range"
              value={aqiThreshold}
              onChange={(e) => setAqiThreshold(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              min="50"
              max="400"
              step="50"
            />
            <div className="flex justify-between text-xs text-slate-500 font-semibold mt-1">
              <span>50 (Good)</span>
              <span>200 (Poor)</span>
              <span>400 (Severe)</span>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Alert Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`px-4 py-3 rounded-xl font-bold capitalize transition-all ${
                    frequency === freq
                      ? 'bg-indigo-500 text-white shadow-lg scale-105'
                      : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Ward Info */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
            <p className="text-sm font-bold text-indigo-900">
              📍 Monitoring: <span className="text-indigo-600">{wardName}</span>
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              You'll receive alerts specific to this ward
            </p>
          </div>

          {/* Subscribe Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                Subscribe to Alerts
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Subscription Active */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="font-black text-green-900">Subscription Active</h4>
            </div>
            <p className="text-sm font-semibold text-green-700">
              Alerts will be sent to: <span className="font-black">{email}</span>
            </p>
            <p className="text-sm font-semibold text-green-700 mt-1">
              Threshold: AQI &gt; {aqiThreshold} | Frequency: {frequency}
            </p>
          </div>

          {/* Alert Types */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
            <h4 className="font-black text-slate-900 mb-3">You'll Receive Alerts For:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-indigo-600">✓</span>
                High AQI levels (above {aqiThreshold})
              </li>
              <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-indigo-600">✓</span>
                Sudden pollution spikes
              </li>
              <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-indigo-600">✓</span>
                Health advisories and recommendations
              </li>
              <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-indigo-600">✓</span>
                MCD pollution control measures
              </li>
            </ul>
          </div>

          {/* Unsubscribe Button */}
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Unsubscribe'}
          </button>
        </div>
      )}

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-green-800">{success}</p>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Note */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800">
          💡 <strong>Tip:</strong> You can update your preferences anytime by unsubscribing and subscribing again with new settings.
        </p>
      </div>
    </motion.div>
  );
}
