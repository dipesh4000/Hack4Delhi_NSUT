import { Info, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ContextualAdviceCard({ advice }: { advice: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-500/20 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
      
      <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30 shrink-0">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-black text-blue-900 text-xl mb-2 flex items-center gap-2">
          Daily Insight
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">Personalized</span>
        </h3>
        <p className="text-blue-800/80 font-medium leading-relaxed text-lg">
          {advice}
        </p>
      </div>
    </motion.div>
  );
}
