"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Wind, Loader2, MapPin, Bell, Clock, Activity, TrendingUp, Shield, Users, Zap, ArrowDown, ArrowUp, Minus, Droplets, CloudFog, Factory } from "lucide-react";
import VideoAlertCard from './VideoAlertCard';
import SmartAlertSystem from './SmartAlertSystem';
import PollutionCharts from './PollutionCharts';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { fetchWAQIData } from "@/lib/waqi-service";
import { MOCK_WARD_DATA, WardData, getSeverity } from "@/lib/mock-data";
import { usePollution } from "@/context/PollutionContext";
import LocationStatusHeader from "./LocationStatusHeader";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

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
    description?: string;
  };
  dominantPollutant?: string;
  status?: string;
}

const PollutantCard = ({ p }: { p: any }) => {
  const getIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case 'PM2.5': return <Wind className="w-5 h-5" />;
      case 'PM10': return <CloudFog className="w-5 h-5" />;
      case 'NO2': return <Zap className="w-5 h-5" />;
      case 'SO2': return <Droplets className="w-5 h-5" />;
      case 'CO': return <Activity className="w-5 h-5" />;
      case 'O3': return <Factory className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getGradient = (status: string) => {
    switch (status) {
      case 'Severe':
      case 'Hazardous':
      case 'Very Poor':
      case 'Poor':
        return 'from-red-50 to-white border-red-100';
      case 'Moderate':
        return 'from-amber-50 to-white border-amber-100';
      case 'Good':
      default:
        return 'from-emerald-50 to-white border-emerald-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Severe':
      case 'Hazardous':
      case 'Very Poor':
      case 'Poor':
        return 'bg-red-100 text-red-700';
      case 'Moderate':
        return 'bg-amber-100 text-amber-700';
      case 'Good':
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  return (
    <div className={cn(
      "p-6 rounded-3xl border shadow-sm bg-gradient-to-br transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
      getGradient(p.status)
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-xl bg-white shadow-sm", 
          p.status === 'Severe' || p.status === 'Poor' || p.status === 'Very Poor' || p.status === 'Hazardous' ? 'text-red-600' :
          p.status === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'
        )}>
          {getIcon(p.name)}
        </div>
        <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", getStatusColor(p.status))}>
          {p.status}
        </div>
      </div>
      <div className="text-left">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{p.name}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900">{p.value || 'N/A'}</span>
          <span className="text-xs font-bold text-slate-400">{p.unit}</span>
        </div>
      </div>
    </div>
  );
};

export default function HybridLiveDashboard({ userName }: { userName: string }) {
  const { updatePollutionData } = usePollution();
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
              { name: "PM2.5", value: pollutionData.current_status.pollutant_levels.pm25, unit: "µg/m³", status: "Severe", change: "+5%" },
              { name: "PM10", value: pollutionData.current_status.pollutant_levels.pm10, unit: "µg/m³", status: "Moderate", change: "+2%" },
              { name: "NO2", value: pollutionData.current_status.pollutant_levels.no2, unit: "µg/m³", status: "Good", change: "-1%" },
              { name: "O3", value: pollutionData.current_status.pollutant_levels.o3, unit: "µg/m³", status: "Good", change: "+3%" },
              { name: "SO2", value: pollutionData.current_status.pollutant_levels.so2, unit: "µg/m³", status: "Good", change: "0%" },
              { name: "CO", value: pollutionData.current_status.pollutant_levels.co, unit: "mg/m³", status: "Good", change: "-2%" }
            ],
            pollution_sources: pollutionData.pollution_sources,
            health_recommendations: pollutionData.health_recommendations,
            trends: pollutionData.trends,
            lastUpdated: new Date(pollutionData.ward_info.last_updated).toLocaleTimeString()
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

  // Update global context for Chatbot
  useEffect(() => {
    updatePollutionData({
      aqi: data.aqi,
      location: data.name,
      status: getSeverity(data.aqi)
    });
  }, [data, updatePollutionData]);

  // Initial Data Fetch
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
      <LocationStatusHeader 
        locationName={locationName} 
        aqi={data.aqi} 
        severity={severity} 
        usingRealData={usingRealData} 
      />
      {/* Left Main Content */}
      <div className="lg:col-span-9 space-y-8">
        {/* Top Row: Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl relative overflow-hidden group">
            {/* 3D Background */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
               <img 
                 src={data.aqi > 200 ? "/assets/3d/polluted_air.png" : "/assets/3d/clean_air.png"} 
                 alt="Visual" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
            </div>

            <div className="relative z-10">
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
              {data.pollutants.find(p => p.name === (data.dominantPollutant || "PM2.5"))?.value || 'N/A'} {data.pollutants.find(p => p.name === (data.dominantPollutant || "PM2.5"))?.unit || 'µg/m³'} detected
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

        {/* Charts Section */}
        <PollutionCharts 
          hourlyTrend={data.hourlyTrend} 
          pollutants={data.pollutantComposition} 
        />

        {/* Smart Alert System */}
        <SmartAlertSystem data={data} />

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
          <div className="space-y-6">
            {/* Top Row: 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.pollutants.slice(0, 3).map((p) => (
                <PollutantCard key={p.name} p={p} />
              ))}
            </div>
            
            {/* Bottom Row: Centered Remaining Cards */}
            {data.pollutants.length > 3 && (
              <div className="flex flex-wrap justify-center gap-6">
                {data.pollutants.slice(3).map((p) => (
                  <div key={p.name} className="w-full md:w-[calc(33.333%-1rem)]">
                    <PollutantCard p={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        {/* Location Info */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{locationName}</h3>
              <p className="text-xs text-slate-500 font-medium">Monitoring Station</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
              <span className={cn("px-2 py-1 rounded-lg text-xs font-bold uppercase", getSeverityColor(severity))}>
                {severity}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase -translate-x-6">Coordinates</span>
              <span className="text-xs font-bold text-slate-900">28.61° N, 77.20° E</span>
            </div>
          </div>
        </motion.div>

        {/* Trend Analysis */}
        {data.trends && (
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Trend Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", 
                  data.trends.trend_direction === 'improving' ? 'bg-green-100 text-green-600' : 
                  data.trends.trend_direction === 'worsening' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                )}>
                  {data.trends.trend_direction === 'improving' ? <ArrowDown className="w-5 h-5" /> : 
                   data.trends.trend_direction === 'worsening' ? <ArrowUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    Air Quality is {data.trends.trend_direction}
                  </p>
                  <p className="text-xs text-slate-500">
                    Compared to last hour
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {data.trends.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Last Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </motion.div>
      </div>

      {/* Emergency Alert */}
      {/* Emergency Alert - Removed to avoid overlap with Chatbot */}
      {/* {data.aqi > 300 && (
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
      )} */}
    </motion.div>
  );
}