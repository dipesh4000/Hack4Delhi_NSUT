"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Wind, Loader2, MapPin, Bell, Clock, Activity, TrendingUp, Shield, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollutionData {
  ward_info: {
    ward_number: string;
    ward_name: string;
    zone: string;
    last_updated: string;
  };
  current_status: {
    aqi: number;
    category: {
      level: string;
      color: string;
      category: string;
    };
    dominant_pollutant: string;
    pollutant_levels: {
      pm25: number;
      pm10: number;
      no2: number;
      o3: number;
      so2: number;
      co: number;
    };
  };
  pollution_sources: {
    [key: string]: {
      contribution_percentage: number;
      confidence: number;
      primary_pollutants: string[];
    };
  };
  health_recommendations: {
    general: string[];
    sensitive_groups: string[];
    outdoor_activities: string;
    mask_recommendation: string;
  };
  optimal_times: {
    optimal_days: Array<{
      date: string;
      aqi_forecast: number;
      category: string;
      recommendation: string;
    }>;
    best_day: any;
    total_good_days: number;
  };
  trends: {
    current_aqi: number;
    trend_direction: string;
    avg_forecast: number;
    improvement_expected: boolean;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function LiveDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<PollutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string>('123');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPollutionData = async (wardNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/pollution/ward/${wardNumber}/analysis`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pollution data');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching pollution data:', err);
      setError('Unable to connect to pollution monitoring system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user's ward from localStorage or use default
    const userWard = localStorage.getItem('userWard') || '123';
    setSelectedWard(userWard);
    fetchPollutionData(userWard);

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchPollutionData(selectedWard);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedWard]);

  const getSeverityColor = (category: string) => {
    switch (category) {
      case "GOOD": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "MODERATE": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "UNHEALTHY_SENSITIVE": return "bg-orange-50 text-orange-600 border-orange-100";
      case "UNHEALTHY": return "bg-red-50 text-red-600 border-red-100";
      case "VERY_UNHEALTHY": return "bg-purple-50 text-purple-600 border-purple-100";
      case "HAZARDOUS": return "bg-gray-50 text-gray-600 border-gray-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getMaskIcon = (recommendation: string) => {
    switch (recommendation) {
      case "required": return "🔴";
      case "recommended": return "🟡";
      case "recommended_for_sensitive": return "🟠";
      default: return "🟢";
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "improving": return "📈";
      case "worsening": return "📉";
      default: return "➡️";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading real-time pollution data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-red-500 font-medium">{error || 'No data available'}</p>
        <button 
          onClick={() => fetchPollutionData(selectedWard)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Left Main Content */}
      <div className="lg:col-span-9 space-y-8">
        {/* Top Row: Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current AQI</h3>
              <div className="p-2 bg-blue-50 rounded-xl">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{data.current_status.aqi}</span>
              <span className={cn("text-[10px] font-black mb-1 px-2 py-0.5 rounded-lg border uppercase tracking-widest", getSeverityColor(data.current_status.category.category))}>
                {data.current_status.category.level}
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (data.current_status.aqi / 500) * 100)}%` }}
                className={cn("h-full", 
                  data.current_status.aqi <= 50 ? "bg-emerald-500" : 
                  data.current_status.aqi <= 100 ? "bg-yellow-500" : 
                  data.current_status.aqi <= 200 ? "bg-orange-500" : "bg-red-500"
                )}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Pollutant</h3>
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Wind className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{data.current_status.dominant_pollutant.toUpperCase()}</span>
              <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                {getTrendIcon(data.trends.trend_direction)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
              {data.current_status.pollutant_levels[data.current_status.dominant_pollutant as keyof typeof data.current_status.pollutant_levels]} µg/m³
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mask Status</h3>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMaskIcon(data.health_recommendations.mask_recommendation)}</span>
              <span className="text-sm font-black text-slate-900 capitalize">
                {data.health_recommendations.mask_recommendation.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
              Outdoor: {data.health_recommendations.outdoor_activities}
            </p>
          </motion.div>
        </div>

        {/* Health Recommendations */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Health Recommendations</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Users className="w-3 h-3" />
              Personal Advice
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700">General Population</h4>
              {data.health_recommendations.general.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-blue-900 font-medium">{rec}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700">Sensitive Groups</h4>
              {data.health_recommendations.sensitive_groups.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    ⚠️
                  </div>
                  <p className="text-sm text-orange-900 font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pollution Sources */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Pollution Sources</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              AI Analysis
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.pollution_sources).map(([source, details]) => (
              <div key={source} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-slate-900 capitalize">{source.replace('_', ' ')}</h4>
                  <span className="text-xs font-bold text-blue-600">{details.contribution_percentage}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${details.contribution_percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Confidence: {Math.round(details.confidence * 100)}%
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {details.primary_pollutants.map(pollutant => (
                    <span key={pollutant} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {pollutant.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Pollutants */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Pollutant Levels</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <MapPin className="w-3 h-3" />
              {data.ward_info.ward_name}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.current_status.pollutant_levels).map(([pollutant, value]) => (
              <div key={pollutant} className="p-4 bg-slate-50 rounded-xl text-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{pollutant}</h4>
                <p className="text-2xl font-black text-slate-900">{value || 'N/A'}</p>
                <p className="text-xs text-slate-400 mt-1">µg/m³</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-3 space-y-8">
        {/* Location Info */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Ward</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">{data.ward_info.ward_name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.ward_info.zone}</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            <p>Ward #{data.ward_info.ward_number}</p>
            <p>Updated: {new Date(data.ward_info.last_updated).toLocaleTimeString()}</p>
          </div>
        </motion.div>

        {/* Trend Indicator */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trend Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Direction</span>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold", 
                data.trends.trend_direction === 'improving' ? 'bg-green-100 text-green-700' :
                data.trends.trend_direction === 'worsening' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              )}>
                {data.trends.trend_direction}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Forecast Avg</span>
              <span className="text-lg font-black text-slate-900">{data.trends.avg_forecast}</span>
            </div>
            {data.trends.improvement_expected && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-green-700 font-medium">✅ Improvement expected in coming days</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Optimal Times */}
        {data.optimal_times.optimal_days.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Best Days Ahead</h3>
            <div className="space-y-3">
              {data.optimal_times.optimal_days.slice(0, 3).map((day, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-green-900">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-xs text-green-600">{day.category}</p>
                  </div>
                  <span className="text-lg font-black text-green-700">{day.aqi_forecast}</span>
                </div>
              ))}
              <p className="text-xs text-slate-500 text-center mt-4">
                {data.optimal_times.total_good_days} good days in forecast
              </p>
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold">Live Monitoring</h3>
          </div>
          <p className="text-blue-100 text-xs mb-4">
            Data refreshes automatically every 5 minutes from government monitoring stations.
          </p>
          <div className="text-xs opacity-75">
            Last update: {lastUpdated.toLocaleTimeString()}
          </div>
        </motion.div>
      </div>

      {/* Emergency Alert */}
      {data.current_status.aqi > 300 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-8 right-8 z-50 bg-red-600 text-white p-4 rounded-2xl shadow-2xl max-w-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm mb-1">Hazardous Air Quality!</h4>
              <p className="text-xs text-red-100">Stay indoors and avoid all outdoor activities.</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}