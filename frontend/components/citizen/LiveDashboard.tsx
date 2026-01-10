"use client";

import { useState, useEffect } from "react";
import { fetchWAQIData } from "@/lib/waqi-service";
import { MOCK_WARD_DATA, WardData, getSeverity } from "@/lib/mock-data";
import AQICard from "@/components/citizen/AQICard";
import AQITrendChart from "@/components/citizen/AQITrendChart";
import PollutantSourceChart from "@/components/citizen/PollutantSourceChart";
import ImpactActionCard from "@/components/citizen/ImpactActionCard";
import ContextualAdviceCard from "@/components/citizen/ContextualAdviceCard";
import HealthAdvisoryCard from "@/components/citizen/HealthAdvisoryCard";
import PollutantCard from "@/components/citizen/PollutantCard";
import VideoAlertModal from "@/components/citizen/VideoAlertModal";
import PollutantRadarChart from "@/components/citizen/PollutantRadarChart";
import WeeklyComparisonChart from "@/components/citizen/WeeklyComparisonChart";
import AQISeverityRing from "@/components/citizen/AQISeverityRing";
import LocationStatusHeader from "@/components/citizen/LocationStatusHeader";
import AlertBannerStack from "@/components/citizen/AlertBannerStack";
import DynamicActionList from "@/components/citizen/DynamicActionList";
import OptimalTimeIndicator from "@/components/citizen/OptimalTimeIndicator";
import AreaSelector from "@/components/citizen/AreaSelector";
import { cn } from "@/lib/utils";
import { AlertTriangle, Wind, Loader2, MapPin, Bell, Sparkles, ShieldCheck, Activity, Info, TrendingUp, Clock, Search } from "lucide-react";
import Link from "next/link";
import PollutionContributionChart from "@/components/citizen/PollutionContributionChart";
import { motion } from "framer-motion";

export default function LiveDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<WardData>(MOCK_WARD_DATA);
  const [loading, setLoading] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [locationName, setLocationName] = useState(MOCK_WARD_DATA.name);
  const [showVideoAlert, setShowVideoAlert] = useState(false);
  const [showAreaSelector, setShowAreaSelector] = useState(false);

  const updateDataForLocation = async (lat: number, lon: number, name?: string) => {
    setLoading(true);
    const realData = await fetchWAQIData(lat, lon, name);
    if (realData) {
      setData({
        ...MOCK_WARD_DATA,
        ...realData,
        name: name || realData.name,
        hourlyTrend: realData.hourlyTrend.length > 0 ? realData.hourlyTrend : MOCK_WARD_DATA.hourlyTrend
      });
      setUsingRealData(true);
      if (name) setLocationName(name);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        let name: string | undefined;
        
        try {
           const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          const osmData = await osmRes.json();
          const address = osmData.address;
          name = address.suburb || address.neighbourhood || address.residential || address.city_district || address.city;
          if (name) setLocationName(name);
        } catch (e) {
          console.error("OSM failed", e);
        }

        updateDataForLocation(latitude, longitude, name);
      },
      (err) => {
        console.error("Location denied", err);
        setLoading(false);
      }
    );
  }, []);

  const handleAreaSelect = async (area: string) => {
    // For demo, we'll just use the keyword search in WAQI
    // In a real app, we'd geocode the area name first
    setLoading(true);
    const realData = await fetchWAQIData(28.6139, 77.2090, area); // Default to Delhi center if geocoding missing
    if (realData) {
      setData({
        ...MOCK_WARD_DATA,
        ...realData,
        name: area,
        hourlyTrend: realData.hourlyTrend.length > 0 ? realData.hourlyTrend : MOCK_WARD_DATA.hourlyTrend
      });
      setUsingRealData(true);
      setLocationName(area);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && data.aqi > 200) {
      const alertKey = `videoAlertSeen_${data.aqi > 300 ? "severe" : "poor"}_${new Date().toDateString()}`;
      const hasSeenToday = localStorage.getItem(alertKey);
      
      if (!hasSeenToday) {
        const timer = setTimeout(() => {
          setShowVideoAlert(true);
          localStorage.setItem(alertKey, "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, data.aqi]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Fetching live air quality for your location...</p>
      </div>
    );
  }

  const severity = getSeverity(data.aqi);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Good": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Moderate": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "Unhealthy": return "bg-orange-50 text-orange-600 border-orange-100";
      case "Severe": return "bg-red-50 text-red-600 border-red-100";
      case "Hazardous": return "bg-purple-50 text-purple-600 border-purple-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
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
              <span className="text-4xl font-black text-slate-900 tracking-tighter">PM2.5</span>
              <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Fine Particles</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
              {data.pollutants.find(p => p.name === "PM2.5")?.value} µg/m³ detected
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Time Out</h3>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <OptimalTimeIndicator aqi={data.aqi} />
          </motion.div>
        </div>

        {/* Middle Row: Trend + Support */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <motion.div variants={itemVariants} className="md:col-span-8 bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly AQI Trend</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Based on last 7 days</p>
              </div>
              <div className="flex gap-2">
                {["Week", "Month", "Year"].map(t => (
                  <button key={t} className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", 
                    t === "Week" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:bg-white")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <WeeklyComparisonChart data={data.hourlyTrend.map(h => ({ day: h.time, aqi: h.aqi }))} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-600/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <h3 className="text-xl font-black tracking-tight mb-4">Urgent Support</h3>
            <p className="text-blue-100 text-xs font-medium leading-relaxed mb-6">
              Air quality is currently <span className="font-black text-white">{severity.toLowerCase()}</span>. 
              Get immediate health advice or contact your ward officer.
            </p>
            <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all">
              Get Help Now
            </button>
            <div className="mt-8 flex justify-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-10 h-10 text-white/40" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Detailed Pollutants */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Pollutant Breakdown</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <MapPin className="w-3 h-3" />
              {locationName}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.pollutants.map((p) => (
              <PollutantCard key={p.name} pollutant={p} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar Content */}
      <div className="lg:col-span-3 space-y-8">
        {/* Location Card */}
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
          <button 
            onClick={() => setShowAreaSelector(true)}
            className="w-full py-3 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-3 h-3" /> Change Location
          </button>
        </motion.div>

        {/* Upcoming Alerts */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</h3>
            <Bell className="w-4 h-4 text-slate-300" />
          </div>
          <div className="space-y-4">
            {data.alerts.length > 0 ? (
              data.alerts.map(alert => (
                <div key={alert.id} className="flex gap-4 p-3 rounded-2xl hover:bg-white/50 transition-all group">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", 
                    alert.type === "Severe" ? "bg-red-500" : "bg-orange-500")} />
                  <div>
                    <p className="text-xs font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{alert.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-xs font-bold text-slate-400">No active alerts</p>
              </div>
            )}
            <Link href="/citizen/alerts" className="block w-full py-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all">
              View All Alerts
            </Link>
          </div>
        </motion.div>

        {/* Source Inference */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pollution Source</h3>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Dominant Cause</p>
              <p className="text-sm font-black text-indigo-900 tracking-tight">{data.dominantSource}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Confidence</span>
                <span>{data.sourceConfidence}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.sourceConfidence === 'High' ? 90 : data.sourceConfidence === 'Medium' ? 60 : 30}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
              "{data.sourceReasoning}"
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modals & Overlays */}
      <VideoAlertModal
        isOpen={showVideoAlert}
        onClose={() => setShowVideoAlert(false)}
        aqi={data.aqi}
        wardName={locationName}
      />

      <AreaSelector 
        isOpen={showAreaSelector}
        onClose={() => setShowAreaSelector(false)}
        onSelect={handleAreaSelect}
      />

      {/* Floating Action Button */}
      {data.aqi > 200 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowVideoAlert(true)}
          className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center group"
        >
          <Bell className="w-8 h-8 group-hover:animate-ring" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-600 rounded-full text-xs font-black flex items-center justify-center border-2 border-red-600">
            !
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}
