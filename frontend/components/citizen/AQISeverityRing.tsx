"use client";

import { motion } from "framer-motion";

interface AQISeverityRingProps {
  aqi: number;
  size?: number;
  strokeWidth?: number;
}

export default function AQISeverityRing({ aqi, size = 200, strokeWidth = 15 }: AQISeverityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((aqi / 500) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const getSeverityColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"; // Emerald 500
    if (aqi <= 100) return "#f59e0b"; // Amber 500
    if (aqi <= 200) return "#f97316"; // Orange 500
    if (aqi <= 300) return "#ef4444"; // Red 500
    if (aqi <= 400) return "#7f1d1d"; // Red 900
    return "#4c1d95"; // Violet 900
  };

  const color = getSeverityColor(aqi);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black tracking-tighter text-slate-900"
        >
          {aqi}
        </motion.span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AQI</span>
      </div>
      
      {/* Pulse effect for high AQI */}
      {aqi > 200 && (
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
          style={{ border: `4px solid ${color}` }}
        />
      )}
    </div>
  );
}
