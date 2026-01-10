"use client";

import { ActionItem } from "@/lib/mock-data";
import { CheckCircle2, XCircle, Leaf, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ImpactActionCardProps {
  dos: ActionItem[];
  avoids: ActionItem[];
}

export default function ImpactActionCard({ dos, avoids }: ImpactActionCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-emerald-500/20 p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Eco-Action Tracker</h2>
          <p className="text-emerald-700/70 font-bold text-xs uppercase tracking-widest">Personalized for your ward</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* DO THIS */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Positive Impact
          </h3>
          <ul className="space-y-4">
            {dos.map((item, i) => (
              <motion.li 
                key={i} 
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-sm"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm font-bold text-slate-700">{item.text}</span>
                {item.impact === "High Impact" && (
                  <span className="ml-auto text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded-lg uppercase tracking-tighter">
                    High
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* AVOID THIS */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Reduce Footprint
          </h3>
          <ul className="space-y-4">
            {avoids.map((item, i) => (
              <motion.li 
                key={i} 
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-red-100 shadow-sm"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-bold text-slate-700">{item.text}</span>
                {item.impact === "High Impact" && (
                  <span className="ml-auto text-[10px] font-black bg-red-500 text-white px-2 py-1 rounded-lg uppercase tracking-tighter">
                    High
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-10 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-800 font-bold leading-tight">
            Pro Tip: If 20% of residents switch to public transport today, local PM2.5 levels could drop by up to 15%.
        </p>
      </div>
    </motion.div>
  );
}
