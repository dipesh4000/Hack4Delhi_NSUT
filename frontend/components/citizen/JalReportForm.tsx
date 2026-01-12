"use client";

import { useState } from 'react';
import { Droplets, MapPin, AlertTriangle, CheckCircle, Loader2, Send, Camera, Image as ImageIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

import { motion, AnimatePresence } from 'framer-motion';


interface JalReportFormProps {
  wardName?: string;
  wardNumber?: string;
  onReportSuccess?: () => void;
}

const SEVERITY_LEVELS = [
  { id: 'Ankle Deep', label: 'Ankle Deep', color: 'bg-yellow-500', icon: '💧' },
  { id: 'Knee Deep', label: 'Knee Deep', color: 'bg-orange-500', icon: '🌊' },
  { id: 'Waist Deep', label: 'Waist Deep', color: 'bg-red-500', icon: '🚨' },
  { id: 'Hazardous', label: 'Hazardous', color: 'bg-purple-600', icon: '⚠️' },
];

export default function JalReportForm({ wardName: initialWardName, wardNumber: initialWardNumber, onReportSuccess }: JalReportFormProps) {
  const { user } = useUser();
  const [location, setLocation] = useState('');

  const [severity, setSeverity] = useState('');
  const [wardNumber, setWardNumber] = useState(initialWardNumber || '');
  const [wardName, setWardName] = useState(initialWardName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [credits, setCredits] = useState<number | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!severity) {
      setError('Please select severity level');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalPhotoUrl = photo;

      // If there's a file to upload, do it first
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/waterlogging/upload`, {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          finalPhotoUrl = uploadData.url;
        } else {
          throw new Error(uploadData.message || 'Photo upload failed');
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/waterlogging/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          wardId: wardNumber || 'Unknown',
          wardName: wardName || 'Unknown Ward',
          severity,
          location,
          photoUrl: finalPhotoUrl
        })

      });


      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (data.creditsAwarded) setCredits(data.creditsAwarded);
        if (onReportSuccess) onReportSuccess();
        setTimeout(() => {
          setSuccess(false);
          setLocation('');
          setSeverity('');
          setPhoto(null);
          setCredits(null);
        }, 5000);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };





  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-blue-100 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50" />
      
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Jal-Report</h3>
          <p className="text-sm text-slate-500 font-medium">Report waterlogging in your area</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 border-2 border-green-100 rounded-3xl p-8 text-center"
          >
            <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
              <CheckCircle className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Intelligence Received!</h3>
            <p className="text-sm font-bold text-slate-600 mb-4">
              Your report has been logged and verified by our AI engine.
            </p>
            {credits && (
              <div className="bg-white rounded-2xl p-4 border border-green-200 inline-block">
                <p className="text-xs font-black text-green-600 uppercase">Jal-Mitra Reward</p>
                <p className="text-2xl font-black text-slate-900">+{credits} Credits</p>
              </div>
            )}
          </motion.div>

        ) : (
          <form key="form" onSubmit={handleSubmit} className="space-y-5 relative">
            {/* Ward Info Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ward Number</label>
                <input
                  type="text"
                  value={wardNumber}
                  onChange={(e) => setWardNumber(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-semibold transition-all bg-slate-50 focus:bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ward Name</label>
                <input
                  type="text"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  placeholder="e.g. Rohini"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-semibold transition-all bg-slate-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Specific Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near Metro Pillar 124, Main Road"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-semibold transition-all bg-slate-50 focus:bg-white"
              />
            </div>


            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Water Level Severity
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SEVERITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setSeverity(level.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      severity === level.id
                        ? `border-blue-500 bg-blue-50 shadow-md scale-105`
                        : 'border-slate-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <span className={`text-xs font-black ${severity === level.id ? 'text-blue-700' : 'text-slate-600'}`}>
                      {level.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>



            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Photo Evidence (AI Analysis)</label>
              <div 
                onClick={() => document.getElementById('photo-upload')?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  photo ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <input 
                  id="photo-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden"
                />
                {photo ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-black uppercase">Click to Change</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Click to upload photo for AI verification</span>
                  </>
                )}
              </div>
            </div>


            {error && (
              <p className="text-red-500 text-xs font-bold text-center">{error}</p>
            )}


            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Jal-Report
                </>
              )}
            </button>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
