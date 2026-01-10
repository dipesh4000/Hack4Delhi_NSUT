"use client";

import { Clock, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface OptimalTimeIndicatorProps {
  aqi: number;
}

export default function OptimalTimeIndicator({ aqi }: OptimalTimeIndicatorProps) {
  // Simple heuristic: Best time is usually mid-afternoon when mixing height is highest
  // or early morning if traffic is low. For this demo, we'll suggest 2 PM - 4 PM
  // unless AQI is hazardous.
  
  const isHazardous = aqi > 300;
  const suggestion = isHazardous 
    ? "No optimal time today. Stay indoors." 
    : "Best time for outdoors: 2 PM - 4 PM";

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md ${
        isHazardous ? 'bg-red-500/10 border-red-500/20 text-red-900' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900'
      }`}
    >
      <div className={`p-2 rounded-xl ${isHazardous ? 'bg-red-500' : 'bg-emerald-500'}`}>
        <Clock className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Activity Window</p>
        <p className="text-sm font-black">{suggestion}</p>
      </div>
    </motion.div>
  );
}
