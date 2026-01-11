"use client";

import { Search, MapPin, X, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ward {
  ward_number: string;
  ward_name: string;
  zone: string;
  aqi: number;
}

interface WardSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (wardNumber: string, wardName: string) => void;
  currentWardNumber?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function WardSelector({ isOpen, onClose, onSelect, currentWardNumber }: WardSelectorProps) {
  const [query, setQuery] = useState("");
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchWards();
    }
  }, [isOpen]);

  const fetchWards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/pollution/wards`);
      const result = await response.json();
      if (result.success) {
        setWards(result.data.wards);
      } else {
        setError("Failed to load wards");
      }
    } catch (err) {
      setError("Network error. Please check if backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWards = wards.filter(ward => 
    ward.ward_name.toLowerCase().includes(query.toLowerCase()) ||
    ward.ward_number.includes(query) ||
    ward.zone.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10); // Limit to 10 results for performance

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Your Ward</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Project Data Integration</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, number or zone..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-sm text-slate-500 font-medium">Fetching wards from project data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 font-bold mb-2">⚠️ {error}</p>
                  <button onClick={fetchWards} className="text-blue-600 text-sm font-bold hover:underline">Try Again</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredWards.length > 0 ? (
                    filteredWards.map((ward) => (
                      <button
                        key={ward.ward_number}
                        onClick={() => {
                          onSelect(ward.ward_number, ward.ward_name);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                          currentWardNumber === ward.ward_number 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${
                            currentWardNumber === ward.ward_number ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 group-hover:text-blue-500'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900">{ward.ward_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Ward {ward.ward_number} • {ward.zone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900">AQI {ward.aqi}</p>
                          </div>
                          {currentWardNumber === ward.ward_number && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400 font-medium">No wards found matching "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Showing data from the integrated MCD pollution pipeline
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
