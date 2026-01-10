"use client";

import { getSeverity, getSeverityColor, AQISeverity } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface AQICardProps {
  aqi: number;
  lastUpdated: string;
}

export default function AQICard({ aqi, lastUpdated }: AQICardProps) {
  const severity = getSeverity(aqi);
  const colorClass = getSeverityColor(severity);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden h-full flex flex-col"
    >
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-slate-500 font-bold text-xs uppercase tracking-widest">Current AQI</h2>
            <p className="text-slate-400 text-[10px] mt-1 font-medium">Updated {lastUpdated}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-white text-xs font-black shadow-lg ${colorClass}`}>
            {severity.toUpperCase()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-black text-slate-900 tracking-tighter">
              {aqi}
            </span>
            <span className="text-slate-400 font-bold text-sm">US AQI</span>
          </div>
          <div className="flex-1 h-12 flex items-center justify-center">
            <Activity className={`w-10 h-10 ${aqi > 200 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
          </div>
        </div>

        <div className="mt-8">
          <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full ${colorClass} rounded-full shadow-inner`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-bold px-1">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400+</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
