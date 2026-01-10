import { Pollutant, getSeverityColor } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function PollutantCard({ pollutant }: { pollutant: Pollutant }) {
  const colorClass = getSeverityColor(pollutant.status);
  
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-black text-slate-700 text-sm tracking-tight">{pollutant.name}</h3>
        <div className={`w-3 h-3 rounded-full shadow-lg ${colorClass}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-black text-slate-900 tracking-tighter">{pollutant.value}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pollutant.unit}</span>
      </div>
      <div className="mt-auto">
        <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2">{pollutant.description}</p>
      </div>
    </motion.div>
  );
}
