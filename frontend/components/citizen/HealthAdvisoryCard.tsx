import { HEALTH_ADVISORY, getSeverity } from "@/lib/mock-data";
import { CheckCircle2, XCircle, HeartPulse, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthAdvisoryCard({ aqi }: { aqi: number }) {
  const severity = getSeverity(aqi);
  const advisory = HEALTH_ADVISORY[severity.toLowerCase() as keyof typeof HEALTH_ADVISORY];

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/20 p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 rounded-2xl shadow-lg ${aqi > 200 ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Health Protocol</h2>
      </div>
      
      <div className="mb-8 p-6 bg-slate-900/5 rounded-2xl border border-slate-900/5">
        <h3 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
          {advisory.title}
          {aqi > 200 && <ShieldAlert className="w-5 h-5 text-red-500" />}
        </h3>
        <p className="text-slate-600 font-medium leading-relaxed">{advisory.message}</p>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Recommended Actions
          </h4>
          <ul className="grid gap-3">
            {advisory.dos.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 font-semibold flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Critical Restrictions
          </h4>
          <ul className="grid gap-3">
            {advisory.donts.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 font-semibold flex items-center gap-3 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
