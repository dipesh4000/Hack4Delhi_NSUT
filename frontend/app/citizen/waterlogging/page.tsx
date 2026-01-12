"use client";

import { useState, useEffect } from 'react';
import { 
  Waves, 
  MapPin, 
  AlertTriangle, 
  AlertCircle,
  Clock,
  CheckCircle, 
  Activity, 
  Droplets, 
  BarChart3, 
  Wind, 
  Navigation,
  Trash2,
  Eye,
  Image as ImageIcon
} from 'lucide-react';


import { motion, AnimatePresence } from 'framer-motion';
import JalReportForm from '@/components/citizen/JalReportForm';
import GreenRouteTool from '@/components/citizen/GreenRouteTool';


interface Report {
  _id: string;
  id: number;
  wardId: number | string;
  wardName: string;
  severity: string;
  location: string;
  timestamp: string;
  status: string;
  verification?: {
    verified: boolean;
    confidence: number;
    source: string;
    sensorLevel: number;
  };
  estimatedDepth?: {
    cm: number;
    confidence: number;
  };
  jalNetra?: {
    photoUrl: string;
    tags: string[];
    confidence: number;
    isDrainage?: boolean;
    aiVerified: boolean;
    isWaterDetected: boolean;
    reason?: string;
  };
  photoUrl?: string;
}


interface Hotspot {
  roadName: string;
  location: string;
  date: string;
  frequency: string;
  source: string;
}

interface Alert {
  id: string;
  type: string;
  wardName: string;
  message: string;
  severity: string;
  timestamp: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function WaterloggingDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [climate, setClimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);


  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, hotspotsRes, climateRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/waterlogging/status`),
        fetch(`${BACKEND_URL}/api/waterlogging/delhi-police`),
        fetch(`${BACKEND_URL}/api/waterlogging/climate`)
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
        setAlerts(data.alerts || []);
      }
      if (hotspotsRes.ok) {
        const data = await hotspotsRes.json();
        setHotspots(data.data || []);
      }
      if (climateRes.ok) {
        const data = await climateRes.json();
        setClimate(data.climate);
      }
    } catch (error) {
      console.error("Error fetching waterlogging data:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/waterlogging/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Jal-Drishti</h1>
          </div>
          <p className="text-slate-500 font-medium">Real-time waterlogging intelligence & drainage health monitoring.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 group"
        >
          <Droplets className="w-5 h-5 group-hover:animate-bounce" />
          Report Waterlogging
        </button>
      </div>

      {/* Emergency Alerts Section */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 space-y-4"
          >
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-red-600 text-white p-6 rounded-3xl shadow-2xl shadow-red-600/30 flex items-center gap-6 border-4 border-red-500 animate-pulse">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Emergency Broadcast</span>
                    <span className="text-xs font-bold opacity-80">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h3 className="text-xl font-black">{alert.message}</h3>
                </div>
                <div className="hidden md:block">
                  <span className="px-4 py-2 bg-white text-red-600 rounded-xl font-black text-sm uppercase">Critical</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Hotspots & Navigation */}
        <div className="lg:col-span-1 space-y-8">
          {/* Authority Hotspots Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Authority Verified Hotspots
              </h2>
            </div>
            
            <div className="relative h-[400px] overflow-hidden">
              <motion.div 
                animate={{ y: [0, -1000] }}
                transition={{ 
                  duration: 30, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="space-y-4"
              >
                {/* Double the list for seamless loop */}
                {[...hotspots, ...hotspots].length > 0 ? [...hotspots, ...hotspots].map((spot, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{spot.roadName}</h4>
                      <p className="text-xs font-bold text-slate-500">{spot.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">
                          Freq: {spot.frequency}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Last Observed: {spot.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-red-600 uppercase bg-white px-2 py-1 rounded-lg border border-red-100">Verified</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 font-bold">Fetching authority data...</div>
                )}
              </motion.div>
              {/* Gradient Overlays for Fade Effect */}
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10" />
            </div>
          </div>

          {/* Climate Intelligence Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/20 relative overflow-hidden group mb-8"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Wind className="w-24 h-24 text-blue-600" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Climate Intelligence</h3>
                  <p className="text-sm text-slate-500">Live from Open-Meteo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AQI Index</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${climate?.aqi > 200 ? 'text-red-600' : climate?.aqi > 100 ? 'text-orange-500' : 'text-emerald-600'}`}>
                      {climate?.aqi || '---'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">US-AQI</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rain Risk</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${climate?.riskScore > 70 ? 'text-red-600' : climate?.riskScore > 30 ? 'text-orange-500' : 'text-blue-600'}`}>
                      {climate?.riskScore || '0'}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Temp</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {climate?.temp ? `${Math.round(climate.temp)}°C` : '---'}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Humidity</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {climate?.humidity ? `${climate.humidity}%` : '---'}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-xs text-blue-700 leading-relaxed">
                  {climate?.rain > 0 
                    ? `⚠️ Active rainfall of ${climate.rain}mm/hr detected. Drainage systems are under load.`
                    : climate?.riskScore > 40
                    ? `☁️ High probability of rain. Green-Route is prioritizing driest paths.`
                    : `✅ Weather conditions are stable. No immediate flood risk detected.`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Green-Route Tool */}
          <GreenRouteTool />

        </div>

        {/* Right Column: Reports Feed & Drainage */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                Recent Citizen Reports
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
              </div>
            </div>

            <div className="space-y-6">
              {reports.length > 0 ? reports.map((report) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={report._id} 
                  className="group p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-600/5 transition-all relative"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Photo Preview - Larger Size */}
                    <div className="w-full md:w-64 h-48 rounded-[2rem] bg-slate-200 overflow-hidden relative flex-shrink-0 shadow-inner">
                      {(report.photoUrl || report.jalNetra?.photoUrl) ? (
                        <img 
                          src={(report.photoUrl || report.jalNetra?.photoUrl || '').startsWith('http') 
                            ? (report.photoUrl || report.jalNetra?.photoUrl) 
                            : `${BACKEND_URL}${report.photoUrl || report.jalNetra?.photoUrl}`} 
                          alt="Waterlogging" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Droplets className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase">
                        {report.severity}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-2">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {report.verification?.verified && (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                            report.verification.source.includes('Authority') ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            {report.verification.source.includes('Authority') ? 'Authority Verified' : 'AI Verified'}
                          </span>
                        )}
                        {report.jalNetra?.aiVerified && report.jalNetra?.isWaterDetected ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Jal-Netra Vision
                          </span>
                        ) : report.jalNetra && !report.jalNetra.isWaterDetected ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-600 border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Rejected by AI
                          </span>
                        ) : null}
                        {report.jalNetra?.isDrainage && report.jalNetra?.isWaterDetected && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white flex items-center gap-1">
                            <Waves className="w-3 h-3" />
                            Drainage Issue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-black text-slate-900">{report.location}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(report.timestamp).toLocaleTimeString()}
                          </span>
                          <button 
                            onClick={() => handleDelete(report._id)}
                            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-6">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {report.wardName}
                        </span>
                        {report.estimatedDepth && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Activity className="w-4 h-4" />
                            Est. Depth: {report.estimatedDepth.cm}cm
                          </span>
                        )}
                      </div>

                      {report.verification?.verified && (
                        <p className="text-[10px] font-bold text-indigo-600 mt-2 italic">
                          {report.verification.source}
                        </p>
                      )}
                      {report.jalNetra && !report.jalNetra.isWaterDetected && (
                        <p className="text-[10px] font-bold text-red-500 mt-2 italic bg-red-50 p-2 rounded-lg border border-red-100">
                          AI Rejection: {report.jalNetra.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="p-12 text-center text-slate-400 font-bold">
                  No reports in your area yet.
                </div>
              )}
            </div>
          </div>

          {/* Drainage Health Card - Moved Below Reports */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Drainage Health Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'System Capacity', value: 84, color: 'blue', desc: 'Current load vs total volume' },
                { label: 'Flow Efficiency', value: 62, color: 'emerald', desc: 'Velocity of water discharge' },
                { label: 'Blockage Risk', value: 28, color: 'amber', desc: 'Probability of debris accumulation' }
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-black text-slate-900">{stat.label}</span>
                    <span className="text-sm font-black text-blue-600">{stat.value}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      className={`h-full bg-${stat.color}-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl"
            >
              <JalReportForm 
                wardName="Keshopur" 
                wardNumber="101" 
                onReportSuccess={() => {
                  setIsFormOpen(false);
                  fetchData();
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

