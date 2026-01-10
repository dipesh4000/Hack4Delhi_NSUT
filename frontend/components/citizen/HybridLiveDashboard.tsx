"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Wind, Loader2, MapPin, Bell, Clock, Activity, TrendingUp, Shield, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWAQIData } from "@/lib/waqi-service";
import { MOCK_WARD_DATA, WardData, getSeverity } from "@/lib/mock-data";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface EnhancedWardData extends WardData {
  pollution_sources?: {
    [key: string]: {
      contribution_percentage: number;
      confidence: number;
      primary_pollutants: string[];
    };
  };
  health_recommendations?: {
    general: string[];
    sensitive_groups: string[];
    outdoor_activities: string;
    mask_recommendation: string;
  };
  trends?: {
    trend_direction: string;
    avg_forecast: number;
    improvement_expected: boolean;
  };
}

export default function HybridLiveDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<EnhancedWardData>(MOCK_WARD_DATA);
  const [loading, setLoading] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [locationName, setLocationName] = useState(MOCK_WARD_DATA.name);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedWard, setSelectedWard] = useState<string>('123');

  const fetchEnhancedData = async (wardNumber: string) => {
    try {
      // Try to get enhanced pollution data
      const response = await fetch(`${BACKEND_URL}/api/pollution/ward/${wardNumber}/analysis`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const pollutionData = result.data;
          
          // Convert to our format
          const enhancedData: EnhancedWardData = {
            ...MOCK_WARD_DATA,
            name: pollutionData.ward_info.ward_name,
            aqi: pollutionData.current_status.aqi,
            status: pollutionData.current_status.category.level,
            dominantPollutant: pollutionData.current_status.dominant_pollutant.toUpperCase(),
            pollutants: [
              { name: "PM2.5", value: pollutionData.current_status.pollutant_levels.pm25, unit: "µg/m³", status: "High", change: "+5%" },
              { name: "PM10", value: pollutionData.current_status.pollutant_levels.pm10, unit: "µg/m³", status: "Moderate", change: "+2%" },
              { name: "NO2", value: pollutionData.current_status.pollutant_levels.no2, unit: "µg/m³", status: "Low", change: "-1%" },
              { name: "O3", value: pollutionData.current_status.pollutant_levels.o3, unit: "µg/m³", status: "Low", change: "+3%" },
              { name: "SO2", value: pollutionData.current_status.pollutant_levels.so2, unit: "µg/m³", status: "Low", change: "0%" },
              { name: "CO", value: pollutionData.current_status.pollutant_levels.co, unit: "mg/m³", status: "Low", change: "-2%" }
            ],
            pollution_sources: pollutionData.pollution_sources,
            health_recommendations: pollutionData.health_recommendations,
            trends: pollutionData.trends,
            lastUpdated: new Date(pollutionData.ward_info.last_updated)
          };
          
          setData(enhancedData);
          setUsingRealData(true);
          setLastUpdated(new Date());
          return;
        }
      }
      
      // Fallback to WAQI data
      await fetchWAQIFallback();
      
    } catch (error) {
      console.error('Enhanced data fetch failed:', error);
      await fetchWAQIFallback();
    }
  };

  const fetchWAQIFallback = async () => {
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Get location name
            try {
              const osmRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
              );
              const osmData = await osmRes.json();
              const address = osmData.address;
              const name = address.suburb || address.neighbourhood || address.residential || address.city_district || address.city;
              if (name) setLocationName(name);
            } catch (e) {
              console.error("Location name fetch failed", e);
            }

            // Get WAQI data
            const realData = await fetchWAQIData(latitude, longitude);
            if (realData) {
              setData({
                ...MOCK_WARD_DATA,
                ...realData,
                name: locationName,
                hourlyTrend: realData.hourlyTrend.length > 0 ? realData.hourlyTrend : MOCK_WARD_DATA.hourlyTrend
              });
              setUsingRealData(true);
            }
          },
          (err) => {
            console.error("Location denied", err);
            // Use mock data
          }
        );
      }
    } catch (error) {
      console.error('WAQI fallback failed:', error);
      // Use mock data as final fallback
    }
  };

  useEffect(() => {
    const userWard = localStorage.getItem('userWard') || '123';
    setSelectedWard(userWard);
    
    fetchEnhancedData(userWard).finally(() => {
      setLoading(false);
    });

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchEnhancedData(selectedWard);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedWard]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Good": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Moderate": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "Unhealthy": return "bg-orange-50 text-orange-600 border-orange-100";
      case "Severe": return "bg-red-50 text-red-600 border-red-100";
      case "Hazardous": return "bg-purple-50 text-purple-600 border-purple-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading live air quality data...</p>
      </div>
    );
  }

  const severity = getSeverity(data.aqi);

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
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{data.aqi}</span>
              <span className={cn("text-[10px] font-black mb-1 px-2 py-0.5 rounded-lg border uppercase tracking-widest", getSeverityColor(severity))}>
                {severity}
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (data.aqi / 500) * 100)}%` }}
                className={cn("h-full", 
                  data.aqi <= 50 ? "bg-emerald-500" : 
                  data.aqi <= 100 ? "bg-yellow-500" : 
                  data.aqi <= 200 ? "bg-orange-500" : "bg-red-500"
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
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{data.dominantPollutant || "PM2.5"}</span>
              <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                {data.trends?.trend_direction === 'improving' ? '📈' : data.trends?.trend_direction === 'worsening' ? '📉' : '➡️'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
              {data.pollutants.find(p => p.name === "PM2.5")?.value || 'N/A'} µg/m³ detected
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
              <span className="text-2xl">
                {data.health_recommendations?.mask_recommendation === 'required' ? '🔴' :
                 data.health_recommendations?.mask_recommendation === 'recommended' ? '🟡' :
                 data.health_recommendations?.mask_recommendation === 'recommended_for_sensitive' ? '🟠' : '🟢'}
              </span>
              <span className="text-sm font-black text-slate-900 capitalize">
                {data.health_recommendations?.mask_recommendation?.replace('_', ' ') || 
                 (data.aqi > 200 ? 'Required' : data.aqi > 100 ? 'Recommended' : 'Optional')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
              Outdoor: {data.health_recommendations?.outdoor_activities || (data.aqi > 200 ? 'Avoid' : 'Limited')}
            </p>
          </motion.div>
        </div>

        {/* Health Recommendations */}
        {data.health_recommendations && (
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
        )}

        {/* Pollution Sources */}
        {data.pollution_sources && (
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
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detailed Pollutants */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Pollutant Breakdown</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <MapPin className="w-3 h-3" />
              {locationName}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.pollutants.map((p) => (
              <div key={p.name} className="p-4 bg-slate-50 rounded-xl text-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{p.name}</h4>
                <p className="text-2xl font-black text-slate-900">{p.value || 'N/A'}</p>
                <p className="text-xs text-slate-400 mt-1">{p.unit}</p>
                <div className={cn("inline-block px-2 py-1 rounded text-xs font-semibold mt-2",
                  p.status === 'High' ? 'bg-red-100 text-red-700' :
                  p.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                )}>
                  {p.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-3 space-y-8">
        {/* Location Info */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Location</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">{locationName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Delhi, India</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            <p>Data Source: {usingRealData ? 'Live API' : 'Demo Mode'}</p>
            <p>Updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</h3>
            <Bell className="w-4 h-4 text-slate-300" />
          </div>
          <div className="space-y-4">
            {data.aqi > 200 && (
              <div className="flex gap-4 p-3 rounded-2xl bg-red-50 border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-red-900 tracking-tight">High Pollution Alert</p>
                  <p className="text-[10px] text-red-600 font-medium mt-0.5">Air quality is unhealthy. Limit outdoor activities.</p>
                </div>
              </div>
            )}
            {data.aqi > 100 && data.aqi <= 200 && (
              <div className="flex gap-4 p-3 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-orange-900 tracking-tight">Moderate Pollution</p>
                  <p className="text-[10px] text-orange-600 font-medium mt-0.5">Sensitive groups should limit outdoor exposure.</p>
                </div>
              </div>
            )}
            {data.aqi <= 100 && (
              <div className="text-center py-6">
                <p className="text-xs font-bold text-green-600">Air quality is acceptable</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trend Analysis */}
        {data.trends && (
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
                  <p className="text-xs text-green-700 font-medium">✅ Improvement expected</p>
                </div>
              )}
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
            Data refreshes automatically every 5 minutes from {usingRealData ? 'government monitoring stations' : 'demo sources'}.
          </p>
          <div className="text-xs opacity-75">
            Last update: {lastUpdated.toLocaleTimeString()}
          </div>
        </motion.div>
      </div>

      {/* Emergency Alert */}
      {data.aqi > 300 && (
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