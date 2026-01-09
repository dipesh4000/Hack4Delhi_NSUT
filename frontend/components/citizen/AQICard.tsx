"use client";

import { getSeverity, getSeverityColor } from "@/lib/mock-data";
import { motion } from "framer-motion";

interface AQICardProps {
  aqi: number;
  lastUpdated: string;
}

export default function AQICard({ aqi, lastUpdated }: AQICardProps) {
  const severity = getSeverity(aqi);
  const colorClass = getSeverityColor(severity);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Current AQI</h2>
            <p className="text-slate-400 text-xs mt-1">Updated {lastUpdated}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${colorClass}`}>
            {severity}
          </span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className={`text-6xl font-bold ${severity === "Severe" || severity === "Poor" ? "text-slate-900" : "text-slate-900"}`}>
            {aqi}
          </span>
          <span className="text-slate-500 font-medium">US AQI</span>
        </div>

        <div className="mt-6">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
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
