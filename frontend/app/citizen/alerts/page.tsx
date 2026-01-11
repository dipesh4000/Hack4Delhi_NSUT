
"use client";

import { useState, useEffect } from 'react';
import { MOCK_WARD_DATA, WardData } from "@/lib/mock-data";
import { Bell, Sparkles, AlertTriangle, Activity, Wind, Thermometer, Car, Filter, Clock } from "lucide-react";
import { getActiveAlerts } from "@/lib/alert-rules";
import { AlertAnalysisResponse } from "@/lib/grok";
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function AlertsPage() {
  const [wardData, setWardData] = useState<WardData>(MOCK_WARD_DATA);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AlertAnalysisResponse | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Fetch real ward data
  useEffect(() => {
    const fetchWardData = async () => {
      try {
        const userWard = localStorage.getItem('userWard') || '123';
        const response = await fetch(`${BACKEND_URL}/api/pollution/ward/${userWard}/analysis`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const pollutionData = result.data;
            
            // Convert backend data to WardData format
            const realWardData: WardData = {
              ...MOCK_WARD_DATA,
              id: `ward-${pollutionData.ward_info.ward_number}`,
              name: pollutionData.ward_info.ward_name,
              aqi: pollutionData.current_status.aqi,
              pollutants: [
                { name: "PM2.5", value: pollutionData.current_status.pollutant_levels.pm25, unit: "µg/m³", status: "Very Poor" },
                { name: "PM10", value: pollutionData.current_status.pollutant_levels.pm10, unit: "µg/m³", status: "Very Poor" },
                { name: "NO₂", value: pollutionData.current_status.pollutant_levels.no2, unit: "µg/m³", status: "Good" },
                { name: "SO₂", value: pollutionData.current_status.pollutant_levels.so2, unit: "µg/m³", status: "Good" },
                { name: "O₃", value: pollutionData.current_status.pollutant_levels.o3, unit: "µg/m³", status: "Good" },
                { name: "CO", value: pollutionData.current_status.pollutant_levels.co, unit: "mg/m³", status: "Good" },
              ]
            };
            
            setWardData(realWardData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ward data:', error);
        // Keep using MOCK_WARD_DATA as fallback
      }
    };

    fetchWardData();
  }, []);

  // Fetch AI analysis
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        // Extract pollutant values from current ward data
        const pm25 = wardData.pollutants.find(p => p.name === "PM2.5")?.value || 0;
        const no2 = wardData.pollutants.find(p => p.name === "NO₂")?.value || 0;
        const so2 = wardData.pollutants.find(p => p.name === "SO₂")?.value || 0;

        const response = await fetch('/api/ai/analyze-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aqi: wardData.aqi,
            pm25: pm25,
            no2: no2,
            so2: so2,
            wind: 12, // Mock wind speed
            temp: 28, // Mock temp
            traffic: 'High', // Mock traffic
            location: wardData.name,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI analysis', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, [wardData]);

  const dynamicAlerts = getActiveAlerts(wardData);
  const filteredAlerts = filterSeverity === 'all' 
    ? dynamicAlerts 
    : dynamicAlerts.filter(alert => alert.severity === filterSeverity);


  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 animate-pulse">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Pollution Alerts</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Stay updated with critical air quality warnings and actionable advice for your ward.
          </p>
        </motion.div>

        {/* AI Insight Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.7rem] p-8 sm:p-10 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-7 h-7 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Generated Insight</h2>
                <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
                  <Clock size={14} />
                  Powered by Grok • Real-time Analysis
                </p>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-white/20 rounded-xl w-3/4"></div>
                <div className="h-5 bg-white/20 rounded-xl w-1/2"></div>
                <div className="h-24 bg-white/20 rounded-2xl w-full mt-6"></div>
              </div>
            ) : aiAnalysis ? (
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-300" />
                      <span className="font-bold text-yellow-300 uppercase tracking-wider text-sm">
                        {aiAnalysis.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold leading-tight mb-3">
                      {aiAnalysis.shortAlert}
                    </h3>
                    <p className="text-blue-100 leading-relaxed text-lg">
                      {aiAnalysis.cause}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-xl flex items-center gap-2 border border-white/10">
                      <Wind size={18} />
                      <span className="text-sm font-semibold">12 km/h Wind</span>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-xl flex items-center gap-2 border border-white/10">
                      <Thermometer size={18} />
                      <span className="text-sm font-semibold">28°C Temp</span>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-xl flex items-center gap-2 border border-white/10">
                      <Car size={18} />
                      <span className="text-sm font-semibold">High Traffic</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-5"
                >
                  <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-300">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Activity size={20} /> Health Impact
                    </h4>
                    <p className="text-sm text-blue-50 leading-relaxed">
                      {aiAnalysis.healthImpact}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm p-6 rounded-2xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                    <h4 className="font-bold text-lg mb-3 text-green-100 flex items-center gap-2">
                      <Sparkles size={20} /> Recommended Action
                    </h4>
                    <p className="text-sm text-green-50 leading-relaxed">
                      {aiAnalysis.recommendation}
                    </p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-10 text-blue-200">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Unable to generate AI analysis at the moment.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Filter by Severity:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'Critical', 'Warning', 'Info'].map((severity) => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  filterSeverity === severity
                    ? severity === 'Critical' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' :
                      severity === 'Warning' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                      severity === 'Info' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                      'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {severity === 'all' ? 'All' : severity}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Alerts Grid Section */}
        {filteredAlerts.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 px-2">
              Active Ward Alerts ({filteredAlerts.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className={`group relative p-6 rounded-3xl border-t-8 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 flex flex-col h-full ${
                      alert.severity === "Critical"
                        ? "border-t-red-500 hover:border-red-600"
                        : alert.severity === "Warning"
                        ? "border-t-orange-500 hover:border-orange-600"
                        : "border-t-blue-500 hover:border-blue-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                        alert.severity === "Critical" ? "bg-red-100 text-red-600" :
                        alert.severity === "Warning" ? "bg-orange-100 text-orange-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        <alert.icon size={28} strokeWidth={2.5} />
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                         alert.severity === "Critical" ? "bg-red-100 text-red-700" :
                         alert.severity === "Warning" ? "bg-orange-100 text-orange-700" :
                         "bg-blue-100 text-blue-700"
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-xl text-slate-900 tracking-tight mb-3 leading-tight">{alert.title}</h3>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed flex-grow mb-6">{alert.message}</p>
                    
                    <div className="mt-auto pt-6 border-t-2 border-slate-100">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          alert.severity === "Critical" ? "bg-red-50 text-red-700" :
                          alert.severity === "Warning" ? "bg-orange-50 text-orange-700" :
                          "bg-blue-50 text-blue-700"
                        }`}>
                          Action
                        </span>
                        <span className="text-sm font-bold text-slate-800 leading-snug">{alert.action}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border-2 border-dashed border-slate-200"
          >
            <Bell className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <p className="text-2xl font-black text-slate-500 tracking-tight mb-2">No active alerts at this time.</p>
            <p className="text-slate-400 font-medium">Check back later for updates.</p>
          </motion.div>
        )}
      </div>
  );
}
