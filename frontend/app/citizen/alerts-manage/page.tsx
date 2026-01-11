"use client";

import { useState } from 'react';
import { Mail, Bell, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePollution } from '@/context/PollutionContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function AlertsManagementPage() {
  const { pollutionData } = usePollution();
  const wardName = pollutionData?.name || 'Your Ward';
  const wardNumber = pollutionData?.id?.replace('ward-', '') || '123';

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
      const response = await fetch(`${BACKEND_URL}/api/alerts/subscribe`, {
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
        await fetch(`${BACKEND_URL}/api/alerts/send-welcome`, {
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
      const response = await fetch(`${BACKEND_URL}/api/alerts/unsubscribe`, {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/citizen" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Email Pollution Alerts</h1>
              <p className="text-lg text-slate-600 font-medium">Get notified when air quality deteriorates in your ward</p>
            </div>
          </div>
        </div>

        {/* Current Ward Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Monitoring Ward</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{wardName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-600">Current AQI</p>
              <p className="text-4xl font-bold text-slate-900">{pollutionData?.aqi || '—'}</p>
            </div>
          </div>
        </div>

        {!isSubscribed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">Subscribe to Alerts</h2>
            
            <form onSubmit={handleSubscribe} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-semibold text-lg"
                />
              </div>

              {/* AQI Threshold */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Alert When AQI Exceeds: <span className="text-blue-600 text-xl">{aqiThreshold}</span>
                </label>
                <input
                  type="range"
                  value={aqiThreshold}
                  onChange={(e) => setAqiThreshold(parseInt(e.target.value))}
                  className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  min="50"
                  max="400"
                  step="50"
                />
                <div className="flex justify-between text-sm text-slate-500 font-semibold mt-2">
                  <span>50 (Good)</span>
                  <span>200 (Poor)</span>
                  <span>400 (Severe)</span>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Alert Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`px-6 py-4 rounded-xl font-bold capitalize transition-all ${
                        frequency === freq
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscribe Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Bell className="w-6 h-6" />
                    Subscribe to Alerts
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Subscription Active */}
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <h3 className="text-3xl font-black text-green-900">Subscription Active</h3>
              </div>
              <p className="text-lg font-semibold text-green-700">
                Alerts will be sent to: <span className="font-black">{email}</span>
              </p>
              <p className="text-lg font-semibold text-green-700 mt-2">
                Threshold: AQI &gt; {aqiThreshold} | Frequency: {frequency}
              </p>
            </div>

            {/* Alert Types */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg">
              <h4 className="text-2xl font-black text-slate-900 mb-6">You'll Receive Alerts For:</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-lg font-semibold text-slate-700">
                  <span className="text-blue-600 text-2xl">✓</span>
                  High AQI levels (above {aqiThreshold})
                </li>
                <li className="flex items-center gap-3 text-lg font-semibold text-slate-700">
                  <span className="text-blue-600 text-2xl">✓</span>
                  Sudden pollution spikes
                </li>
                <li className="flex items-center gap-3 text-lg font-semibold text-slate-700">
                  <span className="text-blue-600 text-2xl">✓</span>
                  Health advisories and recommendations
                </li>
                <li className="flex items-center gap-3 text-lg font-semibold text-slate-700">
                  <span className="text-blue-600 text-2xl">✓</span>
                  MCD pollution control measures
                </li>
              </ul>
            </div>

            {/* Unsubscribe Button */}
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full bg-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Processing...' : 'Unsubscribe'}
            </button>
          </motion.div>
        )}

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start gap-4"
            >
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-lg font-semibold text-green-800">{success}</p>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4"
            >
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-lg font-semibold text-red-800">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <p className="text-sm font-semibold text-blue-800">
            💡 <strong>Tip:</strong> You can update your preferences anytime by unsubscribing and subscribing again with new settings.
          </p>
        </div>
      </div>
    </div>
  );
}
