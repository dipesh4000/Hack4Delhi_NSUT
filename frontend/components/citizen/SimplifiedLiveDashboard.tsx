"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Wind, Loader2, MapPin, Bell, Clock, Activity, Shield, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWAQIData } from "@/lib/waqi-service";
import { MOCK_WARD_DATA, WardData, getSeverity } from "@/lib/mock-data";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface SimplifiedWardData extends WardData {
  health_recommendations?: {
    general: string[];
    sensitive_groups: string[];
    outdoor_activities: string;
    mask_recommendation: string;
  };
  forecast?: Array<{
    date: string;
    aqi_forecast: number;
    category: string;
    recommendation: string;
  }>;
  trends?: {
    trend_direction: string;
    improvement_expected: boolean;
  };
}

export default function SimplifiedLiveDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<SimplifiedWardData>(MOCK_WARD_DATA);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState(MOCK_WARD_DATA.name);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedWard, setSelectedWard] = useState<string>('123');

  const fetchData = async (wardNumber: string) => {
    try {
      setLoading(true);
      
      // Try enhanced API first
      try {
        const response = await fetch(`${BACKEND_URL}/api/pollution/ward/${wardNumber}/analysis`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const pollutionData = result.data;
            
            const enhancedData: SimplifiedWardData = {
              ...MOCK_WARD_DATA,
              name: pollutionData.ward_info.ward_name,
              aqi: pollutionData.current_status.aqi,
              status: pollutionData.current_status.category.level,
              dominantPollutant: pollutionData.current_status.dominant_pollutant.toUpperCase(),
              health_recommendations: pollutionData.health_recommendations,
              forecast: pollutionData.optimal_times?.optimal_days || [],
              trends: pollutionData.trends,
              lastUpdated: new Date(pollutionData.ward_info.last_updated)
            };
            
            setData(enhancedData);
            setLocationName(pollutionData.ward_info.ward_name);
            setLastUpdated(new Date());
            return;
          }
        }
      } catch (error) {
        console.log('Enhanced API not available, using fallback');
      }

      // Fallback to location-based data
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
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

            const realData = await fetchWAQIData(latitude, longitude);
            if (realData) {
              setData({
                ...MOCK_WARD_DATA,
                ...realData,
                name: locationName,
                hourlyTrend: realData.hourlyTrend.length > 0 ? realData.hourlyTrend : MOCK_WARD_DATA.hourlyTrend,
                health_recommendations: generateHealthRecommendations(realData.aqi),
                forecast: generateForecast(realData.aqi),
                trends: { trend_direction: 'stable', improvement_expected: false }
              });
            }
          },
          (err) => {
            console.error("Location denied", err);
          }
        );
      }
    } catch (error) {
      console.error('Data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHealthRecommendations = (aqi: number) => ({
    general: [
      aqi > 200 ? 'Stay indoors as much as possible' : aqi > 150 ? 'Limit outdoor activities' : 'Air quality is acceptable',
      aqi > 150 ? 'Wear a mask when going outside' : 'Monitor air quality regularly',
      aqi > 200 ? 'Keep windows closed' : 'Ventilate your home during cleaner hours'
    ],
    sensitive_groups: [
      'People with asthma or heart conditions should avoid outdoor activities',
      'Children and elderly should stay indoors',
      'Pregnant women should take extra precautions'
    ],
    outdoor_activities: aqi > 200 ? 'avoid' : aqi > 100 ? 'limited' : 'allowed',
    mask_recommendation: aqi > 200 ? 'required' : aqi > 100 ? 'recommended' : 'optional'
  });

  const generateForecast = (currentAqi: number) => {
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const forecastAqi = currentAqi + (Math.random() - 0.5) * 50;
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        aqi_forecast: Math.max(50, Math.round(forecastAqi)),
        category: getSeverity(forecastAqi),
        recommendation: forecastAqi < 100 ? 'Good for outdoor activities' : 'Limit outdoor exposure'
      });
    }
    return forecast;
  };

  useEffect(() => {
    const userWard = localStorage.getItem('userWard') || '123';
    setSelectedWard(userWard);
    fetchData(userWard);

    const interval = setInterval(() => {
      fetchData(selectedWard);
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
        <p className="text-slate-500 font-medium">Loading air quality data...</p>
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
        {/* Top Row: Current Status */}
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
              Fine particles detected
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
                 data.health_recommendations?.mask_recommendation === 'recommended' ? '🟡' : '🟢'}
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

        {/* 7-Day Forecast */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">7-Day AQI Forecast</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Calendar className="w-3 h-3" />
              Weekly Outlook
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {(data.forecast || []).map((day, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div className="text-2xl font-black text-slate-900 mb-2">{day.aqi_forecast}</div>
                <div className={cn("inline-block px-2 py-1 rounded text-xs font-semibold", getSeverityColor(day.category))}>
                  {day.category}
                </div>
                <p className="text-xs text-slate-500 mt-2">{day.recommendation}</p>
              </div>
            ))}
          </div>
        </motion.div>

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
              {(data.health_recommendations?.general || []).map((rec, idx) => (
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
              {(data.health_recommendations?.sensitive_groups || []).map((rec, idx) => (
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
            <p>Updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </motion.div>

        {/* Quick Alerts */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Alert</h3>
            <Bell className="w-4 h-4 text-slate-300" />
          </div>
          <div className="space-y-4">
            {data.aqi > 200 ? (
              <div className="flex gap-4 p-3 rounded-2xl bg-red-50 border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-red-900 tracking-tight">High Pollution Alert</p>
                  <p className="text-[10px] text-red-600 font-medium mt-0.5">Stay indoors and wear masks outside.</p>
                </div>
              </div>
            ) : data.aqi > 100 ? (
              <div className="flex gap-4 p-3 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-orange-900 tracking-tight">Moderate Pollution</p>
                  <p className="text-[10px] text-orange-600 font-medium mt-0.5">Limit outdoor activities.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs font-bold text-green-600">Air quality is good today!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Best Times */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold">Best Times Today</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Morning</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {data.aqi < 100 ? 'Good' : 'Moderate'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Evening</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {data.aqi < 150 ? 'Moderate' : 'Poor'}
              </span>
            </div>
          </div>
          <div className="text-xs opacity-75 mt-4">
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