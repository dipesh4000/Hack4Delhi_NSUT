"use client";

import { MapPin, Activity, Bell } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

interface LocationStatusHeaderProps {
  locationName: string;
  aqi: number;
  severity: string;
  usingRealData: boolean;
}

export default function LocationStatusHeader({ locationName, aqi, severity, usingRealData }: LocationStatusHeaderProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 100);
    });
  }, [scrollY]);

  const getSeverityColor = (aqi: number) => {
    if (aqi <= 50) return "text-emerald-500";
    if (aqi <= 100) return "text-amber-500";
    if (aqi <= 200) return "text-orange-500";
    if (aqi <= 300) return "text-red-500";
    if (aqi <= 400) return "text-red-700";
    return "text-purple-900";
  };

  const colorClass = getSeverityColor(aqi);

  return (
    <motion.header
      animate={{ 
        y: isScrolled ? 0 : -100,
        opacity: isScrolled ? 1 : 0
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm px-6 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Monitoring</p>
            <p className="text-sm font-black text-slate-900">{locationName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Current AQI</p>
              <p className={`text-lg font-black ${colorClass}`}>{aqi}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${aqi > 200 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>

          {aqi > 200 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30">
              <Bell className="w-3 h-3" />
              Alert Active
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
