"use client";

import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DynamicActionListProps {
  aqi: number;
}

export default function DynamicActionList({ aqi }: DynamicActionListProps) {
  const getActions = (aqi: number) => {
    if (aqi <= 50) return {
      dos: ["Enjoy outdoor activities", "Open windows for ventilation", "Walk or cycle"],
      avoids: ["Burning waste", "Idling your vehicle"]
    };
    if (aqi <= 100) return {
      dos: ["Sensitive groups should limit exertion", "Use public transport", "Keep plants indoors"],
      avoids: ["Strenuous outdoor exercise", "Burning wood/trash"]
    };
    if (aqi <= 200) return {
      dos: ["Wear a mask outdoors", "Use air purifiers", "Stay hydrated"],
      avoids: ["Outdoor jogging", "Peak traffic areas", "Smoking"]
    };
    return {
      dos: ["Stay indoors", "Keep windows sealed", "Run air purifiers on high"],
      avoids: ["ALL outdoor activities", "Using vacuum cleaners (stirs dust)", "Candle burning"]
    };
  };

  const { dos, avoids } = getActions(aqi);

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/20 p-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Daily Protocol</h2>
          <p className="text-blue-700/70 font-bold text-xs uppercase tracking-widest">Actionable guidance for today</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Recommended
          </h3>
          <ul className="space-y-4">
            {dos.map((text, i) => (
              <motion.li 
                key={i} 
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm font-bold text-slate-700">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Avoid
          </h3>
          <ul className="space-y-4">
            {avoids.map((text, i) => (
              <motion.li 
                key={i} 
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/10"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-bold text-slate-700">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
